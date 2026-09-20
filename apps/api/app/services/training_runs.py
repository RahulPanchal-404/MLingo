from dataclasses import dataclass

from app.ml.datasets.classification import make_logistic_regression_dataset
from app.ml.datasets.clustering import make_kmeans_dataset
from app.ml.datasets.synthetic import make_linear_regression_dataset
from app.ml.training.trainer import train_kmeans, train_linear_regression, train_logistic_regression, train_neural_network
from app.ml.training.types import ClassificationDataset, ClusteringDataset, RegressionDataset, TrainingConfig, TrainingRun
from app.schemas.training_runs import CreateTrainingRunRequest


@dataclass(frozen=True)
class GeneratedTrainingRun:
    run: TrainingRun
    dataset_points: tuple[dict[str, float | int], ...]


def create_training_run(request: CreateTrainingRunRequest) -> GeneratedTrainingRun:
    """Execute a configured training run without persistence."""
    dataset_config = request.dataset
    training_config = request.training
    if request.algorithm == "neural_network":
        samples = getattr(dataset_config, "samples", 64)
        noise = getattr(dataset_config, "noise", 0.1)
        seed = getattr(dataset_config, "seed", 0)
        synthetic = make_logistic_regression_dataset(samples=samples, noise=noise, seed=seed)
        dataset = ClassificationDataset(features=synthetic.features, targets=synthetic.targets, name="synthetic-neural-classification")
        configuration = TrainingConfig(
            learning_rate=training_config.learning_rate,
            epochs=training_config.epochs,
            hidden_neurons=training_config.hidden_neurons or 3,
            seed=training_config.seed,
        )
        run = train_neural_network(dataset, configuration)
        points = tuple({"x1": float(point[0]), "x2": float(point[1]), "label": int(label)} for point, label in zip(synthetic.features, synthetic.targets, strict=True))
    elif request.algorithm == "logistic_regression":
        synthetic = make_logistic_regression_dataset(samples=dataset_config.samples, noise=dataset_config.noise, seed=dataset_config.seed)
        dataset = ClassificationDataset(features=synthetic.features, targets=synthetic.targets, name="synthetic-logistic-classification")
        configuration = TrainingConfig(
            learning_rate=training_config.learning_rate,
            epochs=training_config.epochs,
            initial_weights=(training_config.initial_weight, training_config.initial_weight),
            initial_bias=training_config.initial_bias,
        )
        run = train_logistic_regression(dataset, configuration)
        points = tuple({"x1": float(point[0]), "x2": float(point[1]), "label": int(label)} for point, label in zip(synthetic.features, synthetic.targets, strict=True))
    elif request.algorithm == "kmeans":
        synthetic = make_kmeans_dataset(samples=dataset_config.samples, noise=dataset_config.noise, seed=dataset_config.seed)
        dataset = ClusteringDataset(points=synthetic.points, name=synthetic.name)
        configuration = TrainingConfig(
            learning_rate=training_config.learning_rate,
            epochs=training_config.epochs,
            clusters=training_config.clusters or 3,
            iterations=training_config.iterations or training_config.epochs or 1,
            seed=training_config.seed,
        )
        run = train_kmeans(dataset, configuration)
        points = tuple({"x": float(point[0]), "y": float(point[1])} for point in synthetic.points)
    else:
        synthetic = make_linear_regression_dataset(**dataset_config.model_dump())
        dataset = RegressionDataset(features=synthetic.features.reshape(-1, 1), targets=synthetic.targets, name="synthetic-linear-regression")
        configuration = TrainingConfig(
            learning_rate=training_config.learning_rate,
            epochs=training_config.epochs,
            initial_weights=(training_config.initial_weight,),
            initial_bias=training_config.initial_bias,
        )
        run = train_linear_regression(dataset, configuration)
        points = tuple({"feature": float(feature), "target": float(target)} for feature, target in zip(synthetic.features, synthetic.targets, strict=True))
    return GeneratedTrainingRun(run=run, dataset_points=points)
