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


def check_login_rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    now = time.time()
    with _lock:
        recent = [t for t in _attempts[ip] if now - t < WINDOW_SECONDS]
        _attempts[ip] = recent
        if len(recent) >= MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again in a few minutes.",
            )


def record_failed_login(request: Request) -> None:
    with _lock:
        _attempts[_client_ip(request)].append(time.time())


def reset_login_attempts(request: Request) -> None:
    with _lock:
        _attempts.pop(_client_ip(request), None)
