from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.sale import Sale
from app.models.user import User, UserRole
from app.schemas.sale import SaleCreate, SaleOut
from app.services.sale_service import create_sale

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("", response_model=list[SaleOut])
def list_sales(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.manager)),
):
    return (
        db.query(Sale)
        .options(joinedload(Sale.items))
        .order_by(Sale.created_at.desc())
        .all()
    )


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    sale = db.query(Sale).options(joinedload(Sale.items)).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.post("", response_model=SaleOut, status_code=201)
def record_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_sale(db, payload, current_user.id)
