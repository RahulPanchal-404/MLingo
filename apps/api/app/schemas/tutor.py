from typing import Literal
from pydantic import BaseModel, Field


class TutorAnchors(BaseModel):
    math_anchor_id: str | None = None
    code_anchor_id: str | None = None
    model_xray_anchor_id: str | None = None
    timeline_step: int | None = None
    suggested_action: str | None = None


class TutorMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    anchors: TutorAnchors | None = None


class TrainingContext(BaseModel):
    algorithm: str = "linear_regression"
    selected_step: int = 0
    total_steps: int = 0
    loss: float | None = None
    previous_loss: float | None = None
    weights: list[float] | None = None
    bias: float | None = None
    gradients: list[float] | None = None
    bias_gradient: float | None = None
    learning_rate: float | None = None
    metrics: dict[str, float] | None = None
    centroids: list[list[float]] | None = None
    cluster_assignments: list[int] | None = None
    inertia: float | None = None
    hidden_activations: list[list[float]] | None = None


class EvaluationContext(BaseModel):
    task_type: str = "regression"
    train_metric: float | None = None
    test_metric: float | None = None
    metric_name: str | None = None
    mae: float | None = None
    r2: float | None = None
    accuracy: float | None = None
    precision: float | None = None
    recall: float | None = None
    f1: float | None = None
    threshold: float | None = None
    tp: int | None = None
    fp: int | None = None
    fn: int | None = None
    tn: int | None = None
    inertia: float | None = None


class ExperimentContext(BaseModel):
    run_a_title: str | None = None
    run_b_title: str | None = None
    param_changed: str | None = None
    run_a_val: str | None = None
    run_b_val: str | None = None
    run_a_metric: str | None = None
    run_b_metric: str | None = None


class ProjectContext(BaseModel):
    project_id: str | None = None
    project_title: str | None = None
    milestone_id: str | None = None
    milestone_order: int | None = None
    milestone_title: str | None = None
    educational_goal: str | None = None
    dataset_name: str | None = None
    model_name: str | None = None
    completed_milestones: list[str] = Field(default_factory=list)


class DiagnosticContext(BaseModel):
    type: str = ""
    title: str = ""
    step: int = 0
    what_happened: str = ""
    why: str = ""
    parameter_behavior: str = ""
    suggested_action: str = ""
    evidence: list[dict[str, str | int | float | None]] = Field(default_factory=list)


class TutorContext(BaseModel):
    route: str | None = None
    training: TrainingContext | None = None
    evaluation: EvaluationContext | None = None
    experiment: ExperimentContext | None = None
    project: ProjectContext | None = None
    diagnostic: DiagnosticContext | None = None
    active_anchor: str | None = None


class TutorRequest(BaseModel):
    message: str
    context: TutorContext = Field(default_factory=TutorContext)
    conversation_history: list[TutorMessage] = Field(default_factory=list)
    mode: str = "general"


class TutorResponse(BaseModel):
    answer: str
    why: str | None = None
    evidence: list[str] = Field(default_factory=list)
    math_connection: str | None = None
    what_to_inspect_next: str | None = None
    anchors: TutorAnchors = Field(default_factory=TutorAnchors)
    suggested_followups: list[str] = Field(default_factory=list)
    provider: str = "fallback"
    mode: str = "general"
