import random
import smtplib
import string
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.db.session import arango_instance
from app.db.users import get_user_by_email

router = APIRouter()

RESET_TOKENS_COLLECTION = "PasswordResetTokens"
CODE_TTL_MINUTES = 10


def _ensure_collection():
    db = arango_instance.db
    if not db.has_collection(RESET_TOKENS_COLLECTION):
        db.create_collection(RESET_TOKENS_COLLECTION)


def _generate_code() -> str:
    return "".join(random.choices(string.digits, k=6))


def _send_email(to_email: str, code: str):
    smtp_host = getattr(settings, "SMTP_HOST", "")
    smtp_user = getattr(settings, "SMTP_USER", "")
    smtp_password = getattr(settings, "SMTP_PASSWORD", "")
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_from = getattr(settings, "SMTP_FROM", "noreply@trash.local")

    if not smtp_host or not smtp_user:
        print(f"[PASSWORD RESET] Код для {to_email}: {code}")
        return

    msg = MIMEText(
        f"Ваш код для сброса пароля: {code}\n\nКод действителен {CODE_TTL_MINUTES} минут.",
        "plain",
        "utf-8",
    )
    msg["Subject"] = "Сброс пароля — ЭкоКурьер"
    msg["From"] = smtp_from
    msg["To"] = to_email

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, [to_email], msg.as_string())


def _get_token(db, email: str):
    cursor = db.aql.execute(
        "FOR t IN PasswordResetTokens FILTER t.email == @email SORT t.created_at DESC LIMIT 1 RETURN t",
        bind_vars={"email": email},
    )
    results = list(cursor)
    return results[0] if results else None


def _delete_tokens(db, email: str):
    db.aql.execute(
        "FOR t IN PasswordResetTokens FILTER t.email == @email REMOVE t IN PasswordResetTokens",
        bind_vars={"email": email},
    )


def _is_expired(token: dict) -> bool:
    created_at = datetime.fromisoformat(token["created_at"])
    return datetime.now(timezone.utc) - created_at > timedelta(minutes=CODE_TTL_MINUTES)

class PasswordResetRequestBody(BaseModel):
    email: str


class PasswordResetVerifyBody(BaseModel):
    email: str
    code: str


class PasswordResetConfirmBody(BaseModel):
    email: str
    code: str
    new_password: str
    confirm_password: str

@router.post("/password-reset/request")
def request_password_reset(body: PasswordResetRequestBody):
    user = get_user_by_email(body.email)
    if not user:
        raise HTTPException(status_code=404, detail="Аккаунт с таким email не найден")

    _ensure_collection()
    db = arango_instance.db

    _delete_tokens(db, body.email)

    code = _generate_code()
    db.collection(RESET_TOKENS_COLLECTION).insert({
        "email": body.email,
        "code": code,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    try:
        _send_email(body.email, code)
    except Exception as e:
        print(f"[WARN] Не удалось отправить письмо: {e}")

    return {"message": "Код отправлен на указанный email"}


@router.post("/password-reset/verify")
def verify_reset_code(body: PasswordResetVerifyBody):
    _ensure_collection()
    db = arango_instance.db

    token = _get_token(db, body.email)

    if not token:
        raise HTTPException(status_code=400, detail="Код не найден. Запросите новый")

    if _is_expired(token):
        _delete_tokens(db, body.email)
        raise HTTPException(status_code=400, detail="Код устарел. Запросите новый")

    if token["code"] != body.code:
        raise HTTPException(status_code=400, detail="Неверный код подтверждения")

    return {"message": "Код подтверждён"}


@router.post("/password-reset/confirm")
def confirm_password_reset(body: PasswordResetConfirmBody):
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Пароли не совпадают")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Пароль должен содержать минимум 8 символов")

    _ensure_collection()
    db = arango_instance.db

    token = _get_token(db, body.email)

    if not token:
        raise HTTPException(status_code=400, detail="Код не найден. Запросите новый")

    if _is_expired(token):
        _delete_tokens(db, body.email)
        raise HTTPException(status_code=400, detail="Код устарел. Запросите новый")

    if token["code"] != body.code:
        raise HTTPException(status_code=400, detail="Неверный код подтверждения")

    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = get_user_by_email(body.email)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.collection("Users").update({
        "_key": user["_key"],
        "password_hash": pwd_context.hash(body.new_password),
    })

    _delete_tokens(db, body.email)

    return {"message": "Пароль успешно изменён"}
