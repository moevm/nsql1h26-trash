from arango import ArangoClient
import os


ARANGO_URL = os.getenv("DATABASE_URL", "http://db:8529")
ARANGO_PASSWORD = os.getenv("DB_PASSWORD", "tywin_secret_pass")

class ArangoDatabase:
    def __init__(self):
        self.client = ArangoClient(hosts=ARANGO_URL)
        self.db = None

    def connect(self):
        
        sys_db = self.client.db('_system', username='root', password=ARANGO_PASSWORD)
        
        
        db_name = 'trash_service_db'
        
        if not sys_db.has_database(db_name):
            sys_db.create_database(db_name)
        
        self.db = self.client.db(db_name, username='root', password=ARANGO_PASSWORD)
        print(f"Успешное подключение к ArangoDB: {db_name}")
        return self.db


arango_instance = ArangoDatabase()