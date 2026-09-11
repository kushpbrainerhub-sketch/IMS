from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.stock_ledger import StockLedgerReason


class StockAdjustmentCreate(BaseModel):
    product_id: int
    change_qty: int
    note: str | None = None

    @field_validator("change_qty")
    @classmethod
    def change_qty_nonzero(cls, v: int) -> int:
        if v == 0:
            raise ValueError("change_qty must not be zero")
        return v


class StockLedgerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    change_qty: int
    reason: StockLedgerReason
    note: str | None
    ref_type: str | None
    ref_id: int | None
    user_id: int
    created_at: datetime
