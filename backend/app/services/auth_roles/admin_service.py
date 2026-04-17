from datetime import datetime

from app.core.config import settings
from app.db.users import create_user, get_user_by_email
from app.services.auth_roles.common import pwd_context


def ensure_default_admin() -> None:
    email = str(settings.DEBUG_ADMIN_EMAIL)
    if get_user_by_email(email):
        return

    user_data = {
        "full_name": str(settings.DEBUG_ADMIN_FULL_NAME),
        "email": email,
        "phone": str(settings.DEBUG_ADMIN_PHONE),
        "password_hash": pwd_context.hash(str(settings.DEBUG_ADMIN_PASSWORD)),
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }
    create_user(user_data)
