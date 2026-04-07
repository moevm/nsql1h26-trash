from arango import ArangoClient
from app.core.config import settings

class ArangoDatabase:
    def __init__(self):
        self.client = ArangoClient(hosts=settings.DB_URL)
        self.db = None

    def connect(self):
        sys_db = self.client.db(
            '_system', 
            username='root', 
            password=settings.DB_PASSWORD
        )
        
        if not sys_db.has_database(settings.DB_NAME):
            sys_db.create_database(settings.DB_NAME)
        
        self.db = self.client.db(
            settings.DB_NAME, 
            username='root', 
            password=settings.DB_PASSWORD
        )
        return self.db

    def disconnect(self):
        self.db = None

arango_instance = ArangoDatabase()