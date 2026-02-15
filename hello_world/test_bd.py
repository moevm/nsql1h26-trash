import datetime
import os
import time
from arango import ArangoClient


def run_test():
    arango_host = os.getenv('ARANGO_HOST', 'http://localhost:8529')
    client = ArangoClient(hosts=arango_host)

    print(f"--- Подключение к ArangoDB по адресу: {arango_host} ---")

    time.sleep(2)

    try:
        db = client.db('_system', username='root', password='')

        col_name = 'orders_batch_test'
        if not db.has_collection(col_name):
            collection = db.create_collection(col_name)
        else:
            collection = db.collection(col_name)

        orders_to_insert = [
            {
                'order_id': 'EW-2026-001',
                'created_at': str(datetime.datetime.now()),
                'client': 'Софья Титкова',
                'location': {'address': 'ул. Тверская, 7', 'coordinates': [55.75, 37.61]},
                'items': [{'type': 'Пластик', 'weight': 5.5}],
                'status': 'Pending'
            },
            {
                'order_id': 'EW-2026-002',
                'created_at': str(datetime.datetime.now()),
                'client': 'Алексей Иванов',
                'location': {'address': 'ул. Арбат, 10', 'coordinates': [55.74, 37.59]},
                'items': [{'type': 'Стекло', 'weight': 10.0}, {'type': 'Металл', 'weight': 3.2}],
                'status': 'In Progress'
            },
            {
                'order_id': 'EW-2026-003',
                'created_at': str(datetime.datetime.now()),
                'client': 'Мария Петрова',
                'location': {'address': 'Ленинский пр-т, 45', 'coordinates': [55.70, 37.57]},
                'items': [{'type': 'Бумага', 'weight': 20.0}],
                'status': 'Completed'
            }
        ]

        print(f"Запись {len(orders_to_insert)} заказов...")
        collection.insert_many(orders_to_insert)
        print("Данные успешно загружены в ArangoDB!\n")

        print("--- Чтение данных из базы ---")
        cursor = db.aql.execute('FOR o IN orders_batch_test RETURN o')

        for doc in cursor:
            print(f"   Заказ: {doc['order_id']} | Статус: {doc['status']}")
            print(f"   Клиент: {doc['client']}")
            print(f"   Адрес: {doc['location']['address']}")
            total_weight = sum(item['weight'] for item in doc['items'])
            print(f"   Вес посылки: {total_weight} кг")
            print("-" * 40)

    except Exception as e:
        print(f" Ошибка: {e}")


if __name__ == "__main__":
    run_test()