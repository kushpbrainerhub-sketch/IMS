from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.sale import PaymentMode


class SaleItemIn(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be positive")
        return v


class SaleCreate(BaseModel):
    customer_name: str | None = None
    discount: Decimal = Decimal("0")
    payment_mode: PaymentMode = PaymentMode.cash
    items: list[SaleItemIn]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list[SaleItemIn]) -> list[SaleItemIn]:
        if not v:
            raise ValueError("sale must have at least one item")
        return v

    @field_validator("discount")
    @classmethod
    def discount_non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("discount must not be negative")
        return v


class SaleItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal


class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    customer_name: str | None
    subtotal: Decimal
    discount: Decimal
    total_amount: Decimal
    payment_mode: PaymentMode
    created_at: datetime
    items: list[SaleItemOut]
