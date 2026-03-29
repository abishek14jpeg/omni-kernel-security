"""
Rule-Based Compliance Engine
==============================
Layer 4: Deterministic financial rule evaluation.
Rules are loaded from rules_config.json and can be updated at runtime.
This layer enforces guardrails that the AI model CANNOT override.
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Optional


class ComplianceEngine:
    """
    Evaluates financial transactions against a configurable set of compliance rules.
    Rule failures ALWAYS result in rejection/escalation, regardless of AI classification.
    """

    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), "rules_config.json")
        self.config_path = config_path
        self.rules = []
        self._recent_transactions = []  # Window for duplicate detection
        self._load_rules()

    def _load_rules(self):
        """Load rules from JSON config file."""
        with open(self.config_path, 'r') as f:
            config = json.load(f)
        self.rules = config.get("rules", [])
        print(f"[Compliance] Loaded {len(self.rules)} rules from config.")

    def reload_rules(self):
        """Hot-reload rules from config without restarting."""
        self._load_rules()

    def get_rules(self):
        """Return all configured rules."""
        return self.rules

    def get_rule(self, rule_id: str):
        """Get a single rule by ID."""
        for rule in self.rules:
            if rule["id"] == rule_id:
                return rule
        return None

    def update_rule(self, rule_id: str, updates: dict):
        """
        Update a rule's parameters at runtime.
        Persists changes to the config file.
        """
        for rule in self.rules:
            if rule["id"] == rule_id:
                if "params" in updates:
                    rule["params"].update(updates["params"])
                if "enabled" in updates:
                    rule["enabled"] = updates["enabled"]
                if "severity" in updates:
                    rule["severity"] = updates["severity"]

                # Persist to file
                self._save_rules()
                return rule
        return None

    def _save_rules(self):
        """Persist current rules to config file."""
        config = {
            "version": "1.0",
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "rules": self.rules,
        }
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)

    def evaluate(self, transaction: dict) -> dict:
        """
        Evaluate a transaction against all enabled compliance rules.

        Returns:
            {
                "passed": bool,
                "rules_evaluated": int,
                "rules_passed": int,
                "rules_failed": int,
                "triggered_rules": [...],
                "details": [...]
            }
        """
        results = []
        triggered = []

        for rule in self.rules:
            if not rule.get("enabled", True):
                continue

            rule_id = rule["id"]
            result = self._evaluate_rule(rule, transaction)
            results.append(result)

            if not result["passed"]:
                triggered.append({
                    "rule_id": rule_id,
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "message": result["message"],
                })

        passed_count = sum(1 for r in results if r["passed"])
        failed_count = sum(1 for r in results if not r["passed"])

        # Add to recent transactions window for duplicate detection
        self._recent_transactions.append(transaction)
        if len(self._recent_transactions) > 1000:
            self._recent_transactions = self._recent_transactions[-500:]

        return {
            "passed": failed_count == 0,
            "rules_evaluated": len(results),
            "rules_passed": passed_count,
            "rules_failed": failed_count,
            "triggered_rules": triggered,
            "details": results,
        }

    def _evaluate_rule(self, rule: dict, txn: dict) -> dict:
        """Dispatch to the appropriate rule evaluator."""
        rule_id = rule["id"]
        params = rule.get("params", {})

        evaluators = {
            "R001": self._check_double_entry,
            "R002": self._check_amount_limit,
            "R003": self._check_approval_threshold,
            "R004": self._check_segregation_of_duties,
            "R005": self._check_duplicates,
            "R006": self._check_authorized_accounts,
            "R007": self._check_timing_anomaly,
            "R008": self._check_required_fields,
            "R009": self._check_ledger_consistency,
            "R010": self._check_policy_violation,
        }

        evaluator = evaluators.get(rule_id)
        if evaluator:
            return evaluator(txn, params)

        return {"rule_id": rule_id, "passed": True, "message": "Rule not implemented"}

    def _check_double_entry(self, txn: dict, params: dict) -> dict:
        """R001: Total debits must equal total credits."""
        debit = txn.get("debit_amount", 0)
        credit = txn.get("credit_amount", 0)
        tolerance = params.get("tolerance", 0.01)

        passed = abs(debit - credit) <= tolerance
        msg = (
            f"Balanced: debit=${debit:,.2f} credit=${credit:,.2f}"
            if passed
            else f"UNBALANCED: debit=${debit:,.2f} ≠ credit=${credit:,.2f} (diff=${abs(debit - credit):,.2f})"
        )
        return {"rule_id": "R001", "passed": passed, "message": msg}

    def _check_amount_limit(self, txn: dict, params: dict) -> dict:
        """R002: Amount must not exceed maximum threshold."""
        amount = txn.get("amount", 0)
        max_amount = params.get("max_amount", 1_000_000)

        passed = amount <= max_amount
        msg = (
            f"Amount ${amount:,.2f} within limit ${max_amount:,.2f}"
            if passed
            else f"EXCEEDS LIMIT: ${amount:,.2f} > ${max_amount:,.2f}"
        )
        return {"rule_id": "R002", "passed": passed, "message": msg}

    def _check_approval_threshold(self, txn: dict, params: dict) -> dict:
        """R003: High-value transactions require approval."""
        amount = txn.get("amount", 0)
        threshold = params.get("approval_threshold", 50_000)

        if amount <= threshold:
            return {"rule_id": "R003", "passed": True, "message": f"Amount ${amount:,.2f} below approval threshold"}

        approved_by = txn.get("approved_by")
        passed = approved_by is not None and approved_by.strip() != ""
        msg = (
            f"Approved by {approved_by}"
            if passed
            else f"MISSING APPROVAL: ${amount:,.2f} exceeds ${threshold:,.2f} threshold but no approver"
        )
        return {"rule_id": "R003", "passed": passed, "message": msg}

    def _check_segregation_of_duties(self, txn: dict, params: dict) -> dict:
        """R004: Initiator and approver must be different."""
        initiator = txn.get("initiated_by", "")
        approver = txn.get("approved_by")

        if not approver:
            return {"rule_id": "R004", "passed": True, "message": "No approver set (low-value)"}

        passed = initiator.lower() != approver.lower()
        msg = (
            f"Segregation OK: {initiator} ≠ {approver}"
            if passed
            else f"SEGREGATION VIOLATION: initiator '{initiator}' == approver '{approver}'"
        )
        return {"rule_id": "R004", "passed": passed, "message": msg}

    def _check_duplicates(self, txn: dict, params: dict) -> dict:
        """R005: No duplicate transactions within time window."""
        time_window = params.get("time_window_minutes", 5)

        try:
            txn_time = datetime.fromisoformat(txn.get("timestamp", ""))
        except (ValueError, TypeError):
            return {"rule_id": "R005", "passed": True, "message": "Cannot parse timestamp, skipping"}

        txn_amount = txn.get("amount", 0)
        txn_account = txn.get("debit_account", "")
        txn_ref = txn.get("reference_number", "")

        for prev in self._recent_transactions:
            if prev.get("transaction_id") == txn.get("transaction_id"):
                continue
            try:
                prev_time = datetime.fromisoformat(prev.get("timestamp", ""))
            except (ValueError, TypeError):
                continue

            time_diff = abs((txn_time - prev_time).total_seconds()) / 60.0

            if (
                time_diff <= time_window
                and prev.get("amount") == txn_amount
                and prev.get("debit_account") == txn_account
                and prev.get("reference_number") == txn_ref
            ):
                return {
                    "rule_id": "R005",
                    "passed": False,
                    "message": f"DUPLICATE DETECTED: matches {prev.get('transaction_id')} within {time_window}min",
                }

        return {"rule_id": "R005", "passed": True, "message": "No duplicates found"}

    def _check_authorized_accounts(self, txn: dict, params: dict) -> dict:
        """R006: Accounts must be in the approved chart."""
        approved = set(params.get("approved_accounts", []))
        debit_acc = txn.get("debit_account", "")
        credit_acc = txn.get("credit_account", "")

        issues = []
        if debit_acc and debit_acc not in approved:
            issues.append(f"debit account '{debit_acc}'")
        if credit_acc and credit_acc not in approved:
            issues.append(f"credit account '{credit_acc}'")

        passed = len(issues) == 0
        msg = (
            "All accounts authorized"
            if passed
            else f"UNAUTHORIZED: {', '.join(issues)} not in approved chart"
        )
        return {"rule_id": "R006", "passed": passed, "message": msg}

    def _check_timing_anomaly(self, txn: dict, params: dict) -> dict:
        """R007: Transactions outside business hours need override."""
        start_hour = params.get("business_hours_start", 7)
        end_hour = params.get("business_hours_end", 19)

        try:
            ts = datetime.fromisoformat(txn.get("timestamp", ""))
        except (ValueError, TypeError):
            return {"rule_id": "R007", "passed": True, "message": "Cannot parse timestamp"}

        hour = ts.hour
        is_business_hours = start_hour <= hour < end_hour
        is_weekday = ts.weekday() < 5

        override = txn.get("after_hours_override", False)

        passed = (is_business_hours and is_weekday) or override
        msg = (
            f"Transaction at {ts.strftime('%H:%M')} within business hours"
            if passed
            else f"TIMING ANOMALY: {ts.strftime('%A %H:%M')} is outside business hours ({start_hour}:00-{end_hour}:00)"
        )
        return {"rule_id": "R007", "passed": passed, "message": msg}

    def _check_required_fields(self, txn: dict, params: dict) -> dict:
        """R008: All mandatory fields must be present."""
        required = params.get("required_fields", [])
        missing = []

        for field in required:
            val = txn.get(field)
            if val is None or (isinstance(val, str) and val.strip() == ""):
                missing.append(field)

        passed = len(missing) == 0
        msg = (
            "All required fields present"
            if passed
            else f"MISSING FIELDS: {', '.join(missing)}"
        )
        return {"rule_id": "R008", "passed": passed, "message": msg}

    def _check_ledger_consistency(self, txn: dict, params: dict) -> dict:
        """R009: Debit and credit amounts must be positive."""
        debit = txn.get("debit_amount", 0)
        credit = txn.get("credit_amount", 0)
        amount = txn.get("amount", 0)

        issues = []
        if debit < 0:
            issues.append(f"negative debit: {debit}")
        if credit < 0:
            issues.append(f"negative credit: {credit}")
        if amount < 0:
            issues.append(f"negative amount: {amount}")
        if amount > 0 and debit == 0 and credit == 0:
            issues.append("amount set but no debit/credit entries")

        passed = len(issues) == 0
        msg = (
            "Ledger entries consistent"
            if passed
            else f"LEDGER INCONSISTENCY: {'; '.join(issues)}"
        )
        return {"rule_id": "R009", "passed": passed, "message": msg}

    def _check_policy_violation(self, txn: dict, params: dict) -> dict:
        """R010: Description must not match violation patterns."""
        patterns = params.get("violation_patterns", [])
        description = txn.get("description", "")

        for pattern in patterns:
            if re.search(pattern, description):
                return {
                    "rule_id": "R010",
                    "passed": False,
                    "message": f"POLICY VIOLATION: description matches pattern '{pattern}'",
                }

        return {"rule_id": "R010", "passed": True, "message": "No policy violations detected"}
