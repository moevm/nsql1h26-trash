import io
import json
from typing import Optional

from jose import jwt, JWTError
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.db.session import arango_instance

router = APIRouter(prefix="/admin", tags=["Admin"])

_bearer = HTTPBearer()

# Коллекции, участвующие в экспорте/импорте
DOCUMENT_COLLECTIONS = ["users", "orders", "Locations"]
EDGE_COLLECTIONS = ["At", "Executes", "Owns"]
ALL_COLLECTIONS = DOCUMENT_COLLECTIONS + EDGE_COLLECTIONS


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            str(settings.JWT_SECRET),
            algorithms=[str(settings.JWT_ALGORITHM)],
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный или истёкший токен")

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Доступ разрешён только администраторам")

    return payload


@router.get("/export")
def export_db(admin: dict = Depends(get_current_admin)):
    """
    Экспортирует все коллекции БД в один JSON-файл.
    Структура: { "collection_name": [ ...documents... ], ... }
    """
    db = arango_instance.db
    dump: dict[str, list] = {}

    for col_name in ALL_COLLECTIONS:
        if not db.has_collection(col_name):
            dump[col_name] = []
            continue
        col = db.collection(col_name)
        # cursor() без параметров возвращает все документы
        dump[col_name] = [doc for doc in col]

    json_bytes = json.dumps(dump, ensure_ascii=False, indent=2).encode("utf-8")
    filename = "trash_db_dump.json"

    return StreamingResponse(
        io.BytesIO(json_bytes),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/import")
async def import_db(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
):
    """
    Импортирует данные из JSON-дампа в БД.
    Документы с уже существующим _key обновляются (upsert),
    новые — создаются. Существующие данные, которых нет в дампе, не удаляются.
    """
    if not file.filename or not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Ожидается файл формата .json")

    raw = await file.read()
    try:
        dump: dict = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Ошибка формата: выберите корректный файл дампа базы данных ({exc})",
        )

    if not isinstance(dump, dict):
        raise HTTPException(status_code=400, detail="Неверная структура дампа: ожидается JSON-объект")

    db = arango_instance.db
    stats: dict[str, dict] = {}

    for col_name, documents in dump.items():
        if col_name not in ALL_COLLECTIONS:
            # Игнорируем неизвестные коллекции — не трогаем лишнего
            continue

        if not isinstance(documents, list):
            raise HTTPException(
                status_code=400,
                detail=f"Коллекция '{col_name}': ожидается массив документов",
            )

        # Создаём коллекцию если её нет
        if not db.has_collection(col_name):
            is_edge = col_name in EDGE_COLLECTIONS
            db.create_collection(col_name, edge=is_edge)

        col = db.collection(col_name)
        inserted = 0
        updated = 0

        for doc in documents:
            if not isinstance(doc, dict):
                continue
            # Убираем служебные поля ArangoDB перед вставкой, оставляем _key/_from/_to
            doc.pop("_id", None)
            doc.pop("_rev", None)

            if "_key" in doc:
                # Документ с известным ключом — upsert
                try:
                    col.get(doc["_key"])
                    col.update(doc)
                    updated += 1
                except Exception:
                    col.insert(doc)
                    inserted += 1
            else:
                col.insert(doc)
                inserted += 1

        stats[col_name] = {"inserted": inserted, "updated": updated}

    return {"status": "ok", "details": stats}


# ---------------------------------------------------------------------------
# Статистика для дашборда
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_stats(admin: dict = Depends(get_current_admin)):
    """
    Сводная статистика для дашборда:
    - заказов создано сегодня
    - активных курьеров (is_active=true, role=courier)
    - общий объём (вес) выполненных заказов за сегодня
    """
    db = arango_instance.db

    cursor = db.aql.execute("""
        LET day_start = DATE_TIMESTAMP(DATE_FORMAT(DATE_NOW(), "%yyyy-%mm-%dd"))

        LET orders_today = LENGTH(
            FOR o IN orders
                FILTER DATE_TIMESTAMP(o.created_at) >= day_start
                RETURN 1
        )

        LET couriers_online = LENGTH(
            FOR u IN users
                FILTER u.role == "courier" AND u.is_active == true
                RETURN 1
        )

        LET volume_today = SUM(
            FOR o IN orders
                FILTER o.status == "done"
                    AND DATE_TIMESTAMP(o.created_at) >= day_start
                    AND o.weight != null
                RETURN o.weight
        )

        RETURN {
            orders_today,
            couriers_online,
            volume_today: volume_today || 0
        }
    """)

    return list(cursor)[0]


