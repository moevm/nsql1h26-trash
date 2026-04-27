from fastapi import APIRouter, Depends
from app.api.deps import get_current_active_client
from app.models.user import UserResponse, ProfileUpdateCustomer
from app.db.users import update_user_profile_in_db

router = APIRouter(
    prefix="/client",
    tags=["Client"]
)

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_client: UserResponse = Depends(get_current_active_client)):
    return current_client


@router.patch("/me")
async def update_my_profile(
    profile_data: ProfileUpdateCustomer,
    current_client: UserResponse = Depends(get_current_active_client)
):
    """Обновление профиля клиента"""

    data_to_update = {
        "full_name": f"{profile_data.firstName} {profile_data.lastName}".strip(),
        "phone": profile_data.phone,
        "email": profile_data.email,
        "address": profile_data.address
    }
    update_user_profile_in_db(user_id=current_client.id, update_data=data_to_update)

    return {"message": "Профиль успешно обновлен"}