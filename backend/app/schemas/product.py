from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    sku: str
    name: str
    category_id: int | None = None
    unit: str = "pcs"
    cost_price: Decimal = Decimal("0")
    sell_price: Decimal = Decimal("0")
    quantity: int = 0
    reorder_level: int = 0


class ProductUpdate(BaseModel):
    sku: str | None = None
    name: str | None = None
    category_id: int | None = None
    unit: str | None = None
    cost_price: Decimal | None = None
    sell_price: Decimal | None = None
    reorder_level: int | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    category_id: int | None
    unit: str
    cost_price: Decimal
    sell_price: Decimal
    quantity: int
    reorder_level: int
