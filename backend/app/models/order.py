from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal, Optional

OrderStatus = Literal["searching", "active", "done"]
class AddressDetails(BaseModel):
    entrance: Optional[str] = Field(None, description="Подъезд")
    floor: Optional[int] = Field(None, description="Этаж")
    intercom: Optional[str] = Field(None, description="Домофон")


class OrderBase(BaseModel):
    waste_type: str = Field(..., description="Тип отходов")
    volume: float = Field(..., gt=0, description="Объём в м³")
    address: str = Field(..., min_length=5, description="Адрес вывоза")
    address_details: Optional[AddressDetails] = Field(None, description="Детали адреса")
    scheduled_at: str = Field(..., description="Желаемая дата и время вывоза")
    description: Optional[str] = Field(None, description="Комментарий к заказу")


class OrderCreate(OrderBase):
    """Модель для создания заказа"""
    status: OrderStatus = Field("searching", description="Начальный статус")

class StatusUpdate(BaseModel):
    """Модель для статуса заказа"""
    status: str

class Order(OrderBase):
    """Полная модель заказа для ответа"""
    id: str = Field(..., alias="_key")
    status: OrderStatus
    completion_photo: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }