from dynaconf import Dynaconf, Validator

settings = Dynaconf(
    envvar_prefix="TRASH", 
    load_dotenv=True,
    validators=[
        Validator("DB_PORT", default=8529, is_type_of=int),
        Validator("DB_HOST", must_exist=True),
        Validator("DB_URL", must_exist=True),
        Validator("DB_PASSWORD", must_exist=True),
    ]
)

settings.validators.validate()