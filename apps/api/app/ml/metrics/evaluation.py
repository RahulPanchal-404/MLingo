"""Model evaluation comparison: train vs test metrics and generalization gap."""

from dataclasses import dataclass


@dataclass(frozen=True)
class MetricComparison:
    name: str
    train_value: float
    test_value: float
    difference: float  # test_value - train_value
    generalization_gap_description: str


def evaluate_generalization_gap(
    metric_name: str,
    train_value: float,
    test_value: float,
    higher_is_better: bool = False,
) -> MetricComparison:
    """Analyze the gap between training performance and test generalization.

    Uses neutral, evidence-based descriptions.
    """
    diff = round(test_value - train_value, 4)

    if higher_is_better:
        # e.g., Accuracy, R2
        drop = train_value - test_value
        if drop > 0.15:
            desc = f"Training {metric_name} ({train_value}) exceeds test {metric_name} ({test_value}) by {round(drop, 4)}, which may indicate a generalization gap."
        elif drop > 0.05:
            desc = f"Moderate difference of {round(drop, 4)} between training and test {metric_name}."
        elif abs(drop) <= 0.05:
            desc = f"Training and test {metric_name} are closely aligned (difference of {round(abs(drop), 4)})."
        else:
            desc = f"Test {metric_name} ({test_value}) is comparable to or higher than training {metric_name} ({train_value})."
    else:
        # e.g., MSE, MAE
        increase = test_value - train_value
        if increase > 0.2:
            desc = f"Test {metric_name} ({test_value}) is higher than training {metric_name} ({train_value}) by {round(increase, 4)}, which may indicate a generalization gap."
        elif increase > 0.05:
            desc = f"Test {metric_name} exceeds training {metric_name} by {round(increase, 4)}."
        elif abs(increase) <= 0.05:
            desc = f"Training and test {metric_name} are closely aligned (difference of {round(abs(increase), 4)})."
        else:
            desc = f"Test {metric_name} ({test_value}) is lower than training {metric_name} ({train_value})."

    return MetricComparison(
        name=metric_name,
        train_value=train_value,
        test_value=test_value,
        difference=diff,
        generalization_gap_description=desc,
    )
