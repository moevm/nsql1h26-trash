from fastapi import APIRouter, Query
from typing import Optional
from app.db.orders import get_available_orders

router = APIRouter(prefix="/courier", tags=["Courier Operations"])

@router.get("/orders/available")
def list_available_orders(type: Optional[str] = Query(None)):
    # Передаем type из URL прямо в функцию доступа к базе
    return {"orders": get_available_orders(type_filter=type)}