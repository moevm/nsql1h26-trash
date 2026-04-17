from fastapi import APIRouter, HTTPException

from app.models.user import LoginRequest, LoginResponse
from app.services.auth_service import authenticate_user, create_access_token

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    try:
        user = authenticate_user(login=data.login, password=data.password)
        token = create_access_token(user)
        return {
            **user,
            "message": "Вход выполнен успешно",
            "access_token": token,
            "token_type": "bearer",
        }
    except ValueError as e:
        msg = str(e)
        if msg == "INACTIVE_USER":
            raise HTTPException(
                status_code=403,
                detail="Ваш аккаунт деактивирован. Обратитесь в службу поддержки",
            )
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
