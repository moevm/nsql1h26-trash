"""
Тесты: GET /admin/dashboard/stats и GET /admin/dashboard/events.

Покрываемые сценарии:
  Статистика:
    - Структура ответа (все поля присутствуют)
    - Корректные значения при данных в БД
    - Нулевые значения при пустой БД

  Лента событий:
    - Базовое получение событий
    - Пагинация: has_more=True и has_more=False
    - Событие со связанным объектом, который существует → error=None
    - Событие с удалённым связанным объектом → поле error заполнено
    - Событие без related_id → error не устанавливается
    - Неизвестный related_type → пропускается без ошибки
    - Доступ без авторизации → 401
"""

import pytest
from tests.conftest import cursor

STATS_BASE = "/admin/dashboard/stats"
EVENTS_BASE = "/admin/dashboard/events"


class TestDashboardStats:

    def _setup_stats(self, mock_db, orders_today=3, couriers_active=2,
                     couriers_total=5, volume_today=12.5):
        mock_db.aql.execute.side_effect = [
            cursor(orders_today),
            cursor({"active": couriers_active, "total": couriers_total}),
            cursor(volume_today),
        ]

    def test_returns_200(self, admin_client, mock_db):
        self._setup_stats(mock_db)
        resp = admin_client.get(STATS_BASE)
        assert resp.status_code == 200

    def test_response_has_all_fields(self, admin_client, mock_db):
        self._setup_stats(mock_db)
        data = admin_client.get(STATS_BASE).json()
        assert "orders_today" in data
        assert "couriers_active" in data
        assert "couriers_total" in data
        assert "volume_today" in data

    def test_correct_orders_today(self, admin_client, mock_db):
        self._setup_stats(mock_db, orders_today=7)
        data = admin_client.get(STATS_BASE).json()
        assert data["orders_today"] == 7

    def test_correct_couriers_counts(self, admin_client, mock_db):
        self._setup_stats(mock_db, couriers_active=3, couriers_total=10)
        data = admin_client.get(STATS_BASE).json()
        assert data["couriers_active"] == 3
        assert data["couriers_total"] == 10

    def test_correct_volume_today(self, admin_client, mock_db):
        self._setup_stats(mock_db, volume_today=25.5)
        data = admin_client.get(STATS_BASE).json()
        assert data["volume_today"] == 25.5

    def test_zero_orders_today(self, admin_client, mock_db):
        self._setup_stats(mock_db, orders_today=0)
        data = admin_client.get(STATS_BASE).json()
        assert data["orders_today"] == 0

    def test_no_couriers(self, admin_client, mock_db):
        self._setup_stats(mock_db, couriers_active=0, couriers_total=0)
        data = admin_client.get(STATS_BASE).json()
        assert data["couriers_active"] == 0
        assert data["couriers_total"] == 0

    def test_zero_volume(self, admin_client, mock_db):
        mock_db.aql.execute.side_effect = [
            cursor(0),
            cursor({"active": 0, "total": 0}),
            cursor(None),
        ]
        data = admin_client.get(STATS_BASE).json()
        assert data["volume_today"] == 0

    def test_without_token_returns_401(self, unauth_client):
        resp = unauth_client.get(STATS_BASE)
        assert resp.status_code == 401

def _make_event(key, event_type="order_created", related_id=None, related_type=None):
    return {
        "_key": key,
        "event_type": event_type,
        "title": f"Событие {key}",
        "description": "Тест",
        "created_at": "2026-05-01T12:00:00+00:00",
        "related_id": related_id,
        "related_type": related_type,
    }


def _setup_events(mock_db, events, total=None):
    """Настраивает mock_db для событийного эндпоинта.
    ensure_events_collection вызывает has_collection — он уже замокан на True.
    get_events → первый aql.execute
    get_events_count → второй aql.execute
    """
    if total is None:
        total = len(events)
    mock_db.aql.execute.side_effect = [
        cursor(*events),
        cursor(total),
    ]


