from app.db.session import arango_instance
from fastapi import HTTPException, status
from app.db.orders import USERS_COLLECTION
from datetime import datetime
from app.db.events import log_event

def update_user_profile_in_db(user_id: str, update_data: dict):
    db = arango_instance.db
    users_col = db.collection(USERS_COLLECTION)

    filtered_data = {k: v for k, v in update_data.items() if v is not None}
    
    if not filtered_data:
        return
    try:
        if not user_id:
            raise ValueError("user_id is empty")
            
        # Обновляем документ по ключу
        users_col.update({
            "_key": str(user_id), 
            **filtered_data
        })
        print(f"DEBUG: Успешно обновили юзера {user_id}")
    except Exception as e:
        print(f"ERROR: Ошибка обновления в Arango: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка базы данных: {str(e)}"
        )


def ensure_users_collection():
    db = arango_instance.db
    if not db.has_collection(USERS_COLLECTION):
        db.create_collection(USERS_COLLECTION)
        db.collection(USERS_COLLECTION).add_hash_index(fields=["email"], unique=True)


def get_user_by_email(email: str):
    db = arango_instance.db
    cursor = db.aql.execute(
        "FOR u IN Users FILTER u.email == @email RETURN u",
        bind_vars={"email": email}
    )
    results = list(cursor)
    return results[0] if results else None


def get_user_by_email_or_phone(login: str):
    db = arango_instance.db
    cursor = db.aql.execute(
        "FOR u IN Users FILTER u.email == @login OR u.phone == @login RETURN u",
        bind_vars={"login": login}
    )
    results = list(cursor)
    return results[0] if results else None


def create_user(user_data: dict) -> dict:
    db = arango_instance.db
    meta = db.collection(USERS_COLLECTION).insert(user_data, return_new=True)
    return meta["new"]


def top_up_balance(user_key: str, amount: float, payment_method: str = "card"):
    """
    Пополнение баланса пользователя + создание транзакции + логирование
    """
    db = arango_instance.db

    query = """
    LET user = DOCUMENT('Users', @user_key)
    LET new_balance = TO_NUMBER(user.balance || 0) + @amount

    UPDATE user WITH {
        balance: new_balance,
        updated_at: @now
    } IN Users

    LET tx = (
        INSERT {
            amount: @amount,
            type: "top_up",
            status: "success",
            timestamp: @now,
            description: CONCAT("Пополнение через ", @payment_method),
            card_mask: null,
            user_key: @user_key
        } INTO Transactions
        RETURN NEW
    )[0]

    RETURN {
        new_balance: new_balance,
        transaction: tx
    }
    """

    cursor = db.aql.execute(
        query,
        bind_vars={
            "user_key": user_key,
            "amount": amount,
            "payment_method": payment_method,
            "now": datetime.utcnow().isoformat()
        }
    )

    result = list(cursor)[0]

    log_event(
        event_type="balance_top_up",
        title="Пополнение баланса",
        description=f"Пополнение на сумму {amount} ₽ через {payment_method}",
        related_id=result["transaction"]["_key"],
        related_type="Transaction"
    )

    return {
        "success": True,
        "new_balance": result["new_balance"],
        "amount": amount,
        "transaction_id": result["transaction"]["_key"],
        "message": f"Баланс успешно пополнен на {amount} ₽"
    }


def get_user_balance(user_key: str):
    """
    Получить баланс пользователя
    """
    db = arango_instance.db

    user = db.collection("Users").get(user_key)

    if not user:
        raise ValueError("Пользователь не найден")

    balance = float(user.get("balance", 0.0))

    return {
        "balance": balance,
        "currency": "RUB",
        "user_id": user_key,
        "full_name": user.get("full_name")
    }
