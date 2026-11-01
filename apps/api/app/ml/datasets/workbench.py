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

# 4. Project 04: House Price Prediction (Regression)
HOUSE_PRICE_DATA: list[dict[str, Any]] = [
    {"square_feet": 1200, "bedrooms": 2, "bathrooms": 1.5, "house_age": 15, "location": "Suburban", "price": 235.0},
    {"square_feet": 1450, "bedrooms": 3, "bathrooms": 2.0, "house_age": 10, "location": "Suburban", "price": 280.0},
    {"square_feet": 1600, "bedrooms": 3, "bathrooms": 2.0, "house_age": 12, "location": "Urban", "price": 340.0},
    {"square_feet": 1750, "bedrooms": 3, "bathrooms": None, "house_age": 8, "location": "Suburban", "price": 310.0},
    {"square_feet": 1900, "bedrooms": 4, "bathrooms": 2.5, "house_age": 5, "location": "Suburban", "price": 375.0},
    {"square_feet": 2100, "bedrooms": 4, "bathrooms": 3.0, "house_age": 18, "location": "Urban", "price": 420.0},
    {"square_feet": 2300, "bedrooms": 4, "bathrooms": 3.0, "house_age": 4, "location": "Urban", "price": 495.0},
    {"square_feet": 2500, "bedrooms": 4, "bathrooms": 3.5, "house_age": 6, "location": "Suburban", "price": 460.0},
    {"square_feet": 2800, "bedrooms": 5, "bathrooms": 3.5, "house_age": 2, "location": "Urban", "price": 580.0},
    {"square_feet": 1100, "bedrooms": 2, "bathrooms": 1.0, "house_age": 25, "location": "Rural", "price": 180.0},
]

# 5. Project 05: Customer RFM Cohorts (Clustering)
CUSTOMER_RFM_DATA: list[dict[str, Any]] = [
    {"recency_days": 12, "frequency_orders": 28, "monetary_spend": 3450.0, "loyalty": "Gold"},
    {"recency_days": 15, "frequency_orders": 24, "monetary_spend": 3100.0, "loyalty": "Gold"},
    {"recency_days": 8, "frequency_orders": 35, "monetary_spend": 4200.0, "loyalty": "Gold"},
    {"recency_days": 45, "frequency_orders": 12, "monetary_spend": 1450.0, "loyalty": "Silver"},
    {"recency_days": 52, "frequency_orders": 10, "monetary_spend": 1200.0, "loyalty": "Silver"},
    {"recency_days": 140, "frequency_orders": 3, "monetary_spend": 280.0, "loyalty": "Bronze"},
    {"recency_days": 180, "frequency_orders": 2, "monetary_spend": 190.0, "loyalty": "Bronze"},
]

# 6. Project 06: Email Spam Filter (Classification)
EMAIL_SPAM_DATA: list[dict[str, Any]] = [
    {"char_count": 140, "urgency_words": 4, "has_link": 1, "susp_score": 85, "sender": "unverified", "is_spam": 1},
    {"char_count": 95, "urgency_words": 3, "has_link": 1, "susp_score": 92, "sender": "unverified", "is_spam": 1},
    {"char_count": 550, "urgency_words": 0, "has_link": 0, "susp_score": 12, "sender": "corporate", "is_spam": 0},
    {"char_count": 420, "urgency_words": 1, "has_link": 1, "susp_score": 18, "sender": "corporate", "is_spam": 0},
    {"char_count": 380, "urgency_words": 0, "has_link": 0, "susp_score": None, "sender": "corporate", "is_spam": 0},
    {"char_count": 160, "urgency_words": 4, "has_link": 1, "susp_score": 90, "sender": "unverified", "is_spam": 1},
]

# 7. Project 07: Digit Recognition (Classification)
DIGIT_RECOGNITION_DATA: list[dict[str, Any]] = [
    {"top_density": 0.15, "bottom_density": 0.85, "loops": 0, "vert_sym": 0.72, "horiz_sym": 0.40, "is_digit_zero": 0},
    {"top_density": 0.78, "bottom_density": 0.75, "loops": 1, "vert_sym": 0.85, "horiz_sym": 0.88, "is_digit_zero": 1},
    {"top_density": 0.82, "bottom_density": 0.80, "loops": 1, "vert_sym": 0.90, "horiz_sym": 0.84, "is_digit_zero": 1},
    {"top_density": 0.12, "bottom_density": 0.90, "loops": 0, "vert_sym": 0.68, "horiz_sym": 0.35, "is_digit_zero": 0},
]

# 8. Project 08: Movie Recommendations (Regression)
MOVIE_RATING_DATA: list[dict[str, Any]] = [
    {"action_affinity": 0.90, "scifi_affinity": 0.85, "drama_affinity": 0.30, "avg_rating_given": 4.2, "genre": "Sci-Fi", "rating": 4.8},
    {"action_affinity": 0.85, "scifi_affinity": 0.92, "drama_affinity": 0.25, "avg_rating_given": 4.0, "genre": "Sci-Fi", "rating": 4.6},
    {"action_affinity": 0.30, "scifi_affinity": 0.20, "drama_affinity": 0.95, "avg_rating_given": 3.8, "genre": "Drama", "rating": 4.5},
    {"action_affinity": 0.95, "scifi_affinity": 0.80, "drama_affinity": 0.20, "avg_rating_given": None, "genre": "Action", "rating": 4.7},
]

