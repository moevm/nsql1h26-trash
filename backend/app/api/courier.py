from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_client
from app.models.user import UserResponse, ProfileUpdateCourier
from app.db.orders import get_available_orders
from app.api.deps import get_current_active_courier
from app.db.session import arango_instance

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

@router.get("/me")
async def get_my_profile(current_courier = Depends(get_current_active_courier)):
    """Получение профиля"""
    return current_courier

@router.patch("/me")
async def update_my_profile(
        profile_data: ProfileUpdateCourier,
        current_courier = Depends(get_current_active_courier)
):
    """Обновление профиля"""
    users_col = arango_instance.db.collection("users")

    user_doc = users_col.get(current_courier.id)

    if not user_doc:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    update_data = {
        "full_name": f"{profile_data.firstName} {profile_data.lastName}",
        "phone": profile_data.phone,
        "transport": profile_data.transport
    }

    if user_doc.get("email") != profile_data.email:
        cursor = users_col.find({"email": profile_data.email})

        if not cursor.empty():

            existing_user = cursor.next()
            print(f"DEBUG: Нашел конфликт! Наш ID: {current_courier.id}, ID конфликта: {existing_user['_key']}")

            if existing_user["_key"] != current_courier.id:
                raise HTTPException(status_code=409, detail="Этот email уже занят другим пользователем")

        update_data["email"] = profile_data.email

    users_col.update({"_key": current_courier.id, **update_data})

    return {"message": "Профиль успешно обновлен"}