class TestDashboardEvents:

    def test_returns_200(self, admin_client, mock_db):
        _setup_events(mock_db, [])
        resp = admin_client.get(EVENTS_BASE)
        assert resp.status_code == 200

    def test_response_structure(self, admin_client, mock_db):
        _setup_events(mock_db, [])
        data = admin_client.get(EVENTS_BASE).json()
        assert "events" in data
        assert "total" in data
        assert "has_more" in data

    def test_returns_events_list(self, admin_client, mock_db):
        events = [_make_event("e1"), _make_event("e2")]
        _setup_events(mock_db, events)
        data = admin_client.get(EVENTS_BASE).json()
        assert len(data["events"]) == 2

    def test_event_fields_present(self, admin_client, mock_db):
        event = _make_event("e1", event_type="order_created")
        _setup_events(mock_db, [event])
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        assert ev["id"] == "e1"
        assert ev["event_type"] == "order_created"
        assert ev["title"] == "Событие e1"
        assert "created_at" in ev
        assert "error" in ev

    def test_has_more_false_when_all_loaded(self, admin_client, mock_db):
        _setup_events(mock_db, [_make_event("e1")], total=1)
        data = admin_client.get(EVENTS_BASE).json()
        assert data["has_more"] is False

    def test_has_more_true_when_more_exist(self, admin_client, mock_db):
        events = [_make_event(f"e{i}") for i in range(20)]
        _setup_events(mock_db, events, total=25)
        data = admin_client.get(EVENTS_BASE).json()
        assert data["has_more"] is True

    def test_total_reflects_all_events(self, admin_client, mock_db):
        _setup_events(mock_db, [_make_event("e1")], total=42)
        data = admin_client.get(EVENTS_BASE).json()
        assert data["total"] == 42

    def test_event_without_related_id_no_error(self, admin_client, mock_db):
        """Событие без related_id → поле error = None."""
        event = _make_event("e1", related_id=None, related_type=None)
        _setup_events(mock_db, [event])
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        assert ev["error"] is None

    def test_event_with_existing_related_object_no_error(self, admin_client, mock_db):
        """Связанный объект найден → error = None."""
        event = _make_event("e1", related_id="ord1", related_type="order")
        _setup_events(mock_db, [event])
        mock_db.collection.return_value.get.return_value = {"_key": "ord1"}
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        assert ev["error"] is None

    def test_event_with_deleted_related_order_shows_error(self, admin_client, mock_db):
        """Связанный заказ удалён → поле error заполнено."""
        event = _make_event("e1", related_id="deleted_ord", related_type="order")
        _setup_events(mock_db, [event])
        mock_db.collection.return_value.get.return_value = None
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        assert ev["error"] is not None
        assert "не найден" in ev["error"]

    def test_event_with_deleted_related_user_shows_error(self, admin_client, mock_db):
        """Связанный пользователь удалён → поле error заполнено."""
        event = _make_event("e1", related_id="deleted_user", related_type="user")
        _setup_events(mock_db, [event])
        mock_db.collection.return_value.get.return_value = None
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        assert ev["error"] is not None

    def test_event_with_deleted_transaction_shows_error(self, admin_client, mock_db):
        """related_type='Transaction' — должен проверяться в коллекции Transactions."""
        event = _make_event("e1", related_id="tx1", related_type="Transaction")
        _setup_events(mock_db, [event])
        mock_db.collection.return_value.get.return_value = None
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        collections_queried = [
            call.args[0] for call in mock_db.collection.call_args_list
        ]
        assert "Transactions" in collections_queried

    def test_event_with_unknown_related_type_no_error(self, admin_client, mock_db):
        """Неизвестный related_type — пропускается, DB не вызывается, error=None."""
        event = _make_event("e1", related_id="x1", related_type="UnknownType")
        _setup_events(mock_db, [event])
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        assert ev["error"] is None

    def test_db_exception_on_related_check_shows_error(self, admin_client, mock_db):
        """Исключение при проверке связанного объекта → поле error заполнено."""
        event = _make_event("e1", related_id="ord1", related_type="order")
        _setup_events(mock_db, [event])
        mock_db.collection.return_value.get.side_effect = Exception("DB error")
        ev = admin_client.get(EVENTS_BASE).json()["events"][0]
        assert ev["error"] is not None

    def test_pagination_offset_param(self, admin_client, mock_db):
        _setup_events(mock_db, [], total=100)
        resp = admin_client.get(EVENTS_BASE, params={"offset": 20, "limit": 10})
        assert resp.status_code == 200

    def test_without_token_returns_401(self, unauth_client):
        resp = unauth_client.get(EVENTS_BASE)
        assert resp.status_code == 401
