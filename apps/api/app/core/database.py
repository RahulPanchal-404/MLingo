from app.core.config import get_settings


def get_database_url() -> str:
    """Expose persistence configuration without coupling it to route handlers.

    SQLAlchemy engine and session factories will live here when persistence is introduced.
    """

    return get_settings().database_url
