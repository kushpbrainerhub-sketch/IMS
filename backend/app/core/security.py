from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def _create_purpose_token(user_id: int, purpose: str, expires_minutes: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    return jwt.encode(
        {"sub": str(user_id), "purpose": purpose, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def _decode_purpose_token(token: str, purpose: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    if payload.get("purpose") != purpose or payload.get("sub") is None:
        return None
    return int(payload["sub"])


def create_password_reset_token(user_id: int) -> str:
    return _create_purpose_token(user_id, "password_reset", expires_minutes=30)


def decode_password_reset_token(token: str) -> int | None:
    return _decode_purpose_token(token, "password_reset")


def create_email_verification_token(user_id: int) -> str:
    return _create_purpose_token(user_id, "email_verification", expires_minutes=60 * 24)


def decode_email_verification_token(token: str) -> int | None:
    return _decode_purpose_token(token, "email_verification")
