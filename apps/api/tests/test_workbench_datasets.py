"""Tests for educational datasets, summary, and data quality inspection."""

import pytest
from app.ml.datasets.workbench import (
    analyze_data_quality,
    get_dataset,
    summarize_dataset,
)


def test_get_datasets() -> None:
    housing_data, task_reg, target_reg = get_dataset("housing_regression")
    assert len(housing_data) == 20
    assert task_reg == "regression"
    assert target_reg == "salary"

    student_data, task_clf, target_clf = get_dataset("student_classification")
    assert len(student_data) == 20
    assert task_clf == "classification"
    assert target_clf == "passed"

    customer_data, task_clust, target_clust = get_dataset("customer_clustering")
    assert len(customer_data) == 12
    assert task_clust == "clustering"
    assert target_clust is None

    with pytest.raises(ValueError, match="Unknown dataset_id"):
        get_dataset("non_existent")


def test_summarize_dataset_regression() -> None:
    data, task_type, target_col = get_dataset("housing_regression")
    summary = summarize_dataset("housing", "Housing", "desc", data, task_type, target_col)

    assert summary.row_count == 20
    assert summary.feature_count == 3
    assert summary.target is not None
    assert summary.target.name == "salary"
    assert summary.target.task_type == "regression"
    assert summary.target.min_value == 45.0
    assert summary.target.max_value == 155.0

    # Verify features and missing count
    features_by_name = {f.name: f for f in summary.features}
    assert features_by_name["experience"].dtype == "numeric"
    assert features_by_name["experience"].missing_count == 0

    assert features_by_name["education"].dtype == "categorical"
    assert features_by_name["education"].missing_count == 0

    assert features_by_name["projects"].dtype == "numeric"
    assert features_by_name["projects"].missing_count == 1


def test_summarize_dataset_classification() -> None:
    data, task_type, target_col = get_dataset("student_classification")
    summary = summarize_dataset("student", "Student", "desc", data, task_type, target_col)

    assert summary.row_count == 20
    assert summary.feature_count == 3
    assert summary.target is not None
    assert summary.target.task_type == "classification"
    assert summary.target.class_distribution == {"0": 8, "1": 12}

    features_by_name = {f.name: f for f in summary.features}
    assert features_by_name["study_hours"].missing_count == 1
    assert features_by_name["tutoring"].dtype == "categorical"


def test_analyze_data_quality() -> None:
    data, _, target_col = get_dataset("student_classification")
    quality = analyze_data_quality(data, target_col)

    assert quality.total_missing_values == 1
    assert "study_hours" in quality.columns_with_missing
    assert quality.duplicate_rows_count == 0
    assert len(quality.constant_columns) == 0
    assert "study_hours" in quality.numeric_columns
    assert "tutoring" in quality.categorical_columns
    assert quality.class_balance is not None
    assert "0" in quality.class_balance and "1" in quality.class_balance
    assert quality.class_balance["0"] + quality.class_balance["1"] == pytest.approx(1.0, abs=0.01)


def test_analyze_data_quality_with_duplicates_and_constants() -> None:
    data = [
        {"a": 1, "b": "const", "target": 0},
        {"a": 1, "b": "const", "target": 0},  # duplicate
        {"a": 2, "b": "const", "target": 1},
    ]
    quality = analyze_data_quality(data, "target")
    assert quality.duplicate_rows_count == 1
    assert "b" in quality.constant_columns
