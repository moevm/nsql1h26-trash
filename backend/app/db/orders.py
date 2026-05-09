from datetime import datetime, timedelta, timezone
from app.db.session import arango_instance
from app.db.users import deduct_order_payment, payout_to_courier
from app.models.order import OrderCreate, Order


USERS_COLLECTION = "Users"
ORDERS_COLLECTION = "Orders"
EXECUTES_COLLECTION = "Executes"
OWNS_COLLECTION = "Owns"

ADDRESSES_COLLECTION = 'Addresses'
AT_COLLECTION = "At"

HISTORY_COLLECTION = "History"

TRANSACTION_COLLECTION = "Transactions"



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

    if not db.has_collection(HISTORY_COLLECTION):
        db.create_collection(HISTORY_COLLECTION, edge=True)
        print(f"✅ Создана Edge-коллекция: {HISTORY_COLLECTION}")

    if not db.has_collection(TRANSACTION_COLLECTION):
        db.create_collection(TRANSACTION_COLLECTION)
        print(f"✅ Создана коллекция: {TRANSACTION_COLLECTION}")


def create_order(order_in: OrderCreate, client_key: str, price: float) -> Order:
    """
    Создаёт новый заказ.
    """
    _ensure_collections()
    db = arango_instance.db
    deduct_order_payment(user_key=client_key, amount=price)

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



def get_available_orders(type_filter: str = None, skip: int = 0, limit: int = 10):
    db = arango_instance.db

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
        
        SORT o.created_at DESC
        LIMIT @skip, @limit

        RETURN MERGE(o, {
            id: o._key,
            address: addr_doc.full_address,
            address_details: addr_doc.details
        })
    """

    bind_vars = {
        "filter": type_filter,
        "skip": skip,
        "limit": limit,
        "@orders": ORDERS_COLLECTION,
        "@executes": EXECUTES_COLLECTION,
        "@at": AT_COLLECTION,
    }

    cursor = db.aql.execute(
        query,
        bind_vars=bind_vars,
        full_count=True
    )

    raw_orders = list(cursor)
    total_count = cursor.statistics().get('fullCount', 0)
    for o in raw_orders:
        style = ORDER_STYLES.get(
            o.get("waste_type"),
            {"icon": "eco", "color": "text-green-500", "bg": "bg-green-50"}
        )
        o.update({
            "icon": style["icon"],
            "color": style["color"],
            "bg": style["bg"],
            "isNew": True
        })

    return raw_orders, total_count


def update_order_status_by_courier(order_key: str, new_status: str, courier_key: str):
    """
    Изменение статуса заказа
    """
    _ensure_collections()
    db = arango_instance.db

    order = db.collection(ORDERS_COLLECTION).get(order_key)
    if not order:
        return {"error": "not_found"}

    now = datetime.now(timezone.utc).isoformat()

    if new_status == "active":
        db.collection(EXECUTES_COLLECTION).insert({
            "_from": f"{USERS_COLLECTION}/{courier_key}",
            "_to": f"{ORDERS_COLLECTION}/{order_key}",
            "started_at": now
        })

    elif new_status == "done":
        if not order.get("completion_photo"):
            return {"error": "no_photo"}

        price = float(order.get("price", 0.0))


        payout_to_courier(
            courier_key=courier_key,
            amount=price,
            order_key=order_key
        )

        tx_meta = db.collection(TRANSACTION_COLLECTION).insert({
            "amount": price,
            "type": "order_payout",
            "status": "success",
            "timestamp": now,
            "courier_id": str(courier_key)
        })

        db.collection(HISTORY_COLLECTION).insert({
            "_from": f"{ORDERS_COLLECTION}/{order_key}",
            "_to": f"{TRANSACTION_COLLECTION}/{tx_meta['_key']}",
            "created_at": now
        })


    db.collection(ORDERS_COLLECTION).update({"_key": order_key, "status": new_status})
    return {"success": True}



def get_my_orders(client_key: str, status_filter: str = None, waste_type: str = None, skip: int = 0, limit: int = 20, sort_by: str = "created_at", sort_order: str = "desc"):
    """
    Получить все заказы конкретного клиента
    """
    _ensure_collections()
    db = arango_instance.db

    allowed_sort_fields = {"created_at", "price", "waste_type", "volume"}
    if sort_by not in allowed_sort_fields:
        sort_by = "created_at"

    direction = "DESC" if sort_order.lower() == "desc" else "ASC"

    query = """
    LET user_id = CONCAT(@users_collection, '/', @client_key)
    
    FOR o IN 1..1 OUTBOUND user_id @@owns_collection
        FILTER @status_filter == null OR o.status == @status_filter
        FILTER @waste_type == null OR o.waste_type == @waste_type
        
        LET addr = FIRST(
            FOR v IN 1..1 OUTBOUND o @@at_collection
                RETURN v
        )
        
        SORT o.@sort_field @sort_direction
        LIMIT @skip, @limit
        
        RETURN MERGE(o, {
            "id": o._key,
            "address": addr.full_address,
            "address_details": addr.details
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
            "waste_type": waste_type,
            "sort_field": sort_by,
            "sort_direction": direction,
            "skip": skip,
            "limit": limit,
        },
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
        
        //FILTER is_owner == true
        
        LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o @@at_col RETURN v)
        
        LET courier_info = FIRST(
            FOR courier IN 1..1 INBOUND o @@executes_col
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
            "@at_col": AT_COLLECTION,
            "@executes_col": EXECUTES_COLLECTION
        }
    )

    return cursor.next() if not cursor.empty() else None



