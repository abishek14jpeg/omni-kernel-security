import torch
import torch.nn as nn
import numpy as np
from torch.utils.data import DataLoader, TensorDataset

class LSTMAutoencoder(nn.Module):
    """
    LSTM Autoencoder configured for CreditCard dataset transactions.
    Reconstructs the input sequence. For non-temporal fraud data, seq_len is typically 1,
    making this functionally a dense autoencoder through LSTM cells.
    """
    def __init__(self, input_dim=30, hidden_dim=16, num_layers=2):
        super().__init__()
        self.encoder = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.decoder = nn.LSTM(hidden_dim, input_dim, num_layers, batch_first=True)

    def forward(self, x):
        # x shape: (batch_size, seq_len, input_dim)
        _, (hidden, _) = self.encoder(x)
        
        # Take the hidden state of the very last LSTM layer block
        h_last = hidden[-1].unsqueeze(1) 
        
        # Expand target hidden state across sequence dimension (seq_len=1 for CC dataset)
        seq_len = x.shape[1]
        h_repeated = h_last.repeat(1, seq_len, 1)

        decoded, _ = self.decoder(h_repeated)
        return decoded

def train_model(model, train_tensor, epochs=10, batch_size=128, lr=0.001):
    """
    Trains the Autoencoder strictly on normal transactions.
    Calculates dynamic threshold using Mu + 3*Sigma.
    """
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    
    dataset = TensorDataset(train_tensor)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    print(f"[Model] Training LSTM Autoencoder for {epochs} epochs...")
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        for (batch,) in dataloader:
            optimizer.zero_grad()
            reconstructed = model(batch)
            loss = criterion(reconstructed, batch)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
            
        print(f"  Epoch {epoch+1:02d}/{epochs} | Loss: {epoch_loss/len(dataloader):.6f}")
        
    # Standard inference for training bounds
    print("[Model] Calculating reconstruction threshold via mu + 3*sigma...")
    model.eval()
    with torch.no_grad():
        reconstructed = model(train_tensor)
        # MSE = (1/N) * Σ(x_i − x̂_i)^2
        mse_scores = torch.mean((train_tensor - reconstructed) ** 2, dim=[1, 2]).cpu().numpy()
        
    mu = np.mean(mse_scores)
    sigma = np.std(mse_scores)
    threshold = mu + 3 * sigma
    print(f"[Model] Threshold calculated: {threshold:.6f}")
    
    return model, threshold

def predict_anomaly(model, tensor_input, threshold):
    """
    Runs inference on testing tensors. 
    Returns raw MSE scores and boolean flags (MSE > θ).
    """
    model.eval()
    with torch.no_grad():
        reconstructed = model(tensor_input)
        mse_scores = torch.mean((tensor_input - reconstructed) ** 2, dim=[1, 2]).cpu().numpy()
        
    is_anomaly = mse_scores > threshold
    return mse_scores, is_anomaly
