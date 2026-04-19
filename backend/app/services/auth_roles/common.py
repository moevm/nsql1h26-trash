import re
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
BCRYPT_MAX_PASSWORD_BYTES = 72


def validate_password_strength(password: str) -> list:
    errors = []
    if len(password) < 8:
        errors.append("Пароль должен содержать не менее 8 символов")
    if len(password.encode("utf-8")) > BCRYPT_MAX_PASSWORD_BYTES:
        errors.append(
            "Пароль слишком длинный для текущего алгоритма шифрования. "
            "Используйте не более 72 байт (примерно 72 латинских или 24 кириллических символа)."
        )
    if not re.search(r"[A-Z]", password):
        errors.append("Пароль должен содержать хотя бы одну заглавную букву")
    if not re.search(r"\d", password):
        errors.append("Пароль должен содержать хотя бы одну цифру")
    return errors


def to_public_user(user: dict) -> dict:
    return {
        "id": user["_key"],
        "full_name": user["full_name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "role": user["role"],
    }
