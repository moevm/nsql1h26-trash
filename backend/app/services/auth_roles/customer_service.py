from datetime import datetime

from app.db.users import create_user, get_user_by_email
from app.services.auth_roles.common import pwd_context, to_public_user, validate_password_strength


def register_customer(
    full_name: str,
    email: str,
    phone: str,
    password: str,
    confirm_password: str,
    address: str,
) -> dict:
    if password != confirm_password:
        raise ValueError("Пароли не совпадают")

    errors = validate_password_strength(password)
    if errors:
        raise ValueError("; ".join(errors))

    if get_user_by_email(email):
        raise ValueError("DUPLICATE_EMAIL")

    user_data = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "password_hash": pwd_context.hash(password),
        "role": "customer",
        "address": address,
        "balance": 0.0,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }

    created = create_user(user_data)
    return to_public_user(created)
