import random
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from faker import Faker

from app.db.session import arango_instance

fake = Faker("ru_RU")
Faker.seed(42)
random.seed(42)

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_HASH = _pwd.hash("Demo1234!")

_TRANSPORTS = ["car", "foot", "van"]
_WASTE_TYPES = ["Бытовой", "Строительный", "Мебель"]

_DESCRIPTIONS = [
    "", "", "", "",
    "Позвоните за 30 минут",
    "Домофон не работает, звоните по телефону",
    "Подъезд со двора",
    "Мусор в мешках у подъезда",
    "Вход с торца здания",
    "Крупногабаритный, нужен грузовик",
    "Стройматериалы — кирпич и бетон",
    "Старая мебель — диван и шкаф",
    "Остатки после ремонта",
    "Только до 18:00",
    "Рядом с мусорными баками",
    "3 этаж без лифта",
    "Парковка свободная перед домом",
    "Нужна аккуратная погрузка",
]

HISTORY_DAYS = 365


def _now_minus(days: float) -> str:
    dt = datetime.now(timezone.utc) - timedelta(days=days)
    return dt.isoformat()


def _price_for(waste_type: str, volume: float) -> float:
    base_rates = {"Бытовой": 450, "Строительный": 600, "Мебель": 550}
    rate = base_rates[waste_type]
    return round(volume * rate * random.uniform(0.85, 1.15))


