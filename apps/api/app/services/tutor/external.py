import json
import logging
from typing import Any

import httpx

from app.core.config import Settings
from app.schemas.tutor import TutorAnchors, TutorRequest, TutorResponse
from app.services.tutor.base import BaseTutorProvider
from app.services.tutor.fallback import DeterministicFallbackProvider

logger = logging.getLogger(__name__)


class ExternalLLMProvider(BaseTutorProvider):
    """External LLM provider with strict context grounding and automatic deterministic fallback."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.fallback = DeterministicFallbackProvider()

    async def generate_response(self, request: TutorRequest) -> TutorResponse:
        api_key = self.settings.tutor_api_key
        if not api_key:
            logger.info("No LLM API key configured. Utilizing deterministic fallback provider.")
            return await self.fallback.generate_response(request)

        try:
            # Build prompt payload with explicit telemetry JSON
            system_prompt = (
                "You are MLingo AI Tutor, an expert machine learning pedagogical mentor. "
                "The learner is interacting with an ML algorithm frame by frame. "
                "STRICT SAFETY RULES:\n"
                "1. Ground all answers strictly in the provided MLingo telemetry context JSON.\n"
                "2. NEVER fabricate or hallucinate loss values, gradients, weights, or metrics.\n"
                "3. If evidence is missing, state that context is insufficient.\n"
                "4. Respond with valid JSON matching keys: answer, why, evidence (list of strings), "
                "math_connection, what_to_inspect_next, suggested_followups (list of strings)."
            )

            context_json = request.context.model_dump_json(exclude_none=True)
            user_content = f"Learner Query: {request.message}\n\nCurrent MLingo Telemetry Context:\n{context_json}"

            # Call Google Gemini API
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.settings.tutor_model}:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_content}"}]}
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.2,
                },
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)

            if response.status_code != 200:
                logger.warning("External provider error %s: %s", response.status_code, response.text)
                return await self.fallback.generate_response(request)

            data: dict[str, Any] = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return await self.fallback.generate_response(request)

            raw_text = candidates[0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)

            anchors = TutorAnchors(
                math_anchor_id="math-mode-panel",
                code_anchor_id="code-mode-panel",
                model_xray_anchor_id="model-x-ray-panel",
                timeline_step=request.context.training.selected_step if request.context.training else None,
            )

            return TutorResponse(
                answer=parsed.get("answer", "Here is your machine learning explanation."),
                why=parsed.get("why"),
                evidence=parsed.get("evidence", []),
                math_connection=parsed.get("math_connection"),
                what_to_inspect_next=parsed.get("what_to_inspect_next"),
                anchors=anchors,
                suggested_followups=parsed.get("suggested_followups", []),
                provider="external_llm",
                mode=request.mode or "general",
            )
        except Exception as exc:
            logger.warning("External LLM call failed (%s). Using deterministic fallback.", exc)
            return await self.fallback.generate_response(request)
