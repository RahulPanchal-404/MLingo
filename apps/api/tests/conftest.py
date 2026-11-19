import pytest

from app.core import ratelimit


@pytest.fixture(autouse=True)
def _fresh_rate_limits():
    """Every test starts with empty rate-limit counters."""
    ratelimit.reset()
    yield
    ratelimit.reset()
