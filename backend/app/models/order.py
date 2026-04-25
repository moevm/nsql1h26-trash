from datetime import datetime
from pydantic import BaseModel, Field, field_serializer
from typing import Literal, Optional

OrderStatus = Literal["searching", "active", "done"]
class AddressDetails(BaseModel):
    entrance: Optional[str] = Field(None, description="Подъезд")
    floor: Optional[int] = Field(None, description="Этаж")
    intercom: Optional[str] = Field(None, description="Домофон")

class Address(BaseModel):
    """Теперь это отдельная модель"""
    full_address: str = Field(..., min_length=5)
    details: Optional[AddressDetails] = None

class OrderBase(BaseModel):
    waste_type: str = Field(..., description="Тип отходов")
    volume: float = Field(..., gt=0, description="Объём в м³")
    scheduled_at: str = Field(..., description="Желаемая дата и время вывоза")
    description: Optional[str] = Field(None, description="Комментарий к заказу")

class OrderCreate(OrderBase):
    """Модель для создания заказа"""
    address: Address
    status: OrderStatus = Field("searching", description="Начальный статус")
    price: float = Field(..., gt=0, description="Цена заказа")

class StatusUpdate(BaseModel):
    """Модель для статуса заказа"""
    status: str

class Transaction(BaseModel):
    amount: float
    type: str
    status: str
    timestamp: str

class Order(OrderBase):
    """Полная модель заказа для ответа"""
    id: str = Field(..., alias="_key")
    status: OrderStatus
    address: Optional[Address] = None
    completion_photo: Optional[str] = None
    created_at: Optional[datetime] = None
    client_name: Optional[str] = None
    transaction: Optional[Transaction] = None
    price: Optional[float] = None

    @field_serializer('created_at')
    def serialize_dt(self, dt: datetime, _info):
        return dt.isoformat() if dt else None
    class Config:
        populate_by_name = True
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        alias_generator = lambda s: s