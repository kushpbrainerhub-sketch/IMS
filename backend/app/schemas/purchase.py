from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator


class PurchaseItemIn(BaseModel):
    product_id: int
    quantity: int
    unit_cost: Decimal

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be positive")
        return v


class PurchaseCreate(BaseModel):
    supplier_id: int
    items: list[PurchaseItemIn]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list[PurchaseItemIn]) -> list[PurchaseItemIn]:
        if not v:
            raise ValueError("purchase must have at least one item")
        return v


class PurchaseItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_cost: Decimal


class PurchaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    supplier_id: int
    user_id: int
    total_amount: Decimal
    items: list[PurchaseItemOut]
