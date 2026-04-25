from datetime import datetime, timezone
from app.db.session import arango_instance

EVENTS_COLLECTION = "Events"


def ensure_events_collection():
    db = arango_instance.db
    if not db.has_collection(EVENTS_COLLECTION):
        db.create_collection(EVENTS_COLLECTION)
        print(f"Создана коллекция: {EVENTS_COLLECTION}")


def log_event(event_type: str, title: str, description: str,
              related_id: str = None, related_type: str = None):
    ensure_events_collection()
    db = arango_instance.db
    doc = {
        "event_type": event_type,
        "title": title,
        "description": description,
        "related_id": related_id,
        "related_type": related_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.collection(EVENTS_COLLECTION).insert(doc)


def get_events(offset: int = 0, limit: int = 20):
    ensure_events_collection()
    db = arango_instance.db

    query = """
    FOR e IN @@events
        SORT e.created_at DESC
        LIMIT @offset, @limit
        RETURN e
    """
    cursor = db.aql.execute(
        query,
        bind_vars={
            "@events": EVENTS_COLLECTION,
            "offset": offset,
            "limit": limit,
        }
    )
    return list(cursor)


def get_events_count():
    ensure_events_collection()
    db = arango_instance.db
    query = "RETURN LENGTH(@@events)"
    cursor = db.aql.execute(query, bind_vars={"@events": EVENTS_COLLECTION})
    results = list(cursor)
    return results[0] if results else 0