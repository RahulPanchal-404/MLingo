from uuid import uuid4

import numpy as np

from app.ml.algorithms.kmeans import assign_clusters, inertia, initialize_centroids, update_centroids
from app.ml.algorithms.linear_regression import predict
from app.ml.algorithms.logistic_regression import binary_cross_entropy, predict_proba
from app.ml.algorithms.neural_network import (
    backward as nn_backward,
    binary_cross_entropy as nn_bce,
    forward as nn_forward,
    initialize_network,
)
from app.ml.metrics.regression import mean_squared_error
from app.ml.training.gradient_descent import gradients
from app.ml.training.types import ClusteringDataset, ClusteringMetrics, ClassificationDataset, RegressionDataset, RegressionMetrics, TrainingConfig, TrainingMetrics, TrainingRun, TrainingState


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


def train_neural_network(dataset: ClassificationDataset, configuration: TrainingConfig, *, run_id: str | None = None) -> TrainingRun:
    """Train a 2-layer neural network with backpropagation and retain an immutable snapshot for every epoch."""
    _validate_inputs(dataset, configuration)
    if not np.all(np.isfinite(dataset.targets)) or not np.all(np.isin(dataset.targets, (0.0, 1.0))):
        raise ValueError("classification targets must be finite binary labels")
    
    feature_count = dataset.features.shape[1]
    hidden_count = max(2, min(4, configuration.hidden_neurons or 3))
    
    w1, b1, w2, b2 = initialize_network(input_dim=feature_count, hidden_dim=hidden_count, seed=configuration.seed)
    
    history: list[TrainingState] = []
    previous_dw1: np.ndarray | None = None
    previous_db1: np.ndarray | None = None
    previous_dw2: np.ndarray | None = None
    previous_db2: float | None = None

    for step in range(configuration.epochs + 1):
        z1, a1, z2, a2 = nn_forward(dataset.features, w1, b1, w2, b2)
        probabilities = a2.flatten()
        loss = nn_bce(probabilities, dataset.targets)
        accuracy = float(np.mean((probabilities >= 0.5) == dataset.targets))
        
        history.append(
            TrainingState(
                step=step,
                weights=tuple(float(v) for v in w1.flatten()),
                bias=float(b2),
                loss=loss,
                gradients=tuple(float(v) for v in previous_dw1.flatten()) if previous_dw1 is not None else (),
                bias_gradient=previous_db2,
                predictions=tuple(float(p) for p in probabilities),
                metrics=TrainingMetrics(binary_cross_entropy=loss, accuracy=accuracy),
                w1=tuple(tuple(float(v) for v in row) for row in w1),
                b1=tuple(float(v) for v in b1),
                w2=tuple(tuple(float(v) for v in row) for row in w2),
                b2=float(b2),
                dw1=tuple(tuple(float(v) for v in row) for row in previous_dw1) if previous_dw1 is not None else None,
                db1=tuple(float(v) for v in previous_db1) if previous_db1 is not None else None,
                dw2=tuple(tuple(float(v) for v in row) for row in previous_dw2) if previous_dw2 is not None else None,
                db2=previous_db2,
                hidden_activations=tuple(tuple(float(v) for v in row) for row in a1[:8]),
            )
        )
        
        if step == configuration.epochs:
            break
            
        dw1, db1, dw2, db2 = nn_backward(dataset.features, dataset.targets, z1, a1, z2, a2, w2)
        previous_dw1 = dw1
        previous_db1 = db1
        previous_dw2 = dw2
        previous_db2 = db2
        
        w1 -= configuration.learning_rate * dw1
        b1 -= configuration.learning_rate * db1
        w2 -= configuration.learning_rate * dw2
        b2 -= configuration.learning_rate * db2

    return TrainingRun(
        run_id or str(uuid4()),
        "neural_network",
        dataset.name,
        configuration,
        configuration.epochs,
        tuple(history),
        tuple(state.step for state in history),
        {
            "feature_count": str(feature_count),
            "hidden_neurons": str(hidden_count),
            "sample_count": str(dataset.features.shape[0]),
        },
    )


def train_kmeans(dataset: ClusteringDataset, configuration: TrainingConfig, *, run_id: str | None = None) -> TrainingRun:
    cluster_count = configuration.clusters or 3
    iteration_count = configuration.iterations or configuration.epochs or 1
    _validate_kmeans_inputs(dataset, configuration, cluster_count=cluster_count, iteration_count=iteration_count)
    points = np.asarray(dataset.points, dtype=np.float64)
    centroids = initialize_centroids(points, clusters=cluster_count, seed=configuration.seed)
    history: list[TrainingState] = []
    initial_assignments = assign_clusters(points, centroids)
    initial_inertia = inertia(points, centroids, initial_assignments)
    history.append(
        TrainingState(
            0,
            (),
            0.0,
            float(initial_inertia),
            (),
            None,
            (),
            ClusteringMetrics(float(initial_inertia)),
            tuple(tuple(float(value) for value in row) for row in centroids),
            tuple(int(index) for index in initial_assignments),
            float(initial_inertia),
            None,
        )
    )
    for step in range(1, iteration_count + 1):
        previous_centroids = centroids.copy()
        centroids = update_centroids(points, initial_assignments, centroids)
        next_assignments = assign_clusters(points, centroids)
        current_inertia = inertia(points, centroids, next_assignments)
        centroid_movement = tuple(float(value) for value in np.linalg.norm(centroids - previous_centroids, axis=1))
        history.append(
            TrainingState(
                step,
                (),
                0.0,
                float(current_inertia),
                (),
                None,
                (),
                ClusteringMetrics(float(current_inertia)),
                tuple(tuple(float(value) for value in row) for row in centroids),
                tuple(int(index) for index in next_assignments),
                float(current_inertia),
                centroid_movement,
            )
        )
        initial_assignments = next_assignments
    return TrainingRun(run_id or str(uuid4()), "kmeans", dataset.name, configuration, iteration_count, tuple(history), tuple(state.step for state in history), {"cluster_count": str(cluster_count), "sample_count": str(points.shape[0])})


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


def _validate_kmeans_inputs(dataset: ClusteringDataset, configuration: TrainingConfig, *, cluster_count: int | None = None, iteration_count: int | None = None) -> None:
    if dataset.points.ndim != 2 or dataset.points.shape[0] == 0 or dataset.points.shape[1] == 0:
        raise ValueError("points must be a non-empty two-dimensional matrix")
    if cluster_count is None or cluster_count <= 0:
        raise ValueError("clusters must be greater than zero")
    if iteration_count is None or iteration_count <= 0:
        raise ValueError("iterations must be greater than zero")
    if cluster_count > dataset.points.shape[0]:
        raise ValueError("clusters cannot exceed the number of points")
