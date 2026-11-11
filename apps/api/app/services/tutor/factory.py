import logging

from app.core.config import Settings, get_settings
from app.services.tutor.base import BaseTutorProvider
from app.services.tutor.external import ExternalLLMProvider
from app.services.tutor.fallback import DeterministicFallbackProvider
from app.services.tutor.mock import MockTutorProvider

logger = logging.getLogger(__name__)


def get_tutor_provider(settings: Settings | None = None) -> BaseTutorProvider:
    """Instantiate and return the configured AI Tutor provider."""
    active_settings = settings or get_settings()
    provider_name = active_settings.tutor_provider.lower().strip()

    if provider_name == "mock":
        return MockTutorProvider()

    if provider_name == "gemini" and active_settings.tutor_api_key:
        return ExternalLLMProvider(active_settings)

    if provider_name not in ("fallback", "gemini"):
        # e.g. "openai": there is no OpenAI client, and the external provider only
        # speaks the Gemini API, so never send this key to Google.
        logger.warning("Unsupported tutor provider %r; using the deterministic fallback.", provider_name)

    # Default: Deterministic, zero-key fallback provider
    return DeterministicFallbackProvider()
