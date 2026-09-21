"""Tests for reproducible, leak-free train/test splitting."""

import pytest
from app.ml.splitting.split import train_test_split


def test_train_test_split_proportions_and_disjointness() -> None:
    data = list(range(100))
    train, test = train_test_split(data, train_ratio=0.8, seed=42)

    assert len(train) == 80
    assert len(test) == 20

    # Guarantee no overlap
    assert len(set(train).intersection(set(test))) == 0
    # Guarantee full coverage
    assert set(train).union(set(test)) == set(data)


def test_train_test_split_determinism() -> None:
    data = [{"id": i, "val": i * 2} for i in range(50)]

    train1, test1 = train_test_split(data, train_ratio=0.75, seed=123)
    train2, test2 = train_test_split(data, train_ratio=0.75, seed=123)

    assert train1 == train2
    assert test1 == test2


def test_train_test_split_different_seeds() -> None:
    data = list(range(100))
    train1, _ = train_test_split(data, train_ratio=0.8, seed=1)
    train2, _ = train_test_split(data, train_ratio=0.8, seed=2)

    assert train1 != train2


def test_train_test_split_validation() -> None:
    with pytest.raises(ValueError, match="at least 2 samples"):
        train_test_split([1], train_ratio=0.8)

    with pytest.raises(ValueError, match="strictly between 0.0 and 1.0"):
        train_test_split([1, 2, 3], train_ratio=1.5)
