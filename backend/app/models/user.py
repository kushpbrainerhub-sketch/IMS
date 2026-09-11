import enum

from sqlalchemy import Column, DateTime, Enum, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    cashier = "cashier"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.cashier)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
