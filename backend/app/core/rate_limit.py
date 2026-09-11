import time
from collections import defaultdict
from threading import Lock

from fastapi import HTTPException, Request, status

MAX_ATTEMPTS = 5
WINDOW_SECONDS = 300

# In-memory and per-process: fine for a single uvicorn worker, resets on
# restart, and does not share state across multiple workers/instances.
_attempts: dict[str, list[float]] = defaultdict(list)
_lock = Lock()


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _key(request: Request, bucket: str) -> str:
    return f"{bucket}:{_client_ip(request)}"


def check_rate_limit(
    request: Request,
    bucket: str,
    max_attempts: int = MAX_ATTEMPTS,
    window_seconds: int = WINDOW_SECONDS,
) -> None:
    key = _key(request, bucket)
    now = time.time()
    with _lock:
        recent = [t for t in _attempts[key] if now - t < window_seconds]
        _attempts[key] = recent
        if len(recent) >= max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please try again in a few minutes.",
            )


def record_attempt(request: Request, bucket: str) -> None:
    with _lock:
        _attempts[_key(request, bucket)].append(time.time())


def reset_attempts(request: Request, bucket: str) -> None:
    with _lock:
        _attempts.pop(_key(request, bucket), None)


def check_login_rate_limit(request: Request) -> None:
    check_rate_limit(request, "login")


def record_failed_login(request: Request) -> None:
    record_attempt(request, "login")


def reset_login_attempts(request: Request) -> None:
    reset_attempts(request, "login")
