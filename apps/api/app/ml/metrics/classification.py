"""Binary classification metrics: Confusion Matrix, Accuracy, Precision, Recall, F1, and ROC/AUC."""

from dataclasses import dataclass
import numpy as np
from numpy.typing import NDArray


@dataclass(frozen=True)
class ConfusionMatrix:
    tn: int
    fp: int
    fn: int
    tp: int
    threshold: float


@dataclass(frozen=True)
class ClassificationMetrics:
    accuracy: float
    precision: float
    recall: float
    f1: float
    threshold: float
    confusion_matrix: ConfusionMatrix


def compute_confusion_matrix(
    probabilities: NDArray[np.float64],
    targets: NDArray[np.float64],
    threshold: float = 0.5,
) -> ConfusionMatrix:
    """Compute 2x2 confusion matrix counts at a given decision threshold.

    Predicted 1 if probability >= threshold else 0.
    """
    if probabilities.shape != targets.shape:
        raise ValueError("probabilities and targets must have matching shapes")
    if probabilities.size == 0:
        raise ValueError("Cannot compute confusion matrix on empty inputs")
    if not (0.0 <= threshold <= 1.0):
        raise ValueError("threshold must be between 0.0 and 1.0")

    preds = (probabilities >= threshold).astype(int)
    targs = targets.astype(int)

    tp = int(np.sum((preds == 1) & (targs == 1)))
    tn = int(np.sum((preds == 0) & (targs == 0)))
    fp = int(np.sum((preds == 1) & (targs == 0)))
    fn = int(np.sum((preds == 0) & (targs == 1)))

    return ConfusionMatrix(tn=tn, fp=fp, fn=fn, tp=tp, threshold=threshold)


def compute_classification_metrics(
    cm: ConfusionMatrix,
) -> ClassificationMetrics:
    """Compute accuracy, precision, recall, and F1 safely handling zero denominators."""
    total = cm.tp + cm.tn + cm.fp + cm.fn
    accuracy = (cm.tp + cm.tn) / total if total > 0 else 0.0

    precision_denom = cm.tp + cm.fp
    precision = cm.tp / precision_denom if precision_denom > 0 else 0.0

    recall_denom = cm.tp + cm.fn
    recall = cm.tp / recall_denom if recall_denom > 0 else 0.0

    f1_denom = precision + recall
    f1 = (2.0 * precision * recall) / f1_denom if f1_denom > 0 else 0.0

    return ClassificationMetrics(
        accuracy=round(accuracy, 4),
        precision=round(precision, 4),
        recall=round(recall, 4),
        f1=round(f1, 4),
        threshold=cm.threshold,
        confusion_matrix=cm,
    )


def compute_roc_curve_and_auc(
    probabilities: NDArray[np.float64],
    targets: NDArray[np.float64],
    num_thresholds: int = 50,
) -> tuple[list[float], list[float], float]:
    """Compute True Positive Rates (TPR) and False Positive Rates (FPR) across thresholds, and trapezoidal AUC."""
    if probabilities.shape != targets.shape:
        raise ValueError("probabilities and targets must have matching shapes")
    if probabilities.size == 0:
        raise ValueError("Cannot compute ROC on empty inputs")

    targs = targets.astype(int)
    positives = int(np.sum(targs == 1))
    negatives = int(np.sum(targs == 0))

    if positives == 0 or negatives == 0:
        # Edge case: all one class
        return [0.0, 1.0], [0.0, 1.0], 0.5

    thresholds = np.linspace(1.0, 0.0, num_thresholds)
    fpr_list: list[float] = []
    tpr_list: list[float] = []

    for th in thresholds:
        cm = compute_confusion_matrix(probabilities, targets, threshold=float(th))
        tpr = cm.tp / positives if positives > 0 else 0.0
        fpr = cm.fp / negatives if negatives > 0 else 0.0
        fpr_list.append(round(fpr, 4))
        tpr_list.append(round(tpr, 4))

    # Compute AUC using trapezoidal rule: trapezoid = (x[i] - x[i-1]) * (y[i] + y[i-1]) / 2
    auc = 0.0
    for i in range(1, len(fpr_list)):
        dx = fpr_list[i] - fpr_list[i - 1]
        avg_y = (tpr_list[i] + tpr_list[i - 1]) / 2.0
        auc += dx * avg_y

    auc = max(0.0, min(1.0, round(float(auc), 4)))
    return fpr_list, tpr_list, auc
