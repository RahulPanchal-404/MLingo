import re

from app.schemas.tutor import (
    TutorAnchors,
    TutorContext,
    TutorRequest,
    TutorResponse,
)
from app.services.tutor.base import BaseTutorProvider

OFF_TOPIC_PATTERNS = [
    r"\b(poem|poetry|song|lyrics|joke|story|essay|recipe|weather|president|capital of|movie)\b",
    r"\b(who is|who was|tell me about your life|write a letter)\b",
]


class DeterministicFallbackProvider(BaseTutorProvider):
    """Deterministic, zero-key tutor engine grounded strictly in MLingo telemetry and domain models."""

    async def generate_response(self, request: TutorRequest) -> TutorResponse:
        message_lower = request.message.strip().lower()
        context = request.context

        # 1. Off-topic check
        if self._is_off_topic(message_lower):
            return TutorResponse(
                answer=(
                    "I am the MLingo AI Tutor, focused on helping you master machine learning concepts, "
                    "loss optimization, mathematics, and data workflows frame by frame. "
                    "Please ask me about your current model, telemetry state, training dynamics, code, or project!"
                ),
                why="Off-topic queries are filtered to maintain pedagogical focus on machine learning telemetry.",
                evidence=["Detected non-ML request query."],
                math_connection=None,
                what_to_inspect_next="Ask a question about the active training frame, gradient descent update, or decision threshold.",
                anchors=TutorAnchors(),
                suggested_followups=[
                    "What is happening in this training step?",
                    "Why is the loss moving this way?",
                    "Explain this gradient in Math Mode.",
                ],
                provider="deterministic_fallback",
                mode="off_topic",
            )

        # 2. Mode detection (explicit mode or inferred from query keywords)
        inferred_mode = self._infer_mode(message_lower, request.mode)

        if inferred_mode == "project" or context.project is not None:
            return self._handle_project_mode(context, message_lower)

        if inferred_mode == "challenge":
            return self._handle_challenge_mode(context, message_lower)

        if inferred_mode == "experiment" or context.experiment is not None:
            return self._handle_experiment_mode(context, message_lower)

        if inferred_mode == "code" or "code" in message_lower or "line" in message_lower:
            return self._handle_code_mode(context)

        if inferred_mode == "math" or "formula" in message_lower or "math" in message_lower or "equation" in message_lower:
            return self._handle_math_mode(context)

        if inferred_mode == "why" or "why" in message_lower or "increase" in message_lower or "decrease" in message_lower or "change" in message_lower:
            return self._handle_why_mode(context)

        # Default: EXPLAIN mode
        return self._handle_explain_mode(context)

    def _is_off_topic(self, text: str) -> bool:
        if not text or len(text) < 3:
            return False
        for pat in OFF_TOPIC_PATTERNS:
            if re.search(pat, text):
                return True
        return False

    def _infer_mode(self, text: str, explicit_mode: str) -> str:
        if explicit_mode and explicit_mode != "general":
            return explicit_mode
        if "project" in text or "milestone" in text or "reflection" in text:
            return "project"
        if "challenge" in text or "hint" in text or "break" in text:
            return "challenge"
        if "experiment" in text or "compare" in text or "run a" in text or "run b" in text:
            return "experiment"
        if "code" in text or "implementation" in text or "numpy" in text:
            return "code"
        if "math" in text or "formula" in text or "equation" in text or "derivative" in text:
            return "math"
        if "why" in text or "reason" in text:
            return "why"
        return "explain"

    def _handle_explain_mode(self, context: TutorContext) -> TutorResponse:
        tr = context.training
        diag = context.diagnostic

        if not tr:
            return TutorResponse(
                answer="No active training telemetry is loaded in the current frame.",
                why="The tutor requires recorded training state to extract parameters and gradients.",
                evidence=["Context contains no active training state."],
                what_to_inspect_next="Run model training in any lab or load an educational dataset to inspect telemetry.",
                anchors=TutorAnchors(),
                suggested_followups=["How does gradient descent work?", "What does learning rate control?"],
                provider="deterministic_fallback",
                mode="explain",
            )

        algo = tr.algorithm.replace("_", " ").title()
        step_str = f"Step {tr.selected_step + 1} of {tr.total_steps}"
        loss_val = f"{tr.loss:.4f}" if tr.loss is not None else "N/A"
        evidence_list = [f"Algorithm: {algo}", f"Frame: {step_str}", f"Current Loss: {loss_val}"]

        if tr.weights:
            w_str = ", ".join(f"{w:.3f}" for w in tr.weights[:4])
            evidence_list.append(f"Weights: [{w_str}]")
        if tr.bias is not None:
            evidence_list.append(f"Bias: {tr.bias:.3f}")
        if tr.learning_rate is not None:
            evidence_list.append(f"Learning Rate: {tr.learning_rate}")

        why_text = (
            f"At {step_str}, the model is iteratively updating its parameters along the negative gradient vector. "
            f"The loss of {loss_val} quantifies residual prediction discrepancy at this exact frame."
        )

        if diag and diag.what_happened:
            why_text += f" Engine Diagnostic: {diag.what_happened}"

        math_conn = (
            "Each weight update follows w ← w - α · ∂L/∂w. "
            "The gradient measures the instantaneous slope of the loss surface with respect to each parameter."
        )

        return TutorResponse(
            answer=(
                f"You are inspecting **{algo}** at **{step_str}**. "
                f"The model's current loss is `{loss_val}`. Parameters are updating according to recorded gradients."
            ),
            why=why_text,
            evidence=evidence_list,
            math_connection=math_conn,
            what_to_inspect_next="Scrub forward on the timeline or inspect the parameter updates in Model X-Ray.",
            anchors=TutorAnchors(
                math_anchor_id="math-mode-panel",
                code_anchor_id="code-mode-panel",
                model_xray_anchor_id="model-x-ray-panel",
                timeline_step=tr.selected_step,
            ),
            suggested_followups=[
                "Why did the loss change from the previous step?",
                "Show this update in Math Mode.",
                "See the Python gradient code.",
            ],
            provider="deterministic_fallback",
            mode="explain",
        )

    def _handle_why_mode(self, context: TutorContext) -> TutorResponse:
        tr = context.training
        if not tr:
            return TutorResponse(
                answer="I cannot explain why the metric shifted because no training state is currently selected.",
                why="Available context is insufficient: missing current step telemetry.",
                evidence=["No training state available."],
                what_to_inspect_next="Train the model or scrub the timeline to an active frame.",
                anchors=TutorAnchors(),
                suggested_followups=["Train model in lab", "Explain gradient descent"],
                provider="deterministic_fallback",
                mode="why",
            )

        curr_loss = tr.loss
        prev_loss = tr.previous_loss
        evidence = []

        if curr_loss is not None:
            evidence.append(f"Current loss: {curr_loss:.4f} (Step {tr.selected_step + 1})")
        if prev_loss is not None:
            evidence.append(f"Previous loss: {prev_loss:.4f} (Step {tr.selected_step})")

        if tr.gradients:
            grad_str = ", ".join(f"{g:.4f}" for g in tr.gradients[:3])
            evidence.append(f"Weight gradient: [{grad_str}]")

        if tr.learning_rate is not None:
            evidence.append(f"Learning rate (α): {tr.learning_rate}")

        if curr_loss is not None and prev_loss is not None:
            delta = curr_loss - prev_loss
            if delta > 0.0001:
                answer = (
                    f"Loss increased by `+{delta:.4f}` between step {tr.selected_step} and {tr.selected_step + 1}. "
                    "This usually occurs when the learning rate step size overshoots the minimum of the loss valley."
                )
                why = (
                    f"The update step size (α · ∂L/∂w) was larger than the local curvature radius. "
                    f"At learning rate {tr.learning_rate}, the parameter update jumped across the valley rather than descending."
                )
                next_step = "Consider reducing the learning rate by 50% to prevent overshooting."
            elif delta < -0.0001:
                answer = (
                    f"Loss decreased by `{abs(delta):.4f}` from {prev_loss:.4f} to {curr_loss:.4f}. "
                    "The parameter update moved in the direction of steepest descent, aligning predictions closer to targets."
                )
                why = (
                    "The gradient pointed opposite to the error surface slope. "
                    "Subtracting α · ∇L reduced the objective function monotonically."
                )
                next_step = "Scrub forward to check if the descent continues smoothly or encounters a plateau."
            else:
                answer = (
                    f"Loss stayed virtually unchanged (ΔL ≈ {delta:.5f}). "
                    "The model has reached a plateau or convergence point where gradient magnitudes are near zero."
                )
                why = "When the gradient norm ||∇L|| approaches zero, parameter updates become negligible."
                next_step = "Inspect gradient magnitudes in Model X-Ray to confirm convergence."
        else:
            answer = f"At step {tr.selected_step + 1}, the current loss is `{curr_loss}`."
            why = "To measure frame-to-frame change, scrub past step 0 so a preceding step is recorded."
            next_step = "Scrub the timeline forward to compare consecutive frames."

        return TutorResponse(
            answer=answer,
            why=why,
            evidence=evidence,
            math_connection="Δw = -α · ∂L/∂w; if α > 2/L_max, updates can diverge.",
            what_to_inspect_next=next_step,
            anchors=TutorAnchors(
                math_anchor_id="math-mode-panel",
                code_anchor_id="code-mode-panel",
                model_xray_anchor_id="model-x-ray-panel",
                timeline_step=tr.selected_step,
            ),
            suggested_followups=[
                "What is the mathematical reason for this step?",
                "Open in Math Mode",
                "Inspect model state in X-Ray",
            ],
            provider="deterministic_fallback",
            mode="why",
        )

    def _handle_math_mode(self, context: TutorContext) -> TutorResponse:
        tr = context.training
        algo = tr.algorithm if tr else "linear_regression"

        if algo == "logistic_regression":
            answer = (
                "In Logistic Regression, the model maps linear combinations into (0, 1) probability space "
                "using the sigmoid function: **P(y=1 | x) = σ(wᵀx + b) = 1 / (1 + e^-(wᵀx + b))**."
            )
            why = (
                "Binary Cross-Entropy loss penalizes confident wrong predictions exponentially: "
                "L = -1/n · Σ [y · log(p) + (1 - y) · log(1 - p)]. "
                "Its gradient neatly simplifies to: ∂L/∂w = 1/n · Xᵀ(p - y)."
            )
        elif algo == "kmeans":
            answer = (
                "K-Means minimizes the Within-Cluster Sum of Squares (Inertia): "
                "**WCSS = Σ_k Σ_{x ∈ C_k} ||x - μ_k||²**."
            )
            why = (
                "Centroids update via the arithmetic mean of assigned vectors: "
                "μ_k = 1/|C_k| · Σ_{x ∈ C_k} x. "
                "This guarantees that inertia non-increases monotonically at each iteration."
            )
        elif algo == "neural_network":
            answer = (
                "In a two-layer neural network, the chain rule propagates error backward: "
                "**δ₂ = p - y**, **∂L/∂W₂ = δ₂ · a₁ᵀ**, **δ₁ = (W₂ᵀ · δ₂) ⊙ σ'(z₁)**, **∂L/∂W₁ = δ₁ · xᵀ**."
            )
            why = (
                "Backpropagation calculates exact analytical partial derivatives layer by layer, "
                "multiplying Jacobians from the output back to early feature representations."
            )
        else:
            answer = (
                "In Linear Regression, the hypothesis is linear: **ŷ = wᵀx + b**. "
                "The loss is Mean Squared Error: **J(w, b) = 1/n · Σ (y - ŷ)²**."
            )
            why = (
                "Taking the partial derivative with respect to weights yields: "
                "∂J/∂w = -2/n · Σ (y - ŷ) · x. "
                "The update moves opposite to this gradient: w ← w - α · (∂J/∂w)."
            )

        evidence = []
        if tr and tr.weights:
            evidence.append(f"Current weight(s): {tr.weights}")
        if tr and tr.bias is not None:
            evidence.append(f"Current bias: {tr.bias}")
        if tr and tr.loss is not None:
            evidence.append(f"Recorded loss: {tr.loss:.4f}")

        return TutorResponse(
            answer=answer,
            why=why,
            evidence=evidence,
            math_connection="Mathematical equations are connected directly to active frame numbers in Math Mode.",
            what_to_inspect_next="Click 'Open in Math Mode' below to view and highlight the complete equation breakdown.",
            anchors=TutorAnchors(
                math_anchor_id="math-mode-panel",
                code_anchor_id="code-mode-panel",
                model_xray_anchor_id="model-x-ray-panel",
                timeline_step=tr.selected_step if tr else None,
            ),
            suggested_followups=[
                "How does this connect to Code Mode?",
                "Why did the loss change here?",
                "Jump to timeline frame",
            ],
            provider="deterministic_fallback",
            mode="math",
        )

    def _handle_code_mode(self, context: TutorContext) -> TutorResponse:
        tr = context.training
        algo = tr.algorithm if tr else "linear_regression"

        if algo == "logistic_regression":
            code_snippet = (
                "# Conceptual Logistic Regression update:\n"
                "z = X @ weights + bias\n"
                "predictions = 1 / (1 + np.exp(-z))\n"
                "dw = (X.T @ (predictions - targets)) / n\n"
                "db = np.mean(predictions - targets)\n"
                "weights -= learning_rate * dw\n"
                "bias -= learning_rate * db"
            )
            explanation = (
                "Notice how `dw = (X.T @ (predictions - targets)) / n` computes the dot product of feature columns "
                "with prediction errors. If a sample is already correctly predicted (predictions ≈ targets), its error is near zero."
            )
        elif algo == "kmeans":
            code_snippet = (
                "# Conceptual K-Means iteration:\n"
                "# 1. Assignment\n"
                "distances = np.linalg.norm(X[:, None] - centroids, axis=2)\n"
                "assignments = np.argmin(distances, axis=1)\n"
                "# 2. Update\n"
                "for k in range(K):\n"
                "    centroids[k] = X[assignments == k].mean(axis=0)"
            )
            explanation = (
                "K-Means does not compute gradient descent; it executes coordinate descent via Expectation-Maximization: "
                "first assigning points to the nearest centroid, then re-centering each centroid to its cluster mean."
            )
        else:
            code_snippet = (
                "# Conceptual Linear Regression update:\n"
                "predictions = X @ weights + bias\n"
                "errors = predictions - targets\n"
                "dw = (2 / n) * (X.T @ errors)\n"
                "db = (2 / n) * np.sum(errors)\n"
                "weights -= learning_rate * dw\n"
                "bias -= learning_rate * db"
            )
            explanation = (
                "The matrix multiplication `X.T @ errors` weights each feature vector by the magnitude of prediction error. "
                "Subtracting `learning_rate * dw` slides weights downhill on the MSE paraboloid."
            )

        return TutorResponse(
            answer=f"Here is the Python implementation corresponding to the current frame:\n\n```python\n{code_snippet}\n```",
            why=explanation,
            evidence=[f"Algorithm: {algo}"],
            math_connection="Each code operation maps 1-to-1 with analytical matrix derivatives.",
            what_to_inspect_next="Click 'See in Code' below to view and highlight the live Code Mode panel.",
            anchors=TutorAnchors(
                code_anchor_id="code-mode-panel",
                math_anchor_id="math-mode-panel",
                timeline_step=tr.selected_step if tr else None,
            ),
            suggested_followups=[
                "Open in Math Mode",
                "Why did the loss change?",
                "Inspect model state in X-Ray",
            ],
            provider="deterministic_fallback",
            mode="code",
        )

    def _handle_experiment_mode(self, context: TutorContext, query: str) -> TutorResponse:
        exp = context.experiment
        if not exp or not exp.run_a_title:
            return TutorResponse(
                answer="No active experiment comparison was found in context.",
                why="To compare runs, save at least two experiments in Experiment Explorer or Workbench.",
                evidence=["Experiment context is empty."],
                what_to_inspect_next="Run an experiment variation in Project Studio or the Experiment Explorer.",
                anchors=TutorAnchors(),
                suggested_followups=["How does learning rate affect convergence?", "What is an experiment sweep?"],
                provider="deterministic_fallback",
                mode="experiment",
            )

        param = exp.param_changed or "hyperparameter"
        val_a = exp.run_a_val or "baseline"
        val_b = exp.run_b_val or "tested"
        met_a = exp.run_a_metric or "N/A"
        met_b = exp.run_b_metric or "N/A"

        return TutorResponse(
            answer=(
                f"Comparing **{exp.run_a_title}** vs **{exp.run_b_title}**: "
                f"When `{param}` shifted from `{val_a}` to `{val_b}`, "
                f"the metric changed from `{met_a}` to `{met_b}`."
            ),
            why=(
                f"Tuning {param} altered the optimization dynamics. "
                "Larger step sizes can accelerate convergence or cause instability, while smaller values ensure smooth descent."
            ),
            evidence=[
                f"Run A: {exp.run_a_title} ({param}={val_a}) -> {met_a}",
                f"Run B: {exp.run_b_title} ({param}={val_b}) -> {met_b}",
            ],
            math_connection=f"Parameter {param} modifies the update step vector Δθ directly.",
            what_to_inspect_next="Inspect the loss curve divergence between both runs in Experiment Explorer.",
            anchors=TutorAnchors(),
            suggested_followups=["Why did this hyperparameter change the metric?", "Which run generalized better?"],
            provider="deterministic_fallback",
            mode="experiment",
        )

    def _handle_project_mode(self, context: TutorContext, query: str) -> TutorResponse:
        prj = context.project
        if not prj or not prj.project_title:
            return TutorResponse(
                answer="You are in Project Studio. Select a project to inspect guided milestones.",
                why="Project context enables milestone-specific guidance and reflection mentoring.",
                evidence=["In Project Studio dashboard."],
                what_to_inspect_next="Open Salary Prediction, Student Exam Outcome, or Customer Segmentation.",
                anchors=TutorAnchors(),
                suggested_followups=["What projects are available?", "How do milestones work?"],
                provider="deterministic_fallback",
                mode="project",
            )

        m_title = prj.milestone_title or "Current Milestone"
        m_goal = prj.educational_goal or "Complete data science workflow stage."
        completed = len(prj.completed_milestones)

        # Reflection assistance hint
        if "reflection" in query or prj.milestone_id == "reflect":
            return TutorResponse(
                answer=(
                    f"For your reflection in **{prj.project_title}**, focus on connecting engineering decisions to outcomes: "
                    "1. Note how missing values or categorical features required preprocessing.\n"
                    "2. Explain why transformers were fit strictly on the training partition.\n"
                    "3. Cite your actual train vs test metrics to justify generalization."
                ),
                why="Reflective synthesis cements the difference between isolated coding and end-to-end ML engineering.",
                evidence=[
                    f"Project: {prj.project_title}",
                    f"Completed milestones: {completed} / 11",
                ],
                math_connection="Evaluation gap Δ = Test Error - Train Error reflects empirical generalization.",
                what_to_inspect_next="Answer the reflection prompts and click 'Finalize & Complete Project'.",
                anchors=TutorAnchors(),
                suggested_followups=[
                    "Why was feature scaling required?",
                    "What does my test metric tell me?",
                    "What would happen if test data leaked into preprocessing?",
                ],
                provider="deterministic_fallback",
                mode="project",
            )

        return TutorResponse(
            answer=(
                f"You are working on **{prj.project_title}** at **{m_title}** "
                f"({completed} of 11 milestones completed)."
            ),
            why=f"Educational Objective: {m_goal}",
            evidence=[
                f"Project: {prj.project_title}",
                f"Current Milestone: {m_title}",
                f"Dataset: {prj.dataset_name or 'Educational Dataset'}",
                f"Model: {prj.model_name or 'Educational Model'}",
            ],
            math_connection="Each project milestone maps to a formal phase of the supervised or unsupervised learning lifecycle.",
            what_to_inspect_next="Complete the current milestone action and verify the criteria before advancing.",
            anchors=TutorAnchors(),
            suggested_followups=[
                "Why is this preprocessing step needed?",
                "Explain the train/test split.",
                "How will we evaluate this model?",
            ],
            provider="deterministic_fallback",
            mode="project",
        )

    def _handle_challenge_mode(self, context: TutorContext, query: str) -> TutorResponse:
        diag = context.diagnostic
        tr = context.training

        return TutorResponse(
            answer=(
                "**Challenge Hint**: Look at the relationship between learning rate and loss trajectory. "
                "When learning rate is set too high, the update step can leap across the loss valley rather than descending. "
                "Inspect the first frame where loss begins increasing after a prior decrease."
            ),
            why=(
                "In Break Mode challenges, the objective is to understand failure modes. "
                "Observing divergence or slowdown builds intuition for tuning real-world training."
            ),
            evidence=[
                f"Active diagnostic: {diag.title if diag else 'None'}",
                f"Current step: {tr.selected_step + 1 if tr else 'N/A'}",
            ],
            math_connection="Divergence occurs when step size exceeds the Lipschitz gradient bound (α > 2/L).",
            what_to_inspect_next="Try adjusting the learning rate slider and scrub the timeline to observe where instability manifests.",
            anchors=TutorAnchors(
                timeline_step=tr.selected_step if tr else None,
                model_xray_anchor_id="model-x-ray-panel",
            ),
            suggested_followups=[
                "Give me another hint",
                "Why did instability happen?",
                "Open in Math Mode",
            ],
            provider="deterministic_fallback",
            mode="challenge",
        )
