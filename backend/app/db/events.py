from datetime import datetime, timezone

from app.db.session import arango_instance

# Маппинг типов событий на человекочитаемые заголовки
EVENT_TITLES = {
    "customer_registered": "Регистрация нового клиента",
    "courier_registered":  "Регистрация нового курьера",
    "order_created":       "Новая заявка на вывоз",
    "order_taken":         "Курьер взял заказ",
    "order_done":          "Заказ выполнен",
    "order_cancelled":     "Заказ отменён",
}


def write_event(event_type: str, description: str = "", user_id: str = None) -> None:
    """
    Записывает событие в коллекцию Events.
    Вызов безопасен: ошибки подавляются, чтобы не ломать основной flow.
    """
    try:
        db = arango_instance.db
        if not db.has_collection("Events"):
            db.create_collection("Events")

        db.collection("Events").insert({
            "type":        event_type,
            "title":       EVENT_TITLES.get(event_type, event_type),
            "description": description,
            "user_id":     user_id,
            "created_at":  datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass
