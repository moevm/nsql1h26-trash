from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings
from app.db.users import get_user_by_email_or_phone
from app.services.auth_roles.common import pwd_context, to_public_user


def authenticate_user(login: str, password: str) -> dict:
    user = get_user_by_email_or_phone(login.strip())
    if not user:
        raise ValueError("INVALID_CREDENTIALS")

    if not user.get("is_active", True):
        raise ValueError("INACTIVE_USER")

    password_hash = user.get("password_hash")
    if not password_hash or not pwd_context.verify(password, password_hash):
        raise ValueError("INVALID_CREDENTIALS")

    return to_public_user(user)


def create_access_token(user: dict) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=int(settings.JWT_EXPIRE_MINUTES))
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, str(settings.JWT_SECRET), algorithm=str(settings.JWT_ALGORITHM))




def decode_access_token(token: str) -> dict:
    """Декодирует токен"""
    payload = jwt.decode(
        token, 
        settings.SECRET_KEY, 
        algorithms=[settings.ALGORITHM or "HS256"]
    )
    return payload
