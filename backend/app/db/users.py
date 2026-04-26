from app.db.session import arango_instance
from fastapi import HTTPException, status
from app.db.orders import USERS_COLLECTION

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
