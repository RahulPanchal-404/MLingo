from dataclasses import dataclass

from app.ml.datasets.synthetic import make_linear_regression_dataset
from app.ml.training.trainer import train_linear_regression
from app.ml.training.types import RegressionDataset, TrainingConfig, TrainingRun
from app.schemas.training_runs import CreateTrainingRunRequest


@dataclass(frozen=True)
class GeneratedTrainingRun:
    run: TrainingRun
    dataset_points: tuple[tuple[float, float], ...]


def create_training_run(request: CreateTrainingRunRequest) -> GeneratedTrainingRun:
    """Execute a configured linear-regression training run without persistence."""
    dataset_config = request.dataset
    training_config = request.training
    synthetic = make_linear_regression_dataset(**dataset_config.model_dump())
    dataset = RegressionDataset(
        features=synthetic.features.reshape(-1, 1),
        targets=synthetic.targets,
        name="synthetic-linear-regression",
    )
    configuration = TrainingConfig(
        learning_rate=training_config.learning_rate,
        epochs=training_config.epochs,
        initial_weights=(training_config.initial_weight,),
        initial_bias=training_config.initial_bias,
    )
    run = train_linear_regression(dataset, configuration)
    points = tuple((float(feature), float(target)) for feature, target in zip(synthetic.features, synthetic.targets, strict=True))
    return GeneratedTrainingRun(run=run, dataset_points=points)
