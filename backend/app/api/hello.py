from fastapi import APIRouter
from app.db.session import arango_instance
from app.services.hello_service import get_hello_message 

router = APIRouter()

@router.get("/hello")
def hello_world():
    
    is_connected = arango_instance.db is not None
    db_name = arango_instance.db.name if is_connected else None
    
    message = get_hello_message(is_connected, db_name)
    print("There is success in the api!")
    return {
        "status": "ok",
        "service_response": message
    }