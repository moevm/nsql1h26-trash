"""
Общие фикстуры для тестов админ-панели.

Стратегия мокирования:
- arango_instance.db заменяется на MagicMock перед каждым тестом.
  Все модули работают с одним и тем же объектом arango_instance,
  поэтому подмена .db распространяется на admin.py, events.py и др.
- Зависимость get_current_active_admin переопределяется через
  app.dependency_overrides, чтобы не требовать JWT-токена.
- Lifespan (startup) не запускается: используем TestClient без
  контекстного менеджера.
"""

import pytest
from unittest.mock import MagicMock
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.models.user import UserResponse
from app.api.admin import router as admin_router
from app.api.deps import get_current_active_admin

ADMIN_USER = UserResponse(
    id="admin_key_1",
    full_name="Тест Администратор",
    email="admin@test.local",
    phone="+70000000000",
    role="admin",
)

def cursor(*items):
    """Возвращает итератор, имитирующий курсор ArangoDB."""
    return iter(list(items))

@pytest.fixture
def mock_db():
    """
    Подменяет arango_instance.db на MagicMock.
    По умолчанию:
      - has_collection → True (коллекции существуют)
      - aql.execute    → пустой итератор
      - collection().get → документ-заглушка (объект не удалён)
      - collection().all → пустой итератор
      - collections()    → пустой список
    """
    db = MagicMock()
    db.has_collection.return_value = True
    db.aql.execute.return_value = cursor()
    db.collection.return_value.get.return_value = {"_key": "exists"}
    db.collection.return_value.all.return_value = cursor()
    db.collections.return_value = []

    from app.db.session import arango_instance
    original = arango_instance.db
    arango_instance.db = db
    yield db
    arango_instance.db = original


@pytest.fixture
def admin_client(mock_db):
    """
    TestClient с роутером /admin и подменённой авторизацией.
    Путь запросов: /admin/users, /admin/orders, ...
    """
    app = FastAPI()
    app.include_router(admin_router)
    app.dependency_overrides[get_current_active_admin] = lambda: ADMIN_USER
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def unauth_client():
    """TestClient без переопределения авторизации — запросы вернут 401/403."""
    app = FastAPI()
    app.include_router(admin_router)
    return TestClient(app, raise_server_exceptions=False)
