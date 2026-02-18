def get_hello_message(db_status: bool, db_name: str = None):
    if db_status:
        return f"Hello, World from services"
    return "Fail in services"