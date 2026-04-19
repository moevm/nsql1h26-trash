import os
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.db.events import write_event
from app.models.user import CustomerRegisterRequest, UserResponse
from app.services.auth_service import register_courier, register_customer

router = APIRouter()

UPLOAD_DIR = "uploads/passports"


@router.post("/register/customer", response_model=UserResponse, status_code=201)
def customer_register(data: CustomerRegisterRequest):
    try:
        user = register_customer(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            password=data.password,
            confirm_password=data.confirm_password,
            address=data.address,
        )
        write_event(
            "customer_registered",
            description=data.full_name,
            user_id=user.get("id"),
        )
        return user
    except ValueError as e:
        msg = str(e)
        if msg == "DUPLICATE_EMAIL":
            raise HTTPException(
                status_code=409,
                detail="Пользователь с таким email уже существует",
            )
        raise HTTPException(status_code=422, detail=msg)


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
        user = register_courier(
            full_name=full_name,
            email=email,
            phone=phone,
            city=city,
            transport=transport,
            password=password,
            confirm_password=confirm_password,
            passport_photo_path=passport_path,
        )
        write_event(
            "courier_registered",
            description=f"{full_name} • {transport}",
            user_id=user.get("id"),
        )
        return user
    except ValueError as e:
        msg = str(e)
        if msg == "DUPLICATE_EMAIL":
            raise HTTPException(
                status_code=409,
                detail="Пользователь с таким email уже существует",
            )
        raise HTTPException(status_code=422, detail=msg)
