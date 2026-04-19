from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import arango_instance
from app.api.hello import router as hello_router
from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.services.auth_service import ensure_default_admin
from app.api.courier import router as courier_router
from app.api.orders import router as orders_router
from app.api.admin import router as admin_router
from app.db.init_db import init_db
from fastapi.openapi.utils import get_openapi
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

    init_db()
    ensure_default_admin()
    logger.info("Коллекции БД инициализированы.")

    yield

    logger.info("Завершение...")
    arango_instance.disconnect()


app = FastAPI(title="Trash Service", lifespan=lifespan)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        description="Trash Service API",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Вставьте токен в формате: Bearer <токен>",
        }
    }
    for route in openapi_schema["paths"].values():
        for method in route.values():
            if isinstance(method, dict):
                method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hello_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(health_router, prefix="/api/v1")
app.include_router(courier_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
