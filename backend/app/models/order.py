from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal, Optional


OrderStatus = Literal["searching", "active", "done"]
class AddressDetails(BaseModel):
    entrance: Optional[str] = Field(None, description="Подъезд")
    floor: Optional[int] = Field(None, description="Этаж")
    intercom: Optional[str] = Field(None, description="Домофон")

class Address(BaseModel):
    id: Optional[str] = Field(None, alias="_key")
    full_address: str = Field(..., min_length=5, description="Полный адрес")
    details: Optional[AddressDetails] = None


class OrderBase(BaseModel):
    waste_type: str = Field(..., description="Тип отходов")
    volume: float = Field(..., gt=0, description="Объём в м³")
    scheduled_at: str = Field(..., description="Желаемая дата и время вывоза")
    description: Optional[str] = Field(None, description="Комментарий к заказу")


class OrderCreate(OrderBase):
    address: str = Field(..., min_length=5)
    address_details: Optional[AddressDetails] = None
    status: OrderStatus = Field("searching")
    price: float = Field(..., gt=0)

class StatusUpdate(BaseModel):
    """Модель для статуса заказа"""
    status: str

class Transaction(BaseModel):
    amount: float
    type: str
    status: str
    timestamp: str


class CourierShortInfo(BaseModel):
    id: str
    full_name: str
    phone: Optional[str] = None
    rating: float = 0.0
    transport: Optional[str] = None

    class Config:
        from_attributes = True


class Order(OrderBase):
    """Полная модель заказа для ответа"""
    id: str = Field(..., alias="_key")
    status: OrderStatus
    
    address: Optional[str] = None
    address_details: Optional[AddressDetails] = None
    courier: Optional[CourierShortInfo] = None

    completion_photo: Optional[str] = None
    created_at: Optional[datetime] = None
    client_name: Optional[str] = None
    transaction: Optional[Transaction] = None
    price: Optional[float] = None

    class Config:
        populate_by_name = True
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }