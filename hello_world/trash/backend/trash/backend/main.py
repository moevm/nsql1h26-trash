from fastapi import FastAPI
import time
from app.db.session import arango_instance
from app.api.hello import router as hello_router

app = FastAPI(title="Trash Service")

app.include_router(hello_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    connected = False
    attempts = 5
    while not connected and attempts > 0:
        try:
            arango_instance.connect()
            connected = True
        except Exception as e:
            attempts -= 1
            print(f"Ожидание базы... Осталось попыток: {attempts}")
            time.sleep(3)

@app.get("/")
def read_root():
    return {"message": "Вызов Main()"}