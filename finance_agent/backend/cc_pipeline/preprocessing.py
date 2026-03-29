import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import torch

class CCPipelinePreprocessor:
    def __init__(self):
        """
        Initializes the Preprocessor for creditcard.csv datasets.
        """
        self.scaler = StandardScaler()
        self.features = ['Time', 'Amount'] + [f'V{i}' for i in range(1, 29)]
        self.is_fitted = False
        
    def fit(self, train_df: pd.DataFrame):
        """
        Fits the StandardScaler ONLY on the normal training data to prevent data leakage.
        """
        print("[Preprocessor] Fitting StandardScaler on normal training data (30 features)...")
        self.scaler.fit(train_df[self.features])
        self.is_fitted = True
        
    def transform(self, df: pd.DataFrame) -> torch.FloatTensor:
        """
        Scales the incoming dataset and reshapes it to (N, 1, 30) suitable for PyTorch LSTMs.
        Assumes independent transactions (seq_len = 1).
        """
        if not self.is_fitted:
            raise ValueError("Preprocessor runs transform without being fitted. Run fit() first.")
            
        scaled_data = self.scaler.transform(df[self.features])
        
        # Reshape to (Batch Size, Sequence Length, Input Dim)
        # For the CreditCard dataset, each row is a distinct transaction -> seq_len = 1
        reshaped = scaled_data.reshape(scaled_data.shape[0], 1, scaled_data.shape[1])
        
        return torch.FloatTensor(reshaped)

    def extract_single(self, row_series: pd.Series) -> torch.FloatTensor:
        """Transforms a single transaction pandas Series into a tensor."""
        df = pd.DataFrame([row_series])
        return self.transform(df)
