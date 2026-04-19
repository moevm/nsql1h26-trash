from app.db.session import arango_instance

def init_db():
    db = arango_instance.db

    # 1. Список коллекций документов
    docs = ["Orders", "Locations", "users"]
    # 2. Список ребер (edge collections)
    edges = ["At", "Executes", "Owns"]

    for col in docs:
        if not db.has_collection(col):
            db.create_collection(col)

    for col in edges:
        if not db.has_collection(col):
            # Важно: edge=True создает коллекцию ребер
            db.create_collection(col, edge=True)