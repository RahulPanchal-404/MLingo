import numpy as np
import pytest

from app.ml.training.trainer import train_linear_regression
from app.ml.training.types import RegressionDataset, TrainingConfig, TrainingRun
from app.timeline.controller import TimelineController
from app.timeline.types import MarkerType, TimelineMarker


def _run(epochs: int = 3) -> TrainingRun:
    dataset = RegressionDataset(np.array([[0.0], [1.0], [2.0]]), np.array([1.0, 3.0, 5.0]), "timeline-data")
    return train_linear_regression(dataset, TrainingConfig(learning_rate=0.1, epochs=epochs), run_id="timeline-run")


def test_initial_playhead_selects_first_recorded_state() -> None:
    timeline = TimelineController(_run())

    assert timeline.state.current_step == 0
    assert timeline.state.total_steps == 3
    assert timeline.current_training_state == _run().history[0]
    assert timeline.is_at_start


def test_jump_clamps_outside_steps_and_selects_requested_state() -> None:
    timeline = TimelineController(_run())

    assert timeline.jump_to_step(-10).current_step == 0
    assert timeline.jump_to_step(99).current_step == 3
    selected = timeline.jump_to_step(2).selected_training_state
    assert selected is not None
    assert selected.step == 2


def test_step_navigation_and_start_end_behavior() -> None:
    timeline = TimelineController(_run())

    assert timeline.step_backward().current_step == 0
    assert timeline.step_forward().current_step == 1
    assert timeline.jump_to_end().current_step == 3
    assert timeline.is_at_end
    assert timeline.step_forward().current_step == 3
    assert timeline.jump_to_start().current_step == 0


def test_playback_state_and_speed_validation() -> None:
    timeline = TimelineController(_run())

    assert timeline.play().is_playing
    assert not timeline.toggle_play().is_playing
    assert timeline.set_playback_speed(2.0).playback_speed == 2.0
    with pytest.raises(ValueError, match="positive finite"):
        timeline.set_playback_speed(0)
    with pytest.raises(ValueError, match="positive finite"):
        TimelineController(_run(), playback_speed=float("inf"))


def test_marker_creation_removal_and_validation() -> None:
    timeline = TimelineController(_run())
    marker = TimelineMarker("plateau", 2, "Loss plateau", MarkerType.IMPORTANT_EVENT, "Inspect convergence")

    assert timeline.add_marker(marker).markers == (marker,)
    assert timeline.remove_marker("plateau")
    assert not timeline.remove_marker("missing")
    timeline.add_marker(marker)
    with pytest.raises(ValueError, match="already exists"):
        timeline.add_marker(marker)
    with pytest.raises(ValueError, match="recorded"):
        timeline.create_marker(step=20, title="Later", marker_type=MarkerType.USER_ANNOTATION)


def test_empty_history_remains_safe_and_paused() -> None:
    original = _run()
    empty_run = TrainingRun(original.id, original.algorithm, original.dataset_name, original.configuration, 0, (), (), {})
    timeline = TimelineController(empty_run)

    assert timeline.state.current_step == 0
    assert timeline.state.selected_training_state is None
    assert not timeline.play().is_playing
    assert timeline.jump_to_step(4).current_step == 0
    assert timeline.is_at_start and timeline.is_at_end


def test_single_state_history_cannot_move_outside_its_state() -> None:
    timeline = TimelineController(_run(epochs=1))

    assert timeline.step_forward().current_step == 1
    assert timeline.step_backward().current_step == 0
    assert timeline.is_at_start