def get_order_details_for_courier(order_key: str):
    """
    Получить полную информацию о заказе для курьера одним запросом.
    """
    _ensure_collections()
    db = arango_instance.db

    query = """
    FOR o IN @@orders_col
        FILTER o._key == @order_key
        
        LET client = FIRST(FOR u IN 1..1 INBOUND o @@owns_col RETURN u)
        
        LET addr = FIRST(FOR a IN 1..1 OUTBOUND o @@at_col RETURN a)
        
        LET tx = IS_SAME_COLLECTION('History', @@history_col) ? 
            FIRST(FOR h IN 1..1 OUTBOUND o @@history_col RETURN h) : null

        RETURN MERGE(o, {
            "id": o._key,
            "client_name": client.full_name OR client.name OR "Неизвестный заказчик",
            "address": addr.full_address,
            "address_details": addr.details,
            "transaction": tx
        })
    """

    cursor = db.aql.execute(
        query,
        bind_vars={
            "order_key": order_key,
            "@orders_col": ORDERS_COLLECTION,
            "@owns_col": OWNS_COLLECTION,
            "@at_col": AT_COLLECTION,
            "@history_col": HISTORY_COLLECTION
        }
    )

    return cursor.next() if not cursor.empty() else None

def get_courier_orders_service(courier_id: str, search: str = None, waste_type: str = None,
                               status: str = None, skip: int = 0, limit: int = 10, sort: str = "desc"):
    """
    Получение активных и выполненных заказов курьером
    """
    db = arango_instance.db
    sort_direction = "DESC" if sort == "desc" else "ASC"

    query = f"""
    FOR edge IN Executes
        FILTER edge._from == @courier_id
        LET order = DOCUMENT(edge._to)
        
        FILTER (@status == null OR order.status == @status)
        FILTER (@waste_type == null OR order.waste_type == @waste_type)

        LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND order @@at RETURN v)
        
        LET final_order = MERGE(order, {{ 
            "id": order._key,
            "address": addr_doc.full_address,
            "address_details": addr_doc.details
        }})

        FILTER @search == null OR (
            CONTAINS(LOWER(final_order.id), LOWER(@search)) OR
            CONTAINS(LOWER(final_order.address), LOWER(@search))
        )
        
        SORT final_order.created_at {sort_direction}
        LIMIT @skip, @limit
        RETURN final_order
    """

    bind_vars = {
        "courier_id": f"{USERS_COLLECTION}/{courier_id}",
        "search": search,
        "waste_type": waste_type,
        "status": status,
        "skip": skip,
        "limit": limit,
        "@at": AT_COLLECTION
    }

    cursor = db.aql.execute(query, bind_vars=bind_vars, full_count=True)
    orders = list(cursor)
    total_count = cursor.statistics().get('fullCount', 0)

    return orders, total_count

