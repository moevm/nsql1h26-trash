from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.models.order import OrderCreate, Order, StatusUpdate
from app.db.orders import create_order
from app.api.deps import get_current_active_client, get_current_active_courier
from app.models.user import UserResponse
from app.db.session import arango_instance
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

@router.get("/{order_id}", response_model=Order)
async def get_order_details(order_id: str, current_user=Depends(get_current_active_courier)):
    "Переход на страницу заказа"
    orders_col = arango_instance.db.collection("Orders")

    order_doc = orders_col.get(order_id)

    if not order_doc:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    return order_doc

@router.put("/{order_id}/status")
async def update_order_status(
        order_id: str,
        status_update: StatusUpdate,
        current_courier = Depends(get_current_active_courier)
):
    "Статус заказа(обновление)"
    db = arango_instance.db
    orders_col = db.collection("Orders")

    print(f"DEBUG: Запрос на смену статуса заказа {order_id} на {status_update.status}")

    order = orders_col.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    courier_key = getattr(current_courier, 'key', getattr(current_courier, 'id', None))
    print(f"DEBUG: Курьер: users/{courier_key}")

    if status_update.status == "active":
        try:
            executes_col = db.collection("Executes")
            from_node = f"users/{courier_key}"
            to_node = f"Orders/{order_id}"

            print(f"DEBUG: Пытаюсь создать ребро: {from_node} -> {to_node}")

            edge_data = {
                "_from": from_node,
                "_to": to_node,
                "started_at": datetime.now(timezone.utc).isoformat()
            }
            executes_col.insert(edge_data)
            print("DEBUG: РЕБРО УСПЕШНО СОЗДАНО!")

        except Exception as e:
            print(f"!!! DEBUG: ОШИБКА при вставке ребра: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка графа: {str(e)}")

    elif status_update.status == "done":
        if not order.get("completion_photo"):
            raise HTTPException(status_code=400, detail="Сначала загрузите фото!")

    orders_col.update({"_key": order_id, "status": status_update.status})
    return {"message": "Статус обновлен"}

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

