from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.core.email import send_email
from app.core.rate_limit import check_login_rate_limit, check_rate_limit, record_failed_login, reset_login_attempts
from app.core.security import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    decode_email_verification_token,
    decode_password_reset_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.schemas.user import (
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    SetupStatus,
    Token,
    UserCreate,
    UserOut,
    VerifyEmailRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _send_verification_email(user: User) -> None:
    token = create_email_verification_token(user.id)
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    send_email(
        user.email,
        "Verify your email",
        f"Hi {user.name},\n\nVerify your email address by opening this link:\n{link}\n\n"
        "This link expires in 24 hours.",
    )


@router.get("/setup-status", response_model=SetupStatus)
def setup_status(db: Session = Depends(get_db)):
    return SetupStatus(needs_setup=db.query(User).count() == 0)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    # Bootstrap: the very first user in an empty database becomes admin with no auth
    # required. Once at least one user exists, only an admin can register new users.
    is_first_user = db.query(User).count() == 0
    if not is_first_user and (current_user is None or current_user.role != UserRole.admin):
        raise HTTPException(status_code=403, detail="Only an admin can register new users")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.admin if is_first_user else payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _send_verification_email(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    check_login_rate_limit(request)
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        record_failed_login(request)
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    reset_login_attempts(request)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    check_rate_limit(request, "forgot-password")
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        token = create_password_reset_token(user.id)
        link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        send_email(
            user.email,
            "Reset your password",
            f"Hi {user.name},\n\nReset your password by opening this link:\n{link}\n\n"
            "This link expires in 30 minutes. If you didn't request this, ignore this email.",
        )
    return {"detail": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user_id = decode_password_reset_token(payload.token)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"detail": "Password has been reset. You can now log in."}


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user_id = decode_email_verification_token(payload.token)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    user.email_verified = True
    db.commit()
    return {"detail": "Email verified."}


@router.post("/resend-verification")
def resend_verification(request: Request, current_user: User = Depends(get_current_user)):
    check_rate_limit(request, "resend-verification")
    if not current_user.email_verified:
        _send_verification_email(current_user)
    return {"detail": "If your email isn't verified yet, a new link has been sent."}
