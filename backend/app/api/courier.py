from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_client
from app.models.user import UserResponse
from app.db.orders import get_available_orders
from app.api.deps import get_current_active_courier
router = APIRouter(
    prefix="/courier",
    tags=["Courier"]
)

@router.get("/available-orders", response_model=list[dict])
async def list_available_for_courier(
        waste_type: str = None,
        current_user: UserResponse = Depends(get_current_active_courier)
):
    """Список всех доступных заказов"""
    return get_available_orders(type_filter=waste_type)