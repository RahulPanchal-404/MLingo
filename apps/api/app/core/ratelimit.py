"""Small in-memory sliding-window rate limiter.

Used to slow down password guessing and scripted result spam. On serverless hosts each
instance keeps its own counters, so this is a per-instance brake rather than a global
guarantee; pair it with a platform firewall rule for stronger limits.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_lock = threading.Lock()
_hits: dict[str, deque[float]] = defaultdict(deque)
_MAX_KEYS = 50_000


def client_ip(request: Request) -> str:
    """Best-effort client address. Vercel and most proxies put the caller first in X-Forwarded-For."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    return request.client.host if request.client else "unknown"


def hit(key: str, limit: int, window_seconds: float) -> None:
    """Record one event for `key`; raise 429 if more than `limit` events happened in the window."""
    now = time.monotonic()
    with _lock:
        if len(_hits) > _MAX_KEYS:  # bound memory under a flood of distinct keys
            _hits.clear()
        q = _hits[key]
        while q and now - q[0] > window_seconds:
            q.popleft()
        if len(q) >= limit:
            retry = max(1, int(window_seconds - (now - q[0])))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please wait a moment and try again.",
                headers={"Retry-After": str(retry)},
            )
        q.append(now)


def reset() -> None:
    """Clear all counters (tests)."""
    with _lock:
        _hits.clear()
