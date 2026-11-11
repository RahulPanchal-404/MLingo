from typing import Annotated, Literal

from pydantic import BaseModel, Field

# Request size limits. The web client sends the last 10 messages and one
# training frame, so these are generous for real use but stop oversized payloads.
MAX_MESSAGE_CHARS = 2_000
MAX_HISTORY_MESSAGES = 50
MAX_HISTORY_MESSAGE_CHARS = 8_000
MAX_LIST_ITEMS = 10_000  # per-sample lists (e.g. cluster assignments) are capped by dataset size
MAX_SHORT_TEXT = 200
MAX_LONG_TEXT = 4_000

ShortText = Annotated[str, Field(max_length=MAX_SHORT_TEXT)]
LongText = Annotated[str, Field(max_length=MAX_LONG_TEXT)]


class TutorAnchors(BaseModel):
    math_anchor_id: ShortText | None = None
    code_anchor_id: ShortText | None = None
    model_xray_anchor_id: ShortText | None = None
    timeline_step: int | None = None
    suggested_action: LongText | None = None


class TutorMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(max_length=MAX_HISTORY_MESSAGE_CHARS)
    anchors: TutorAnchors | None = None


class TrainingContext(BaseModel):
    algorithm: ShortText = "linear_regression"
    selected_step: int = 0
    total_steps: int = 0
    loss: float | None = None
    previous_loss: float | None = None
    weights: Annotated[list[float], Field(max_length=MAX_LIST_ITEMS)] | None = None
    bias: float | None = None
    gradients: Annotated[list[float], Field(max_length=MAX_LIST_ITEMS)] | None = None
    bias_gradient: float | None = None
    learning_rate: float | None = None
    metrics: Annotated[dict[str, float], Field(max_length=50)] | None = None
    centroids: Annotated[list[list[float]], Field(max_length=100)] | None = None
    cluster_assignments: Annotated[list[int], Field(max_length=MAX_LIST_ITEMS)] | None = None
    inertia: float | None = None
    hidden_activations: Annotated[list[list[float]], Field(max_length=100)] | None = None


class EvaluationContext(BaseModel):
    task_type: ShortText = "regression"
    train_metric: float | None = None
    test_metric: float | None = None
    metric_name: ShortText | None = None
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
    run_a_title: ShortText | None = None
    run_b_title: ShortText | None = None
    param_changed: ShortText | None = None
    run_a_val: ShortText | None = None
    run_b_val: ShortText | None = None
    run_a_metric: ShortText | None = None
    run_b_metric: ShortText | None = None


class ProjectContext(BaseModel):
    project_id: ShortText | None = None
    project_title: ShortText | None = None
    milestone_id: ShortText | None = None
    milestone_order: int | None = None
    milestone_title: ShortText | None = None
    educational_goal: LongText | None = None
    dataset_name: ShortText | None = None
    model_name: ShortText | None = None
    completed_milestones: list[ShortText] = Field(default_factory=list, max_length=100)


class DiagnosticContext(BaseModel):
    type: ShortText = ""
    title: ShortText = ""
    step: int = 0
    what_happened: LongText = ""
    why: LongText = ""
    parameter_behavior: LongText = ""
    suggested_action: LongText = ""
    evidence: list[dict[str, str | int | float | None]] = Field(default_factory=list, max_length=50)


class TutorContext(BaseModel):
    route: ShortText | None = None
    training: TrainingContext | None = None
    evaluation: EvaluationContext | None = None
    experiment: ExperimentContext | None = None
    project: ProjectContext | None = None
    diagnostic: DiagnosticContext | None = None
    active_anchor: ShortText | None = None


class TutorRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS)
    context: TutorContext = Field(default_factory=TutorContext)
    conversation_history: list[TutorMessage] = Field(default_factory=list, max_length=MAX_HISTORY_MESSAGES)
    mode: ShortText = "general"


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
