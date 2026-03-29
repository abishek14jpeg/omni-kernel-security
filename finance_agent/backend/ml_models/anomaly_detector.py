"""
Anomaly Detector — Inference Wrapper for the LSTM Autoencoder
==============================================================
Handles model initialization, training on synthetic data, and inference.
"""

import torch
import numpy as np
from ml_models.lstm_autoencoder import LSTMAutoencoder, train_model
from synthetic_data import generate_training_sequences


# Global state
_model = None
_threshold = None
_model_version = "lstm_ae_v1.0"


def initialize_model(force_train=False):
    """
    Initialize the LSTM Autoencoder model.
    Trains on synthetic normal financial transaction sequences.
    Returns tuple of (model, threshold).
    """
    global _model, _threshold

    print("[FinanceAI] Initializing LSTM Autoencoder...")
    model = LSTMAutoencoder(
        input_dim=LSTMAutoencoder.INPUT_DIM,
        hidden_dim=LSTMAutoencoder.HIDDEN_DIM,
        seq_len=LSTMAutoencoder.SEQ_LEN,
        num_layers=LSTMAutoencoder.NUM_LAYERS,
    )

    # Generate synthetic training data
    print("[FinanceAI] Generating synthetic training data (1000 sequences)...")
    train_sequences = generate_training_sequences(n_sequences=1000, seq_len=10)
    val_sequences = generate_training_sequences(n_sequences=200, seq_len=10)

    # Convert to tensor batches (batch_size=32)
    train_batches = _make_batches(train_sequences, batch_size=32)
    val_batches = _make_batches(val_sequences, batch_size=32)

    # Train the model
    print("[FinanceAI] Training LSTM Autoencoder (50 epochs)...")
    model, threshold = train_model(
        model, train_batches, val_batches, epochs=50, lr=0.001
    )

    _model = model
    _threshold = threshold
    print(f"[FinanceAI] Model ready. Threshold θ = {threshold:.6f}")

    return model, threshold


def detect_anomaly(transaction_features):
    """
    Run anomaly detection on a single transaction feature sequence.

    Args:
        transaction_features: numpy array of shape (seq_len, input_dim) or (1, seq_len, input_dim)

    Returns:
        dict with anomaly_score, threshold, is_anomaly, classification
    """
    global _model, _threshold

    if _model is None:
        initialize_model()

    model = _model
    threshold = _threshold

    # Ensure correct shape
    if isinstance(transaction_features, list):
        transaction_features = np.array(transaction_features, dtype=np.float32)

    if len(transaction_features.shape) == 2:
        transaction_features = transaction_features[np.newaxis, :]  # Add batch dim

    tensor_input = torch.FloatTensor(transaction_features)

    model.eval()
    with torch.no_grad():
        reconstructed = model(tensor_input)
        # MSE = (1/N) * Σ(x_i − x̂_i)²
        mse_loss = torch.nn.functional.mse_loss(reconstructed, tensor_input, reduction='mean').item()

    # Classification based on threshold
    is_anomaly = mse_loss > threshold
    severity = _compute_severity(mse_loss, threshold)

    classification = "Normal"
    if mse_loss > threshold * 2.5:
        classification = "Critical Anomaly"
    elif mse_loss > threshold * 1.5:
        classification = "High Anomaly"
    elif mse_loss > threshold:
        classification = "Suspicious"

    return {
        "anomaly_score": round(mse_loss, 6),
        "threshold": round(threshold, 6),
        "is_anomaly": is_anomaly,
        "classification": classification,
        "severity": severity,
        "model_version": _model_version,
        "confidence": round(1.0 - min(1.0, abs(mse_loss - threshold) / threshold), 4),
    }


def detect_anomaly_raw(raw_transaction, recent_transactions=None):
    """
    Convenience method: builds a synthetic feature sequence from a raw transaction
    and its recent context, then runs anomaly detection.
    Used when we don't have a pre-built feature sequence.
    """
    from preprocessing import preprocess_single_transaction
    features = preprocess_single_transaction(raw_transaction, recent_transactions)
    return detect_anomaly(features)


def get_model_info():
    """Return current model metadata."""
    return {
        "version": _model_version,
        "architecture": "LSTM Autoencoder (Encoder-Decoder)",
        "input_dim": LSTMAutoencoder.INPUT_DIM,
        "hidden_dim": LSTMAutoencoder.HIDDEN_DIM,
        "seq_len": LSTMAutoencoder.SEQ_LEN,
        "num_layers": LSTMAutoencoder.NUM_LAYERS,
        "threshold": round(_threshold, 6) if _threshold else None,
        "loss_function": "MSE = (1/N) * Σ(x_i − x̂_i)²",
        "status": "loaded" if _model is not None else "not_loaded",
    }


def _compute_severity(score, threshold):
    """Map anomaly score to severity level (0.0-1.0)."""
    if score <= threshold:
        return round(score / threshold * 0.3, 4)  # Normal: 0-0.3
    ratio = score / threshold
    if ratio < 1.5:
        return round(0.3 + (ratio - 1.0) * 0.4, 4)  # Suspicious: 0.3-0.5
    elif ratio < 2.5:
        return round(0.5 + (ratio - 1.5) * 0.3, 4)  # High: 0.5-0.8
    else:
        return min(1.0, round(0.8 + (ratio - 2.5) * 0.1, 4))  # Critical: 0.8-1.0


def _make_batches(data, batch_size=32):
    """Convert numpy array into list of torch tensor batches."""
    batches = []
    for i in range(0, len(data), batch_size):
        batch = torch.FloatTensor(data[i:i + batch_size])
        batches.append(batch)
    return batches
