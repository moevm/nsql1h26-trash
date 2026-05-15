"""
Бенчмарк AQL-запросов на разных масштабах данных.

Запускается автоматически при старте контейнера (если TRASH_RUN_BENCHMARK=true).
Для каждого масштаба:
  1. Очищает БД
  2. Заполняет данными через seed
  3. Выполняет набор реальных AQL-запросов
  4. Замеряет время каждого запроса
  5. Выводит сводную таблицу
  6. Сохраняет результаты в CSV
"""

import csv
import os
import random
import time
import logging
from datetime import datetime, timezone

from app.db.session import arango_instance
from app.db.seed import seed_demo_data

logger = logging.getLogger(__name__)

RESULTS_DIR = "/app/benchmark_results"

# ── Масштабы: нелинейный рост (заказы растут быстрее юзеров) ──
#
#  Scale   | Customers | Couriers | Orders  | Orders/Customer
#  --------|-----------|----------|---------|----------------
#  small   |    30     |   10     |   100   |   ~3.3
#  medium  |   150     |   40     |  2000   |   ~13.3
#  large   |   400     |   80     | 15000   |   ~37.5

SCALES = [
    {"name": "small",  "n_customers": 30,  "n_couriers": 10, "n_orders": 100},
    {"name": "medium", "n_customers": 150, "n_couriers": 40, "n_orders": 2000},
    {"name": "large",  "n_customers": 400, "n_couriers": 80, "n_orders": 15000},
]

RUNS_PER_QUERY = 3


def _time_query(db, query: str, bind_vars: dict = None, runs: int = RUNS_PER_QUERY) -> float:
    """Выполняет запрос runs раз, возвращает среднее время в мс."""
    times = []
    for _ in range(runs):
        start = time.perf_counter()
        cursor = db.aql.execute(query, bind_vars=bind_vars or {})
        list(cursor)  # материализуем результат
        elapsed = (time.perf_counter() - start) * 1000
        times.append(elapsed)
    return round(sum(times) / len(times), 2)


def _clear_database(db):
    """Очищает все пользовательские коллекции."""
    for col_info in db.collections():
        name = col_info["name"]
        if not name.startswith("_"):
            db.collection(name).truncate()


