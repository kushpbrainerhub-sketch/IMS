"""Seed the local database with demo data for manually exploring the app.

Safe to re-run: categories/suppliers/products are created only if missing
(matched by name/SKU). Each run adds a fresh batch of purchases and sales
so report/dashboard charts have data to show.

Usage (from backend/, with venv active):
    python scripts/seed_demo_data.py
"""

import random
import sys
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.product import Product  # noqa: E402
from app.models.purchase import Purchase  # noqa: E402
from app.models.sale import Sale  # noqa: E402
from app.models.supplier import Supplier  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402
from app.schemas.purchase import PurchaseCreate, PurchaseItemIn  # noqa: E402
from app.schemas.sale import SaleCreate, SaleItemIn  # noqa: E402
from app.schemas.stock_ledger import StockAdjustmentCreate  # noqa: E402
from app.services.purchase_service import create_purchase  # noqa: E402
from app.services.sale_service import create_sale  # noqa: E402
from app.services.stock_service import create_adjustment  # noqa: E402

CATEGORIES = ["Notebooks", "Pens & Pencils", "Files & Folders", "Art Supplies", "Office Supplies"]

SUPPLIERS = [
    {"name": "Sharma Stationery Wholesale", "phone": "9820011122", "email": "sales@sharmastationery.in", "address": "12 MG Road, Pune"},
    {"name": "ClassMate Distributors", "phone": "9911223344", "email": "orders@classmatedist.in", "address": "45 Nehru Market, Delhi"},
    {"name": "Om Paper Traders", "phone": "9765432109", "email": "ompapertraders@gmail.com", "address": "8 Station Road, Nashik"},
]

# (sku, name, category, unit, cost_price, sell_price, reorder_level)
PRODUCTS = [
    ("NB-002", "Spiral Notebook 200pg", "Notebooks", "pcs", "35.00", "65.00", 15),
    ("NB-003", "Long Notebook (King Size)", "Notebooks", "pcs", "45.00", "80.00", 10),
    ("PEN-002", "Black Gel Pen", "Pens & Pencils", "pcs", "8.00", "15.00", 25),
    ("PEN-003", "HB Pencil (Pack of 10)", "Pens & Pencils", "pack", "25.00", "45.00", 15),
    ("PEN-004", "Sketch Pens Set (12 colors)", "Pens & Pencils", "set", "60.00", "110.00", 10),
    ("FIL-001", "L-Shape File Folder", "Files & Folders", "pcs", "12.00", "22.00", 20),
    ("FIL-002", "Ring Binder 2-inch", "Files & Folders", "pcs", "90.00", "150.00", 10),
    ("FIL-003", "Spring File Board", "Files & Folders", "pcs", "15.00", "28.00", 15),
    ("ART-001", "Watercolor Set 12 colors", "Art Supplies", "set", "70.00", "130.00", 8),
    ("ART-002", "Crayons Box 24", "Art Supplies", "box", "40.00", "75.00", 15),
    ("OFF-001", "Stapler Small", "Office Supplies", "pcs", "35.00", "60.00", 10),
    ("OFF-002", "Stapler Pins Box", "Office Supplies", "box", "10.00", "20.00", 20),
    ("OFF-003", "Correction Pen (Whitener)", "Office Supplies", "pcs", "18.00", "32.00", 10),
    ("OFF-004", "Cello Tape 1inch", "Office Supplies", "pcs", "10.00", "18.00", 25),
]

CUSTOMER_NAMES = [None, None, "Walk-in", "Priya Sharma", "Rahul Verma", "Anjali Mehta", "Rohan Gupta", "Sneha Patil"]
PAYMENT_MODES = ["cash", "cash", "cash", "card", "upi", "upi"]


def get_or_create_category(db, name):
    category = db.query(Category).filter(Category.name == name).first()
    if category is None:
        category = Category(name=name)
        db.add(category)
        db.flush()
    return category


def get_or_create_supplier(db, data):
    supplier = db.query(Supplier).filter(Supplier.name == data["name"]).first()
    if supplier is None:
        supplier = Supplier(**data)
        db.add(supplier)
        db.flush()
    return supplier


