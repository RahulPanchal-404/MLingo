"""Missing value imputation with train-fit and test-transform isolation."""

from collections import Counter
from typing import Any


class MeanImputer:
    """Impute missing numeric values using the mean of the training data.

    x_missing = mean(observed training values)
    """

    def __init__(self) -> None:
        self.means_: dict[str, float] = {}

    def fit(self, rows: list[dict[str, Any]], columns: list[str]) -> "MeanImputer":
        self.means_ = {}
        for col in columns:
            vals = [float(r[col]) for r in rows if r.get(col) is not None]
            if not vals:
                raise ValueError(f"Column '{col}' has no observed values to compute mean")
            self.means_[col] = sum(vals) / len(vals)
        return self

    def transform(self, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not self.means_:
            raise RuntimeError("MeanImputer must be fit before transform")
        transformed = []
        for r in rows:
            new_row = dict(r)
            for col, mean_val in self.means_.items():
                if new_row.get(col) is None:
                    new_row[col] = mean_val
            transformed.append(new_row)
        return transformed

    def fit_transform(self, rows: list[dict[str, Any]], columns: list[str]) -> list[dict[str, Any]]:
        return self.fit(rows, columns).transform(rows)


class MostFrequentImputer:
    """Impute missing categorical values using the most frequent value (mode) from training data."""

    def __init__(self) -> None:
        self.modes_: dict[str, Any] = {}

    def fit(self, rows: list[dict[str, Any]], columns: list[str]) -> "MostFrequentImputer":
        self.modes_ = {}
        for col in columns:
            vals = [r[col] for r in rows if r.get(col) is not None]
            if not vals:
                raise ValueError(f"Column '{col}' has no observed values to compute mode")
            counts = Counter(vals)
            mode_val = counts.most_common(1)[0][0]
            self.modes_[col] = mode_val
        return self

    def transform(self, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not self.modes_:
            raise RuntimeError("MostFrequentImputer must be fit before transform")
        transformed = []
        for r in rows:
            new_row = dict(r)
            for col, mode_val in self.modes_.items():
                if new_row.get(col) is None:
                    new_row[col] = mode_val
            transformed.append(new_row)
        return transformed

    def fit_transform(self, rows: list[dict[str, Any]], columns: list[str]) -> list[dict[str, Any]]:
        return self.fit(rows, columns).transform(rows)
