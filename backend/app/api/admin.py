from fastapi import APIRouter, Depends, Query
from app.api.deps import get_current_active_admin
from app.models.user import UserResponse
from app.db.session import arango_instance
from app.db.events import get_events, get_events_count, ensure_events_collection

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard/stats")
async def dashboard_stats(current_user: UserResponse = Depends(get_current_active_admin)):
    db = arango_instance.db

    # Количество заказов за сегодня
    orders_today_query = """
    LET today = DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd")
    FOR o IN Orders
        FILTER DATE_FORMAT(DATE_ISO8601(o.created_at), "%yyyy-%mm-%dd") == today
        COLLECT WITH COUNT INTO cnt
        RETURN cnt
    """
    cursor = db.aql.execute(orders_today_query)
    orders_today = list(cursor)
    orders_today = orders_today[0] if orders_today else 0

    # Курьеры на линии (имеют активные заказы) / всего курьеров
    couriers_query = """
    LET total = LENGTH(FOR u IN users FILTER u.role == "courier" RETURN u)
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
        FILTER DATE_FORMAT(DATE_ISO8601(o.created_at), "%yyyy-%mm-%dd") == today
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
            collection = "Orders" if related_type == "order" else "users"
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
