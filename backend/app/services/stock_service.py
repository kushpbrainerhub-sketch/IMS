from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock_ledger import StockLedger, StockLedgerReason
from app.schemas.stock_ledger import StockAdjustmentCreate


def create_adjustment(db: Session, payload: StockAdjustmentCreate, user_id: int) -> StockLedger:
    product = db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    new_qty = product.quantity + payload.change_qty
    if new_qty < 0:
        raise HTTPException(status_code=400, detail="Adjustment would make stock negative")

    product.quantity = new_qty
    entry = StockLedger(
        product_id=payload.product_id,
        change_qty=payload.change_qty,
        reason=StockLedgerReason.adjustment,
        note=payload.note,
        user_id=user_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
