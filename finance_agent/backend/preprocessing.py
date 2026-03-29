"""
Preprocessing Layer
====================
Layer 2: Normalization, missing value handling, and feature engineering.
Converts raw transaction data into 8-dimensional feature vectors for the LSTM model.
"""

import numpy as np
from datetime import datetime
from typing import List, Dict, Optional


# Global normalization parameters (computed from training data)
_norm_params = {
    "amount_min": 0,
    "amount_max": 1_000_000,
    "amount_mean": 50_000,
    "amount_std": 80_000,
}

# Account type encoding map
ACCOUNT_TYPE_MAP = {
    "1000": "asset", "1100": "asset", "1200": "asset",
    "2000": "liability", "2100": "liability",
    "3000": "equity", "3100": "equity",
    "4000": "revenue",
    "5000": "expense", "5100": "expense", "5200": "expense",
}

TYPE_ENCODING = {
    "asset": 0.2, "liability": 0.4, "equity": 0.6, "revenue": 0.8, "expense": 1.0
}


def preprocess_transaction(txn: dict) -> dict:
    """
    Transform a raw transaction into normalized features.
    Returns the transaction enriched with a 'features' field (8-d vector).
    """
    features = extract_features(txn)
    txn["features"] = features
    txn["preprocessing_metadata"] = {
        "features_extracted": len(features),
        "normalization": "min-max + cyclical + z-score",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    return txn


def extract_features(txn: dict, recent_count: int = 0) -> List[float]:
    """
    Extract 8-dimensional feature vector from a transaction.
    
    Features:
    1. amount_normalized — Min-Max scaled amount
    2. balance_proxy — Normalized amount relative to account capacity
    3. hour_sin — Cyclical sin encoding of hour
    4. hour_cos — Cyclical cos encoding of hour
    5. day_of_week — Day encoded 0-6, normalized 0-1
    6. transaction_velocity — Proxy for transaction frequency
    7. amount_deviation — Z-score of amount, clipped and normalized
    8. account_type_encoded — Encoded account category
    """
    amount = txn.get("amount", 0)

    # Parse timestamp
    try:
        ts = datetime.fromisoformat(txn.get("timestamp", "").replace("Z", "+00:00"))
    except (ValueError, TypeError):
        ts = datetime.utcnow()

    # Feature 1: Normalized amount (min-max)
    amt_min = _norm_params["amount_min"]
    amt_max = _norm_params["amount_max"]
    amount_norm = np.clip((amount - amt_min) / (amt_max - amt_min), 0, 1)

    # Feature 2: Balance proxy (simple ratio)
    balance_proxy = min(1.0, amount / 100_000)

    # Feature 3-4: Cyclical hour encoding
    hour = ts.hour + ts.minute / 60.0
    hour_sin = float(np.sin(2 * np.pi * hour / 24.0))
    hour_cos = float(np.cos(2 * np.pi * hour / 24.0))

    # Feature 5: Day of week (normalized)
    day_of_week = ts.weekday() / 6.0

    # Feature 6: Transaction velocity proxy
    velocity = min(1.0, recent_count / 10.0)

    # Feature 7: Amount deviation (z-score, clipped to [-1, 1])
    amt_mean = _norm_params["amount_mean"]
    amt_std = _norm_params["amount_std"]
    z_score = (amount - amt_mean) / amt_std if amt_std > 0 else 0
    amount_dev = float(np.clip(z_score / 3.0, -1, 1))

    # Feature 8: Account type encoding
    acc_code = txn.get("debit_account", "1000")
    acc_type = ACCOUNT_TYPE_MAP.get(acc_code, "asset")
    account_enc = TYPE_ENCODING.get(acc_type, 0.5)

    return [amount_norm, balance_proxy, hour_sin, hour_cos, day_of_week, velocity, amount_dev, account_enc]


def preprocess_single_transaction(txn: dict, recent_transactions: Optional[List[dict]] = None) -> np.ndarray:
    """
    Build a full feature sequence (seq_len=10) from a single transaction
    and its recent context. Pads with zeros if not enough history.
    
    Returns: numpy array of shape (10, 8) ready for LSTM input.
    """
    seq_len = 10
    features_list = []

    # Add recent transaction features as context
    if recent_transactions:
        for rt in recent_transactions[-(seq_len - 1):]:
            features_list.append(extract_features(rt))

    # Add current transaction features
    recent_count = len(recent_transactions) if recent_transactions else 0
    features_list.append(extract_features(txn, recent_count=recent_count))

    # Pad with zeros if not enough history
    while len(features_list) < seq_len:
        features_list.insert(0, [0.0] * 8)

    # Take last seq_len features
    features_list = features_list[-seq_len:]

    return np.array(features_list, dtype=np.float32)


def handle_missing_values(txn: dict) -> dict:
    """
    Handle missing values in transaction data.
    Applies sensible defaults for numeric and categorical fields.
    """
    defaults = {
        "amount": 0.0,
        "debit_amount": txn.get("amount", 0.0),
        "credit_amount": txn.get("amount", 0.0),
        "currency": "USD",
        "status": "pending",
        "description": "No description provided",
        "department": "unspecified",
    }

    for field, default in defaults.items():
        if txn.get(field) is None:
            txn[field] = default

    return txn


def update_normalization_params(transactions: List[dict]):
    """Update normalization parameters based on a batch of transactions."""
    global _norm_params
    amounts = [t.get("amount", 0) for t in transactions]
    if amounts:
        _norm_params["amount_min"] = min(amounts)
        _norm_params["amount_max"] = max(amounts)
        _norm_params["amount_mean"] = float(np.mean(amounts))
        _norm_params["amount_std"] = float(np.std(amounts))
