from uuid import uuid4

import numpy as np

from app.ml.algorithms.linear_regression import predict
from app.ml.algorithms.logistic_regression import binary_cross_entropy, predict_proba
from app.ml.metrics.regression import mean_squared_error
from app.ml.training.gradient_descent import gradients
from app.ml.training.types import ClassificationDataset, RegressionDataset, RegressionMetrics, TrainingConfig, TrainingMetrics, TrainingRun, TrainingState


def train_linear_regression(dataset: RegressionDataset, configuration: TrainingConfig, *, run_id: str | None = None) -> TrainingRun:
    """Train one linear model and retain an immutable state for every epoch."""
    _validate_inputs(dataset, configuration)
    feature_count = dataset.features.shape[1]
    weights = np.array(configuration.initial_weights or (0.0,) * feature_count, dtype=np.float64)
    bias = float(configuration.initial_bias)
    history: list[TrainingState] = []
    initial_predictions = predict(dataset.features, weights, bias)
    initial_mse = mean_squared_error(initial_predictions, dataset.targets)
    history.append(
        TrainingState(
            0,
            tuple(float(value) for value in weights),
            bias,
            initial_mse,
            (),
            None,
            tuple(float(value) for value in initial_predictions),
            RegressionMetrics(initial_mse),
        )
    )
    for step in range(1, configuration.epochs + 1):
        errors = predict(dataset.features, weights, bias) - dataset.targets
        weight_gradients, bias_gradient = gradients(dataset.features, errors)
        weights = weights - configuration.learning_rate * weight_gradients
        bias -= configuration.learning_rate * bias_gradient
        predictions = predict(dataset.features, weights, bias)
        mse = mean_squared_error(predictions, dataset.targets)
        history.append(TrainingState(step, tuple(float(value) for value in weights), bias, mse, tuple(float(value) for value in weight_gradients), bias_gradient, tuple(float(value) for value in predictions), RegressionMetrics(mse)))
    return TrainingRun(run_id or str(uuid4()), "linear_regression.gradient_descent", dataset.name, configuration, configuration.epochs, tuple(history), tuple(state.step for state in history), {"feature_count": str(feature_count), "sample_count": str(dataset.features.shape[0])})


def train_logistic_regression(dataset: ClassificationDataset, configuration: TrainingConfig, *, run_id: str | None = None) -> TrainingRun:
    _validate_inputs(dataset, configuration)
    if not np.all(np.isfinite(dataset.targets)) or not np.all(np.isin(dataset.targets, (0.0, 1.0))):
        raise ValueError("classification targets must be finite binary labels")
    feature_count = dataset.features.shape[1]
    weights = np.array(configuration.initial_weights or (0.0,) * feature_count, dtype=np.float64)
    bias = float(configuration.initial_bias)
    history: list[TrainingState] = []
    for step in range(configuration.epochs + 1):
        probabilities = predict_proba(dataset.features, weights, bias)
        errors = probabilities - dataset.targets
        loss = binary_cross_entropy(probabilities, dataset.targets)
        accuracy = float(np.mean((probabilities >= 0.5) == dataset.targets))
        if step == 0:
            weight_gradients: tuple[float, ...] = ()
            bias_gradient = None
        else:
            weight_gradients = tuple(float(value) for value in previous_gradients)
            bias_gradient = previous_bias_gradient
        history.append(TrainingState(step, tuple(float(value) for value in weights), bias, loss, weight_gradients, bias_gradient, tuple(float(value) for value in probabilities), TrainingMetrics(binary_cross_entropy=loss, accuracy=accuracy)))
        if step == configuration.epochs:
            break
        previous_gradients = (dataset.features.T @ errors) / dataset.features.shape[0]
        previous_bias_gradient = float(np.mean(errors))
        weights = weights - configuration.learning_rate * previous_gradients
        bias -= configuration.learning_rate * previous_bias_gradient
    return TrainingRun(run_id or str(uuid4()), "logistic_regression.gradient_descent", dataset.name, configuration, configuration.epochs, tuple(history), tuple(state.step for state in history), {"feature_count": str(feature_count), "sample_count": str(dataset.features.shape[0])})


def _validate_inputs(dataset: RegressionDataset, configuration: TrainingConfig) -> None:
    if dataset.features.ndim != 2 or dataset.features.shape[0] == 0 or dataset.features.shape[1] == 0:
        raise ValueError("features must be a non-empty two-dimensional matrix")
    if dataset.targets.ndim != 1 or dataset.targets.shape[0] != dataset.features.shape[0]:
        raise ValueError("targets must be one-dimensional and match the sample count")
    if configuration.epochs <= 0:
        raise ValueError("epochs must be greater than zero")
    if configuration.learning_rate <= 0:
        raise ValueError("learning_rate must be greater than zero")
    if configuration.initial_weights is not None and len(configuration.initial_weights) != dataset.features.shape[1]:
        raise ValueError("initial_weights must match the number of features")
