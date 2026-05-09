from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from app.models.order import OrderCreate, Order, StatusUpdate
from app.db.orders import create_order, get_my_orders, get_order_by_id_for_client, get_order_details_for_courier, update_order_status_by_courier
from app.api.deps import get_current_active_client, get_current_active_courier
from app.models.user import UserResponse
from app.db.session import arango_instance
from typing import Optional
from app.db.events import log_event
import os
import uuid



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
    """Создание нового заказа и создание связи Owns"""
    try:
        new_order = create_order(order_in, client_key=current_user.id, price=order_in.price)
        log_event(event_type="order_created", 
                  title = f"Новая заявка на вывоз", 
                  description=f"Клиент: {current_user.full_name} - {order_in.waste_type}", 
                  related_id=new_order.id, 
                  related_type="order",)

        return new_order

    except Exception as e:
        print(f"!!! ОШИБКА ПРИ СОЗДАНИИ ЗАКАЗА: {str(e)}")
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Не удалось создать заказ: {str(e)}"
        )


@router.get("/my", response_model=list[Order])
async def get_my_orders_endpoint(
    current_user: UserResponse = Depends(get_current_active_client),
    status_m: Optional[str] = Query(None, description="Фильтр по статусу (searching, active, done)")
):
    """Просмотр истории заказов текущего клиента (Сценарий 2.4)"""
    try:
        orders = get_my_orders(client_key=current_user.id, status_filter=status_m)
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Не удалось загрузить историю заказов: {str(e)}"
        )


@router.get("/{order_id}", response_model=Order)
async def get_order_details(
    order_id: str, 
    current_user: UserResponse = Depends(get_current_active_courier)
):
    """
    Просмотр деталей заказа курьером.
    """
    order_doc = get_order_details_for_courier(order_id)

    if not order_doc:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    return order_doc


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: StatusUpdate,
    current_courier: UserResponse = Depends(get_current_active_courier)
):
    """
    Обновление статуса заказа с автоматическим созданием связей и транзакций.
    """

    courier_id = current_courier.id 

    result = update_order_status_by_courier(
        order_key=order_id, 
        new_status=status_update.status, 
        courier_key=courier_id
    )

    if "error" in result:
        if result["error"] == "not_found":
            raise HTTPException(status_code=404, detail="Заказ не найден")
        if result["error"] == "no_photo":
            raise HTTPException(status_code=400, detail="Сначала загрузите фото подтверждения!")

    if status_update.status == "done":
        log_event(
            event_type="order_completed",
            title=f'Заказ ORD-{order_id} выполнен',
            description=f"Курьер: {current_courier.full_name}",
            related_id=order_id,
            related_type="order",
        )    
    elif status_update.status == "active":
        log_event(
            event_type="order_accepted",
            title=f'Заказ ORD-{order_id} принят курьером',
            description=f"Курьер: {current_courier.full_name}",
            related_id=order_id,
            related_type="order",
        )  

    return {"message": f"Статус успешно изменен на {status_update.status}"}




UPLOAD_DIR = "uploads/completion_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{order_id}/photo")
async def upload_completion_photo(
        order_id: str,
        file: UploadFile = File(...),
        current_courier = Depends(get_current_active_courier)
):
    "Грузим фото подтверждения"
    orders_col = arango_instance.db.collection("Orders")
    order = orders_col.get(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    file_extension = os.path.splitext(file.filename)[1]
    new_filename = f"{order_id}_{uuid.uuid4().hex[:6]}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    orders_col.update({
        "_key": order_id,
        "completion_photo": file_path
    })

    return {"message": "Фото успешно загружено", "photo_path": file_path}


@router.get("/my/{order_id}", response_model=Order)
async def get_my_order_detail(
    order_id: str,
    current_user: UserResponse = Depends(get_current_active_client)
):
    order_data = get_order_by_id_for_client(
        order_key=order_id, 
        client_key=current_user.id
    )

    if not order_data:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    return order_data