def seed_demo_data(
    n_couriers: int = 50,
    n_customers: int = 200,
    n_orders: int = 1500,
    silent: bool = False,
) -> dict:
    """
    Заполняет БД реалистичными данными.
    Возвращает dict с ключами courier_keys и customer_keys для бенчмарков.
    """
    db = arango_instance.db

    users_col = db.collection("Users")
    if users_col.count() > 5:
        if not silent:
            print("[SEED] В базе уже есть данные, пропускаем seed.")
        return {"courier_keys": [], "customer_keys": []}

    orders_col = db.collection("Orders")

    for name in ["Owns", "Executes", "At", "History"]:
        if not db.has_collection(name):
            db.create_collection(name, edge=True)

    for name in ["Addresses", "Transactions", "Events"]:
        if not db.has_collection(name):
            db.create_collection(name)

    owns_col = db.collection("Owns")
    executes_col = db.collection("Executes")
    at_col = db.collection("At")
    history_col = db.collection("History")
    addresses_col = db.collection("Addresses")
    transactions_col = db.collection("Transactions")
    events_col = db.collection("Events")

    # ── Курьеры ──

    courier_keys = []
    courier_cities = {}

    for i in range(n_couriers):
        city = fake.city_name()
        registered_ago = random.uniform(30, HISTORY_DAYS)
        doc = users_col.insert({
            "full_name": fake.name_male(),
            "email": f"courier{i + 1}@demo.local",
            "phone": fake.phone_number(),
            "password_hash": _HASH,
            "role": "courier",
            "city": city,
            "transport": random.choice(_TRANSPORTS),
            "balance": round(random.uniform(0, 15000), 2),
            "rating": round(random.uniform(2.5, 5.0), 1),
            "is_active": random.random() > 0.05,
            "created_at": _now_minus(registered_ago),
        })
        courier_keys.append(doc["_key"])
        courier_cities[doc["_key"]] = city

    # ── Заказчики ──

    customer_keys = []
    customer_cities = {}

    for i in range(n_customers):
        city = fake.city_name()
        registered_ago = random.uniform(7, HISTORY_DAYS)
        balance = 0
        if random.random() < 0.7:
            balance = round(random.uniform(100, 30000), 2)

        doc = users_col.insert({
            "full_name": fake.name(),
            "email": f"customer{i + 1}@demo.local",
            "phone": fake.phone_number(),
            "password_hash": _HASH,
            "role": "customer",
            "address": fake.address(),
            "balance": balance,
            "is_active": random.random() > 0.02,
            "created_at": _now_minus(registered_ago),
        })
        customer_keys.append(doc["_key"])
        customer_cities[doc["_key"]] = city

    # ── Заказы ──

    order_count = {"done": 0, "active": 0, "searching": 0}
    courier_order_count = {k: 0 for k in courier_keys}

    for n in range(n_orders):
        days_ago = min(max(random.expovariate(1 / 60), 0.1), HISTORY_DAYS)

        if days_ago > 3:
            status = random.choices(["done", "active", "searching"], weights=[90, 5, 5])[0]
        elif days_ago > 0.5:
            status = random.choices(["done", "active", "searching"], weights=[40, 35, 25])[0]
        else:
            status = random.choices(["done", "active", "searching"], weights=[10, 30, 60])[0]

        waste = random.choices(_WASTE_TYPES, weights=[60, 25, 15])[0]

        if waste == "Бытовой":
            volume = round(random.uniform(0.5, 15), 1)
        elif waste == "Строительный":
            volume = round(random.uniform(2, 40), 1)
        else:
            volume = round(random.uniform(1, 20), 1)

        price = _price_for(waste, volume)

        customer_idx = int(random.paretovariate(1.5)) % len(customer_keys)
        customer_key = customer_keys[customer_idx]
        city = customer_cities[customer_key]

        created_at = _now_minus(days_ago)
        scheduled_at = _now_minus(days_ago - random.uniform(0.2, 1.0))

        order_data = {
            "waste_type": waste,
            "volume": volume,
            "price": price,
            "status": status,
            "description": random.choice(_DESCRIPTIONS),
            "client_key": customer_key,
            "scheduled_at": scheduled_at,
            "created_at": created_at,
        }

        if status == "done":
            order_data["completed_at"] = _now_minus(max(0.05, days_ago - random.uniform(0.3, 2.0)))

        order_doc = orders_col.insert(order_data)
        order_key = order_doc["_key"]
        order_count[status] += 1

        addr_doc = addresses_col.insert({
            "full_address": fake.address(),
            "details": {
                "entrance": str(random.randint(1, 8)),
                "floor": random.randint(1, 25),
                "intercom": str(random.randint(1, 9999)),
            },
        })
        at_col.insert({
            "_from": f"Orders/{order_key}",
            "_to": f"Addresses/{addr_doc['_key']}",
            "relation_type": "At",
        })

        owns_col.insert({
            "_from": f"Users/{customer_key}",
            "_to": f"Orders/{order_key}",
            "created_at": created_at,
            "relation_type": "Owns",
        })

        if status in ("active", "done"):
            same_city = [k for k in courier_keys if courier_cities[k] == city]
            if same_city and random.random() < 0.7:
                courier_key = random.choice(same_city)
            else:
                courier_key = random.choice(courier_keys)

            executes_col.insert({
                "_from": f"Users/{courier_key}",
                "_to": f"Orders/{order_key}",
                "started_at": _now_minus(max(0.05, days_ago - 0.3)),
            })
            courier_order_count[courier_key] = courier_order_count.get(courier_key, 0) + 1

            if status == "done":
                tx_doc = transactions_col.insert({
                    "courier_id": str(courier_key),
                    "amount": float(price),
                    "type": "order_payout",
                    "status": "success",
                    "timestamp": order_data["completed_at"],
                    "description": f"Оплата за заказ #{order_key}",
                })

                history_col.insert({
                    "_from": f"Orders/{order_key}",
                    "_to": f"Transactions/{tx_doc['_key']}",
                    "created_at": order_data["completed_at"],
                })

                events_col.insert({
                    "event_type": "order_payment",
                    "title": "Заказ завершён",
                    "description": f"Заказ #{order_key} завершён, оплата {price} руб.",
                    "related_id": order_key,
                    "related_type": "Order",
                    "created_at": order_data["completed_at"],
                })

    # ── Дополнительные транзакции ──

    extra_tx = max(50, n_orders // 5)
    for _ in range(extra_tx):
        is_topup = random.random() < 0.6
        if is_topup:
            user_key = random.choice(customer_keys)
            amount = round(random.choice([500, 1000, 2000, 3000, 5000, 10000]) * random.uniform(0.8, 1.2))
            tx_type = "top_up"
            desc = "Пополнение баланса"
        else:
            user_key = random.choice(courier_keys)
            amount = round(random.uniform(1000, 10000))
            tx_type = "withdraw"
            desc = "Вывод средств"

        days_ago = random.uniform(0.1, HISTORY_DAYS)
        transactions_col.insert({
            "courier_id": str(user_key) if not is_topup else "",
            "user_key": str(user_key) if is_topup else "",
            "amount": float(amount),
            "type": tx_type,
            "status": random.choices(["success", "completed", "pending"], weights=[70, 25, 5])[0],
            "timestamp": _now_minus(days_ago),
            "description": desc,
            "card_mask": f"**** {random.randint(1000, 9999)}",
        })
        events_col.insert({
            "event_type": f"balance_{tx_type}",
            "title": desc,
            "description": f"{desc} на сумму {amount} руб.",
            "related_id": user_key,
            "related_type": "User",
            "created_at": _now_minus(days_ago),
        })

    # ── Рейтинги ──

    for key, count in courier_order_count.items():
        if count > 0:
            rating = min(5.0, max(2.0, round(random.gauss(4.2, 0.4), 1)))
            users_col.update({"_key": key, "rating": rating})

    if not silent:
        print(
            f"[SEED] Данные загружены:\n"
            f"  Курьеров:    {n_couriers}\n"
            f"  Заказчиков:  {n_customers}\n"
            f"  Заказов:     {n_orders} "
            f"(done={order_count['done']}, active={order_count['active']}, "
            f"searching={order_count['searching']})\n"
            f"  Транзакций:  ~{n_orders + extra_tx}\n"
        )

    return {"courier_keys": courier_keys, "customer_keys": customer_keys}
