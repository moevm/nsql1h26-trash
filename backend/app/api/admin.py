import json
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from app.api.deps import get_current_active_admin
from app.models.user import UserResponse
from app.db.session import arango_instance
from app.db.events import get_events, get_events_count, ensure_events_collection

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    full_name: Optional[str] = Query(None, description="Подстрока ФИО"),
    email: Optional[str] = Query(None, description="Подстрока email"),
    phone: Optional[str] = Query(None, description="Подстрока телефона"),
    role: Optional[str] = Query(None, description="Роль: admin/customer/courier"),
    is_active: Optional[bool] = Query(None, description="Статус активности"),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: UserResponse = Depends(get_current_active_admin),
):
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

    filter_bind_vars = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "role": role,
        "is_active": is_active,
    }

    paged_bind_vars = {
        **filter_bind_vars,
        "offset": offset,
        "limit": limit,
    }

    users = list(db.aql.execute(query, bind_vars=paged_bind_vars))
    total = list(db.aql.execute(total_query, bind_vars=filter_bind_vars))[0]

    return {
        "items": users,
        "total": total,
        "offset": offset,
        "limit": limit,
    }


@router.get("/orders")
async def list_orders(
    order_id: Optional[str] = Query(None, description="Подстрока ID заказа"),
    status: Optional[str] = Query(None, description="Статус заказа"),
    waste_type: Optional[str] = Query(None, description="Тип отходов"),
    address: Optional[str] = Query(None, description="Подстрока адреса"),
    client_name: Optional[str] = Query(None, description="Подстрока ФИО клиента"),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: UserResponse = Depends(get_current_active_admin),
):
    db = arango_instance.db

    query = """
    FOR o IN Orders
        LET client = o.client_key != null ? DOCUMENT(CONCAT("Users/", o.client_key)) : null
        LET addr_doc = FIRST(FOR v IN 1..1 OUTBOUND o At RETURN v)
        LET courier_edge = FIRST(
            FOR e IN Executes
                FILTER PARSE_IDENTIFIER(e._to).key == o._key
                RETURN e
        )
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

    filter_bind_vars = {
        "order_id": order_id,
        "status": status,
        "waste_type": waste_type,
        "address": address,
        "client_name": client_name,
    }

    paged_bind_vars = {
        **filter_bind_vars,
        "offset": offset,
        "limit": limit,
    }

    orders = list(db.aql.execute(query, bind_vars=paged_bind_vars))
    total = list(db.aql.execute(total_query, bind_vars=filter_bind_vars))[0]

    return {
        "items": orders,
        "total": total,
        "offset": offset,
        "limit": limit,
    }


@router.get("/dashboard/stats")
async def dashboard_stats(current_user: UserResponse = Depends(get_current_active_admin)):
    db = arango_instance.db

    # Количество заказов завершённых сегодня
    orders_today_query = """
    LET today = DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd")
    FOR o IN Orders
        FILTER o.status == "done"
        FILTER o.completed_at != null
        FILTER DATE_FORMAT(DATE_ISO8601(o.completed_at), "%yyyy-%mm-%dd") == today
        COLLECT WITH COUNT INTO cnt
        RETURN cnt
    """
    cursor = db.aql.execute(orders_today_query)
    orders_today = list(cursor)
    orders_today = orders_today[0] if orders_today else 0

    # Курьеры на линии (имеют активные заказы) / всего курьеров
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
    cursor = db.aql.execute(couriers_query)
    couriers = list(cursor)
    couriers_data = couriers[0] if couriers else {"active": 0, "total": 0}

    # Вывезено сегодня (м³)
    volume_query = """
    LET today = DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd")
    FOR o IN Orders
        FILTER o.status == "done"
        FILTER o.completed_at != null
        FILTER DATE_FORMAT(DATE_ISO8601(o.completed_at), "%yyyy-%mm-%dd") == today
        COLLECT AGGREGATE vol = SUM(o.volume)
        RETURN vol
    """
    cursor = db.aql.execute(volume_query)
    volume = list(cursor)
    volume_today = volume[0] if volume and volume[0] is not None else 0

    return {
        "orders_today": orders_today,
        "couriers_active": couriers_data["active"],
        "couriers_total": couriers_data["total"],
        "volume_today": round(volume_today, 1),
    }


@router.get("/dashboard/events")
async def dashboard_events(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_active_admin),
):
    ensure_events_collection()
    db = arango_instance.db

    events = get_events(offset=offset, limit=limit)
    total = get_events_count()

    enriched = []
    for ev in events:
        item = {
            "id": ev.get("_key"),
            "event_type": ev.get("event_type"),
            "title": ev.get("title"),
            "description": ev.get("description"),
            "created_at": ev.get("created_at"),
            "related_id": ev.get("related_id"),
            "related_type": ev.get("related_type"),
            "error": None,
        }

        # Проверка на удалённый связанный объект
        related_id = ev.get("related_id")
        related_type = ev.get("related_type")
        if related_id and related_type:
            _type_to_collection = {
                "order": "Orders",
                "Order": "Orders",
                "user": "Users",
                "User": "Users",
                "Transaction": "Transactions",
            }
            collection = _type_to_collection.get(related_type)
            if collection:
                try:
                    doc = db.collection(collection).get(related_id)
                    if doc is None:
                        item["error"] = "Ошибка отображения события: связанный объект не найден"
                except Exception:
                    item["error"] = "Ошибка отображения события: связанный объект не найден"

        enriched.append(item)

    return {
        "events": enriched,
        "total": total,
        "has_more": offset + limit < total,
    }


@router.get("/analytics")
async def get_analytics(
    x_axis: str = Query("waste_type", description="waste_type | month | courier"),
    y_axis: str = Query("volume", description="volume | count | price"),
    period: str = Query("all", description="all | month | year"),
    waste_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="done — только выполненные"),
    current_user: UserResponse = Depends(get_current_active_admin),
):
    from datetime import datetime, timedelta, timezone

    db = arango_instance.db

    now = datetime.now(timezone.utc)
    if period == "month":
        since = (now - timedelta(days=30)).isoformat()
    elif period == "year":
        since = (now - timedelta(days=365)).isoformat()
    else:
        since = None

    y_expr = (
        "SUM(o.volume)"
        if y_axis == "volume"
        else "SUM(o.price)"
        if y_axis == "price"
        else "COUNT(1)"
    )

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
              {period_filter}
              {waste_filter}
              {status_filter}
              COLLECT label = courier.full_name AGGREGATE value = {y_expr}
              SORT value DESC
              RETURN {{label, value: value == null ? 0 : value}}
        """
    elif x_axis == "month":
        query = f"""
            FOR o IN Orders
              {period_filter}
              {waste_filter}
              {status_filter}
              LET label = SUBSTRING(o.created_at, 0, 7)
              COLLECT grp = label AGGREGATE value = {y_expr}
              SORT grp ASC
              RETURN {{label: grp, value: value == null ? 0 : value}}
        """
    else:  # waste_type
        query = f"""
            FOR o IN Orders
              {period_filter}
              {waste_filter}
              {status_filter}
              COLLECT label = o.waste_type AGGREGATE value = {y_expr}
              SORT value DESC
              RETURN {{label, value: value == null ? 0 : value}}
        """

    rows = list(db.aql.execute(query, bind_vars=bind))
    labels = [r["label"] or "Неизвестно" for r in rows]
    values = [round(r["value"], 2) for r in rows]
    total = round(sum(values), 2)

    return {"labels": labels, "values": values, "total": total}


@router.get("/backup/export")
async def export_backup(current_user: UserResponse = Depends(get_current_active_admin)):
    db = arango_instance.db

    dump = {}
    for collection_info in db.collections():
        name = collection_info["name"]
        if name.startswith("_"):
            continue
        docs = list(db.collection(name).all())
        dump[name] = docs

    content = json.dumps(dump, ensure_ascii=False, default=str)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=backup.json"},
    )


@router.post("/backup/import")
async def import_backup(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_active_admin),
):
    raw = await file.read()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Ошибка формата: выберите корректный файл дампа базы данных",
        )

    if not isinstance(data, dict):
        raise HTTPException(
            status_code=400,
            detail="Ошибка формата: выберите корректный файл дампа базы данных",
        )

    db = arango_instance.db
    try:
        for collection_name, docs in data.items():
            if not isinstance(docs, list):
                continue
            if not db.has_collection(collection_name):
                db.create_collection(collection_name)
            col = db.collection(collection_name)
            col.truncate()
            for doc in docs:
                clean = {k: v for k, v in doc.items() if k not in ("_id", "_rev")}
                col.insert(clean)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Критическая ошибка при восстановлении. Часть данных может быть утеряна: {e}",
        )

    return {"message": "Данные успешно восстановлены"}
