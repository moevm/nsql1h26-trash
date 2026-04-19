from app.db.session import arango_instance


def init_db():
    db = arango_instance.db

    docs = ["users", "orders", "Locations", "Events"]
    edges = ["At", "Executes", "Owns"]

    for col in docs:
        if not db.has_collection(col):
            db.create_collection(col)

    # Уникальный индекс на email — защита от гонки при параллельной регистрации
    db.collection("users").add_hash_index(fields=["email"], unique=True, sparse=True)

    for col in edges:
        if not db.has_collection(col):
            db.create_collection(col, edge=True)
