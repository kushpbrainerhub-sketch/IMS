from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.schemas.report import (
    DashboardSummary,
    LowStockProductOut,
    SalesTrendPoint,
    TopProductOut,
)


def get_summary(db: Session) -> DashboardSummary:
    today = func.date(Sale.created_at) == func.current_date()
    today_total, today_count = db.query(
        func.coalesce(func.sum(Sale.total_amount), 0),
        func.count(Sale.id),
    ).filter(today).one()

    month_start = func.date_trunc("month", func.current_date())
    (month_total,) = db.query(func.coalesce(func.sum(Sale.total_amount), 0)).filter(
        func.date(Sale.created_at) >= month_start
    ).one()

    total_products = db.query(func.count(Product.id)).scalar()
    low_stock_count = (
        db.query(func.count(Product.id)).filter(Product.quantity <= Product.reorder_level).scalar()
    )
    inventory_value = db.query(
        func.coalesce(func.sum(Product.quantity * Product.cost_price), 0)
    ).scalar()

    return DashboardSummary(
        today_sales_total=today_total,
        today_sales_count=today_count,
        month_sales_total=month_total,
        total_products=total_products,
        low_stock_count=low_stock_count,
        inventory_value=inventory_value,
    )


def get_sales_trend(db: Session, days: int) -> list[SalesTrendPoint]:
    cutoff = datetime.now() - timedelta(days=days - 1)
    rows = (
        db.query(func.date(Sale.created_at).label("day"), func.sum(Sale.total_amount).label("total"))
        .filter(Sale.created_at >= cutoff)
        .group_by("day")
        .all()
    )
    totals_by_day = {row.day: row.total for row in rows}

    today = date.today()
    return [
        SalesTrendPoint(
            date=day,
            total=totals_by_day.get(day, Decimal("0")),
        )
        for day in (today - timedelta(days=offset) for offset in range(days - 1, -1, -1))
    ]


def get_top_products(db: Session, days: int, limit: int) -> list[TopProductOut]:
    cutoff = datetime.now() - timedelta(days=days)
    rows = (
        db.query(
            Product.id.label("product_id"),
            Product.sku,
            Product.name,
            func.sum(SaleItem.quantity).label("quantity_sold"),
            func.sum(SaleItem.quantity * SaleItem.unit_price).label("revenue"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.created_at >= cutoff)
        .group_by(Product.id, Product.sku, Product.name)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(limit)
        .all()
    )
    return [TopProductOut.model_validate(row) for row in rows]


def get_low_stock(db: Session) -> list[Product]:
    return (
        db.query(Product)
        .filter(Product.quantity <= Product.reorder_level)
        .order_by((Product.reorder_level - Product.quantity).desc())
        .all()
    )
