from datetime import datetime
from app.db.session import arango_instance
from app.models.order import OrderCreate, Order, OrderStatus

ORDERS_COLLECTION = "Orders"
EXECUTES_COLLECTION = "Executes"

ORDER_STYLES = {
    "Бытовой мусор": {"icon": "delete_forever", "color": "text-red-500", "bg": "bg-red-50"},
    "Строительный": {"icon": "construction", "color": "text-yellow-600", "bg": "bg-yellow-50"},
    "Мебель": {"icon": "chair", "color": "text-blue-500", "bg": "bg-blue-50"}
}


def _ensure_collections():
    db = arango_instance.db

    if not db.has_collection(ORDERS_COLLECTION):
        db.create_collection(ORDERS_COLLECTION)
        print(f"✅ Создана коллекция (document): {ORDERS_COLLECTION}")

    if not db.has_collection(EXECUTES_COLLECTION):
        db.create_collection(EXECUTES_COLLECTION, edge=True)
        print(f"✅ Создана коллекция (edge): {EXECUTES_COLLECTION}")


def create_order(order_in: OrderCreate, client_key: str, price: float) -> Order:
    """
    Создаёт новый заказ.
    client_key — _key пользователя-заказчика (нужен для связи)
    """
    _ensure_collections()
    db = arango_instance.db


    order_dict = order_in.model_dump()
    order_dict["client_key"] = client_key
    order_dict["price"] = price
    print(f"DEBUG: [DB] Сохраняю заказ с ценой: {price}")
    order_dict["created_at"] = str(datetime.now())

    result = db.collection(ORDERS_COLLECTION).insert(order_dict, return_new=True)


    order_data = result["new"]
    return Order(**order_data)


def get_available_orders(type_filter: str = None):
    _ensure_collections()
    db = arango_instance.db
    all_docs = list(db.collection(ORDERS_COLLECTION).all())
    print(f"DEBUG: Всего документов в коллекции '{ORDERS_COLLECTION}': {len(all_docs)}")
    if len(all_docs) > 0:
        print(f"DEBUG: Статус первого документа: {all_docs[0].get('status')}")
        print(f"DEBUG: Тип отходов первого документа: {all_docs[0].get('waste_type')}")
    query = """
    FOR o IN @@orders
        FILTER o.status == 'searching'
        FILTER @filter == null OR o.waste_type == @filter
        
        LET is_taken = LENGTH(
            FOR v, e IN 1..1 INBOUND o @@executes 
            RETURN e
        ) > 0
        
        FILTER !is_taken
        RETURN o
    """

    cursor = db.aql.execute(
        query,
        bind_vars={
            "filter": type_filter,
            "@orders": ORDERS_COLLECTION,
            "@executes": EXECUTES_COLLECTION
        }
    )

    raw_orders = list(cursor)

    for o in raw_orders:
        style = ORDER_STYLES.get(
            o.get("waste_type"),
            {"icon": "eco", "color": "text-green-500", "bg": "bg-green-50"}
        )
        o.update({
            "id": o.get("_key"),
            "icon": style["icon"],
            "color": style["color"],
            "bg": style["bg"],
            "isNew": True
        })

    return raw_orders