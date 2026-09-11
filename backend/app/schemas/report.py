from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DashboardSummary(BaseModel):
    today_sales_total: Decimal
    today_sales_count: int
    month_sales_total: Decimal
    total_products: int
    low_stock_count: int
    inventory_value: Decimal


class SalesTrendPoint(BaseModel):
    date: date
    total: Decimal


class TopProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    sku: str
    name: str
    quantity_sold: int
    revenue: Decimal


class LowStockProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    quantity: int
    reorder_level: int
