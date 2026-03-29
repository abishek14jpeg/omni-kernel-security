"""
Synthetic Financial Transaction Data Generator
================================================
Generates realistic financial transaction data for:
1. Training the LSTM Autoencoder (normal patterns only)
2. Testing the full pipeline (mix of normal + anomalous)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import uuid
import hashlib


# Chart of Accounts
ACCOUNTS = {
    "1000": {"name": "Cash", "type": "asset"},
    "1100": {"name": "Accounts Receivable", "type": "asset"},
    "1200": {"name": "Inventory", "type": "asset"},
    "2000": {"name": "Accounts Payable", "type": "liability"},
    "2100": {"name": "Accrued Expenses", "type": "liability"},
    "3000": {"name": "Common Stock", "type": "equity"},
    "3100": {"name": "Retained Earnings", "type": "equity"},
    "4000": {"name": "Revenue", "type": "revenue"},
    "5000": {"name": "Cost of Goods Sold", "type": "expense"},
    "5100": {"name": "Operating Expenses", "type": "expense"},
    "5200": {"name": "Salaries Expense", "type": "expense"},
}

APPROVED_ACCOUNTS = list(ACCOUNTS.keys())

TRANSACTION_TYPES = ["journal_entry", "payment", "invoice", "refund", "transfer", "adjustment"]

USERS = ["alice.johnson", "bob.smith", "carol.white", "dave.martin", "eve.chen", "frank.kumar"]
APPROVERS = ["mgr.sarah", "mgr.james", "dir.patricia", "cfo.mike"]


def generate_transaction_id():
    return f"TXN-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


def generate_normal_transactions(n=1000, base_date=None):
    """Generate n normal (non-anomalous) financial transactions."""
    if base_date is None:
        base_date = datetime(2026, 1, 1, 8, 0, 0)

    transactions = []
    for i in range(n):
        # Time progression: business hours (8am-6pm), weekdays
        hours_offset = random.gauss(5, 2)  # Center around 1pm
        hours_offset = max(0, min(10, hours_offset))  # Clamp to 0-10 (8am-6pm)
        day_offset = i // 20  # ~20 transactions per day
        # Skip weekends
        actual_day = day_offset + (day_offset // 5) * 2
        timestamp = base_date + timedelta(days=actual_day, hours=hours_offset, minutes=random.randint(0, 59))

        # Normal amounts follow a log-normal distribution centered around $5000
        amount = round(np.random.lognormal(mean=8.5, sigma=0.8), 2)
        amount = min(amount, 900000)  # Keep under the $1M limit

        # Select accounts — proper double-entry pairs
        debit_account, credit_account = _get_account_pair()

        txn_type = random.choice(TRANSACTION_TYPES)
        initiator = random.choice(USERS)
        # Ensure segregation of duties — approver != initiator
        approver = random.choice(APPROVERS) if amount > 50000 else None

        txn = {
            "transaction_id": generate_transaction_id(),
            "timestamp": timestamp.isoformat(),
            "type": txn_type,
            "amount": amount,
            "debit_account": debit_account,
            "credit_account": credit_account,
            "debit_amount": amount,
            "credit_amount": amount,  # Balanced
            "description": _generate_description(txn_type, amount),
            "initiated_by": initiator,
            "approved_by": approver,
            "currency": "USD",
            "status": "posted",
            "department": random.choice(["finance", "operations", "sales", "hr"]),
            "reference_number": f"REF-{random.randint(100000, 999999)}",
        }
        transactions.append(txn)

    return transactions


def generate_anomalous_transactions(n=50, base_date=None):
    """Generate n anomalous transactions with various violation types."""
    if base_date is None:
        base_date = datetime(2026, 3, 1, 8, 0, 0)

    anomalies = []
    anomaly_types = [
        "excessive_amount",
        "unbalanced_entry",
        "off_hours",
        "duplicate",
        "missing_approval",
        "segregation_violation",
        "unauthorized_account",
        "timing_burst",
    ]

    for i in range(n):
        anomaly_type = random.choice(anomaly_types)
        hours_offset = random.gauss(5, 2)
        day_offset = i // 5
        actual_day = day_offset + (day_offset // 5) * 2
        timestamp = base_date + timedelta(days=actual_day, hours=max(0, min(10, hours_offset)))

        base_amount = round(np.random.lognormal(mean=8.5, sigma=0.8), 2)
        debit_account, credit_account = _get_account_pair()
        initiator = random.choice(USERS)

        txn = {
            "transaction_id": generate_transaction_id(),
            "timestamp": timestamp.isoformat(),
            "type": random.choice(TRANSACTION_TYPES),
            "amount": base_amount,
            "debit_account": debit_account,
            "credit_account": credit_account,
            "debit_amount": base_amount,
            "credit_amount": base_amount,
            "description": "",
            "initiated_by": initiator,
            "approved_by": random.choice(APPROVERS),
            "currency": "USD",
            "status": "posted",
            "department": random.choice(["finance", "operations", "sales", "hr"]),
            "reference_number": f"REF-{random.randint(100000, 999999)}",
            "_anomaly_type": anomaly_type,  # Internal label
        }

        # Apply the anomaly
        if anomaly_type == "excessive_amount":
            txn["amount"] = round(random.uniform(1_500_000, 10_000_000), 2)
            txn["debit_amount"] = txn["amount"]
            txn["credit_amount"] = txn["amount"]
            txn["description"] = f"LARGE transfer: ${txn['amount']:,.2f}"

        elif anomaly_type == "unbalanced_entry":
            txn["credit_amount"] = round(txn["debit_amount"] * random.uniform(0.5, 0.95), 2)
            txn["description"] = "Journal adjustment — manual correction"

        elif anomaly_type == "off_hours":
            off_hour = random.choice([2, 3, 4, 23, 0, 1])
            txn["timestamp"] = (base_date + timedelta(days=actual_day, hours=off_hour)).isoformat()
            txn["description"] = f"After-hours processing at {off_hour}:00"

        elif anomaly_type == "duplicate":
            txn["description"] = "Duplicate payment — vendor invoice #38291"
            # Same ref as would appear in a real duplicate
            txn["reference_number"] = "REF-DUPLICATE-001"

        elif anomaly_type == "missing_approval":
            txn["amount"] = round(random.uniform(75_000, 500_000), 2)
            txn["debit_amount"] = txn["amount"]
            txn["credit_amount"] = txn["amount"]
            txn["approved_by"] = None
            txn["description"] = f"High-value transfer without approval: ${txn['amount']:,.2f}"

        elif anomaly_type == "segregation_violation":
            txn["approved_by"] = txn["initiated_by"]  # Same person
            txn["description"] = "Self-approved transaction"

        elif anomaly_type == "unauthorized_account":
            txn["debit_account"] = "9999"
            txn["description"] = "Transfer to unregistered account 9999"

        elif anomaly_type == "timing_burst":
            # 5 transactions within 1 minute
            burst_time = base_date + timedelta(days=actual_day, hours=10, minutes=30)
            txn["timestamp"] = (burst_time + timedelta(seconds=random.randint(0, 60))).isoformat()
            txn["description"] = "Rapid burst transaction"

        if not txn["description"]:
            txn["description"] = _generate_description(txn["type"], txn["amount"])

        anomalies.append(txn)

    return anomalies


def generate_training_sequences(n_sequences=1000, seq_len=10):
    """
    Generate normalized feature sequences for LSTM training.
    Returns torch-compatible numpy arrays of shape (n_sequences, seq_len, 8).
    """
    from preprocessing import update_normalization_params, extract_features

    transactions = generate_normal_transactions(n=n_sequences * seq_len)
    update_normalization_params(transactions)
    
    features = [extract_features(t) for t in transactions]

    # Split into sequences
    sequences = []
    for i in range(0, len(features) - seq_len + 1, seq_len):
        seq = features[i:i + seq_len]
        if len(seq) == seq_len:
            sequences.append(seq)

    return np.array(sequences[:n_sequences], dtype=np.float32)


def _get_account_pair():
    """Return a valid debit-credit account pair for double-entry bookkeeping."""
    pairs = [
        ("5000", "1000"),   # COGS paid from Cash
        ("5100", "1000"),   # OpEx paid from Cash
        ("5200", "2100"),   # Salary accrued
        ("1100", "4000"),   # Revenue recognized
        ("1000", "1100"),   # AR collected to Cash
        ("2000", "1000"),   # AP paid from Cash
        ("1200", "2000"),   # Inventory purchased on credit
        ("1000", "3000"),   # Stock issuance
    ]
    return random.choice(pairs)


def _generate_description(txn_type, amount):
    descriptions = {
        "journal_entry": [
            f"Monthly accrual adjustment ${amount:,.2f}",
            f"Period-end reclassification entry",
            f"Intercompany elimination entry",
        ],
        "payment": [
            f"Vendor payment for invoice — ${amount:,.2f}",
            f"Utility payment — electricity Q1",
            f"Wire transfer to supplier",
        ],
        "invoice": [
            f"Client invoice #{random.randint(10000, 99999)}",
            f"Service revenue recognition",
            f"Product delivery billing",
        ],
        "refund": [
            f"Customer refund — order #{random.randint(1000, 9999)}",
            f"Credit note issued",
        ],
        "transfer": [
            f"Internal fund transfer between departments",
            f"Inter-account rebalancing",
        ],
        "adjustment": [
            f"Period-end adjustment entry",
            f"Reconciliation adjustment",
            f"FX revaluation adjustment",
        ],
    }
    options = descriptions.get(txn_type, [f"Transaction: ${amount:,.2f}"])
    return random.choice(options)