def _build_queries(courier_keys: list, customer_keys: list) -> list:
    """Возвращает список (label, description, aql, bind_vars) для бенчмарка."""
    courier_id = f"Users/{random.choice(courier_keys)}" if courier_keys else "Users/0"
    customer_key = random.choice(customer_keys) if customer_keys else "0"

    return [
        (
            "available_orders",
            "Лента доступных заказов для курьера (граф-обход + фильтрация)",
            """
            FOR o IN Orders
                FILTER o.status == 'searching'
                LET is_taken = LENGTH(
                    FOR v, e IN 1..1 INBOUND o Executes RETURN e
                ) > 0
                FILTER !is_taken
                LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o At RETURN v)
                SORT o.created_at DESC
                LIMIT 0, 20
                RETURN MERGE(o, {
                    id: o._key,
                    address: addr_doc.full_address
                })
            """,
            {},
        ),
        (
            "client_orders",
            "Заказы клиента через Owns-edge (клиентский дашборд)",
            """
            LET user_id = CONCAT('Users/', @client_key)
            FOR o IN 1..1 OUTBOUND user_id Owns
                LET addr = FIRST(FOR v IN 1..1 OUTBOUND o At RETURN v)
                SORT o.created_at DESC
                LIMIT 0, 20
                RETURN MERGE(o, {
                    id: o._key,
                    address: addr.full_address
                })
            """,
            {"client_key": customer_key},
        ),
        (
            "courier_orders",
            "Заказы курьера через Executes-edge",
            """
            FOR edge IN Executes
                FILTER edge._from == @courier_id
                LET order = DOCUMENT(edge._to)
                LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND order At RETURN v)
                LET final_order = MERGE(order, {
                    id: order._key,
                    address: addr_doc.full_address
                })
                SORT final_order.created_at DESC
                LIMIT 0, 20
                RETURN final_order
            """,
            {"courier_id": courier_id},
        ),
        (
            "courier_stats",
            "Статистика курьера: агрегация с DATE_SUBTRACT",
            """
            LET executed_orders = (
                FOR v, e IN 1..1 OUTBOUND @user_id Executes
                    FILTER v.status == 'done'
                    RETURN { price: TO_NUMBER(v.price || 0), created_at: v.created_at }
            )
            LET now = DATE_NOW()
            LET thirty = DATE_SUBTRACT(now, 30, "days")
            LET sixty = DATE_SUBTRACT(now, 60, "days")
            LET cur = (FOR o IN executed_orders FILTER o.created_at >= DATE_ISO8601(thirty) RETURN o)
            LET prev = (FOR o IN executed_orders FILTER o.created_at >= DATE_ISO8601(sixty) FILTER o.created_at < DATE_ISO8601(thirty) RETURN o)
            RETURN {
                total: LENGTH(executed_orders),
                month_earn: SUM(cur[*].price),
                prev_earn: SUM(prev[*].price)
            }
            """,
            {"user_id": courier_id},
        ),
        (
            "admin_orders",
            "Админ-панель заказов: 5 LET, PARSE_IDENTIFIER, CONTAINS (самый тяжёлый)",
            """
            FOR o IN Orders
                LET client = o.client_key != null ? DOCUMENT(CONCAT("Users/", o.client_key)) : null
                LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o At RETURN v)
                LET courier_edge = FIRST(FOR e IN Executes FILTER PARSE_IDENTIFIER(e._to).key == o._key RETURN e)
                LET courier = courier_edge != null ? DOCUMENT(courier_edge._from) : null
                SORT o.created_at DESC
                LIMIT 0, 20
                RETURN {
                    id: o._key,
                    waste_type: o.waste_type,
                    status: o.status,
                    price: o.price,
                    client_name: client != null ? client.full_name : null,
                    courier_name: courier != null ? courier.full_name : null,
                    address: addr_doc != null ? addr_doc.full_address : null
                }
            """,
            {},
        ),
        (
            "admin_users_filter",
            "Список пользователей с фильтром по роли",
            """
            FOR u IN Users
                FILTER u.role == 'courier'
                SORT u.created_at DESC
                LIMIT 0, 20
                RETURN {
                    id: u._key,
                    full_name: u.full_name,
                    email: u.email,
                    role: u.role
                }
            """,
            {},
        ),
        (
            "admin_users_search",
            "Текстовый поиск пользователя: CONTAINS(LOWER())",
            """
            FOR u IN Users
                FILTER CONTAINS(LOWER(u.full_name), LOWER(@search))
                SORT u.created_at DESC
                LIMIT 0, 20
                RETURN { id: u._key, full_name: u.full_name, email: u.email }
            """,
            {"search": "ан"},
        ),
        (
            "dashboard_stats",
            "KPI дашборд: заказы сегодня + объём + курьеры",
            """
            LET today = DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd")
            LET orders_today = LENGTH(
                FOR o IN Orders
                    FILTER o.status == "done" AND o.completed_at != null
                    FILTER DATE_FORMAT(DATE_ISO8601(o.completed_at), "%yyyy-%mm-%dd") == today
                    RETURN 1
            )
            LET volume_today = SUM(
                FOR o IN Orders
                    FILTER o.status == "done" AND o.completed_at != null
                    FILTER DATE_FORMAT(DATE_ISO8601(o.completed_at), "%yyyy-%mm-%dd") == today
                    RETURN o.volume
            )
            LET total_couriers = LENGTH(FOR u IN Users FILTER u.role == "courier" RETURN 1)
            RETURN { orders_today, volume_today, total_couriers }
            """,
            {},
        ),
        (
            "analytics_by_waste",
            "Аналитика: агрегация по типу мусора (COLLECT + SUM)",
            """
            FOR o IN Orders
                FILTER o.status == "done"
                COLLECT label = o.waste_type AGGREGATE
                    cnt = COUNT(1),
                    vol = SUM(o.volume),
                    revenue = SUM(o.price)
                RETURN { label, cnt, vol, revenue }
            """,
            {},
        ),
        (
            "analytics_by_courier",
            "Аналитика: топ-10 курьеров по выручке через Executes",
            """
            FOR e IN Executes
                LET o = DOCUMENT(e._to)
                LET courier = DOCUMENT(e._from)
                FILTER o != null AND courier != null AND o.status == "done"
                COLLECT label = courier.full_name AGGREGATE value = SUM(o.price)
                SORT value DESC
                LIMIT 0, 10
                RETURN { label, value }
            """,
            {},
        ),
        (
            "active_couriers",
            "Подсчёт активных курьеров: DISTINCT + PARSE_IDENTIFIER",
            """
            LET active_keys = (
                FOR e IN Executes
                    LET order = DOCUMENT(e._to)
                    FILTER order != null AND order.status == "active"
                    RETURN DISTINCT PARSE_IDENTIFIER(e._from).key
            )
            RETURN LENGTH(active_keys)
            """,
            {},
        ),
        (
            "courier_transactions",
            "История транзакций курьера с сортировкой",
            """
            FOR t IN Transactions
                FILTER t.courier_id == @courier_key
                SORT t.timestamp DESC
                LIMIT 0, 20
                RETURN {
                    date: t.timestamp,
                    amount: t.amount,
                    type: t.type
                }
            """,
            {"courier_key": random.choice(courier_keys) if courier_keys else "0"},
        ),
    ]