def get_or_create_product(db, sku, name, category_id, unit, cost_price, sell_price, reorder_level):
    product = db.query(Product).filter(Product.sku == sku).first()
    if product is None:
        product = Product(
            sku=sku,
            name=name,
            category_id=category_id,
            unit=unit,
            cost_price=Decimal(cost_price),
            sell_price=Decimal(sell_price),
            quantity=0,
            reorder_level=reorder_level,
        )
        db.add(product)
        db.flush()
    return product


def backdate(db, model, obj_id, dt):
    db.query(model).filter(model.id == obj_id).update({"created_at": dt})


def main():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == UserRole.admin).first()
        if admin is None:
            print("No admin user found — run the app once to bootstrap an admin first.")
            return

        categories = {name: get_or_create_category(db, name) for name in CATEGORIES}
        suppliers = [get_or_create_supplier(db, s) for s in SUPPLIERS]
        db.commit()

        products = [
            get_or_create_product(db, sku, name, categories[cat].id, unit, cost, sell, reorder)
            for sku, name, cat, unit, cost, sell, reorder in PRODUCTS
        ]
        db.commit()

        # Stock in every product via a handful of backdated purchases.
        now = datetime.now()
        purchase_count = 0
        for days_ago in (25, 18, 10, 3):
            supplier = random.choice(suppliers)
            items = [
                PurchaseItemIn(product_id=p.id, quantity=random.randint(20, 60), unit_cost=Decimal(cost))
                for p, (_, _, _, _, cost, _, _) in zip(products, PRODUCTS)
                if random.random() < 0.6
            ]
            if not items:
                continue
            purchase = create_purchase(db, PurchaseCreate(supplier_id=supplier.id, items=items), admin.id)
            backdate(db, Purchase, purchase.id, now - timedelta(days=days_ago, hours=random.randint(0, 5)))
            purchase_count += 1
        db.commit()

        # Backfill NB-001 / PEN-001 (created earlier) if they're out of stock.
        for sku, qty in (("NB-001", 40), ("PEN-001", 80)):
            product = db.query(Product).filter(Product.sku == sku).first()
            if product and product.quantity < 5:
                create_adjustment(
                    db,
                    StockAdjustmentCreate(product_id=product.id, change_qty=qty, note="Seed restock"),
                    admin.id,
                )
        db.commit()

        # Sales spread across the last 14 days (plus a few "today") for chart/report data.
        all_products = db.query(Product).all()
        sale_count = 0
        for days_ago in list(range(13, 0, -1)) + [0, 0, 0]:
            for _ in range(random.randint(1, 3)):
                in_stock = [p for p in all_products if p.quantity > 0]
                if not in_stock:
                    break
                basket = random.sample(in_stock, k=min(random.randint(1, 3), len(in_stock)))
                items = []
                for p in basket:
                    qty = min(random.randint(1, 4), p.quantity)
                    if qty > 0:
                        items.append(SaleItemIn(product_id=p.id, quantity=qty))
                if not items:
                    continue
                sale = create_sale(
                    db,
                    SaleCreate(
                        customer_name=random.choice(CUSTOMER_NAMES),
                        discount=Decimal("0"),
                        payment_mode=random.choice(PAYMENT_MODES),
                        items=items,
                    ),
                    admin.id,
                )
                if days_ago > 0:
                    backdate(db, Sale, sale.id, now - timedelta(days=days_ago, hours=random.randint(0, 10)))
                sale_count += 1
                db.commit()
                all_products = db.query(Product).all()

        # One damage/loss adjustment for demo variety.
        damaged = db.query(Product).filter(Product.quantity > 5).first()
        if damaged:
            create_adjustment(
                db,
                StockAdjustmentCreate(product_id=damaged.id, change_qty=-2, note="Damaged in storage"),
                admin.id,
            )
            db.commit()

        print(f"Seeded: {len(categories)} categories, {len(suppliers)} suppliers, "
              f"{len(products)} new products, {purchase_count} purchases, {sale_count} sales.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
