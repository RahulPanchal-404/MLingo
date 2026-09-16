import numpy as np
import pytest

from app.ml.algorithms.logistic_regression import binary_cross_entropy, sigmoid
from app.ml.datasets.classification import make_logistic_regression_dataset
from app.ml.datasets.synthetic import make_linear_regression_dataset
from app.ml.training.trainer import train_linear_regression, train_logistic_regression
from app.ml.training.types import ClassificationDataset, RegressionDataset, TrainingConfig


def _dataset(*, slope: float = 3.0, intercept: float = -1.0) -> RegressionDataset:
    synthetic = make_linear_regression_dataset(samples=40, slope=slope, intercept=intercept, noise=0.0)
    return RegressionDataset(features=synthetic.features.reshape(-1, 1), targets=synthetic.targets, name="simple-line")


def test_synthetic_dataset_is_seeded_and_has_expected_line_without_noise() -> None:
    first = make_linear_regression_dataset(samples=5, slope=2.0, intercept=1.0, noise=0.2, seed=8)
    second = make_linear_regression_dataset(samples=5, slope=2.0, intercept=1.0, noise=0.2, seed=8)
    noiseless = make_linear_regression_dataset(samples=3, slope=2.0, intercept=1.0)

    assert np.array_equal(first.features, second.features)
    assert np.array_equal(first.targets, second.targets)
    assert np.allclose(noiseless.targets, [-1.0, 1.0, 3.0])


def test_linear_regression_records_each_epoch_and_converges() -> None:
    run = train_linear_regression(_dataset(), TrainingConfig(learning_rate=0.1, epochs=200), run_id="run-1")

    assert len(run.history) == 201
    assert run.markers == tuple(range(201))
    assert run.history[0].step == 0
    assert run.history[0].weights == (0.0,)
    assert run.history[0].bias == 0.0
    assert run.history[0].gradients == ()
    assert run.history[0].bias_gradient is None
    assert run.history[-1].loss < run.history[0].loss
    assert run.history[-1].weights[0] == pytest.approx(3.0, abs=0.01)
    assert run.history[-1].bias == pytest.approx(-1.0, abs=0.01)
    assert len(run.history[-1].predictions) == 40


def test_training_is_deterministic_with_fixed_configuration() -> None:
    configuration = TrainingConfig(learning_rate=0.05, epochs=20, initial_weights=(0.25,), initial_bias=0.5)

    first = train_linear_regression(_dataset(), configuration, run_id="same-run")
    second = train_linear_regression(_dataset(), configuration, run_id="same-run")

    assert first == second


def test_break_mode_learning_rate_produces_instability_pattern() -> None:
    synthetic = make_linear_regression_dataset(samples=32, slope=2.0, intercept=1.0, noise=0.0, seed=0)
    dataset = RegressionDataset(features=synthetic.features.reshape(-1, 1), targets=synthetic.targets, name="break-mode")
    run = train_linear_regression(dataset, TrainingConfig(learning_rate=1.25, epochs=50, initial_weights=(0.0,), initial_bias=0.0), run_id="break-mode")
    losses = [state.loss for state in run.history]

    assert losses[0] > losses[1]
    assert losses[1] < losses[2] < losses[3]
    assert (losses[2] - losses[1]) / losses[1] >= 0.02
    assert (losses[3] - losses[2]) / losses[2] >= 0.02


def test_initial_state_matches_configured_model() -> None:
    configuration = TrainingConfig(learning_rate=0.05, epochs=20, initial_weights=(0.25,), initial_bias=0.5)
    run = train_linear_regression(_dataset(), configuration)
    initial = run.history[0]

    expected_predictions = 0.25 * _dataset().features[:, 0] + 0.5
    expected_loss = float(np.mean((expected_predictions - _dataset().targets) ** 2))
    assert initial.step == 0
    assert initial.weights == configuration.initial_weights
    assert initial.bias == configuration.initial_bias
    assert initial.predictions == pytest.approx(tuple(expected_predictions))
    assert initial.loss == pytest.approx(expected_loss)


def test_initial_state_is_deterministic() -> None:
    configuration = TrainingConfig(learning_rate=0.05, epochs=20, initial_weights=(0.25,), initial_bias=0.5)

    first = train_linear_regression(_dataset(), configuration).history[0]
    second = train_linear_regression(_dataset(), configuration).history[0]

    assert first == second


@pytest.mark.parametrize(
    ("dataset", "configuration", "message"),
    [
        (RegressionDataset(np.empty((0, 1)), np.empty(0)), TrainingConfig(0.1, 1), "non-empty"),
        (_dataset(), TrainingConfig(0.0, 1), "learning_rate"),
        (_dataset(), TrainingConfig(0.1, 0), "epochs"),
        (_dataset(), TrainingConfig(0.1, 1, initial_weights=(1.0, 2.0)), "initial_weights"),
    ],
)
def test_training_rejects_invalid_inputs(dataset: RegressionDataset, configuration: TrainingConfig, message: str) -> None:
    with pytest.raises(ValueError, match=message):
        train_linear_regression(dataset, configuration)


def test_synthetic_dataset_rejects_invalid_sample_or_noise_values() -> None:
    with pytest.raises(ValueError, match="samples"):
        make_linear_regression_dataset(samples=0)
    with pytest.raises(ValueError, match="noise"):
        make_linear_regression_dataset(noise=-0.1)


def test_logistic_dataset_is_deterministic_and_two_dimensional() -> None:
    first = make_logistic_regression_dataset(samples=10, noise=0.1, seed=4)
    second = make_logistic_regression_dataset(samples=10, noise=0.1, seed=4)

    assert np.array_equal(first.features, second.features)
    assert np.array_equal(first.targets, second.targets)
    assert first.features.shape == (10, 2)
    assert set(first.targets) == {0.0, 1.0}


def test_logistic_sigmoid_and_loss_are_stable() -> None:
    probabilities = sigmoid(np.array([-1000.0, 0.0, 1000.0]))

    assert np.all(np.isfinite(probabilities))
    assert np.all((probabilities >= 0) & (probabilities <= 1))
    assert binary_cross_entropy(probabilities, np.array([0.0, 0.0, 1.0])) < 1.0


def test_logistic_training_records_pre_update_state_and_improves_loss() -> None:
    synthetic = make_logistic_regression_dataset(samples=64, noise=0.1, seed=0)
    dataset = ClassificationDataset(synthetic.features, synthetic.targets, "simple-classification")
    configuration = TrainingConfig(learning_rate=0.2, epochs=80, initial_weights=(0.0, 0.0), initial_bias=0.0)
    run = train_logistic_regression(dataset, configuration, run_id="logistic-run")

    assert len(run.history) == 81
    assert run.history[0].step == 0
    assert run.history[0].weights == (0.0, 0.0)
    assert run.history[0].gradients == ()
    assert run.history[0].bias_gradient is None
    assert run.history[-1].loss < run.history[0].loss
    assert run.history[-1].metrics.accuracy is not None
    assert run.history[-1].metrics.accuracy > 0.95
    assert len(run.history[-1].predictions) == 64
