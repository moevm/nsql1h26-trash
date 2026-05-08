from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_active_client
from app.models.user import UserResponse, ProfileUpdateCustomer
from app.models.user import BalanceTopUpRequest, BalanceTopUpResponse
from app.db.users import update_user_profile_in_db, top_up_balance, get_user_balance

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



@router.post("/top-up-balance", response_model=BalanceTopUpResponse)
async def top_up_balance_endpoint(
    request: BalanceTopUpRequest,
    current_user: UserResponse = Depends(get_current_active_client)
):
    """
    2.2 Пополнение баланса пользователя
    """
    try:
        result = top_up_balance(
            user_key=current_user.id,
            amount=request.amount,
            payment_method=request.payment_method
        )
        return result

    except Exception as e:
        # Логируем ошибку
        from app.db.events import log_event
        log_event(
            event_type="balance_top_up_error",
            title="Ошибка пополнения баланса",
            description=str(e),
            related_id=current_user.id,
            related_type="User"
        )
        raise HTTPException(
            status_code=500,
            detail="Не удалось пополнить баланс. Попробуйте позже."
        )


@router.get("/balance", response_model=dict)
async def get_current_balance(
    current_user: UserResponse = Depends(get_current_active_client)
):
    """
    Получить текущий баланс пользователя
    """
    try:
        balance_data = get_user_balance(current_user.id)

        return balance_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Не удалось получить баланс: {str(e)}"
        )  