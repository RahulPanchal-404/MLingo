from dataclasses import dataclass

from app.ml.datasets.synthetic import make_linear_regression_dataset
from app.ml.datasets.classification import make_logistic_regression_dataset
from app.ml.training.trainer import train_linear_regression, train_logistic_regression
from app.ml.training.types import ClassificationDataset, RegressionDataset, TrainingConfig, TrainingRun
from app.schemas.training_runs import CreateTrainingRunRequest


@dataclass(frozen=True)
class GeneratedTrainingRun:
    run: TrainingRun
    dataset_points: tuple[dict[str, float | int], ...]


def create_training_run(request: CreateTrainingRunRequest) -> GeneratedTrainingRun:
    """Execute a configured linear-regression training run without persistence."""
    dataset_config = request.dataset
    training_config = request.training
    if request.algorithm == "logistic_regression":
        synthetic = make_logistic_regression_dataset(samples=dataset_config.samples, noise=dataset_config.noise, seed=dataset_config.seed)
        dataset = ClassificationDataset(features=synthetic.features, targets=synthetic.targets, name="synthetic-logistic-classification")
    else:
        synthetic = make_linear_regression_dataset(**dataset_config.model_dump())
        dataset = RegressionDataset(features=synthetic.features.reshape(-1, 1), targets=synthetic.targets, name="synthetic-linear-regression")
    configuration = TrainingConfig(
        learning_rate=training_config.learning_rate,
        epochs=training_config.epochs,
        initial_weights=(training_config.initial_weight, training_config.initial_weight) if request.algorithm == "logistic_regression" else (training_config.initial_weight,),
        initial_bias=training_config.initial_bias,
    )
    run = train_logistic_regression(dataset, configuration) if request.algorithm == "logistic_regression" else train_linear_regression(dataset, configuration)
    if request.algorithm == "logistic_regression":
        points = tuple({"x1": float(point[0]), "x2": float(point[1]), "label": int(label)} for point, label in zip(synthetic.features, synthetic.targets, strict=True))
    else:
        points = tuple({"feature": float(feature), "target": float(target)} for feature, target in zip(synthetic.features, synthetic.targets, strict=True))
    return GeneratedTrainingRun(run=run, dataset_points=points)
