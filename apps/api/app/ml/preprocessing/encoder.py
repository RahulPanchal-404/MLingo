"""Categorical one-hot encoding with train-fit and test-transform isolation."""

from typing import Any


class OneHotEncoder:
    """Encode categorical features into one-hot binary indicator columns."""

    def __init__(self) -> None:
        self.categories_: dict[str, list[str]] = {}

    def fit(self, rows: list[dict[str, Any]], columns: list[str]) -> "OneHotEncoder":
        self.categories_ = {}
        for col in columns:
            cats = sorted(list({str(r[col]) for r in rows if r.get(col) is not None}))
            self.categories_[col] = cats
        return self

    def transform(self, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not self.categories_:
            raise RuntimeError("OneHotEncoder must be fit before transform")
        transformed = []
        for r in rows:
            new_row = dict(r)
            for col, cats in self.categories_.items():
                val = str(new_row.pop(col, ""))
                for cat in cats:
                    new_row[f"{col}_{cat}"] = 1.0 if val == cat else 0.0
            transformed.append(new_row)
        return transformed

    def fit_transform(self, rows: list[dict[str, Any]], columns: list[str]) -> list[dict[str, Any]]:
        return self.fit(rows, columns).transform(rows)
