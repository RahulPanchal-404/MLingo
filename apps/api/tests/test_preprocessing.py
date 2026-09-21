"""Tests for preprocessing modules and strict data leakage prevention."""

import numpy as np
import pytest
from app.ml.preprocessing.encoder import OneHotEncoder
from app.ml.preprocessing.imputer import MeanImputer, MostFrequentImputer
from app.ml.preprocessing.scaler import MinMaxScaler, StandardScaler


def test_standard_scaler_train_test_isolation() -> None:
    # Training data: mean = 10.0, std = 2.0
    train_X = np.array([[8.0], [10.0], [12.0]], dtype=np.float64)
    # Test data: contains out-of-distribution values
    test_X = np.array([[6.0], [14.0]], dtype=np.float64)

    scaler = StandardScaler()
    scaled_train = scaler.fit_transform(train_X)

    # Train mean should be 0, std should be 1
    assert np.mean(scaled_train) == pytest.approx(0.0, abs=1e-6)
    assert np.std(scaled_train) == pytest.approx(1.0, abs=1e-6)

    # Transform test set using TRAIN parameters
    scaled_test = scaler.transform(test_X)

    # Expected: (6.0 - 10.0) / std(train) = -4.0 / 1.63299
    expected_test_0 = (6.0 - scaler.mean_[0]) / scaler.scale_[0]
    expected_test_1 = (14.0 - scaler.mean_[0]) / scaler.scale_[0]

    assert scaled_test[0, 0] == pytest.approx(expected_test_0, abs=1e-6)
    assert scaled_test[1, 0] == pytest.approx(expected_test_1, abs=1e-6)

    # Verify that scaler parameters DID NOT change after transforming test data
    assert scaler.mean_[0] == pytest.approx(10.0, abs=1e-6)


def test_min_max_scaler_train_test_isolation() -> None:
    train_X = np.array([[10.0], [20.0], [30.0]], dtype=np.float64)
    test_X = np.array([[5.0], [35.0]], dtype=np.float64)

    scaler = MinMaxScaler()
    scaled_train = scaler.fit_transform(train_X)

    assert np.min(scaled_train) == pytest.approx(0.0, abs=1e-6)
    assert np.max(scaled_train) == pytest.approx(1.0, abs=1e-6)

    # Transform test data using train min (10) and max (30)
    scaled_test = scaler.transform(test_X)
    assert scaled_test[0, 0] == pytest.approx(-0.25, abs=1e-6)  # (5 - 10) / 20 = -0.25
    assert scaled_test[1, 0] == pytest.approx(1.25, abs=1e-6)   # (35 - 10) / 20 = 1.25


def test_mean_imputer_train_test_isolation() -> None:
    train_rows = [{"x": 2.0}, {"x": 4.0}, {"x": None}]  # mean of observed is 3.0
    test_rows = [{"x": 10.0}, {"x": None}]

    imputer = MeanImputer()
    imputed_train = imputer.fit_transform(train_rows, ["x"])

    assert imputed_train[0]["x"] == 2.0
    assert imputed_train[1]["x"] == 4.0
    assert imputed_train[2]["x"] == pytest.approx(3.0, abs=1e-6)

    # Imputing test set MUST use training mean (3.0), NOT test mean (10.0)
    imputed_test = imputer.transform(test_rows)
    assert imputed_test[0]["x"] == 10.0
    assert imputed_test[1]["x"] == pytest.approx(3.0, abs=1e-6)


def test_most_frequent_imputer() -> None:
    train_rows = [{"cat": "A"}, {"cat": "B"}, {"cat": "A"}, {"cat": None}]
    test_rows = [{"cat": None}, {"cat": "B"}]

    imputer = MostFrequentImputer()
    imputer.fit(train_rows, ["cat"])
    assert imputer.modes_["cat"] == "A"

    imputed_test = imputer.transform(test_rows)
    assert imputed_test[0]["cat"] == "A"
    assert imputed_test[1]["cat"] == "B"


def test_one_hot_encoder() -> None:
    train_rows = [{"tier": "Standard"}, {"tier": "Premium"}, {"tier": "Standard"}]
    test_rows = [{"tier": "Premium"}, {"tier": "VIP"}]  # "VIP" was not seen in training

    encoder = OneHotEncoder()
    encoded_train = encoder.fit_transform(train_rows, ["tier"])

    assert "tier_Premium" in encoded_train[0]
    assert "tier_Standard" in encoded_train[0]
    assert encoded_train[0]["tier_Standard"] == 1.0
    assert encoded_train[0]["tier_Premium"] == 0.0

    # Test transform: unseen "VIP" should have all indicator columns as 0.0
    encoded_test = encoder.transform(test_rows)
    assert encoded_test[0]["tier_Premium"] == 1.0
    assert encoded_test[0]["tier_Standard"] == 0.0
    assert encoded_test[1]["tier_Standard"] == 0.0
    assert encoded_test[1]["tier_Premium"] == 0.0
