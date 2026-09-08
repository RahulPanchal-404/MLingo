from dataclasses import dataclass
from enum import StrEnum

from app.ml.training.types import TrainingState


class MarkerType(StrEnum):
    USER_ANNOTATION = "user_annotation"
    IMPORTANT_EVENT = "important_event"
    AUTOMATIC_EVENT = "automatic_event"


@dataclass(frozen=True)
class TimelineMarker:
    id: str
    step: int
    title: str
    marker_type: MarkerType
    description: str | None = None


@dataclass(frozen=True)
class TimelineState:
    current_step: int
    total_steps: int
    is_playing: bool
    playback_speed: float
    markers: tuple[TimelineMarker, ...]
    selected_training_state: TrainingState | None
