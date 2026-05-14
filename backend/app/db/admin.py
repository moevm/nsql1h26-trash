import json
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from app.db.session import arango_instance


USERS_COL = "Users"
ORDERS_COL = "Orders"
EXECUTES_COL = "Executes"
TRANSACTIONS_COL = "Transactions"
AT_COL = "At"

def get_admin_users_service(filters: dict, offset: int, limit: int):
    db = arango_instance.db

    query = """
    FOR u IN Users
        FILTER @full_name == null OR CONTAINS(LOWER(u.full_name), LOWER(@full_name))
        FILTER @email == null OR CONTAINS(LOWER(u.email), LOWER(@email))
        FILTER @phone == null OR CONTAINS(LOWER(u.phone), LOWER(@phone))
        FILTER @role == null OR u.role == @role
        FILTER @is_active == null OR u.is_active == @is_active
        SORT u.created_at DESC
        LIMIT @offset, @limit
        RETURN {
            id: u._key,
            full_name: u.full_name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            is_active: u.is_active,
            created_at: u.created_at
        }
    """

    total_query = """
    RETURN LENGTH(
        FOR u IN Users
            FILTER @full_name == null OR CONTAINS(LOWER(u.full_name), LOWER(@full_name))
            FILTER @email == null OR CONTAINS(LOWER(u.email), LOWER(@email))
            FILTER @phone == null OR CONTAINS(LOWER(u.phone), LOWER(@phone))
            FILTER @role == null OR u.role == @role
            FILTER @is_active == null OR u.is_active == @is_active
            RETURN 1
    )
    """

    items = list(db.aql.execute(query, bind_vars={**filters, "offset": offset, "limit": limit}))
    total_result = list(db.aql.execute(total_query, bind_vars=filters))
    total = total_result[0] if total_result else 0

    return items, total


def get_admin_orders_service(filters: dict, offset: int, limit: int):
    db = arango_instance.db

    query = """
    FOR o IN Orders
        LET client = o.client_key != null ? DOCUMENT(CONCAT("Users/", o.client_key)) : null
        LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o At RETURN v)
        LET courier_edge = FIRST(FOR e IN Executes FILTER PARSE_IDENTIFIER(e._to).key == o._key RETURN e)
        LET courier = courier_edge != null ? DOCUMENT(courier_edge._from) : null

        FILTER @order_id == null OR CONTAINS(LOWER(o._key), LOWER(@order_id))
        FILTER @status == null OR o.status == @status
        FILTER @waste_type == null OR o.waste_type == @waste_type
        FILTER @address == null OR (addr_doc != null AND CONTAINS(LOWER(addr_doc.full_address), LOWER(@address)))
        FILTER @client_name == null OR (client != null AND CONTAINS(LOWER(client.full_name), LOWER(@client_name)))

        SORT o.created_at DESC
        LIMIT @offset, @limit
        RETURN {
            id: o._key,
            created_at: o.created_at,
            waste_type: o.waste_type,
            address: addr_doc != null ? addr_doc.full_address : null,
            status: o.status,
            price: o.price,
            client_name: client != null ? client.full_name : null,
            courier_name: courier != null ? courier.full_name : null
        }
    """

    total_query = """
    RETURN LENGTH(
        FOR o IN Orders
            LET client = o.client_key != null ? DOCUMENT(CONCAT("Users/", o.client_key)) : null
            LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o At RETURN v)
            FILTER @order_id == null OR CONTAINS(LOWER(o._key), LOWER(@order_id))
            FILTER @status == null OR o.status == @status
            FILTER @waste_type == null OR o.waste_type == @waste_type
            FILTER @address == null OR (addr_doc != null AND CONTAINS(LOWER(addr_doc.full_address), LOWER(@address)))
            FILTER @client_name == null OR (client != null AND CONTAINS(LOWER(client.full_name), LOWER(@client_name)))
            RETURN 1
    )
    """

    items = list(db.aql.execute(query, bind_vars={**filters, "offset": offset, "limit": limit}))
    total_result = list(db.aql.execute(total_query, bind_vars=filters))
    total = total_result[0] if total_result else 0

    return items, total
