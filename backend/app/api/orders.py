from fastapi import APIRouter, Depends, HTTPException, status
from app.models.order import OrderCreate, Order
from app.db.orders import create_order
from app.api.deps import get_current_active_client
from app.models.user import UserResponse

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.get("/test")
async def test_orders(current_user: UserResponse = Depends(get_current_active_client)):
    """Тест авторизации"""
    return {
        "message": "Авторизация работает отлично!",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }


@router.post("/", response_model=Order, status_code=201)
async def create_new_order(
    order_in: OrderCreate,
    current_user: UserResponse = Depends(get_current_active_client)
):
    """Создание нового заказа (Сценарий 2.1)"""
    try:
        # Используем id из токена
        client_key = current_user.id

        created_order = create_order(
            order_in=order_in,
            client_key=client_key
        )

        return created_order

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Не удалось создать заказ: {str(e)}"
        )


@router.get("/my", response_model=list[Order])
async def get_my_orders(current_user: UserResponse = Depends(get_current_active_client)):
    """Мои заказы (пока заглушка)"""
    return []