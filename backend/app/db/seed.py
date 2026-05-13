"""
Генерация демонстрационных данных при старте контейнера.
Активируется переменной окружения TRASH_SEED_DEMO_DATA=true.
Идемпотентна: повторный запуск ничего не делает, если данные уже есть.
"""

import random
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

from app.db.session import arango_instance

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_HASH = _pwd.hash("Demo1234!")

_CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург"]
_TRANSPORTS = ["car", "foot", "van"]
_WASTE_TYPES = ["Бытовой", "Строительный", "Мебель"]
_STATUSES_DONE = ["done"]
_STATUSES_OPEN = ["searching", "active"]

_COURIER_NAMES = [
    "Алексей Быстров", "Дмитрий Колесов", "Иван Гончаров", "Сергей Ездоков",
    "Павел Трифонов", "Николай Возов", "Андрей Маршев", "Виктор Скоров",
    "Роман Водилов", "Евгений Ходов", "Артём Грузев", "Максим Доставкин",
    "Кирилл Рейсов", "Олег Шоферов", "Тимур Багажев", "Денис Перевозов",
    "Владимир Трассов", "Антон Маршрутов", "Юрий Логистов", "Игорь Кузовов",
]
_CUSTOMER_NAMES = [
    "Анна Чистова", "Мария Уборова", "Елена Вывозова", "Ольга Мусорова",
    "Татьяна Порядкова", "Наталья Чисткина", "Ирина Убратова", "Светлана Вынесова",
    "Галина Подметова", "Людмила Сортова", "Алексей Захламов", "Борис Копилов",
    "Василий Накопов", "Григорий Свалков", "Дмитрий Хламов", "Евгений Грудов",
    "Жанна Рециклова", "Зоя Утильева", "Константин Бытов", "Леонид Сортиров",
]
_ADDRESSES = [
    "Москва, ул. Ленина, д. 1", "Москва, пр. Мира, д. 22", "СПб, Невский пр., д. 5",
    "Казань, ул. Баумана, д. 10", "Екатеринбург, ул. Малышева, д. 3",
    "Новосибирск, Красный пр., д. 7", "Москва, ул. Тверская, д. 14",
    "СПб, ул. Рубинштейна, д. 6", "Москва, Арбат, д. 33", "Казань, ул. Пушкина, д. 8",
    "Москва, ул. Садовая, д. 2", "СПб, ул. Гороховая, д. 11",
    "Новосибирск, ул. Вокзальная, д. 4", "Екатеринбург, ул. 8 Марта, д. 19",
    "Москва, ул. Профсоюзная, д. 45", "СПб, ул. Литейная, д. 16",
    "Казань, ул. Кремлёвская, д. 3", "Москва, ул. Кирова, д. 28",
    "Екатеринбург, пр. Ленина, д. 52", "Новосибирск, ул. Депутатская, д. 9",
]


def _now_minus(days: float) -> str:
    dt = datetime.now(timezone.utc) - timedelta(days=days)
    return dt.isoformat()


def seed_demo_data() -> None:
    db = arango_instance.db

    users_col = db.collection("Users")
    if users_col.count() > 5:
        return

    orders_col = db.collection("Orders")
    executes_col = db.collection("Executes")

    if not db.has_collection("Owns"):
        db.create_collection("Owns", edge=True)
    owns_col = db.collection("Owns")

    if not db.has_collection("Addresses"):
        db.create_collection("Addresses")
    addresses_col = db.collection("Addresses")

    if not db.has_collection("At"):
        db.create_collection("At", edge=True)
    at_col = db.collection("At")

    courier_keys = []
    for i, name in enumerate(_COURIER_NAMES):
        doc = users_col.insert({
            "full_name": name,
            "email": f"demo_courier{i+1}@test.local",
            "phone": f"+7910{i:07d}",
            "password_hash": _HASH,
            "role": "courier",
            "city": random.choice(_CITIES),
            "transport": random.choice(_TRANSPORTS),
            "balance": round(random.uniform(0, 5000)),
            "rating": round(random.uniform(3.5, 5.0), 1),
            "is_active": True,
            "created_at": _now_minus(random.uniform(30, 180)),
        })
        courier_keys.append(doc["_key"])

    customer_keys = []
    for i, name in enumerate(_CUSTOMER_NAMES):
        doc = users_col.insert({
            "full_name": name,
            "email": f"demo_customer{i+1}@test.local",
            "phone": f"+7920{i:07d}",
            "password_hash": _HASH,
            "role": "customer",
            "address": _ADDRESSES[i % len(_ADDRESSES)],
            "balance": round(random.uniform(0, 10000)),
            "is_active": True,
            "created_at": _now_minus(random.uniform(10, 150)),
        })
        customer_keys.append(doc["_key"])

    for n in range(45):
        days_ago = random.uniform(0.5, 180)
        waste = random.choice(_WASTE_TYPES)
        volume = round(random.uniform(1, 40), 1)
        price = round(volume * random.uniform(400, 700))
        is_done = n < 35
        status = "done" if is_done else random.choice(_STATUSES_OPEN)

        customer_key = random.choice(customer_keys)
        address = random.choice(_ADDRESSES)
        order_doc = orders_col.insert({
            "waste_type": waste,
            "volume": volume,
            "price": price,
            "status": status,
            "description": "",
            "client_key": customer_key,
            "scheduled_at": _now_minus(days_ago - 0.5),
            "created_at": _now_minus(days_ago),
        })
        order_key = order_doc["_key"]

        addr_doc = addresses_col.insert({
            "full_address": address,
            "details": {
                "entrance": str(random.randint(1, 5)),
                "floor": random.randint(1, 16),
                "intercom": str(random.randint(1, 999)),
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
            "created_at": _now_minus(days_ago),
            "relation_type": "Owns",
        })

        if is_done or status == "active":
            courier_key = random.choice(courier_keys)
            executes_col.insert({
                "_from": f"Users/{courier_key}",
                "_to": f"Orders/{order_key}",
                "started_at": _now_minus(days_ago - 0.3),
            })

    print(f"[SEED] Демо-данные загружены: {len(courier_keys)} курьеров, "
          f"{len(customer_keys)} заказчиков, 45 заказов (35 выполненных).")
