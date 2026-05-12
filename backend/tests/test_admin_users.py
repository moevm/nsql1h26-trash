"""
Тесты: GET /admin/users — управление пользователями.

Покрываемые сценарии:
  - Получение списка без фильтров
  - Фильтрация по каждому критерию (ФИО, email, телефон, роль, статус)
  - Несколько фильтров одновременно
  - Пустой результат
  - Пагинация (offset / limit)
  - Доступ без авторизации → 401/403
"""

import pytest
from tests.conftest import cursor

BASE = "/admin/users"

SAMPLE_USERS = [
    {
        "id": "u1",
        "full_name": "Иванов Иван Иванович",
        "email": "ivan@example.com",
        "phone": "+79001234567",
        "role": "customer",
        "is_active": True,
        "created_at": "2026-01-01T10:00:00",
    },
    {
        "id": "u2",
        "full_name": "Петров Пётр Петрович",
        "email": "petr@example.com",
        "phone": "+79007654321",
        "role": "courier",
        "is_active": False,
        "created_at": "2026-01-02T10:00:00",
    },
]


def _setup_users(mock_db, users=None, total=None):
    """Настраивает mock_db для эндпоинта /users."""
    if users is None:
        users = SAMPLE_USERS
    if total is None:
        total = len(users)
    mock_db.aql.execute.side_effect = [
        cursor(*users),
        cursor(total),
    ]

class TestAdminUsersListBasic:

    def test_returns_200_with_items_and_total(self, admin_client, mock_db):
        _setup_users(mock_db)
        resp = admin_client.get(BASE)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) == 2
        assert data["total"] == 2

    def test_response_contains_expected_fields(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[0]], total=1)
        resp = admin_client.get(BASE)
        user = resp.json()["items"][0]
        assert user["id"] == "u1"
        assert user["full_name"] == "Иванов Иван Иванович"
        assert user["email"] == "ivan@example.com"
        assert user["phone"] == "+79001234567"
        assert user["role"] == "customer"
        assert user["is_active"] is True

    def test_empty_result_returns_zero_total(self, admin_client, mock_db):
        _setup_users(mock_db, users=[], total=0)
        resp = admin_client.get(BASE)
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_default_pagination_values_in_response(self, admin_client, mock_db):
        _setup_users(mock_db)
        resp = admin_client.get(BASE)
        data = resp.json()
        assert data["offset"] == 0
        assert data["limit"] == 50


class TestAdminUsersFilters:

    def test_filter_by_full_name_passes_correct_bind_var(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[0]], total=1)
        resp = admin_client.get(BASE, params={"full_name": "Иванов"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["full_name"] == "Иванов"

    def test_filter_by_email_passes_correct_bind_var(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[0]], total=1)
        resp = admin_client.get(BASE, params={"email": "ivan@"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["email"] == "ivan@"

    def test_filter_by_phone_passes_correct_bind_var(self, admin_client, mock_db):
        _setup_users(mock_db)
        resp = admin_client.get(BASE, params={"phone": "+7900"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["phone"] == "+7900"

    def test_filter_by_role_customer(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[0]], total=1)
        resp = admin_client.get(BASE, params={"role": "customer"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["role"] == "customer"

    def test_filter_by_role_courier(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[1]], total=1)
        resp = admin_client.get(BASE, params={"role": "courier"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["role"] == "courier"

    def test_filter_by_role_admin(self, admin_client, mock_db):
        _setup_users(mock_db, users=[], total=0)
        resp = admin_client.get(BASE, params={"role": "admin"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["role"] == "admin"

    def test_filter_by_is_active_true(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[0]], total=1)
        resp = admin_client.get(BASE, params={"is_active": "true"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["is_active"] is True

    def test_filter_by_is_active_false(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[1]], total=1)
        resp = admin_client.get(BASE, params={"is_active": "false"})
        assert resp.status_code == 200
        first_call_kwargs = mock_db.aql.execute.call_args_list[0][1]
        assert first_call_kwargs["bind_vars"]["is_active"] is False

    def test_no_filter_passes_null_bind_vars(self, admin_client, mock_db):
        _setup_users(mock_db)
        resp = admin_client.get(BASE)
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["full_name"] is None
        assert bind_vars["email"] is None
        assert bind_vars["role"] is None
        assert bind_vars["is_active"] is None

    def test_multiple_filters_combined(self, admin_client, mock_db):
        _setup_users(mock_db, users=[SAMPLE_USERS[1]], total=1)
        resp = admin_client.get(BASE, params={"role": "courier", "is_active": "false"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["role"] == "courier"
        assert bind_vars["is_active"] is False


class TestAdminUsersPagination:

    def test_custom_offset_and_limit(self, admin_client, mock_db):
        _setup_users(mock_db, users=SAMPLE_USERS[:1], total=10)
        resp = admin_client.get(BASE, params={"offset": 5, "limit": 10})
        assert resp.status_code == 200
        data = resp.json()
        assert data["offset"] == 5
        assert data["limit"] == 10

    def test_offset_and_limit_passed_to_query(self, admin_client, mock_db):
        _setup_users(mock_db)
        admin_client.get(BASE, params={"offset": 20, "limit": 30})
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["offset"] == 20
        assert bind_vars["limit"] == 30

    def test_limit_exceeds_max_returns_422(self, admin_client, mock_db):
        resp = admin_client.get(BASE, params={"limit": 201})
        assert resp.status_code == 422

    def test_negative_offset_returns_422(self, admin_client, mock_db):
        resp = admin_client.get(BASE, params={"offset": -1})
        assert resp.status_code == 422


class TestAdminUsersAuth:

    def test_without_token_returns_401(self, unauth_client):
        resp = unauth_client.get(BASE)
        assert resp.status_code == 401
