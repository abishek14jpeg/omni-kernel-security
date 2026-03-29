"""
Workflow Pipeline Orchestrator
================================
Executes the deterministic end-to-end financial workflow:
    Input → Validation → AI Anomaly Detection → Rule Evaluation → Decision → Action

Each step returns a structured result that feeds into the next.
Every intermediate output is captured for the audit log.
"""

import time
import numpy as np
from typing import Dict, List, Optional

from data_ingestion import TransactionInput, ingest_single, IngestResult
from preprocessing import preprocess_transaction, preprocess_single_transaction, handle_missing_values
from ml_models.anomaly_detector import detect_anomaly, detect_anomaly_raw
from compliance.compliance_engine import ComplianceEngine
from decision_engine import DecisionEngine
from audit_logger import AuditLogger


class FinancePipeline:
    """
    Orchestrates the full financial transaction processing pipeline.
    Fully autonomous, deterministic, and auditable.
    """

    def __init__(self):
        self.compliance_engine = ComplianceEngine()
        self.decision_engine = DecisionEngine()
        self.audit_logger = AuditLogger()
        self._recent_transactions: list = []
        print("[Pipeline] Financial workflow pipeline initialized.")

    def process_transaction(self, txn_input: TransactionInput) -> dict:
        """
        Execute the full pipeline on a single transaction.
        
        Flow: Input → Validation → Preprocessing → AI Detection → 
              Rule Evaluation → Decision → Audit Log → Result
        """
        start_time = time.time()

        # === STAGE 1: DATA INGESTION & VALIDATION ===
        ingest_result = ingest_single(txn_input)

        if not ingest_result.valid:
            # Validation failed — create rejection record
            return self._handle_validation_failure(ingest_result, start_time)

        raw_txn = ingest_result.raw_data

        # === STAGE 2: PREPROCESSING ===
        raw_txn = handle_missing_values(raw_txn)
        processed_txn = preprocess_transaction(raw_txn)
        preprocessing_meta = processed_txn.get("preprocessing_metadata", {})

        # Build feature sequence for LSTM (current + recent context)
        feature_sequence = preprocess_single_transaction(raw_txn, self._recent_transactions)

        # === STAGE 3: AI ANOMALY DETECTION ===
        ai_result = detect_anomaly(feature_sequence)

        # === STAGE 4: COMPLIANCE RULE EVALUATION ===
        compliance_result = self.compliance_engine.evaluate(raw_txn)

        # === STAGE 5: DECISION ENGINE ===
        decision = self.decision_engine.decide(ai_result, compliance_result, raw_txn)

        # === STAGE 6: AUDIT LOGGING ===
        audit_record = self.audit_logger.create_record(
            transaction=raw_txn,
            preprocessing_meta=preprocessing_meta,
            ai_result=ai_result,
            compliance_result=compliance_result,
            decision=decision,
            processing_start_time=start_time,
        )

        # Track for context window
        self._recent_transactions.append(raw_txn)
        if len(self._recent_transactions) > 100:
            self._recent_transactions = self._recent_transactions[-50:]

        # === RESULT ===
        return {
            "success": True,
            "transaction_id": raw_txn.get("transaction_id"),
            "outcome": decision["outcome"],
            "audit_record": audit_record,
            "summary": {
                "anomaly_score": ai_result.get("anomaly_score"),
                "anomaly_classification": ai_result.get("classification"),
                "rules_passed": compliance_result.get("passed"),
                "rules_failed_count": compliance_result.get("rules_failed"),
                "decision": decision["outcome"],
                "reasoning": decision["reasoning"],
                "processing_time_ms": audit_record["processing_time_ms"],
            },
        }

    def process_batch(self, transactions: List[TransactionInput]) -> dict:
        """Process a batch of transactions through the pipeline."""
        results = []
        outcomes = {"APPROVE": 0, "FLAG": 0, "ESCALATE": 0, "REJECT": 0}
        start_time = time.time()

        for txn in transactions:
            result = self.process_transaction(txn)
            results.append(result)
            outcome = result.get("outcome", "REJECT")
            outcomes[outcome] = outcomes.get(outcome, 0) + 1

        total_time = round((time.time() - start_time) * 1000, 2)

        return {
            "batch_size": len(transactions),
            "results": results,
            "outcomes": outcomes,
            "total_processing_time_ms": total_time,
            "avg_processing_time_ms": round(total_time / len(transactions), 2) if transactions else 0,
        }

    def get_dashboard_summary(self) -> dict:
        """Get aggregated metrics for the frontend dashboard."""
        stats = self.audit_logger.get_stats()
        records = self.audit_logger.get_records(limit=50)

        # Recent anomaly scores for the timeline chart
        recent_scores = []
        for r in records:
            recent_scores.append({
                "transaction_id": r["transaction_id"],
                "timestamp": r["audit_timestamp"],
                "anomaly_score": r["anomaly_detection"]["score"],
                "threshold": r["anomaly_detection"]["threshold"],
                "outcome": r["decision"]["outcome"],
            })

        # Compliance heatmap data
        compliance_matrix = []
        for r in records[:20]:  # Last 20 transactions
            rule_statuses = {}
            for detail in r.get("compliance", {}).get("triggered_rules", []):
                rule_statuses[detail["rule_id"]] = "fail"
            
            row = {"transaction_id": r["transaction_id"][:20]}
            for rid in [f"R{str(i).zfill(3)}" for i in range(1, 11)]:
                row[rid] = rule_statuses.get(rid, "pass")
            compliance_matrix.append(row)

        return {
            "stats": stats,
            "recent_scores": recent_scores,
            "compliance_matrix": compliance_matrix,
            "model_info": {
                "version": "lstm_ae_v1.0",
                "architecture": "LSTM Autoencoder (Encoder-Decoder)",
                "features": 8,
                "seq_len": 10,
            },
        }

    def _handle_validation_failure(self, ingest_result: IngestResult, start_time: float) -> dict:
        """Handle transactions that fail initial validation."""
        processing_time = round((time.time() - start_time) * 1000, 2)

        return {
            "success": False,
            "transaction_id": ingest_result.transaction_id,
            "outcome": "REJECT",
            "audit_record": {
                "transaction_id": ingest_result.transaction_id,
                "decision": {
                    "outcome": "REJECT",
                    "reasoning": f"Validation failed: {'; '.join(ingest_result.validation_errors)}",
                },
                "processing_time_ms": processing_time,
            },
            "summary": {
                "anomaly_score": None,
                "anomaly_classification": None,
                "rules_passed": False,
                "rules_failed_count": len(ingest_result.validation_errors),
                "decision": "REJECT",
                "reasoning": f"Validation failed: {'; '.join(ingest_result.validation_errors)}",
                "processing_time_ms": processing_time,
            },
        }
