from app.schemas.tutor import TutorAnchors, TutorRequest, TutorResponse
from app.services.tutor.base import BaseTutorProvider


class MockTutorProvider(BaseTutorProvider):
    """Deterministic mock provider for automated testing."""

    async def generate_response(self, request: TutorRequest) -> TutorResponse:
        context = request.context
        step = context.training.selected_step if context.training else 0
        loss = context.training.loss if context.training else 0.0

        return TutorResponse(
            answer=f"Mock AI Tutor response for: '{request.message}'. Current step: {step}.",
            why=f"Mock explanation based on loss {loss}.",
            evidence=[f"Mock telemetry: step={step}, loss={loss}"],
            math_connection="Mock formula connection: y = w*x + b.",
            what_to_inspect_next="Inspect mock next step.",
            anchors=TutorAnchors(
                math_anchor_id="math-mode-panel",
                code_anchor_id="code-mode-panel",
                model_xray_anchor_id="model-x-ray-panel",
                timeline_step=step,
            ),
            suggested_followups=["Mock followup 1", "Mock followup 2"],
            provider="mock",
            mode=request.mode or "general",
        )
