"""Tests for evaluation metrics: regression, classification, confusion matrix, threshold changes, and generalization."""

import numpy as np
import pytest
from app.ml.metrics.classification import (
    compute_classification_metrics,
    compute_confusion_matrix,
    compute_roc_curve_and_auc,
)
from app.ml.metrics.evaluation import evaluate_generalization_gap
from app.ml.metrics.regression import mean_absolute_error, mean_squared_error, r2_score


def test_regression_metrics() -> None:
    preds = np.array([2.5, 0.0, 2.0, 8.0])
    targets = np.array([3.0, -0.5, 2.0, 7.0])

    # errors: [-0.5, 0.5, 0.0, 1.0]
    # sq errors: [0.25, 0.25, 0.0, 1.0] -> sum = 1.5 -> mean = 0.375
    # abs errors: [0.5, 0.5, 0.0, 1.0] -> sum = 2.0 -> mean = 0.5
    assert mean_squared_error(preds, targets) == pytest.approx(0.375)
    assert mean_absolute_error(preds, targets) == pytest.approx(0.5)

    # Perfect prediction R2 = 1.0
    assert r2_score(targets, targets) == pytest.approx(1.0)
    # R2 for our predictions
    r2 = r2_score(preds, targets)
    assert 0.0 < r2 < 1.0


def test_confusion_matrix_and_threshold_change() -> None:
    # 4 samples: 2 positive (1), 2 negative (0)
    probs = np.array([0.9, 0.7, 0.4, 0.2])
    targets = np.array([1.0, 1.0, 0.0, 0.0])

    # At threshold 0.5:
    # preds: [1, 1, 0, 0] -> TP=2, TN=2, FP=0, FN=0
    cm_05 = compute_confusion_matrix(probs, targets, threshold=0.5)
    assert cm_05.tp == 2
    assert cm_05.tn == 2
    assert cm_05.fp == 0
    assert cm_05.fn == 0

    m_05 = compute_classification_metrics(cm_05)
    assert m_05.accuracy == 1.0
    assert m_05.precision == 1.0
    assert m_05.recall == 1.0
    assert m_05.f1 == 1.0

    # At threshold 0.8:
    # preds: [1, 0, 0, 0] -> sample 2 (prob 0.7) becomes 0!
    # TP=1, TN=2, FP=0, FN=1
    cm_08 = compute_confusion_matrix(probs, targets, threshold=0.8)
    assert cm_08.tp == 1
    assert cm_08.fn == 1

    m_08 = compute_classification_metrics(cm_08)
    assert m_08.recall == 0.5  # recall drops
    assert m_08.precision == 1.0


def test_confusion_matrix_safe_zero_division() -> None:
    probs = np.array([0.2, 0.3])
    targets = np.array([0.0, 0.0])  # No positives

    cm = compute_confusion_matrix(probs, targets, threshold=0.5)
    # TP=0, FP=0 -> precision denominator is 0
    metrics = compute_classification_metrics(cm)
    assert metrics.precision == 0.0
    assert metrics.recall == 0.0
    assert metrics.f1 == 0.0


def test_roc_curve_and_auc() -> None:
    probs = np.array([0.9, 0.8, 0.4, 0.1])
    targets = np.array([1.0, 1.0, 0.0, 0.0])

    fpr, tpr, auc = compute_roc_curve_and_auc(probs, targets)
    assert len(fpr) > 0
    assert len(tpr) > 0
    # Perfect ranking should have AUC close to 1.0
    assert auc == pytest.approx(1.0, abs=0.05)


def test_evaluate_generalization_gap() -> None:
    # Regression: MSE train=0.1, test=0.4
    comp = evaluate_generalization_gap("MSE", 0.1, 0.4, higher_is_better=False)
    assert comp.difference == 0.3
    assert "generalization gap" in comp.generalization_gap_description

    # Classification: Accuracy train=0.95, test=0.70
    comp_acc = evaluate_generalization_gap("Accuracy", 0.95, 0.70, higher_is_better=True)
    assert "generalization gap" in comp_acc.generalization_gap_description
