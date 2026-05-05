from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.deps import get_current_active_client
from app.models.user import UserResponse, ProfileUpdateCourier, CourierResponse, PasswordChangeRequest
from app.db.orders import get_available_orders, get_courier_orders_service, AT_COLLECTION, USERS_COLLECTION, get_courier_transactions_service, get_courier_stats_service, create_withdraw_transaction_service
from app.api.deps import get_current_active_courier
from app.db.session import arango_instance
from app.models.order import Transaction, WithdrawRequest
from app.services.update_password import update_user_password

router = APIRouter(
    prefix="/courier",
    tags=["Courier"]
)

@router.get("/available-orders")
async def list_available_for_courier(
        waste_type: str = None,
        skip: int = 0,
        limit: int = 10,
        current_user: UserResponse = Depends(get_current_active_courier)
):
    """
    Получение доступных заказов для курьера
    """
    orders, total = get_available_orders(type_filter=waste_type, skip=skip, limit=limit)
    return {"orders": orders, "total": total}



@router.get("/me", response_model=CourierResponse)
async def get_my_profile(current_courier = Depends(get_current_active_courier)):
    """Получение профиля"""
    print(f"DEBUG: Объект курьера из БД: {current_courier}")
    return current_courier


@router.patch("/me")
async def update_my_profile(
        profile_data: ProfileUpdateCourier,
        current_courier = Depends(get_current_active_courier)
):
    """Обновление профиля"""
    users_col = arango_instance.db.collection("Users")

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


@router.get("/my-orders")
async def get_courier_orders(
        search: Optional[str] = Query(None),
        sort: str = Query("desc"),
        skip: int = Query(0, ge=0),
        limit: int = Query(10, gt=0, le=100),
        current_user: UserResponse = Depends(get_current_active_courier)
):
    """
    Получение активных заказов курьера
    """
    orders, total = get_courier_orders_service(current_user.id, search, skip, limit, sort)
    return {"orders": orders, "total": total}

@router.get("/balance")
async def get_courier_balance(current_user: UserResponse = Depends(get_current_active_courier)):
    """
    Получение баланса курьера
    """
    db = arango_instance.db
    user_doc = db.collection(USERS_COLLECTION).get(current_user.id)
    balance = user_doc.get("balance", 0.0)
    return {"balance": balance}

@router.get("/stats")
async def get_courier_detailed_stats(current_user: UserResponse = Depends(get_current_active_courier)):
    """
    Получение расширенной статистики курьера
    """
    stats = get_courier_stats_service(current_user.id)
    return stats

@router.get("/transactions")
async def get_transactions(
        skip: int = 0,
        limit: int = 20,
        period: str = "За неделю",
        current_user: UserResponse = Depends(get_current_active_courier)):
    """
    Получение транзакций курьера
    """
    return get_courier_transactions_service(current_user.id, skip=skip, limit=limit, period=period)

@router.post("/withdraw")
async def withdraw_funds(
        payload: WithdrawRequest,
        current_user = Depends(get_current_active_courier)
):
    """
    Вывод денежных средств курьера
    """
    clean_card = payload.card_number.replace(" ", "")

    try:
        result = create_withdraw_transaction_service(
            courier_key=current_user.id,
            amount=float(payload.amount),
            card_number=clean_card
        )

        if not result or "transaction" not in result:
            raise HTTPException(
                status_code=400,
                detail="Недостаточно средств или ошибка транзакции"
            )

        return {
            "status": "success",
            "new_balance": result["new_balance"],
            "transaction": Transaction(**result["transaction"])
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in withdraw: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/change-password")
async def change_password(
        payload: PasswordChangeRequest,
        current_user = Depends(get_current_active_courier)
):
    update_user_password(
        user_id=current_user.id,
        old_password=payload.old_password,
        new_password=payload.new_password
    )

    return {"status": "success", "message": "Пароль обновлен"}