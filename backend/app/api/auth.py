from fastapi import APIRouter
from app.api.auth_handlers.login import router as login_router
from app.api.auth_handlers.registration import router as registration_router
from app.api.auth_handlers.password_reset import router as password_reset_router

router = APIRouter()

router.include_router(login_router)
router.include_router(registration_router)
router.include_router(password_reset_router)