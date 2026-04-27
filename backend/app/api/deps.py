from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.db.session import arango_instance
from app.db.orders import USERS_COLLECTION
from jose import JWTError, jwt
from app.core.config import settings
from app.models.user import UserResponse, CourierResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM or "HS256"]
        )


        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing user ID")


        db = arango_instance.db
        user_doc = db.collection(USERS_COLLECTION).get(user_id)

        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Пользователь не найден в базе"
            )

        print("=== PAYLOAD FROM TOKEN ===")
        
        return UserResponse(
            id=user_doc["_key"],
            full_name=user_doc.get("full_name", "Unknown"),
            email=user_doc.get("email", ""),
            phone=user_doc.get("phone", ""),
            role=user_doc.get("role", "customer")
        )
        

    except JWTError as e:
        print(f"JWTError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Unexpected error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def get_current_active_client(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ разрешён только заказчикам"
        )
    return current_user

async def get_current_active_courier(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "courier":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ разрешён только курьерам"
        )
    return current_user


async def get_current_active_admin(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ разрешён только администраторам"
        )
    return current_user