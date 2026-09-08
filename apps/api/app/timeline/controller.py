from math import isfinite
from uuid import uuid4

from app.ml.training.types import TrainingRun, TrainingState
from app.timeline.types import MarkerType, TimelineMarker, TimelineState


class TimelineController:
    """Owns safe playhead selection and playback state for one training run."""

    def __init__(self, training_run: TrainingRun, *, playback_speed: float = 1.0) -> None:
        self._run = training_run
        self._states_by_step = {state.step: state for state in training_run.history}
        self._steps = tuple(sorted(self._states_by_step))
        self._current_step = self._steps[0] if self._steps else 0
        self._is_playing = False
        self._playback_speed = self._validate_speed(playback_speed)
        self._markers: dict[str, TimelineMarker] = {}

    @property
    def state(self) -> TimelineState:
        return TimelineState(
            current_step=self._current_step,
            total_steps=len(self._steps),
            is_playing=self._is_playing,
            playback_speed=self._playback_speed,
            markers=tuple(self._markers.values()),
            selected_training_state=self.current_training_state,
        )

    @property
    def current_training_state(self) -> TrainingState | None:
        return self._states_by_step.get(self._current_step)

    @property
    def is_at_start(self) -> bool:
        return not self._steps or self._current_step == self._steps[0]

    @property
    def is_at_end(self) -> bool:
        return not self._steps or self._current_step == self._steps[-1]

    def play(self) -> TimelineState:
        if self._steps:
            self._is_playing = True
        return self.state

    def pause(self) -> TimelineState:
        self._is_playing = False
        return self.state

    def toggle_play(self) -> TimelineState:
        return self.pause() if self._is_playing else self.play()

    def step_forward(self) -> TimelineState:
        return self._move_by(1)

    def step_backward(self) -> TimelineState:
        return self._move_by(-1)

    def jump_to_start(self) -> TimelineState:
        if self._steps:
            self._current_step = self._steps[0]
        return self.state

    def jump_to_end(self) -> TimelineState:
        if self._steps:
            self._current_step = self._steps[-1]
        return self.state

    def jump_to_step(self, step: int) -> TimelineState:
        """Select a valid step, clamping values outside a run's recorded range."""
        if not self._steps:
            return self.state
        self._current_step = min(max(step, self._steps[0]), self._steps[-1])
        if self._current_step not in self._states_by_step:
            self._current_step = min(self._steps, key=lambda available: abs(available - step))
        return self.state

    def set_playback_speed(self, speed: float) -> TimelineState:
        self._playback_speed = self._validate_speed(speed)
        return self.state

    def add_marker(self, marker: TimelineMarker) -> TimelineState:
        if marker.id in self._markers:
            raise ValueError(f"marker id already exists: {marker.id}")
        if marker.step not in self._states_by_step:
            raise ValueError("marker step must refer to a recorded training state")
        if not marker.title.strip():
            raise ValueError("marker title must not be empty")
        self._markers[marker.id] = marker
        return self.state

    def create_marker(self, *, step: int, title: str, marker_type: MarkerType, description: str | None = None, marker_id: str | None = None) -> TimelineState:
        return self.add_marker(TimelineMarker(marker_id or str(uuid4()), step, title, marker_type, description))

    def remove_marker(self, marker_id: str) -> bool:
        return self._markers.pop(marker_id, None) is not None

    def _move_by(self, amount: int) -> TimelineState:
        if not self._steps:
            return self.state
        index = self._steps.index(self._current_step)
        self._current_step = self._steps[min(max(index + amount, 0), len(self._steps) - 1)]
        return self.state

    @staticmethod
    def _validate_speed(speed: float) -> float:
        if not isfinite(speed) or speed <= 0:
            raise ValueError("playback speed must be a positive finite number")
        return speed
