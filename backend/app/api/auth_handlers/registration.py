import os
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.user import CustomerRegisterRequest, UserResponse, AdminRegisterRequest
from app.services.auth_service import register_courier, register_customer, register_admin
from app.db.events import log_event

router = APIRouter()

UPLOAD_DIR = "uploads/passports"


@router.post("/register/customer", response_model=UserResponse, status_code=201)
def customer_register(data: CustomerRegisterRequest):
    try:
        result = register_customer(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            password=data.password,
            confirm_password=data.confirm_password,
            address=data.address,
        )
    except ValueError as e:
        msg = str(e)
        if msg == "DUPLICATE_EMAIL":
            raise HTTPException(
                status_code=409,
                detail="Пользователь с таким email уже существует",
            )
        raise HTTPException(status_code=422, detail=msg)

    try:
        log_event(
            event_type="user_registered",
            title="Регистрация нового клиента",
            description=f"{data.full_name}",
            related_id=result["id"],
            related_type="user",
        )
    except Exception as e:
        print(f"[WARN] Не удалось записать событие регистрации клиента: {e}")

    return result


@router.post("/register/courier", response_model=UserResponse, status_code=201)
async def courier_register(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    city: str = Form(...),
    transport: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    passport_photo: UploadFile = File(None),
):
    passport_path = None
    if passport_photo and passport_photo.filename:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(passport_photo.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        content = await passport_photo.read()
        with open(file_path, "wb") as f:
            f.write(content)
        passport_path = file_path

    try:
        result = register_courier(
            full_name=full_name,
            email=email,
            phone=phone,
            city=city,
            transport=transport,
            password=password,
            confirm_password=confirm_password,
            passport_photo_path=passport_path,
        )
    except ValueError as e:
        msg = str(e)
        if msg == "DUPLICATE_EMAIL":
            raise HTTPException(
                status_code=409,
                detail="Пользователь с таким email уже существует",
            )
        raise HTTPException(status_code=422, detail=msg)

    try:
        log_event(
            event_type="user_registered",
            title="Регистрация нового курьера",
            description=f"{full_name} • {transport}",
            related_id=result["id"],
            related_type="user",
        )
    except Exception as e:
        print(f"[WARN] Не удалось записать событие регистрации курьера: {e}")

    return result

@router.post("/register/admin", response_model=UserResponse, status_code=201)
async def admin_register(payload: AdminRegisterRequest): # Принимаем модель (JSON)
    try:
        result = register_admin(
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            password=payload.password,
            confirm_password=payload.confirm_password,
        )
    except ValueError as e:
        msg = str(e)
        if msg == "DUPLICATE_EMAIL":
            raise HTTPException(
                status_code=409,
                detail="Пользователь с таким email уже существует",
            )
        raise HTTPException(status_code=422, detail=msg)

    try:
        log_event(
            event_type="user_registered",
            title="Регистрация нового администратора",
            description=f"{payload.full_name}",
            related_id=result["id"],
            related_type="user",
        )
    except Exception as e:
        print(f"[WARN] Не удалось записать событие регистрации администратора: {e}")

    return result
