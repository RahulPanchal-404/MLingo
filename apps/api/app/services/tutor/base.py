from abc import ABC, abstractmethod

from app.schemas.tutor import TutorRequest, TutorResponse


class BaseTutorProvider(ABC):
    """Abstract interface for all MLingo AI Tutor providers."""

    @abstractmethod
    async def generate_response(self, request: TutorRequest) -> TutorResponse:
        """Generate a structured, context-grounded pedagogical response."""
        pass