# 9. Project 09: Stock Price (Regression)
STOCK_PRICE_DATA: list[dict[str, Any]] = [
    {"day_seq": 1, "open_price": 150.0, "high_price": 152.5, "low_price": 149.0, "volume_k": 1200, "close_price": 151.8},
    {"day_seq": 2, "open_price": 152.0, "high_price": 154.0, "low_price": 151.0, "volume_k": 1350, "close_price": 153.2},
    {"day_seq": 3, "open_price": 153.5, "high_price": 156.0, "low_price": 152.8, "volume_k": 1400, "close_price": 155.5},
    {"day_seq": 4, "open_price": 155.0, "high_price": 157.2, "low_price": 154.0, "volume_k": 1250, "close_price": 156.0},
    {"day_seq": 5, "open_price": 156.5, "high_price": 158.0, "low_price": 155.0, "volume_k": 1100, "close_price": 157.8},
]

# 10. Project 10: Credit Fraud (Classification)
CREDIT_FRAUD_DATA: list[dict[str, Any]] = [
    {"amount": 18.5, "distance_miles": 2.1, "is_online": 0, "device_risk": 10, "card_type": "Chip", "is_fraud": 0},
    {"amount": 45.0, "distance_miles": 4.5, "is_online": 0, "device_risk": 15, "card_type": "Chip", "is_fraud": 0},
    {"amount": 1200.0, "distance_miles": 450.0, "is_online": 1, "device_risk": 92, "card_type": "Virtual", "is_fraud": 1},
    {"amount": 35.0, "distance_miles": 1.5, "is_online": 0, "device_risk": 8, "card_type": "Chip", "is_fraud": 0},
    {"amount": 1850.0, "distance_miles": 820.0, "is_online": 1, "device_risk": 98, "card_type": "Virtual", "is_fraud": 1},
]


def get_dataset(dataset_id: str) -> tuple[list[dict[str, Any]], str, str | None]:
    """Returns (rows, task_type, target_col)."""
    if dataset_id == "housing_regression":
        return HOUSING_EXPERIENCE_DATA, "regression", "salary"
    if dataset_id == "student_classification":
        return STUDENT_ADMISSION_DATA, "classification", "passed"
    if dataset_id == "customer_clustering":
        return CUSTOMER_CLUSTERING_DATA, "clustering", None
    if dataset_id == "house_price_prediction":
        return HOUSE_PRICE_DATA, "regression", "price"
    if dataset_id == "customer_rfm_clustering":
        return CUSTOMER_RFM_DATA, "clustering", None
    if dataset_id == "email_spam_detection":
        return EMAIL_SPAM_DATA, "classification", "is_spam"
    if dataset_id == "digit_recognition":
        return DIGIT_RECOGNITION_DATA, "classification", "is_digit_zero"
    if dataset_id == "movie_recommendations":
        return MOVIE_RATING_DATA, "regression", "rating"
    if dataset_id == "stock_price_prediction":
        return STOCK_PRICE_DATA, "regression", "close_price"
    if dataset_id == "credit_card_fraud":
        return CREDIT_FRAUD_DATA, "classification", "is_fraud"
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
    for fname in feature_names:
        vals = [r.get(fname) for r in rows]
        missing_count = sum(1 for v in vals if v is None)
        non_nulls = [v for v in vals if v is not None]
        unique_vals = set(non_nulls)
        is_num = all(isinstance(v, (int, float)) for v in non_nulls) if non_nulls else True
        dtype = "numeric" if is_num else "categorical"
        sample_vals = list(unique_vals)[:4]
        features.append(
            FeatureInfo(
                name=fname,
                dtype=dtype,
                missing_count=missing_count,
                unique_count=len(unique_vals),
                sample_values=sample_vals,
            )
        )

    target_info: TargetInfo | None = None
    if target_column and target_column in all_keys:
        t_vals = [r.get(target_column) for r in rows if r.get(target_column) is not None]
        unique_t = set(t_vals)
        if task_type == "classification":
            dist = {str(k): sum(1 for v in t_vals if v == k) for k in unique_t}
            target_info = TargetInfo(name=target_column, task_type=task_type, unique_count=len(unique_t), class_distribution=dist)
        elif task_type == "regression" and t_vals:
            nums = [float(v) for v in t_vals if isinstance(v, (int, float))]
            target_info = TargetInfo(
                name=target_column,
                task_type=task_type,
                unique_count=len(unique_t),
                min_value=min(nums) if nums else None,
                max_value=max(nums) if nums else None,
                mean_value=round(sum(nums) / len(nums), 3) if nums else None,
            )

    return DatasetSummary(
        id=dataset_id,
        name=name,
        task_type=task_type,
        description=description,
        row_count=row_count,
        feature_count=len(features),
        features=features,
        target=target_info,
    )


def compute_data_quality_report(
    rows: list[dict[str, Any]],
    target_column: str | None = None,
) -> DataQualityReport:
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