def get_dashboard_stats_service():
    db = arango_instance.db
    # Заказы сегодня
    orders_query = """
    LET today = DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd")
    FOR o IN Orders
        FILTER o.status == "done" AND o.completed_at != null
        FILTER DATE_FORMAT(DATE_ISO8601(o.completed_at), "%yyyy-%mm-%dd") == today
        COLLECT WITH COUNT INTO cnt RETURN cnt
    """
    # Курьеры
    couriers_query = """
    LET total = LENGTH(FOR u IN Users FILTER u.role == "courier" RETURN u)
    LET active_keys = (
        FOR e IN Executes
            LET order = DOCUMENT(e._to)
            FILTER order != null AND order.status == "active"
            RETURN DISTINCT PARSE_IDENTIFIER(e._from).key
    )
    RETURN { active: LENGTH(active_keys), total: total }
    """
    # Объем
    volume_query = """
    LET today = DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd")
    FOR o IN Orders
        FILTER o.status == "done" AND o.completed_at != null
        FILTER DATE_FORMAT(DATE_ISO8601(o.completed_at), "%yyyy-%mm-%dd") == today
        COLLECT AGGREGATE vol = SUM(o.volume) RETURN vol
    """

    orders_today = list(db.aql.execute(orders_query))[0] or 0
    couriers_data = list(db.aql.execute(couriers_query))[0] or {"active": 0, "total": 0}
    volume_today = list(db.aql.execute(volume_query))[0] or 0

    return {
        "orders_today": orders_today,
        "couriers_active": couriers_data["active"],
        "couriers_total": couriers_data["total"],
        "volume_today": round(volume_today, 1),
    }

def get_analytics_service(x_axis, y_axis, period, waste_type, status):
    db = arango_instance.db
    now = datetime.now(timezone.utc)
    since = None
    if period == "month": since = (now - timedelta(days=30)).isoformat()
    elif period == "year": since = (now - timedelta(days=365)).isoformat()

    y_expr = "SUM(o.volume)" if y_axis == "volume" else "SUM(o.price)" if y_axis == "price" else "COUNT(1)"
    period_filter = "FILTER @since == null OR o.created_at >= @since"
    waste_filter = "FILTER @waste_type == null OR o.waste_type == @waste_type"
    status_filter = "FILTER @status == null OR o.status == @status"

    bind = {
        "since": since,
        "waste_type": waste_type if waste_type and waste_type != "Любой" else None,
        "status": "done" if status == "done" else None,
    }

    if x_axis == "courier":
        query = f"""
            FOR e IN Executes
              LET o = DOCUMENT(e._to)
              LET courier = DOCUMENT(e._from)
              FILTER o != null AND courier != null
              {period_filter} {waste_filter} {status_filter}
              COLLECT label = courier.full_name AGGREGATE value = {y_expr}
              SORT value DESC RETURN {{label, value: value == null ? 0 : value}}
        """
    elif x_axis == "month":
        query = f"""
            FOR o IN Orders
              {period_filter} {waste_filter} {status_filter}
              LET label = SUBSTRING(o.created_at, 0, 7)
              COLLECT grp = label AGGREGATE value = {y_expr}
              SORT grp ASC RETURN {{label: grp, value: value == null ? 0 : value}}
        """
    else:
        query = f"""
            FOR o IN Orders
              {period_filter} {waste_filter} {status_filter}
              COLLECT label = o.waste_type AGGREGATE value = {y_expr}
              SORT value DESC RETURN {{label, value: value == null ? 0 : value}}
        """

    rows = list(db.aql.execute(query, bind_vars=bind))
    labels = [r["label"] or "Неизвестно" for r in rows]
    values = [round(r["value"], 2) for r in rows]
    return labels, values

def export_backup_service():
    db = arango_instance.db
    dump = {}
    for col in db.collections():
        if col['name'].startswith("_"): continue
        dump[col['name']] = list(db.collection(col['name']).all())
    return dump

def import_backup_service(data: dict):
    db = arango_instance.db
    for col_name, docs in data.items():
        if not isinstance(docs, list): continue
        if not db.has_collection(col_name): db.create_collection(col_name)
        col = db.collection(col_name)
        col.truncate()
        for doc in docs:
            clean = {k: v for k, v in doc.items() if k not in ("_id", "_rev")}
            col.insert(clean)