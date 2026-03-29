import json
import csv
import os
import uuid
from datetime import datetime

class CCAuditLogger:
    """
    In-memory and persistent storage for strict transaction telemetry.
    Matches the exact dataset keys (Time, Amount) while adding robust UUID tracking.
    """
    def __init__(self):
        self._logs = []
        self.export_dir = os.path.join(os.path.dirname(__file__), '..', 'exports')
        os.makedirs(self.export_dir, exist_ok=True)

    def log_transaction(self, raw_txn: dict, mse_score: float, threshold: float, triggered_rules: list, decision: str, reasoning: str):
        """
        Builds and commits a single transparent JSON audit record.
        """
        entry = {
            "transaction_id": raw_txn.get("transaction_id", f"CC-{uuid.uuid4().hex[:8].upper()}"),
            "system_timestamp": datetime.utcnow().isoformat() + "Z",
            "dataset_time_sec": raw_txn.get('Time', 0),
            "amount": raw_txn.get('Amount', 0.0),
            "input_v_sum": sum([raw_txn.get(f"V{i}", 0) for i in range(1, 29)]), # Abridged feature summary
            "anomaly_score_mse": round(float(mse_score), 6),
            "threshold": round(float(threshold), 6),
            "rules_triggered": triggered_rules,
            "final_decision": decision,
            "reasoning": reasoning
        }
        self._logs.append(entry)
        return entry

    def export_audit_logs(self, format="json") -> str:
        """
        Reusable function exporting the entire telemetry vault to flat files.
        """
        if not self._logs:
            print("[AuditLogger] Warning: Attempting to export empty telemetry vault.")
            return None
            
        if format.lower() == "json":
            file_path = os.path.join(self.export_dir, 'audit_logs.json')
            with open(file_path, 'w') as f:
                json.dump(self._logs, f, indent=4)
            print(f"[AuditLogger] Telemetry exported successfully -> {file_path}")
            return file_path
            
        elif format.lower() == "csv":
            file_path = os.path.join(self.export_dir, 'audit_logs.csv')
            keys = self._logs[0].keys()
            with open(file_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                # Ensure list fields are stringified for CSV
                export_data = []
                for row in self._logs:
                    csv_row = row.copy()
                    csv_row["rules_triggered"] = "|".join(row["rules_triggered"])
                    export_data.append(csv_row)
                writer.writerows(export_data)
            print(f"[AuditLogger] Telemetry exported successfully -> {file_path}")
            return file_path
            
        else:
            raise ValueError("Unsupported format requested. Must be 'json' or 'csv'.")
