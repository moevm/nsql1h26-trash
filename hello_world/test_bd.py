import datetime
from arango import ArangoClient


def run_test():
    client = ArangoClient(hosts='http://localhost:8529')

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
                'items': [{'type': 'Пластик', 'weight': 5}],
                'status': 'Pending'
            },
            {
                'order_id': 'EW-2026-002',
                'created_at': str(datetime.datetime.now()),
                'client': 'Алексей Иванов',
                'location': {'address': 'ул. Арбат, 10', 'coordinates': [55.74, 37.59]},
                'items': [{'type': 'Стекло', 'weight': 10}, {'type': 'Металл', 'weight': 3}],
                'status': 'In Progress'
            },
            {
                'order_id': 'EW-2026-003',
                'created_at': str(datetime.datetime.now()),
                'client': 'Мария Петрова',
                'location': {'address': 'Ленинский пр-т, 45', 'coordinates': [55.70, 37.57]},
                'items': [{'type': 'Бумага', 'weight': 20}],
                'status': 'Completed'
            }
        ]

        results = collection.insert_many(orders_to_insert)
        print(f"Успешно добавлено документов: {len(results)}\n")

        print("--- Чтение всех данных из базы ---")
        cursor = db.aql.execute('FOR o IN orders_batch_test RETURN o')

        for doc in cursor:
            print(f"   Заказ {doc['order_id']} | Клиент: {doc['client']}")
            print(f"   Адрес: {doc['location']['address']}")
            print(f"   Статус: [{doc['status']}]")
            total_w = sum(item['weight'] for item in doc['items'])
            print(f"   Общий вес: {total_w} кг")
            print("-" * 30)

    except Exception as e:
        print(f"Ошибка: {e}")


if __name__ == "__main__":
    run_test()