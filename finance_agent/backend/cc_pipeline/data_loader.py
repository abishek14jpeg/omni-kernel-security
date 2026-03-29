import pandas as pd
import numpy as np
import os

# Using the absolute path provided by the user
DATA_PATH = r'C:\Users\Abishek14\WebstormProjects\ET-GENAI-ROUND2-PROJECT\creditcard.csv'

def load_data(subset_size=None):
    """
    Loads creditcard.csv and splits it into training and testing sets.
    Training set strictly contains 'Class == 0' (normal transactions) for Autoencoder fitting.
    Testing set contains the remaining normal transactions plus all fraud cases.
    """
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Please ensure your creditcard.csv is in the 'finance_agent/data/' directory.")
        
    print(f"[DataLoader] SUCCESS! Loading your actual dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    if subset_size and len(df) > subset_size:
        df = df.head(subset_size)
        print(f"[DataLoader] Processing subset of {subset_size} rows.")
        
    normal = df[df['Class'] == 0]
    fraud = df[df['Class'] == 1]
    
    # 80% train (normal only)
    train_size = int(len(normal) * 0.8)
    train_df = normal.iloc[:train_size]
    
    # Test set includes remaining normal + all fraud
    test_df = pd.concat([normal.iloc[train_size:], fraud])
    test_df = test_df.sample(frac=1, random_state=42).reset_index(drop=True) # Shuffle
    
    print(f"[DataLoader] Train size (Normal only): {len(train_df)}")
    print(f"[DataLoader] Test size (Mixed): {len(test_df)} (Frauds: {len(fraud)})")
    
    return train_df, test_df
