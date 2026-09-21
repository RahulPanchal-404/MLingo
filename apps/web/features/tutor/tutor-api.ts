import { apiBaseUrl } from "@/lib/api";
import type { TutorRequest, TutorResponse } from "./types";

export async function askTutor(request: TutorRequest): Promise<TutorResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}/tutor/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(15_000),
    });

    if (response.ok) {
      const data: unknown = await response.json();
      if (isValidTutorResponse(data)) {
        return data;
      }
    }
  } catch {
    // Gracefully handle network outage or unreachable backend
  }

  // Client-side fallback response if backend service is offline
  return generateClientFallbackResponse(request);
}

function isValidTutorResponse(val: unknown): val is TutorResponse {
  if (!val || typeof val !== "object") return false;
  const v = val as Partial<TutorResponse>;
  return typeof v.answer === "string" && Array.isArray(v.evidence);
}

function generateClientFallbackResponse(request: TutorRequest): TutorResponse {
  const tr = request.context.training;
  const prj = request.context.project;

  if (prj && prj.project_title) {
    return {
      answer: `You are working on **${prj.project_title}** (${prj.milestone_title || "Current Milestone"}).`,
      why: prj.educational_goal || "Follow the guided project milestones.",
      evidence: [
        `Project: ${prj.project_title}`,
        `Milestone: ${prj.milestone_title || "Active"}`,
      ],
      math_connection: "Each milestone connects data processing directly to algorithm optimization.",
      what_to_inspect_next: "Review the milestone criteria and complete the required action.",
      anchors: {},
      suggested_followups: [
        "Why is this preprocessing step needed?",
        "Explain the train/test split.",
      ],
      provider: "client_fallback",
      mode: "project",
    };
  }

  if (tr) {
    const stepStr = `Step ${tr.selected_step + 1} of ${tr.total_steps}`;
    const lossStr = tr.loss !== undefined && tr.loss !== null ? tr.loss.toFixed(4) : "N/A";
    return {
      answer: `Currently inspecting **${tr.algorithm.replace("_", " ")}** at **${stepStr}**. Current loss is \`${lossStr}\`.`,
      why: "Parameters are updating along the negative gradient vector to minimize loss on the training data.",
      evidence: [
        `Algorithm: ${tr.algorithm}`,
        `Step: ${stepStr}`,
        `Loss: ${lossStr}`,
      ],
      math_connection: "w ← w - α · ∂L/∂w. Gradient measures instantaneous loss surface slope.",
      what_to_inspect_next: "Scrub the timeline or inspect parameter updates in Model X-Ray.",
      anchors: {
        math_anchor_id: "math-mode-panel",
        code_anchor_id: "code-mode-panel",
        model_xray_anchor_id: "model-x-ray-panel",
        timeline_step: tr.selected_step,
      },
      suggested_followups: [
        "Why did the loss change here?",
        "Open in Math Mode",
        "See in Code",
      ],
      provider: "client_fallback",
      mode: "explain",
    };
  }

  return {
    answer: "I am your MLingo AI Tutor. Ask me about your active training frame, model parameters, mathematics, or data workflow!",
    why: "The tutor is ready to analyze telemetry as soon as a lab or project is active.",
    evidence: ["Ready for interaction."],
    math_connection: null,
    what_to_inspect_next: "Run model training in any lab or start a guided project in Project Studio.",
    anchors: {},
    suggested_followups: [
      "How does gradient descent work?",
      "What is learning rate?",
    ],
    provider: "client_fallback",
    mode: "general",
  };
}
