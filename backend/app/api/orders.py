from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from app.models.order import OrderCreate, Order, StatusUpdate
from app.db.orders import create_order, get_my_orders
from app.api.deps import get_current_active_client, get_current_active_courier
from app.models.user import UserResponse
from app.db.session import arango_instance
from typing import Optional
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
        client_key = current_user.id

        new_order = create_order(order_in, client_key=current_user.id, price=order_in.price)

        created_at_str = new_order.created_at.isoformat() if isinstance(new_order.created_at, datetime) else str(new_order.created_at)

        db = arango_instance.db
        owns_col = db.collection("Owns")

        owns_col.insert({
            "_from": f"users/{current_user.id}",
            "_to": f"orders/{new_order.id}",
            "created_at": created_at_str
        })

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
    status: Optional[str] = Query(None, description="Фильтр по статусу (searching, active, done)")
):
    """Просмотр истории заказов текущего клиента (Сценарий 2.4)"""
    try:
        orders = get_my_orders(client_key=current_user.id, status_filter=status)
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Не удалось загрузить историю заказов: {str(e)}"
        )

@router.get("/{order_id}", response_model=Order)
async def get_order_details(order_id: str, current_user=Depends(get_current_active_courier)):
    db = arango_instance.db
    orders_col = db.collection("Orders")

    print(f"DEBUG: Пытаюсь получить заказ по ID: {order_id}")
    order_doc = orders_col.get(order_id)
    print(f"DEBUG: [API] Заказ найден в базе: {order_doc}")

    if not order_doc:
        print(f"DEBUG: ЗАКАЗ НЕ НАЙДЕН В КОЛЛЕКЦИИ")
        raise HTTPException(status_code=404, detail="Заказ не найден")

    print(f"DEBUG: Заказ найден: {order_doc['_key']}")

    # Поиск владельца
    query = "FOR user, edge IN 1..1 INBOUND @order_id Owns RETURN user"
    bind_vars = {"order_id": f"orders/{order_id}"}

    print(f"DEBUG: Запускаю AQL с ID: {bind_vars['order_id']}")
    cursor = db.aql.execute(query, bind_vars=bind_vars)
    client = cursor.next() if not cursor.empty() else None

    print(f"DEBUG: Владелец найден: {client}")

    if client:
        order_doc["client_name"] = client.get("name") or client.get("full_name") or "Неизвестный заказчик"
    else:
        order_doc["client_name"] = "Неизвестный заказчик"

    query = """
    FOR tx, edge IN 1..1 OUTBOUND @order_id History
        RETURN tx
    """
    cursor = db.aql.execute(query, bind_vars={"order_id": f"orders/{order_id}"})
    tx = cursor.next() if not cursor.empty() else None
    order_doc["transaction"] = tx

    print(f"DEBUG: [API] Объект перед отправкой: {order_doc}")
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
        db = arango_instance.db
        tx_doc = {
            "amount": order.get("price", 0.0),
            "type": "order_payout",
            "status": "success",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        tx_result = db.collection("Transactions").insert(tx_doc)

        db.collection("History").insert({
            "_from": f"Orders/{order_id}",
            "_to": f"Transactions/{tx_result['_key']}"
        })

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

