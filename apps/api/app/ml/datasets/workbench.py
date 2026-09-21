"""Deterministic educational datasets and dataset inspection for MLingo Data Workbench."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class FeatureInfo:
    name: str
    dtype: str  # "numeric" | "categorical"
    missing_count: int
    unique_count: int
    sample_values: list[Any]


@dataclass(frozen=True)
class TargetInfo:
    name: str
    task_type: str  # "regression" | "classification" | "clustering"
    unique_count: int
    class_distribution: dict[str, int] | None = None
    min_value: float | None = None
    max_value: float | None = None
    mean_value: float | None = None


@dataclass(frozen=True)
class DatasetSummary:
    id: str
    name: str
    task_type: str  # "regression" | "classification" | "clustering"
    description: str
    row_count: int
    feature_count: int
    features: list[FeatureInfo]
    target: TargetInfo | None


@dataclass(frozen=True)
class DataQualityReport:
    total_missing_values: int
    columns_with_missing: list[str]
    duplicate_rows_count: int
    constant_columns: list[str]
    numeric_columns: list[str]
    categorical_columns: list[str]
    class_balance: dict[str, float] | None = None


# Deterministic educational datasets with intentional, controlled characteristics:
# 1. Regression: Experience & Education -> Salary (Projects completed has 1 intentional missing value None)
HOUSING_EXPERIENCE_DATA: list[dict[str, Any]] = [
    {"experience": 1.0, "education": "BSc", "projects": 2, "salary": 45.0},
    {"experience": 1.5, "education": "BSc", "projects": 3, "salary": 48.0},
    {"experience": 2.0, "education": "MSc", "projects": 4, "salary": 56.0},
    {"experience": 2.5, "education": "BSc", "projects": None, "salary": 53.0},  # missing projects
    {"experience": 3.0, "education": "MSc", "projects": 5, "salary": 64.0},
    {"experience": 3.5, "education": "PhD", "projects": 6, "salary": 75.0},
    {"experience": 4.0, "education": "BSc", "projects": 5, "salary": 68.0},
    {"experience": 4.5, "education": "MSc", "projects": 7, "salary": 79.0},
    {"experience": 5.0, "education": "PhD", "projects": 8, "salary": 92.0},
    {"experience": 5.5, "education": "BSc", "projects": 6, "salary": 81.0},
    {"experience": 6.0, "education": "MSc", "projects": 9, "salary": 95.0},
    {"experience": 6.5, "education": "PhD", "projects": 10, "salary": 108.0},
    {"experience": 7.0, "education": "BSc", "projects": 8, "salary": 98.0},
    {"experience": 7.5, "education": "MSc", "projects": 11, "salary": 112.0},
    {"experience": 8.0, "education": "PhD", "projects": 12, "salary": 126.0},
    {"experience": 8.5, "education": "MSc", "projects": 12, "salary": 122.0},
    {"experience": 9.0, "education": "PhD", "projects": 14, "salary": 138.0},
    {"experience": 9.5, "education": "PhD", "projects": 15, "salary": 145.0},
    {"experience": 10.0, "education": "MSc", "projects": 14, "salary": 140.0},
    {"experience": 10.5, "education": "PhD", "projects": 16, "salary": 155.0},
]

# 2. Binary Classification: StudyHours & Attendance -> Passed (StudyHours has 1 intentional missing value None)
STUDENT_ADMISSION_DATA: list[dict[str, Any]] = [
    {"study_hours": 1.5, "attendance": 65.0, "tutoring": "No", "passed": 0},
    {"study_hours": 2.0, "attendance": 70.0, "tutoring": "No", "passed": 0},
    {"study_hours": 2.2, "attendance": 60.0, "tutoring": "No", "passed": 0},
    {"study_hours": 2.8, "attendance": 75.0, "tutoring": "Yes", "passed": 0},
    {"study_hours": None, "attendance": 68.0, "tutoring": "No", "passed": 0},  # missing study_hours
    {"study_hours": 3.2, "attendance": 80.0, "tutoring": "No", "passed": 0},
    {"study_hours": 3.5, "attendance": 72.0, "tutoring": "Yes", "passed": 0},
    {"study_hours": 3.8, "attendance": 85.0, "tutoring": "No", "passed": 1},
    {"study_hours": 4.0, "attendance": 78.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 4.5, "attendance": 82.0, "tutoring": "No", "passed": 1},
    {"study_hours": 5.0, "attendance": 90.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 5.2, "attendance": 76.0, "tutoring": "No", "passed": 0},
    {"study_hours": 5.8, "attendance": 88.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 6.0, "attendance": 92.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 6.5, "attendance": 85.0, "tutoring": "No", "passed": 1},
    {"study_hours": 7.0, "attendance": 95.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 7.5, "attendance": 91.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 8.0, "attendance": 96.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 8.5, "attendance": 94.0, "tutoring": "Yes", "passed": 1},
    {"study_hours": 9.0, "attendance": 98.0, "tutoring": "Yes", "passed": 1},
]

# 3. Clustering: Customer Segments (income, spending, membership, no target)
CUSTOMER_CLUSTERING_DATA: list[dict[str, Any]] = [
    {"income": 25.0, "spending": 78.0, "membership": "Standard"},
    {"income": 28.0, "spending": 82.0, "membership": "Standard"},
    {"income": 32.0, "spending": 75.0, "membership": "Standard"},
    {"income": 35.0, "spending": 85.0, "membership": "Standard"},
    {"income": 65.0, "spending": 45.0, "membership": "Premium"},
    {"income": 70.0, "spending": 48.0, "membership": "Premium"},
    {"income": 72.0, "spending": 52.0, "membership": "Premium"},
    {"income": 75.0, "spending": 40.0, "membership": "Premium"},
    {"income": 105.0, "spending": 18.0, "membership": "VIP"},
    {"income": 110.0, "spending": 22.0, "membership": "VIP"},
    {"income": 115.0, "spending": 15.0, "membership": "VIP"},
    {"income": 120.0, "spending": 25.0, "membership": "VIP"},
]


def get_dataset(dataset_id: str) -> tuple[list[dict[str, Any]], str, str | None]:
    """Returns (rows, task_type, target_col)."""
    if dataset_id == "housing_regression":
        return HOUSING_EXPERIENCE_DATA, "regression", "salary"
    if dataset_id == "student_classification":
        return STUDENT_ADMISSION_DATA, "classification", "passed"
    if dataset_id == "customer_clustering":
        return CUSTOMER_CLUSTERING_DATA, "clustering", None
    raise ValueError(f"Unknown dataset_id: {dataset_id}")


def summarize_dataset(
    dataset_id: str,
    name: str,
    description: str,
    rows: list[dict[str, Any]],
    task_type: str,
    target_column: str | None = None,
) -> DatasetSummary:
    if not rows:
        raise ValueError("Dataset cannot be empty")

    row_count = len(rows)
    all_keys = list(rows[0].keys())
    feature_names = [k for k in all_keys if k != target_column]

    features: list[FeatureInfo] = []
    for col in feature_names:
        values = [r.get(col) for r in rows]
        non_null_values = [v for v in values if v is not None]
        missing_count = sum(1 for v in values if v is None)
        unique_count = len(set(non_null_values))

        # Infer dtype
        is_num = all(isinstance(v, (int, float)) for v in non_null_values) if non_null_values else True
        dtype = "numeric" if is_num else "categorical"

        sample_vals = non_null_values[:3]
        features.append(
            FeatureInfo(
                name=col,
                dtype=dtype,
                missing_count=missing_count,
                unique_count=unique_count,
                sample_values=sample_vals,
            )
        )

    target_info: TargetInfo | None = None
    if target_column:
        target_vals = [r.get(target_column) for r in rows if r.get(target_column) is not None]
        unique_targets = sorted(list(set(target_vals)))
        if task_type == "classification":
            dist = {str(k): sum(1 for v in target_vals if v == k) for k in unique_targets}
            target_info = TargetInfo(
                name=target_column,
                task_type=task_type,
                unique_count=len(unique_targets),
                class_distribution=dist,
            )
        else:
            num_targets = [float(v) for v in target_vals]
            target_info = TargetInfo(
                name=target_column,
                task_type=task_type,
                unique_count=len(unique_targets),
                min_value=min(num_targets) if num_targets else None,
                max_value=max(num_targets) if num_targets else None,
                mean_value=sum(num_targets) / len(num_targets) if num_targets else None,
            )

    return DatasetSummary(
        id=dataset_id,
        name=name,
        task_type=task_type,
        description=description,
        row_count=row_count,
        feature_count=len(feature_names),
        features=features,
        target=target_info,
    )


def analyze_data_quality(rows: list[dict[str, Any]], target_column: str | None = None) -> DataQualityReport:
    """Analyze missing values, duplicate rows, constant columns, and class balance."""
    if not rows:
        raise ValueError("Cannot analyze empty rows")

    row_count = len(rows)
    all_keys = list(rows[0].keys())

    total_missing = 0
    cols_with_missing: list[str] = []
    constant_cols: list[str] = []
    num_cols: list[str] = []
    cat_cols: list[str] = []

    for col in all_keys:
        vals = [r.get(col) for r in rows]
        missing_count = sum(1 for v in vals if v is None)
        total_missing += missing_count
        if missing_count > 0:
            cols_with_missing.append(col)

        non_nulls = [v for v in vals if v is not None]
        unique_vals = set(non_nulls)
        if len(unique_vals) <= 1 and row_count > 1:
            constant_cols.append(col)

        is_num = all(isinstance(v, (int, float)) for v in non_nulls) if non_nulls else True
        if is_num:
            num_cols.append(col)
        else:
            cat_cols.append(col)

    # Detect duplicate rows
    seen: set[tuple] = set()
    dup_count = 0
    for r in rows:
        tup = tuple(sorted((k, str(v)) for k, v in r.items()))
        if tup in seen:
            dup_count += 1
        else:
            seen.add(tup)

    # Class balance if classification
    class_balance: dict[str, float] | None = None
    if target_column and target_column in all_keys:
        t_vals = [r.get(target_column) for r in rows if r.get(target_column) is not None]
        unique_t = set(t_vals)
        if len(unique_t) == 2:  # Binary classification
            total_t = len(t_vals)
            class_balance = {str(k): round(sum(1 for v in t_vals if v == k) / total_t, 3) for k in sorted(list(unique_t))}

    return DataQualityReport(
        total_missing_values=total_missing,
        columns_with_missing=cols_with_missing,
        duplicate_rows_count=dup_count,
        constant_columns=constant_cols,
        numeric_columns=num_cols,
        categorical_columns=cat_cols,
        class_balance=class_balance,
    )
