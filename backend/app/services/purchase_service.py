from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.purchase import Purchase, PurchaseItem
from app.models.stock_ledger import StockLedger, StockLedgerReason
from app.schemas.purchase import PurchaseCreate


def create_purchase(db: Session, payload: PurchaseCreate, user_id: int) -> Purchase:
    product_ids = [item.product_id for item in payload.items]
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}
    missing = set(product_ids) - products.keys()
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown product ids: {sorted(missing)}")

    purchase = Purchase(supplier_id=payload.supplier_id, user_id=user_id, total_amount=Decimal("0"))
    db.add(purchase)
    db.flush()

    total = Decimal("0")
    for item in payload.items:
        product = products[item.product_id]

        existing_qty = product.quantity
        existing_value = product.cost_price * existing_qty
        incoming_value = item.unit_cost * item.quantity
        new_qty = existing_qty + item.quantity
        product.cost_price = (existing_value + incoming_value) / new_qty if new_qty else item.unit_cost
        product.quantity = new_qty

        db.add(
            PurchaseItem(
                purchase_id=purchase.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_cost=item.unit_cost,
            )
        )
        db.add(
            StockLedger(
                product_id=item.product_id,
                change_qty=item.quantity,
                reason=StockLedgerReason.purchase,
                ref_type="purchase",
                ref_id=purchase.id,
                user_id=user_id,
            )
        )
        total += incoming_value

    purchase.total_amount = total
    db.commit()
    db.refresh(purchase)
    return purchase
