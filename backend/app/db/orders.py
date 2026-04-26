from datetime import datetime
from app.db.session import arango_instance
from app.models.order import OrderCreate, Order, OrderStatus

USERS_COLLECTION = "Users"
ORDERS_COLLECTION = "Orders"
EXECUTES_COLLECTION = "Executes"
OWNS_COLLECTION = "Owns"

ADDRESSES_COLLECTION = 'Addresses'
AT_COLLECTION = "At"



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

    if not db.has_collection(ADDRESSES_COLLECTION):
        db.create_collection(ADDRESSES_COLLECTION)
        print(f"✅ Создана коллекция: {ADDRESSES_COLLECTION}")

    if not db.has_collection(AT_COLLECTION):
        db.create_collection(AT_COLLECTION, edge=True)
        print(f"✅ Создана Edge-коллекция: {AT_COLLECTION}")

    if not db.has_collection(OWNS_COLLECTION):
        db.create_collection(OWNS_COLLECTION, edge=True)
        print(f"✅ Создана Edge-коллекция: {OWNS_COLLECTION}")    


def create_order(order_in: OrderCreate, client_key: str, price: float) -> Order:
    """
    Создаёт новый заказ.
    client_key — _key пользователя-заказчика (нужен для связи)
    """
    _ensure_collections()
    db = arango_instance.db

    addr_data = {
        "full_address": order_in.address,
        "details": order_in.address_details.model_dump() if order_in.address_details else None
    }
    addr_res = db.collection(ADDRESSES_COLLECTION).insert(addr_data)
    addr_key = addr_res["_key"]


    order_dict = order_in.model_dump(exclude={"address", "address_details"})
    order_dict["client_key"] = client_key
    order_dict["price"] = price
    print(f"DEBUG: [DB] Сохраняю заказ с ценой: {price}")
    order_dict["created_at"] = datetime.now().isoformat()

    result = db.collection(ORDERS_COLLECTION).insert(order_dict, return_new=True)


    order_data = result["new"]
    order_key = order_data["_key"]



    at_data = {
        "_from": f"{ORDERS_COLLECTION}/{order_key}",
        "_to": f"{ADDRESSES_COLLECTION}/{addr_key}",
        "relation_type": AT_COLLECTION
    }

    owns_data = {
        "_from": f"{USERS_COLLECTION}/{client_key}",
        "_to": f"{ORDERS_COLLECTION}/{order_key}",
        "created_at": datetime.now().isoformat(),
        "relation_type": OWNS_COLLECTION
    }

    try:
        db.collection(AT_COLLECTION).insert(at_data)
    except Exception as e:
        print(f"[Error] Не удалось создать связь At: {e}")    

    try:
        db.collection(OWNS_COLLECTION).insert(owns_data)
        print(f"Создана связь Owns: {USERS_COLLECTION}/{client_key} → Orders/{order_key}")
    except Exception as e:
        print(f"[Error] Не удалось создать связь Owns: {e}")

    order_data["address"] = order_in.address
    order_data["address_details"] = order_in.address_details    

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

        LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o @@at RETURN v)

        RETURN MERGE(o, {
            address: addr_doc.full_address,
            address_details: addr_doc.details
        })
    """

    cursor = db.aql.execute(
        query,
        bind_vars={
            "filter": type_filter,
            "@orders": ORDERS_COLLECTION,
            "@executes": EXECUTES_COLLECTION,
            "@at": AT_COLLECTION,
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
    LET user_id = CONCAT(@users_collection, '/', @client_key)
    
    FOR o IN 1..1 OUTBOUND user_id @@owns_collection
        FILTER @status_filter == null OR o.status == @status_filter
        SORT o.created_at DESC
        
        LET addr_doc = FIRST(
            FOR v IN 1..1 OUTBOUND o @@at_collection
                RETURN v
        )
        
        RETURN MERGE(o, {
            "id": o._key,
            "address": addr_doc.full_address,
            "address_details": addr_doc.details,
        })
    """

    cursor = db.aql.execute(
        query,
        bind_vars={
            "client_key": client_key,
            "@owns_collection": OWNS_COLLECTION,
            "@at_collection": AT_COLLECTION,
            "status_filter": status_filter,
            "users_collection": USERS_COLLECTION,
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
        })

    return raw_orders


def get_order_by_id_for_client(order_key: str, client_key: str):

    _ensure_collections()
    db = arango_instance.db

    query = """
    FOR o IN @@orders_col
        FILTER o._key == @order_key
        
        LET is_owner = FIRST(
            FOR u IN 1..1 INBOUND o @@owns_col
                FILTER u._key == @client_key
                RETURN true
        )
        
        FILTER is_owner == true
        
        LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o @@at_col RETURN v)
        
        LET courier_info = FIRST(
            FOR courier IN 1..1 INBOUND o Executes
                RETURN {
                    id: courier._key,
                    full_name: courier.full_name,
                    phone: courier.phone,
                    rating: courier.rating,
                    transport: courier.transport
                }
        )
        
        RETURN MERGE(o, {
            "id": o._key,
            "address": addr_doc.full_address,
            "address_details": addr_doc.details,
            "courier": courier_info
        })
    """

    cursor = db.aql.execute(
        query,
        bind_vars={
            "order_key": order_key,
            "client_key": client_key,
            "@orders_col": ORDERS_COLLECTION,
            "@owns_col": OWNS_COLLECTION,
            "@at_col": AT_COLLECTION
        }
    )
    
    return cursor.next() if not cursor.empty() else None





    