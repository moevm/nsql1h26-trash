from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional
from app.db.orders import get_available_orders
from app.db.session import arango_instance
from datetime import datetime

router = APIRouter(prefix="/courier", tags=["Courier Operations"])

@router.get("/orders/available")
def list_available_orders(type: Optional[str] = Query(None)):
    return {"orders": get_available_orders(type_filter=type)}

@router.get("/orders/{order_id}/full")
async def get_full_order_details(order_id: str):
    db = arango_instance.db

    query = """
    FOR o IN Orders
        FILTER o._key == @order_id
        
        LET loc = (FOR l, e IN 1..1 OUTBOUND o At RETURN l)[0]
        
        LET client = (FOR u, e IN 1..1 INBOUND o Owns RETURN u)[0]
        
        RETURN {
            "order": o,
            "location": loc,
            "client_name": client.name || "Аноним"
        }
    """

    cursor = db.aql.execute(query, bind_vars={"order_id": order_id})
    result = list(cursor)

    if not result:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    data = result[0]
    order = data["order"]
    loc = data["location"] or {}

    return {
        "id": order.get("_key"),
        "type": order.get("waste_type"),
        "weight": order.get("weight", 0),
        "price": order.get("price"),
        "status": order.get("status"),
        "client_name": data["client_name"],
        "address": loc.get("address", "Адрес не указан"),
        "details": loc.get("details", {}),
        "description": order.get("description", "Описание отсутствует")
    }

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, data: dict = Body(...), current_user_id: str = "3851"): # Замени ID на реальный из токена
    db = arango_instance.db
    new_status = data.get("status")

    if not new_status:
        raise HTTPException(status_code=400, detail="Статус не указан")

    query_update = """
    FOR o IN Orders
        FILTER o._key == @order_id
        UPDATE o WITH { status: @new_status } IN Orders
        RETURN NEW
    """
    cursor = db.aql.execute(query_update, bind_vars={"order_id": order_id, "new_status": new_status})
    result = list(cursor)

    if not result:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if new_status == "in_progress":
        executes_col = db.collection("Executes")
        # Создаем связь Курьер -> Заказ
        executes_col.insert({
            "_from": f"Users/{current_user_id}",
            "_to": f"Orders/{order_id}",
            "assigned_at": datetime.utcnow().isoformat()
        })

    return {"status": "success"}