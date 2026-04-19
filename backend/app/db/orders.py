from app.db.session import arango_instance
import time

ORDERS_COLLECTION = "orders"
EXECUTES_COLLECTION = "Executes"

ORDER_STYLES = {
    "Бытовой мусор": {"icon": "delete_forever", "color": "text-red-500", "bg": "bg-red-50"},
    "Строительный": {"icon": "construction", "color": "text-yellow-600", "bg": "bg-yellow-50"},
    "Мебель": {"icon": "chair", "color": "text-blue-500", "bg": "bg-blue-50"}
}

def get_available_orders(type_filter: str = None):
    db = arango_instance.db

    # Запрос с использованием графовых связей
    query = """
    FOR o IN Orders
    FILTER o.status == 'created'
    FILTER @filter == null OR o.waste_type == @filter
    FILTER LENGTH(FOR v, e IN 1..1 INBOUND o Executes RETURN e) == 0
    
    LET loc = (FOR l, e IN 1..1 OUTBOUND o At RETURN l)[0]
    
    // Теперь мы добавляем весь объект loc целиком, 
    // чтобы на фронте были доступны и адрес, и details
    RETURN MERGE(o, { 
        "location": loc, 
        "id": o._key 
    })
    """

    cursor = db.aql.execute(query, bind_vars={"filter": type_filter})
    raw_orders = list(cursor)

    current_time = time.time()

    for o in raw_orders:
        # Рассчитываем разницу в минутах
        created_at = o.get('created_at', current_time)
        diff_minutes = int((current_time - created_at) / 60)

        if diff_minutes < 60:
            time_display = f"{diff_minutes} мин назад"
        else:
            time_display = f"{int(diff_minutes / 60)} ч назад"

        style = ORDER_STYLES.get(o.get('waste_type'), {"icon": "eco", "color": "text-green-500", "bg": "bg-green-50"})

        o.update({
            "id": o.get('_key'),
            "type": o.get('waste_type'),
            "icon": style['icon'],
            "color": style['color'],
            "bg": style['bg'],
            "isNew": True,
            "time": time_display,  # Теперь здесь будет реальное время
            "distance": "—"
        })

    return raw_orders