def _save_csv(all_results: dict, scale_names: list, timestamp: str) -> str:
    """Сохраняет результаты бенчмарка в CSV-файл. Возвращает путь к файлу."""
    os.makedirs(RESULTS_DIR, exist_ok=True)
    filename = f"benchmark_{timestamp}.csv"
    filepath = os.path.join(RESULTS_DIR, filename)

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        # Заголовок
        header = ["query"] + [f"{s}_ms" for s in scale_names] + ["ratio_large_small"]
        writer.writerow(header)

        # Данные
        for label, scale_times in all_results.items():
            row = [label]
            vals = []
            for sn in scale_names:
                v = scale_times.get(sn, 0)
                vals.append(v)
                row.append(v)

            ratio = round(vals[-1] / vals[0], 2) if vals[0] > 0 else "n/a"
            row.append(ratio)
            writer.writerow(row)

        # Пустая строка + метаданные масштабов
        writer.writerow([])
        writer.writerow(["# scale", "customers", "couriers", "orders", "orders_per_customer"])
        for s in SCALES:
            writer.writerow([
                s["name"],
                s["n_customers"],
                s["n_couriers"],
                s["n_orders"],
                round(s["n_orders"] / s["n_customers"], 1),
            ])

    # Также сохраняем latest-ссылку
    latest_path = os.path.join(RESULTS_DIR, "benchmark_latest.csv")
    with open(filepath, "r", encoding="utf-8") as src:
        with open(latest_path, "w", encoding="utf-8") as dst:
            dst.write(src.read())

    return filepath


def run_benchmark() -> None:
    """Основная функция: прогоняет бенчмарк на всех масштабах."""
    db = arango_instance.db
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    print("\n" + "=" * 90)
    print("  BENCHMARK: AQL-запросы на разных масштабах данных")
    print("=" * 90)

    all_results = {}  # query_label -> {scale_name: avg_ms}

    for scale in SCALES:
        sname = scale["name"]
        print(f"\n{'─' * 90}")
        print(f"  Масштаб: {sname.upper()}")
        print(f"  Customers={scale['n_customers']}, Couriers={scale['n_couriers']}, Orders={scale['n_orders']}")
        print(f"  Orders/Customer ≈ {scale['n_orders'] / scale['n_customers']:.1f}")
        print(f"{'─' * 90}")

        # Очистка
        _clear_database(db)

        # Seed
        t0 = time.perf_counter()
        result = seed_demo_data(
            n_couriers=scale["n_couriers"],
            n_customers=scale["n_customers"],
            n_orders=scale["n_orders"],
            silent=True,
        )
        seed_time = (time.perf_counter() - t0) * 1000
        print(f"  Seed: {seed_time:.0f} ms")

        courier_keys = result["courier_keys"]
        customer_keys = result["customer_keys"]

        if not courier_keys or not customer_keys:
            print("  [!] Seed не вернул ключи, пропускаем масштаб")
            continue

        # Размеры коллекций
        col_sizes = {}
        for col_info in db.collections():
            name = col_info["name"]
            if not name.startswith("_"):
                col_sizes[name] = db.collection(name).count()
        print(f"  Коллекции: { {k: v for k, v in sorted(col_sizes.items()) if v > 0} }")

        # Запросы
        queries = _build_queries(courier_keys, customer_keys)

        print(f"\n  {'Запрос':<30} {'Время (мс)':>12}")
        print(f"  {'─' * 30} {'─' * 12}")

        for label, desc, aql, bind_vars in queries:
            avg_ms = _time_query(db, aql, bind_vars)
            print(f"  {label:<30} {avg_ms:>10.2f} ms")

            if label not in all_results:
                all_results[label] = {}
            all_results[label][sname] = avg_ms

    # ── Сводная таблица ──

    scale_names = [s["name"] for s in SCALES]
    print(f"\n\n{'=' * 90}")
    print("  СВОДНАЯ ТАБЛИЦА (среднее время в мс)")
    print(f"{'=' * 90}")

    header = f"  {'Запрос':<30}"
    for sn in scale_names:
        header += f" {sn:>12}"
    header += f" {'ratio':>10}"
    print(header)
    print(f"  {'─' * 30}" + f" {'─' * 12}" * len(scale_names) + f" {'─' * 10}")

    for label in all_results:
        row = f"  {label:<30}"
        vals = []
        for sn in scale_names:
            v = all_results[label].get(sn, 0)
            vals.append(v)
            row += f" {v:>10.2f}ms"

        if vals[0] > 0:
            ratio = vals[-1] / vals[0]
            row += f" {ratio:>8.1f}x"
        else:
            row += f" {'n/a':>8}"
        print(row)

    # Масштабы
    print(f"\n  Масштабы данных:")
    for s in SCALES:
        ratio_orders = s["n_orders"] / SCALES[0]["n_orders"]
        print(f"    {s['name']:<8}: {s['n_customers']} customers, {s['n_couriers']} couriers, "
              f"{s['n_orders']} orders ({ratio_orders:.0f}x orders vs small)")

    # ── CSV ──
    csv_path = _save_csv(all_results, scale_names, timestamp)
    print(f"\n  CSV сохранён: {csv_path}")
    print(f"{'=' * 90}\n")

    # Возвращаем БД в исходное состояние
    _clear_database(db)
