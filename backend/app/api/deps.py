from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings
from app.models.user import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM or "HS256"]
        )
        
        print("=== PAYLOAD FROM TOKEN ===")
        print(payload)
        
        user_data = {
            "id": payload.get("sub") or payload.get("id"),
            "full_name": payload.get("full_name", "Unknown"),
            "email": payload.get("email", ""),
            "phone": payload.get("phone", ""),
            "role": payload.get("role", "customer")
        }
        
        return UserResponse(**user_data)

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