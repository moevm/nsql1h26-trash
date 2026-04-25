from dynaconf import Dynaconf, Validator

settings = Dynaconf(
    envvar_prefix="TRASH",
    load_dotenv=True,
    validators=[
        Validator("DB_PORT", default=8529, is_type_of=int),
        Validator("DB_HOST", must_exist=True),
        Validator("DB_URL", must_exist=True),
        Validator("DB_NAME", default="trash_db"),
        Validator("DB_PASSWORD", default=""),
        Validator("JWT_SECRET", default="trash-dev-secret-change-me"),
        Validator("JWT_ALGORITHM", default="HS256"),
        Validator("JWT_EXPIRE_MINUTES", default=60 * 24, is_type_of=int),
        Validator("DEBUG_ADMIN_FULL_NAME", default="Администратор"),
        Validator("DEBUG_ADMIN_EMAIL", default="admin@trash.local"),
        Validator("DEBUG_ADMIN_PHONE", default="+70000000000"),
        Validator("DEBUG_ADMIN_PASSWORD", default="Admin123"),
        Validator("DEBUG_COURIER_FULL_NAME", default="Тестовый Курьер"),
        Validator("DEBUG_COURIER_EMAIL", default="courier@trash.local"),
        Validator("DEBUG_COURIER_PHONE", default="+70000000001"),
        Validator("DEBUG_COURIER_PASSWORD", default="Courier123"),
        Validator("DEBUG_COURIER_CITY", default="Санкт-Петербург"),
        Validator("DEBUG_COURIER_TRANSPORT", default="car"),
        Validator("DEBUG_CUSTOMER_FULL_NAME", default="Тестовый Заказчик"),
        Validator("DEBUG_CUSTOMER_EMAIL", default="customer@trash.local"),
        Validator("DEBUG_CUSTOMER_PHONE", default="+70000000002"),
        Validator("DEBUG_CUSTOMER_PASSWORD", default="Customer123"),
        Validator("DEBUG_CUSTOMER_ADDRESS", default="г. Санкт-Петербург, Невский пр., д. 1"),
    ]
)

settings.validators.validate()
