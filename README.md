Finance Domain AI Agent for Credit Card Fraud Detection

A compliance-aware AI agent that detects credit card fraud using a hybrid approach combining an LSTM Autoencoder (AI) and rule-based compliance guardrails, ensuring accurate, auditable, and regulation-safe decisions.

Overview

This project implements a domain-specific financial AI agent capable of:

Detecting fraud using deep learning
Enforcing strict compliance rules
Executing end-to-end financial workflows
Providing full auditability of decisions

The system guarantees that no transaction violating compliance rules is approved, even if the AI model predicts it as normal.

Architecture:

Input (Transaction Data)
        ↓
Preprocessing
        ↓
LSTM Autoencoder (Anomaly Detection)
        ↓
Compliance Engine (Rule Validation)
        ↓
Decision Engine (AI + Rules)
        ↓
Audit Logging
        ↓
Export (JSON / CSV)

AI Model
Model Type: LSTM Autoencoder
Training: Only on normal transactions
Objective: Learn normal transaction behavior and detect deviations

Mathematical Foundation:

Reconstruction Error:

  MSE = (1/N) * Σ(x - x̂)^2
  Low MSE → Normal
  High MSE → Anomaly (Potential Fraud)

Dataset
  Credit Card Fraud Detection Dataset
  284,807 transactions
  0.17% fraud cases (highly imbalanced)
Features:
  Time
  Amount
  V1–V28 (PCA-transformed anonymized features)
  
Compliance Engine

  Implements strict financial guardrails:
  
  R001: No negative transactions
  R002: Maximum transaction limit
  R003: Restricted time window
  
  Rules always override AI predictions.

Decision Engine

  Final decision logic:
  
  Rule violation → REJECT
  No rule violation + High MSE → FLAG
  No rule violation + Low MSE → APPROVE
  Audit Logging

Each transaction is logged with:

  Transaction details
  Anomaly score (MSE)
  Rules triggered
  Final decision
  
Export Options:
JSON
CSV

Testing
Manual Testing:
  Inject transactions via UI
  Observe decisions in real time
Automated Testing:
  cd finance_agent/backend/cc_pipeline
  python test_runner.py

Validates:

  Normal transactions
  Fraud detection
  Rule enforcement
  Audit log generation
  Visualization
  MSE distribution plots
  Threshold-based anomaly detection
  Real-time monitoring
  Tech Stack

Backend:
  FastAPI
  Python
  PyTorch

Frontend:
  React
  WebSockets

Data Processing:
  Pandas
  NumPy

Key Features
  AI-based anomaly detection
  Compliance guardrails enforcement
  Real-time transaction processing
  Full auditability
  Exportable logs
  Scalable architecture

Advantages
  Detects zero-day fraud attacks
  Combines AI with deterministic rules
  Ensures regulatory compliance
  Production-ready design

Team
Abishek K G
Akshith Srinivas
VIT Chennai
Conclusion

This project demonstrates how AI can be integrated into financial systems while maintaining strict compliance, enabling secure, explainable, and auditable fraud detection.
