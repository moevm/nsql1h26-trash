from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from typing import Optional
import json

from app.api.deps import get_current_active_admin
from app.models.user import UserResponse
from app.db.events import get_events, get_events_count, ensure_events_collection
from app.db.session import arango_instance
from app.db.admin import (
    get_admin_users_service, get_admin_orders_service, get_dashboard_stats_service,
    get_analytics_service, export_backup_service, import_backup_service
)

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
async def list_users(
        full_name: Optional[str] = Query(None),
        email: Optional[str] = Query(None),
        phone: Optional[str] = Query(None),
        role: Optional[str] = Query(None),
        is_active: Optional[bool] = Query(None),
        offset: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=200),
        current_user: UserResponse = Depends(get_current_active_admin),
):
    filters = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "role": role,
        "is_active": is_active
    }
    items, total = get_admin_users_service(filters, offset, limit)

    return {
        "items": items,
        "total": total,
        "offset": offset,
        "limit": limit
    }


@router.get("/orders")
async def list_orders(
        order_id: Optional[str] = Query(None),
        status: Optional[str] = Query(None),
        waste_type: Optional[str] = Query(None),
        address: Optional[str] = Query(None),
        client_name: Optional[str] = Query(None),
        offset: int = Query(0, ge=0),
        limit: int = Query(50, ge=1, le=200),
        current_user: UserResponse = Depends(get_current_active_admin),
):
    filters = {
        "order_id": order_id,
        "status": status,
        "waste_type": waste_type,
        "address": address,
        "client_name": client_name
    }
    items, total = get_admin_orders_service(filters, offset, limit)

    return {
        "items": items,
        "total": total,
        "offset": offset,
        "limit": limit
    }

@router.get("/dashboard/stats")
async def dashboard_stats(current_user: UserResponse = Depends(get_current_active_admin)):
    return get_dashboard_stats_service()

@router.get("/dashboard/events")
async def dashboard_events(
        offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
        current_user: UserResponse = Depends(get_current_active_admin),
):
    ensure_events_collection()
    events = get_events(offset=offset, limit=limit)
    total = get_events_count()
    enriched = []
    db = arango_instance.db
    for ev in events:
        item = {**ev, "id": ev.get("_key"), "error": None}
        rid, rtype = ev.get("related_id"), ev.get("related_type")
        if rid and rtype:
            col = {"order": "Orders", "Order": "Orders", "user": "Users", "User": "Users"}.get(rtype)
            if col and not db.collection(col).get(rid):
                item["error"] = "Ошибка отображения события: связанный объект не найден"
        enriched.append(item)
    return {"events": enriched, "total": total, "has_more": offset + limit < total}

@router.get("/analytics")
async def get_analytics(
        x_axis: str = Query("waste_type"), y_axis: str = Query("volume"), period: str = Query("all"),
        waste_type: str = Query(None), status: str = Query(None),
        current_user: UserResponse = Depends(get_current_active_admin),
):
    labels, values = get_analytics_service(x_axis, y_axis, period, waste_type, status)
    return {"labels": labels, "values": values, "total": round(sum(values), 2)}

@router.get("/backup/export")
async def export_backup(current_user: UserResponse = Depends(get_current_active_admin)):
    dump = export_backup_service()
    return Response(
        content=json.dumps(dump, ensure_ascii=False, default=str),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=backup.json"}
    )

@router.post("/backup/import")
async def import_backup(
        file: UploadFile = File(...),
        current_user: UserResponse = Depends(get_current_active_admin),
):
    try:
        data = json.loads(await file.read())
        import_backup_service(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка импорта: {e}")
    return {"message": "Данные успешно восстановлены"}