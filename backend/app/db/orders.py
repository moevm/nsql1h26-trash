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

    if not db.has_collection("Owns"):
        db.create_collection("Owns", edge=True)
        print("✅ Создана Edge-коллекция: Owns")

    if not db.has_collection("Locations"):
        db.create_collection("Locations")

    if not db.has_collection("At"):
        db.create_collection("At", edge=True)
        print("✅ Создана Edge-коллекция: At")


def create_order(order_in: OrderCreate, client_key: str, price: float) -> Order:
    _ensure_collections()
    db = arango_instance.db

    # 1. Данные заказа
    order_dict = order_in.model_dump()
    order_dict.pop("address", None)
    order_dict.update({
        "client_key": client_key,
        "price": price,
        "created_at": datetime.now().isoformat()  # <--- ИСПРАВЛЕНО
    })

    order_result = db.collection(ORDERS_COLLECTION).insert(order_dict, return_new=True)
    order_data = order_result["new"]
    order_key = order_data["_key"]

    # 2. Локация
    loc_doc = order_in.address.model_dump()
    loc_result = db.collection("Locations").insert(loc_doc, return_new=True)
    loc_key = loc_result["new"]["_key"]

    db.collection("At").insert({
        "_from": f"{ORDERS_COLLECTION}/{order_key}",
        "_to": f"Locations/{loc_key}"
    })

    # 3. Связь Owns
    owns_data = {
        "_from": f"users/{client_key}",
        "_to": f"{ORDERS_COLLECTION}/{order_key}",
        "created_at": datetime.now().isoformat(),
        "relation_type": "owns"
    }

    try:
        db.collection("Owns").insert(owns_data)
        print(f"✅ Создана связь Owns")
    except Exception as e:
        print(f"❌ [Error] Не удалось создать связь Owns: {e}")

    # 4. Подготовка ответа
    order_data["address"] = order_in.address
    order_data["id"] = order_key

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



def get_my_orders(client_key: str, status_filter: str = None):
    """
    Получить все заказы конкретного клиента
    """
    _ensure_collections()
    db = arango_instance.db

    query = """
    FOR o IN @@orders
        FILTER o.client_key == @client_key
        FILTER @status_filter == null OR o.status == @status_filter
        
        // Получаем адрес через ребро At
        FOR loc IN 1..1 OUTBOUND o At
            LET order_with_addr = MERGE(o, { "address": loc.address })
            SORT order_with_addr.created_at DESC
            RETURN order_with_addr
    """

    cursor = db.aql.execute(query, bind_vars={
        "@orders": ORDERS_COLLECTION,
        "client_key": client_key,
        "status_filter": status_filter
    })


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
        })

    return raw_orders



    
