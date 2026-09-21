from app.core.config import Settings, get_settings
from app.services.tutor.base import BaseTutorProvider
from app.services.tutor.external import ExternalLLMProvider
from app.services.tutor.fallback import DeterministicFallbackProvider
from app.services.tutor.mock import MockTutorProvider


def get_tutor_provider(settings: Settings | None = None) -> BaseTutorProvider:
    """Instantiate and return the configured AI Tutor provider."""
    active_settings = settings or get_settings()
    provider_name = active_settings.tutor_provider.lower().strip()

    if provider_name == "mock":
        return MockTutorProvider()

    if provider_name in ("gemini", "openai") and active_settings.tutor_api_key:
        return ExternalLLMProvider(active_settings)

    # Default: Deterministic, zero-key fallback provider
    return DeterministicFallbackProvider()
