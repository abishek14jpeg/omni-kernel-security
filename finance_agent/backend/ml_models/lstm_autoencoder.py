"""
LSTM Autoencoder for Financial Transaction Anomaly Detection
============================================================
Architecture: LSTM Encoder → Latent Space → LSTM Decoder
Anomaly Detection via Reconstruction Loss (MSE):
    MSE = (1/N) * Σ(x_i − x̂_i)²
Transactions flagged when MSE > θ (statistically determined threshold)
"""

import torch
import torch.nn as nn
import numpy as np


class LSTMEncoder(nn.Module):
    """
    Encodes a sequence of financial transaction feature vectors into a
    compressed latent representation capturing temporal dependencies.
    """

    def __init__(self, input_dim: int, hidden_dim: int, num_layers: int = 2, dropout: float = 0.1):
        super(LSTMEncoder, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.fc_latent = nn.Linear(hidden_dim, hidden_dim // 2)
        self.layer_norm = nn.LayerNorm(hidden_dim // 2)

    def forward(self, x):
        # x: (batch, seq_len, input_dim)
        _, (h_n, _) = self.lstm(x)
        # Take the last layer's hidden state
        latent = self.fc_latent(h_n[-1])  # (batch, hidden_dim // 2)
        latent = self.layer_norm(latent)
        latent = torch.relu(latent)
        return latent


class LSTMDecoder(nn.Module):
    """
    Reconstructs the original transaction sequence from the latent vector.
    High reconstruction error → anomalous transaction pattern.
    """

    def __init__(self, input_dim: int, hidden_dim: int, seq_len: int, num_layers: int = 2, dropout: float = 0.1):
        super(LSTMDecoder, self).__init__()
        self.seq_len = seq_len

        self.fc_expand = nn.Linear(hidden_dim // 2, hidden_dim)
        self.lstm = nn.LSTM(
            input_size=hidden_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.fc_output = nn.Linear(hidden_dim, input_dim)

    def forward(self, latent):
        # latent: (batch, hidden_dim // 2)
        expanded = torch.relu(self.fc_expand(latent))  # (batch, hidden_dim)
        # Repeat across sequence length
        expanded = expanded.unsqueeze(1).repeat(1, self.seq_len, 1)  # (batch, seq_len, hidden_dim)
        decoded, _ = self.lstm(expanded)
        output = self.fc_output(decoded)  # (batch, seq_len, input_dim)
        return output


class LSTMAutoencoder(nn.Module):
    """
    Full LSTM Autoencoder for anomaly detection in financial transaction sequences.

    Architecture:
        Input (batch, seq_len, 8) → LSTMEncoder → Latent(batch, 16) → LSTMDecoder → Output (batch, seq_len, 8)

    Loss: MSE = (1/N) * Σ(x_i − x̂_i)²
    Anomaly if MSE > θ where θ = μ_val + 2·σ_val
    """

    INPUT_DIM = 8       # Number of features per transaction
    HIDDEN_DIM = 32      # LSTM hidden dimension
    SEQ_LEN = 10         # Sequence length (transaction window)
    NUM_LAYERS = 2       # LSTM depth

    def __init__(self, input_dim=None, hidden_dim=None, seq_len=None, num_layers=None):
        super(LSTMAutoencoder, self).__init__()
        self.input_dim = input_dim or self.INPUT_DIM
        self.hidden_dim = hidden_dim or self.HIDDEN_DIM
        self.seq_len = seq_len or self.SEQ_LEN
        num_layers = num_layers or self.NUM_LAYERS

        self.encoder = LSTMEncoder(self.input_dim, self.hidden_dim, num_layers)
        self.decoder = LSTMDecoder(self.input_dim, self.hidden_dim, self.seq_len, num_layers)

    def forward(self, x):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed

    @staticmethod
    def compute_reconstruction_loss(original, reconstructed):
        """
        MSE = (1/N) * Σ(x_i − x̂_i)²
        """
        return nn.functional.mse_loss(reconstructed, original, reduction='mean')


def train_model(model, train_data, val_data, epochs=50, lr=0.001, device='cpu'):
    """
    Train the LSTM Autoencoder on normal financial transaction sequences.
    Returns the trained model and the anomaly threshold θ.
    """
    model = model.to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=20, gamma=0.5)

    # Training loop
    model.train()
    for epoch in range(epochs):
        total_loss = 0.0
        for batch in train_data:
            batch = batch.to(device)
            optimizer.zero_grad()
            reconstructed = model(batch)
            loss = LSTMAutoencoder.compute_reconstruction_loss(batch, reconstructed)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            total_loss += loss.item()

        scheduler.step()
        avg_loss = total_loss / len(train_data)
        if (epoch + 1) % 10 == 0:
            print(f"  Epoch {epoch + 1}/{epochs} | Train Loss: {avg_loss:.6f}")

    # Compute threshold from validation data
    model.eval()
    val_losses = []
    with torch.no_grad():
        for batch in val_data:
            batch = batch.to(device)
            reconstructed = model(batch)
            loss = LSTMAutoencoder.compute_reconstruction_loss(batch, reconstructed)
            val_losses.append(loss.item())

    val_losses = np.array(val_losses)
    threshold = float(np.mean(val_losses) + 2.0 * np.std(val_losses))
    print(f"  Threshold θ = {threshold:.6f} (μ={np.mean(val_losses):.6f}, σ={np.std(val_losses):.6f})")

    return model, threshold
