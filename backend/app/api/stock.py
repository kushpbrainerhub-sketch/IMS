from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.stock_ledger import StockLedger
from app.models.user import User, UserRole
from app.schemas.stock_ledger import StockAdjustmentCreate, StockLedgerOut
from app.services.stock_service import create_adjustment

router = APIRouter(prefix="/stock", tags=["stock"])


@router.get("/ledger", response_model=list[StockLedgerOut])
def list_ledger(
    product_id: int | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.manager)),
):
    query = db.query(StockLedger)
    if product_id is not None:
        query = query.filter(StockLedger.product_id == product_id)
    return query.order_by(StockLedger.created_at.desc()).all()


@router.post("/adjustments", response_model=StockLedgerOut, status_code=201)
def create_stock_adjustment(
    payload: StockAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return create_adjustment(db, payload, current_user.id)
