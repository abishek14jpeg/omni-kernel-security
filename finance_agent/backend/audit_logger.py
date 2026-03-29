"""
Audit Logger
==============
Layer 6: Structured audit logging for every transaction.
Maintains a complete audit trail for compliance reporting.
"""

import json
import time
from datetime import datetime
from typing import List, Dict, Optional
from collections import deque


class AuditLogger:
    """
    Creates and stores structured audit records for every transaction processed.
    Each record contains the complete processing trace: input → features → anomaly score →
    rules evaluated → decision → reasoning.
    """

    def __init__(self, max_records: int = 10000):
        self._records: deque = deque(maxlen=max_records)
        self._stats = {
            "total_processed": 0,
            "approved": 0,
            "flagged": 0,
            "escalated": 0,
            "rejected": 0,
        }

    def create_record(
        self,
        transaction: dict,
        preprocessing_meta: dict,
        ai_result: dict,
        compliance_result: dict,
        decision: dict,
        processing_start_time: float,
    ) -> dict:
        """
        Create a complete audit record for a processed transaction.
        """
        processing_time_ms = round((time.time() - processing_start_time) * 1000, 2)

        record = {
            "transaction_id": transaction.get("transaction_id", "unknown"),
            "audit_timestamp": datetime.utcnow().isoformat() + "Z",
            "input_data": {
                "amount": transaction.get("amount"),
                "type": transaction.get("type"),
                "debit_account": transaction.get("debit_account"),
                "credit_account": transaction.get("credit_account"),
                "initiated_by": transaction.get("initiated_by"),
                "approved_by": transaction.get("approved_by"),
                "description": transaction.get("description"),
                "timestamp": transaction.get("timestamp"),
            },
            "preprocessing": preprocessing_meta,
            "anomaly_detection": {
                "score": ai_result.get("anomaly_score"),
                "threshold": ai_result.get("threshold"),
                "is_anomaly": ai_result.get("is_anomaly"),
                "classification": ai_result.get("classification"),
                "severity": ai_result.get("severity"),
                "model_version": ai_result.get("model_version"),
                "confidence": ai_result.get("confidence"),
            },
            "compliance": {
                "rules_evaluated": compliance_result.get("rules_evaluated"),
                "rules_passed": compliance_result.get("rules_passed"),
                "rules_failed": compliance_result.get("rules_failed"),
                "all_passed": compliance_result.get("passed"),
                "triggered_rules": compliance_result.get("triggered_rules", []),
            },
            "decision": {
                "outcome": decision.get("outcome"),
                "reasoning": decision.get("reasoning"),
                "confidence": decision.get("confidence"),
                "actions": decision.get("actions", []),
            },
            "processing_time_ms": processing_time_ms,
        }

        # Store and update stats
        self._records.append(record)
        self._stats["total_processed"] += 1
        outcome = decision.get("outcome", "")
        outcome_map = {
            "APPROVE": "approved",
            "FLAG": "flagged",
            "ESCALATE": "escalated",
            "REJECT": "rejected",
        }
        stats_key = outcome_map.get(outcome)
        if stats_key and stats_key in self._stats:
            self._stats[stats_key] += 1

        return record

    def get_records(self, limit: int = 100, offset: int = 0, outcome_filter: Optional[str] = None) -> List[dict]:
        """Retrieve audit records with optional filtering."""
        records = list(self._records)

        if outcome_filter:
            records = [r for r in records if r["decision"]["outcome"].upper() == outcome_filter.upper()]

        # Most recent first
        records.reverse()

        return records[offset:offset + limit]

    def get_record(self, transaction_id: str) -> Optional[dict]:
        """Get a single audit record by transaction ID."""
        for record in self._records:
            if record["transaction_id"] == transaction_id:
                return record
        return None

    def get_stats(self) -> dict:
        """Get aggregate processing statistics."""
        total = self._stats["total_processed"]
        return {
            "total_processed": total,
            "approved": self._stats["approved"],
            "flagged": self._stats["flagged"],
            "escalated": self._stats["escalated"],
            "rejected": self._stats["rejected"],
            "approval_rate": round(self._stats["approved"] / total * 100, 1) if total > 0 else 0,
            "rejection_rate": round(self._stats["rejected"] / total * 100, 1) if total > 0 else 0,
        }

    def generate_compliance_report(self) -> dict:
        """
        Generate a compliance-ready audit report.
        Suitable for regulatory review and external audits.
        """
        records = list(self._records)
        stats = self.get_stats()

        # Aggregate rule violations
        rule_violation_counts = {}
        for record in records:
            for rule in record.get("compliance", {}).get("triggered_rules", []):
                rid = rule["rule_id"]
                rule_violation_counts[rid] = rule_violation_counts.get(rid, 0) + 1

        # Anomaly score distribution
        scores = [r["anomaly_detection"]["score"] for r in records if r["anomaly_detection"]["score"] is not None]

        report = {
            "report_id": f"RPT-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "reporting_period": {
                "from": records[0]["audit_timestamp"] if records else None,
                "to": records[-1]["audit_timestamp"] if records else None,
            },
            "summary": stats,
            "anomaly_score_distribution": {
                "min": round(min(scores), 6) if scores else 0,
                "max": round(max(scores), 6) if scores else 0,
                "mean": round(sum(scores) / len(scores), 6) if scores else 0,
            },
            "rule_violation_summary": rule_violation_counts,
            "high_risk_transactions": [
                {
                    "transaction_id": r["transaction_id"],
                    "outcome": r["decision"]["outcome"],
                    "anomaly_score": r["anomaly_detection"]["score"],
                    "triggered_rules": [tr["rule_id"] for tr in r["compliance"]["triggered_rules"]],
                }
                for r in records
                if r["decision"]["outcome"] in ("REJECT", "ESCALATE")
            ],
            "model_info": {
                "version": records[0]["anomaly_detection"]["model_version"] if records else "N/A",
                "threshold": records[0]["anomaly_detection"]["threshold"] if records else None,
            },
        }

        return report

    def clear(self):
        """Clear all audit records."""
        self._records.clear()
        self._stats = {
            "total_processed": 0,
            "approved": 0,
            "flagged": 0,
            "escalated": 0,
            "rejected": 0,
        }