def get_courier_stats_service(courier_key: str):
    """
    Рассчитывает статистику курьера:
    - Общее количество заказов
    - Доход и заказы за последние 30 дней
    - Доход и заказы за период 60-30 дней назад
    """
    db = arango_instance.db
    user_id = f"{USERS_COLLECTION}/{courier_key}"

    query = """
    LET executed_orders = (
        FOR v, e IN 1..1 OUTBOUND @user_id @@executes
            FILTER v.status == 'done'
            RETURN {
                price: TO_NUMBER(v.price || 0),
                created_at: v.created_at
            }
    )
    
    LET now = DATE_NOW()
    LET thirty_days_ago = DATE_SUBTRACT(now, 30, "days")
    LET sixty_days_ago = DATE_SUBTRACT(now, 60, "days")
    
    LET current_month_orders = (
        FOR o IN executed_orders
            FILTER o.created_at >= DATE_ISO8601(thirty_days_ago)
            RETURN o
    )
    
    LET last_month_orders = (
        FOR o IN executed_orders
            FILTER o.created_at >= DATE_ISO8601(sixty_days_ago) 
            FILTER o.created_at < DATE_ISO8601(thirty_days_ago)
            RETURN o
    )

    RETURN {
        "total_orders": LENGTH(executed_orders),
        "month_earnings": SUM(current_month_orders[*].price),
        "month_orders_count": LENGTH(current_month_orders),
        "prev_month_earnings": SUM(last_month_orders[*].price),
        "prev_month_orders_count": LENGTH(last_month_orders)
    }
    """

    bind_vars = {
        "user_id": user_id,
        "@executes": EXECUTES_COLLECTION
    }

    cursor = db.aql.execute(query, bind_vars=bind_vars)

    default_stats = {
        "total_orders": 0,
        "month_earnings": 0,
        "month_orders_count": 0,
        "prev_month_earnings": 0,
        "prev_month_orders_count": 0
    }

    return cursor.next() if not cursor.empty() else default_stats


def get_courier_transactions_service(courier_key: str, skip: int = 0, limit: int = 20, period: str = 'За неделю'):
    db = arango_instance.db
    now = datetime.utcnow()

    if period == 'За неделю':
        start_date = now - timedelta(days=7)
    elif period == 'За месяц':
        start_date = now - timedelta(days=30)
    elif period == 'За год':
        start_date = now - timedelta(days=365)
    else:
        start_date = None

    start_timestamp_iso = start_date.isoformat() if start_date else None

    query = """
    FOR t IN @@transactions
        FILTER t.courier_id == @courier_id
        FILTER @start_timestamp == null OR t.timestamp >= @start_timestamp
        SORT t.timestamp DESC
        LIMIT @skip, @limit
        RETURN {
            "date": t.timestamp,
            "type": t.type == 'order_payout' ? "Зачисление за заказ" : (t.description || "Операция"),
            "amount": t.amount,
            "isIncome": t.amount > 0
        }
    """

    bind_vars = {
        "courier_id": str(courier_key),
        "skip": skip,
        "limit": limit,
        "start_timestamp": start_timestamp_iso,
        "@transactions": TRANSACTION_COLLECTION
    }

    cursor = db.aql.execute(query, bind_vars=bind_vars, full_count=True)
    transactions = list(cursor)
    total_count = cursor.statistics().get('fullCount', 0)

    return {
        "transactions": transactions,
        "total": total_count
    }

def create_withdraw_transaction_service(courier_key: str, amount: float, card_number: str):
    db = arango_instance.db
    courier_id = f"Users/{courier_key}"

    card_mask = f"**** {card_number[-4:]}"
    description_text = f"Вывод на карту {card_mask}"

    query = """
    LET courier = DOCUMENT(@courier_id)
    LET withdrawAmount = TO_NUMBER(@amount)
    
    FILTER courier != null AND TO_NUMBER(courier.balance) >= withdrawAmount

    UPDATE courier WITH { balance: TO_NUMBER(courier.balance) - withdrawAmount } IN Users
    INSERT {
        courier_id: @courier_key,
        amount: -withdrawAmount, 
        type: "withdraw",
        status: "completed",
        description: @description, 
        card_mask: @card_mask,
        timestamp: DATE_ISO8601(DATE_NOW())
    } INTO Transactions
    
    RETURN {
        new_balance: TO_NUMBER(courier.balance) - withdrawAmount,
        transaction: NEW
    }
    """

    bind_vars = {
        "courier_id": courier_id,
        "courier_key": courier_key,
        "amount": float(amount),
        "description": description_text,
        "card_mask": card_mask
    }

    cursor = db.aql.execute(query, bind_vars=bind_vars)
    return cursor.next() if not cursor.empty() else None