# ---------------------------------------------------------------------------
# Управление пользователями
# ---------------------------------------------------------------------------

@router.get("/users")
def get_users(
    search: Optional[str] = Query(None, description="Подстрока по имени, email или телефону"),
    role: Optional[str] = Query(None, description="courier | customer | admin"),
    is_active: Optional[bool] = Query(None, description="true — активен, false — заблокирован"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: dict = Depends(get_current_admin),
):
    db = arango_instance.db
    skip = (page - 1) * page_size

    bind = {
        "search": search.lower() if search else None,
        "role": role,
        "is_active": is_active,
        "skip": skip,
        "limit": page_size,
    }

    filter_clause = """
        FILTER @search == null
            OR CONTAINS(LOWER(u.full_name), @search)
            OR CONTAINS(LOWER(u.email), @search)
            OR CONTAINS(u.phone, @search)
        FILTER @role == null OR u.role == @role
        FILTER @is_active == null OR u.is_active == @is_active
    """

    total_cursor = db.aql.execute(
        f"FOR u IN users {filter_clause} COLLECT WITH COUNT INTO n RETURN n",
        bind_vars=bind,
    )
    total = list(total_cursor)[0]

    data_cursor = db.aql.execute(
        f"""
        FOR u IN users
            {filter_clause}
            SORT u.created_at DESC
            LIMIT @skip, @limit
            RETURN UNSET(u, "password_hash")
        """,
        bind_vars=bind,
    )
    users = list(data_cursor)

    return {"total": total, "page": page, "page_size": page_size, "items": users}


# ---------------------------------------------------------------------------
# Управление заказами
# ---------------------------------------------------------------------------

@router.get("/orders")
def get_orders(
    order_id: Optional[str] = Query(None, description="Часть ID заказа"),
    status: Optional[str] = Query(None, description="created | in_progress | done | cancelled"),
    waste_type: Optional[str] = Query(None, description="Тип мусора"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: dict = Depends(get_current_admin),
):
    db = arango_instance.db
    skip = (page - 1) * page_size

    bind = {
        "order_id": order_id,
        "status": status,
        "waste_type": waste_type,
        "skip": skip,
        "limit": page_size,
    }

    filter_clause = """
        FILTER @order_id == null OR CONTAINS(o._key, @order_id)
        FILTER @status == null OR o.status == @status
        FILTER @waste_type == null OR o.waste_type == @waste_type
    """

    total_cursor = db.aql.execute(
        f"FOR o IN orders {filter_clause} COLLECT WITH COUNT INTO n RETURN n",
        bind_vars=bind,
    )
    total = list(total_cursor)[0]

    data_cursor = db.aql.execute(
        f"""
        FOR o IN orders
            {filter_clause}
            LET client = (
                FOR u IN 1..1 INBOUND o Owns RETURN u.full_name
            )[0]
            LET courier = (
                FOR u IN 1..1 INBOUND o Executes RETURN u.full_name
            )[0]
            SORT o.created_at DESC
            LIMIT @skip, @limit
            RETURN MERGE(o, {{
                id: o._key,
                client_name: client || "—",
                courier_name: courier || "Не назначен"
            }})
        """,
        bind_vars=bind,
    )
    orders = list(data_cursor)

    return {"total": total, "page": page, "page_size": page_size, "items": orders}


# ---------------------------------------------------------------------------
# Лента событий
# ---------------------------------------------------------------------------

@router.get("/events")
def get_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: dict = Depends(get_current_admin),
):
    db = arango_instance.db

    if not db.has_collection("Events"):
        return {"total": 0, "page": page, "page_size": page_size, "items": []}

    skip = (page - 1) * page_size

    total_cursor = db.aql.execute(
        "FOR e IN Events COLLECT WITH COUNT INTO n RETURN n"
    )
    total = list(total_cursor)[0]

    data_cursor = db.aql.execute(
        """
        FOR e IN Events
            SORT e.created_at DESC
            LIMIT @skip, @limit
            RETURN e
        """,
        bind_vars={"skip": skip, "limit": page_size},
    )

    return {"total": total, "page": page, "page_size": page_size, "items": list(data_cursor)}
