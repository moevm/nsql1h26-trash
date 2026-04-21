from datetime import datetime

from app.core.config import settings
from app.db.users import create_user, get_user_by_email
from app.services.auth_roles.common import pwd_context


def _ensure_debug_user(*, email: str, user_data: dict) -> None:
    if get_user_by_email(email):
        return

    create_user(user_data)


def ensure_default_admin() -> None:
    email = str(settings.DEBUG_ADMIN_EMAIL)

    user_data = {
        "full_name": str(settings.DEBUG_ADMIN_FULL_NAME),
        "email": email,
        "phone": str(settings.DEBUG_ADMIN_PHONE),
        "password_hash": pwd_context.hash(str(settings.DEBUG_ADMIN_PASSWORD)),
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    _ensure_debug_user(email=email, user_data=user_data)


def ensure_default_debug_users() -> None:
    ensure_default_admin()

    courier_email = str(settings.DEBUG_COURIER_EMAIL)
    courier_data = {
        "full_name": str(settings.DEBUG_COURIER_FULL_NAME),
        "email": courier_email,
        "phone": str(settings.DEBUG_COURIER_PHONE),
        "password_hash": pwd_context.hash(str(settings.DEBUG_COURIER_PASSWORD)),
        "role": "courier",
        "city": str(settings.DEBUG_COURIER_CITY),
        "transport": str(settings.DEBUG_COURIER_TRANSPORT),
        "balance": 0.0,
        "rating": 0.0,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    _ensure_debug_user(email=courier_email, user_data=courier_data)

    customer_email = str(settings.DEBUG_CUSTOMER_EMAIL)
    customer_data = {
        "full_name": str(settings.DEBUG_CUSTOMER_FULL_NAME),
        "email": customer_email,
        "phone": str(settings.DEBUG_CUSTOMER_PHONE),
        "password_hash": pwd_context.hash(str(settings.DEBUG_CUSTOMER_PASSWORD)),
        "role": "customer",
        "address": str(settings.DEBUG_CUSTOMER_ADDRESS),
        "balance": 0.0,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    _ensure_debug_user(email=customer_email, user_data=customer_data)
