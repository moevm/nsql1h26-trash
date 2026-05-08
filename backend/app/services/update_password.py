from passlib.context import CryptContext
from fastapi import HTTPException
from app.db.session import arango_instance

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def update_user_password(user_id: str, old_password: str, new_password: str):
    db = arango_instance.db
    user_col = db.collection('Users')

    user = user_col.get(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Пользователь не найден")

    if old_password == new_password:
        raise HTTPException(
            status_code=400,
            detail="Новый пароль не может совпадать со старым"
        )

    stored_hash = user.get('password_hash')

    if not stored_hash:
        raise (HTTPException
               (status_code=400,
                detail="У пользователя не установлен пароль"))

    try:
        if not pwd_context.verify(old_password, stored_hash):
            raise HTTPException(
                status_code=400,
                detail="Неверный старый пароль")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Ошибка формата пароля в базе")

    new_hashed = pwd_context.hash(new_password)

    user_col.update({
        '_key': user_id,
        'password_hash': new_hashed
    })
    return True