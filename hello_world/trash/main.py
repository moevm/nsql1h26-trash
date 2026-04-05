from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.db.session import arango_instance
from app.api.hello import router
import logging
import time


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("Проверка готовности зависимостей...")
    
    connected = False
    attempts = 5
    while not connected and attempts > 0:
        try:
            arango_instance.connect()
            connected = True
            logger.info("Связь с ArangoDB установлена.")
        except Exception as e:
            attempts -= 1
            logger.warning(f"База спит. Попыток осталось: {attempts}. Ошибка: {e}")
            time.sleep(3)

    if not connected:
        logger.error("Критическая ошибка: База данных не ответила.")
        raise RuntimeError("Could not connect to ArangoDB")

    yield
    
    logger.info("Завершение...")
    arango_instance.disconnect()

app = FastAPI(title="Trash Service", lifespan=lifespan)
app.include_router(router, prefix="/api/v1")