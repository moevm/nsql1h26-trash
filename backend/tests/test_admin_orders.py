"""
Тесты: GET /admin/orders — управление заказами.

Покрываемые сценарии:
  - Получение списка без фильтров
  - Фильтрация по ID заказа, статусу, типу мусора, адресу, имени клиента
  - Пустой результат
  - Пагинация
  - Доступ без авторизации → 401
"""

import pytest
from tests.conftest import cursor

BASE = "/admin/orders"

SAMPLE_ORDERS = [
    {
        "id": "ord1",
        "created_at": "2026-01-10T09:00:00",
        "waste_type": "Бытовой мусор",
        "address": "Москва, ул. Ленина, 1",
        "status": "searching",
        "price": 500.0,
        "client_name": "Иванов Иван",
        "courier_name": None,
    },
    {
        "id": "ord2",
        "created_at": "2026-01-11T10:00:00",
        "waste_type": "Строительный",
        "address": "СПб, Невский пр., 5",
        "status": "done",
        "price": 1200.0,
        "client_name": "Петров Пётр",
        "courier_name": "Курьеров Курьер",
    },
]


def _setup_orders(mock_db, orders=None, total=None):
    if orders is None:
        orders = SAMPLE_ORDERS
    if total is None:
        total = len(orders)
    mock_db.aql.execute.side_effect = [
        cursor(*orders),
        cursor(total),
    ]


class TestAdminOrdersListBasic:

    def test_returns_200_with_items_and_total(self, admin_client, mock_db):
        _setup_orders(mock_db)
        resp = admin_client.get(BASE)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) == 2
        assert data["total"] == 2

    def test_response_contains_expected_fields(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[0]], total=1)
        resp = admin_client.get(BASE)
        order = resp.json()["items"][0]
        assert order["id"] == "ord1"
        assert order["waste_type"] == "Бытовой мусор"
        assert order["status"] == "searching"
        assert order["address"] == "Москва, ул. Ленина, 1"
        assert order["client_name"] == "Иванов Иван"

    def test_empty_result(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[], total=0)
        resp = admin_client.get(BASE)
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_default_pagination_in_response(self, admin_client, mock_db):
        _setup_orders(mock_db)
        resp = admin_client.get(BASE)
        data = resp.json()
        assert data["offset"] == 0
        assert data["limit"] == 50


class TestAdminOrdersFilters:

    def test_filter_by_order_id(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[0]], total=1)
        resp = admin_client.get(BASE, params={"order_id": "ord1"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["order_id"] == "ord1"

    def test_filter_by_status_searching(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[0]], total=1)
        resp = admin_client.get(BASE, params={"status": "searching"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["status"] == "searching"

    def test_filter_by_status_done(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[1]], total=1)
        resp = admin_client.get(BASE, params={"status": "done"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["status"] == "done"

    def test_filter_by_waste_type(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[1]], total=1)
        resp = admin_client.get(BASE, params={"waste_type": "Строительный"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["waste_type"] == "Строительный"

    def test_filter_by_address(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[0]], total=1)
        resp = admin_client.get(BASE, params={"address": "Москва"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["address"] == "Москва"

    def test_filter_by_client_name(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[0]], total=1)
        resp = admin_client.get(BASE, params={"client_name": "Иванов"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["client_name"] == "Иванов"

    def test_no_filter_passes_null_bind_vars(self, admin_client, mock_db):
        _setup_orders(mock_db)
        admin_client.get(BASE)
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["order_id"] is None
        assert bind_vars["status"] is None
        assert bind_vars["waste_type"] is None
        assert bind_vars["address"] is None
        assert bind_vars["client_name"] is None

    def test_multiple_filters_combined(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[SAMPLE_ORDERS[1]], total=1)
        resp = admin_client.get(BASE, params={"status": "done", "waste_type": "Строительный"})
        assert resp.status_code == 200
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["status"] == "done"
        assert bind_vars["waste_type"] == "Строительный"


class TestAdminOrdersPagination:

    def test_custom_offset_and_limit(self, admin_client, mock_db):
        _setup_orders(mock_db, orders=[], total=100)
        resp = admin_client.get(BASE, params={"offset": 10, "limit": 25})
        assert resp.status_code == 200
        data = resp.json()
        assert data["offset"] == 10
        assert data["limit"] == 25

    def test_offset_and_limit_passed_to_query(self, admin_client, mock_db):
        _setup_orders(mock_db)
        admin_client.get(BASE, params={"offset": 50, "limit": 100})
        bind_vars = mock_db.aql.execute.call_args_list[0][1]["bind_vars"]
        assert bind_vars["offset"] == 50
        assert bind_vars["limit"] == 100

    def test_limit_exceeds_max_returns_422(self, admin_client, mock_db):
        resp = admin_client.get(BASE, params={"limit": 201})
        assert resp.status_code == 422


class TestAdminOrdersAuth:

    def test_without_token_returns_401(self, unauth_client):
        resp = unauth_client.get(BASE)
        assert resp.status_code == 401
