from pydantic import BaseModel, ConfigDict


class SupplierCreate(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None


class SupplierUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None


class SupplierOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str | None
    email: str | None
    address: str | None
