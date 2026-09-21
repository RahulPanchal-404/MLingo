import { beforeEach, describe, expect, it, vi } from "vitest";
import { askTutor } from "../tutor-api";
import type { TutorRequest, TutorResponse } from "../types";

describe("Tutor API Client & Zero-Key Fallback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns server response when fetch succeeds", async () => {
    const mockResponse: TutorResponse = {
      answer: "Weight w₁ decreased to 0.450.",
      why: "The positive gradient ∂L/∂w = 0.25 caused a subtraction.",
      evidence: ["Gradient: 0.25", "LR: 0.1"],
      math_connection: "w ← w - α · ∂L/∂w",
      what_to_inspect_next: "Inspect next frame in Model X-Ray.",
      anchors: {
        math_anchor_id: "math-mode-panel",
        code_anchor_id: "code-mode-panel",
      },
      suggested_followups: ["Why is the gradient positive?"],
      provider: "mock_provider",
      mode: "explain",
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const request: TutorRequest = {
      message: "Explain this step",
      context: {
        training: {
          algorithm: "gradient_descent",
          selected_step: 4,
          total_steps: 20,
        },
      },
    };

    const result = await askTutor(request);
    expect(result.answer).toBe("Weight w₁ decreased to 0.450.");
    expect(result.provider).toBe("mock_provider");
    expect(result.anchors.math_anchor_id).toBe("math-mode-panel");
  });

  it("uses client fallback gracefully when fetch throws network error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network connection refused"));

    const request: TutorRequest = {
      message: "Explain step 3",
      context: {
        training: {
          algorithm: "logistic_regression",
          selected_step: 3,
          total_steps: 50,
          loss: 0.4123,
        },
      },
    };

    const result = await askTutor(request);
    expect(result).toBeDefined();
    expect(result.provider).toBe("client_fallback");
    expect(result.evidence.some((e) => e.includes("0.4123"))).toBe(true);
    expect(result.anchors.math_anchor_id).toBe("math-mode-panel");
    expect(result.anchors.timeline_step).toBe(3);
  });

  it("uses client fallback for project context when offline", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Offline"));

    const request: TutorRequest = {
      message: "What is this milestone?",
      context: {
        project: {
          project_id: "salary-prediction",
          project_title: "Salary Prediction",
          milestone_title: "Train/Test Split",
          educational_goal: "Prevent data leakage by splitting before scaling.",
        },
      },
    };

    const result = await askTutor(request);
    expect(result.provider).toBe("client_fallback");
    expect(result.mode).toBe("project");
    expect(result.answer).toContain("Salary Prediction");
    expect(result.why).toContain("Prevent data leakage");
  });

  it("handles empty context gracefully in fallback", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const request: TutorRequest = {
      message: "Hello tutor",
      context: {},
    };

    const result = await askTutor(request);
    expect(result.provider).toBe("client_fallback");
    expect(result.answer).toContain("MLingo AI Tutor");
    expect(result.suggested_followups.length).toBeGreaterThan(0);
  });
});
