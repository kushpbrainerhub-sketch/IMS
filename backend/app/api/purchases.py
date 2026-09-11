from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import require_role
from app.models.purchase import Purchase
from app.models.user import User, UserRole
from app.schemas.purchase import PurchaseCreate, PurchaseOut
from app.services.purchase_service import create_purchase

router = APIRouter(prefix="/purchases", tags=["purchases"])


@router.get("", response_model=list[PurchaseOut])
def list_purchases(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return (
        db.query(Purchase)
        .options(joinedload(Purchase.items))
        .order_by(Purchase.created_at.desc())
        .all()
    )


@router.post("", response_model=PurchaseOut, status_code=201)
def record_purchase(
    payload: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return create_purchase(db, payload, current_user.id)
