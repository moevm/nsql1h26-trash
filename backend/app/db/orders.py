from app.db.session import arango_instance

ORDERS_COLLECTION = "orders"
EXECUTES_COLLECTION = "Executes"

ORDER_STYLES = {
    "Бытовой мусор": {"icon": "delete_forever", "color": "text-red-500", "bg": "bg-red-50"},
    "Строительный": {"icon": "construction", "color": "text-yellow-600", "bg": "bg-yellow-50"},
    "Мебель": {"icon": "chair", "color": "text-blue-500", "bg": "bg-blue-50"}
}

def get_available_orders(type_filter: str = None):
    db = arango_instance.db

    query = """
    FOR o IN orders
        FILTER o.status == 'created'
        FILTER @filter == null OR o.type == @filter
        LET is_taken = LENGTH(FOR v, e IN 1..1 INBOUND o Executes RETURN e) > 0
        FILTER !is_taken
        RETURN o
    """

    cursor = db.aql.execute(query, bind_vars={"filter": type_filter})
    raw_orders = list(cursor)
    for o in raw_orders:
        style = ORDER_STYLES.get(o.get('type'), {"icon": "eco", "color": "text-green-500", "bg": "bg-green-50"})
        o.update({
            "id": o.get('_key'),
            "icon": style['icon'],
            "color": style['color'],
            "bg": style['bg'],
            "isNew": True
        })

    return raw_orders