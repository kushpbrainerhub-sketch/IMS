from collections import defaultdict
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.stock_ledger import StockLedger, StockLedgerReason
from app.schemas.sale import SaleCreate


def create_sale(db: Session, payload: SaleCreate, user_id: int) -> Sale:
    requested_qty: dict[int, int] = defaultdict(int)
    for item in payload.items:
        requested_qty[item.product_id] += item.quantity

    product_ids = list(requested_qty.keys())
    products = {
        p.id: p
        for p in db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
    }
    missing = set(product_ids) - products.keys()
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown product ids: {sorted(missing)}")

    insufficient = [
        f"{products[pid].sku} (have {products[pid].quantity}, need {qty})"
        for pid, qty in requested_qty.items()
        if products[pid].quantity < qty
    ]
    if insufficient:
        raise HTTPException(status_code=400, detail=f"Insufficient stock: {', '.join(insufficient)}")

    subtotal = Decimal("0")
    for item in payload.items:
        subtotal += products[item.product_id].sell_price * item.quantity

    if payload.discount > subtotal:
        raise HTTPException(status_code=400, detail="Discount cannot exceed subtotal")

    sale = Sale(
        user_id=user_id,
        customer_name=payload.customer_name,
        subtotal=subtotal,
        discount=payload.discount,
        total_amount=subtotal - payload.discount,
        payment_mode=payload.payment_mode,
    )
    db.add(sale)
    db.flush()

    for item in payload.items:
        product = products[item.product_id]
        db.add(
            SaleItem(
                sale_id=sale.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=product.sell_price,
            )
        )

    for pid, qty in requested_qty.items():
        products[pid].quantity -= qty
        db.add(
            StockLedger(
                product_id=pid,
                change_qty=-qty,
                reason=StockLedgerReason.sale,
                ref_type="sale",
                ref_id=sale.id,
                user_id=user_id,
            )
        )

    db.commit()
    db.refresh(sale)
    return sale
