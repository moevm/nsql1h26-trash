from pydantic import BaseModel, Field
from typing import Optional


class CustomerRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    confirm_password: str
    address: str


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    role: str
    address: Optional[str] = None


class LoginRequest(BaseModel):
    login: str
    password: str


class LoginResponse(UserResponse):
    message: str
    access_token: str
    token_type: str

class ProfileUpdateCourier(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    transport: str


class ProfileUpdateCustomer(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: str
    address: str

class CourierResponse(UserResponse):
    transport: Optional[str] = None
    class Config:
        from_attributes = True

class PasswordChangeRequest(BaseModel):
    old_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)

class AdminRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    confirm_password: str