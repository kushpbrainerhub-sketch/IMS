from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import UserRole
from app.schemas.report import DashboardSummary, LowStockProductOut, SalesTrendPoint, TopProductOut
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=DashboardSummary)
def summary(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return report_service.get_summary(db)


@router.get("/sales-trend", response_model=list[SalesTrendPoint])
def sales_trend(
    days: int = 14,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return report_service.get_sales_trend(db, days)


@router.get("/top-products", response_model=list[TopProductOut])
def top_products(
    days: int = 30,
    limit: int = 5,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return report_service.get_top_products(db, days, limit)


@router.get("/low-stock", response_model=list[LowStockProductOut])
def low_stock(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return report_service.get_low_stock(db)
