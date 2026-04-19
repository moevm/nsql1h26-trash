from app.db.session import arango_instance

USERS_COLLECTION = "users"


def ensure_users_collection():
    db = arango_instance.db
    if not db.has_collection(USERS_COLLECTION):
        db.create_collection(USERS_COLLECTION)
        db.collection(USERS_COLLECTION).add_hash_index(fields=["email"], unique=True)


def get_user_by_email(email: str):
    db = arango_instance.db
    cursor = db.aql.execute(
        "FOR u IN users FILTER u.email == @email RETURN u",
        bind_vars={"email": email}
    )
    results = list(cursor)
    return results[0] if results else None


def get_user_by_email_or_phone(login: str):
    db = arango_instance.db
    cursor = db.aql.execute(
        "FOR u IN users FILTER u.email == @login OR u.phone == @login RETURN u",
        bind_vars={"login": login}
    )
    results = list(cursor)
    return results[0] if results else None


def create_user(user_data: dict) -> dict:
    db = arango_instance.db
    meta = db.collection(USERS_COLLECTION).insert(user_data, return_new=True)
    return meta["new"]
