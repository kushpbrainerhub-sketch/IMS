"""Wipe all application data for a fresh start (e.g. to test the signup flow again).

Usage (from backend/, with venv active):
    python scripts/reset_db.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text  # noqa: E402

from app.core.database import engine  # noqa: E402

TABLES = [
    "stock_ledger",
    "sale_items",
    "sales",
    "purchase_items",
    "purchases",
    "products",
    "categories",
    "suppliers",
    "users",
]


def main():
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE TABLE {', '.join(TABLES)} RESTART IDENTITY CASCADE"))
    print(f"Wiped {len(TABLES)} tables. Database is now empty — the next signup becomes the admin.")


if __name__ == "__main__":
    main()
