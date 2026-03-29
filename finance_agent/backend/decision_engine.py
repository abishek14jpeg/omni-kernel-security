"""
Decision Engine
================
Layer 5: Combines probabilistic AI outputs with deterministic rule evaluations.
Produces final outcomes: Approve, Flag, Escalate, or Reject.

CRITICAL GUARDRAIL: Rule failures ALWAYS result in Reject/Escalate,
even if the AI model classifies the transaction as normal.
"""

from datetime import datetime
from typing import Dict


class DecisionEngine:
    """
    Decision Matrix:
    ┌──────────────────────┬──────────────────┬──────────────────┐
    │                      │ Rules PASS       │ Rules FAIL       │
    ├──────────────────────┼──────────────────┼──────────────────┤
    │ AI: Normal           │ ✅ APPROVE       │ ❌ REJECT        │
    │ AI: Suspicious       │ ⚠️ FLAG          │ ❌ REJECT        │
    │ AI: High Anomaly     │ 🔺 ESCALATE      │ ❌ REJECT        │
    │ AI: Critical Anomaly │ 🔺 ESCALATE      │ ❌ REJECT        │
    └──────────────────────┴──────────────────┴──────────────────┘
    """

    OUTCOMES = {
        "APPROVE": {"action": "log", "color": "#10b981", "priority": 0},
        "FLAG": {"action": "alert", "color": "#f59e0b", "priority": 1},
        "ESCALATE": {"action": "escalate", "color": "#3b82f6", "priority": 2},
        "REJECT": {"action": "reject", "color": "#f43f5e", "priority": 3},
    }

    def decide(self, ai_result: dict, compliance_result: dict, transaction: dict) -> dict:
        """
        Make final decision based on AI anomaly detection and compliance results.
        
        Args:
            ai_result: Output from anomaly_detector.detect_anomaly()
            compliance_result: Output from compliance_engine.evaluate()
            transaction: Original transaction data
            
        Returns:
            Decision record with outcome, reasoning, actions, and metadata
        """
        ai_classification = ai_result.get("classification", "Normal")
        ai_score = ai_result.get("anomaly_score", 0)
        ai_threshold = ai_result.get("threshold", 0)
        rules_passed = compliance_result.get("passed", True)
        triggered_rules = compliance_result.get("triggered_rules", [])

        # === DECISION MATRIX ===
        if not rules_passed:
            # Rules FAIL → REJECT (always, regardless of AI)
            outcome = "REJECT"
            reasoning = self._build_rejection_reasoning(ai_classification, triggered_rules)
        elif ai_classification == "Normal":
            outcome = "APPROVE"
            reasoning = f"AI classification: Normal (score {ai_score:.6f} < θ {ai_threshold:.6f}). All {compliance_result.get('rules_evaluated', 0)} compliance rules passed."
        elif ai_classification == "Suspicious":
            outcome = "FLAG"
            reasoning = f"AI flagged as Suspicious (score {ai_score:.6f} > θ {ai_threshold:.6f}). All compliance rules passed but manual review recommended."
        else:
            # High Anomaly or Critical Anomaly
            outcome = "ESCALATE"
            reasoning = f"AI detected {ai_classification} (score {ai_score:.6f} >> θ {ai_threshold:.6f}). Escalated for senior review despite compliance rules passing."

        # Build decision record
        decision = {
            "outcome": outcome,
            "outcome_metadata": self.OUTCOMES[outcome],
            "reasoning": reasoning,
            "confidence": self._compute_confidence(ai_result, compliance_result),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "ai_classification": ai_classification,
            "ai_score": ai_score,
            "rules_passed": rules_passed,
            "triggered_rules_count": len(triggered_rules),
            "actions": self._determine_actions(outcome, transaction, triggered_rules),
        }

        return decision

    def _build_rejection_reasoning(self, ai_class: str, triggered_rules: list) -> str:
        """Build detailed rejection reasoning."""
        rule_names = [r["rule_name"] for r in triggered_rules]
        severities = [r["severity"] for r in triggered_rules]
        
        msg = f"REJECTED — {len(triggered_rules)} compliance rule(s) violated: {', '.join(rule_names)}. "
        msg += f"Severity levels: {', '.join(severities)}. "
        msg += f"AI classification was '{ai_class}' but GUARDRAIL OVERRIDE applied — "
        msg += "rule failures always result in rejection regardless of AI output."
        return msg

    def _compute_confidence(self, ai_result: dict, compliance_result: dict) -> float:
        """
        Compute decision confidence (0-1).
        High when AI and rules agree, lower when they conflict.
        """
        ai_is_normal = ai_result.get("classification") == "Normal"
        rules_pass = compliance_result.get("passed", True)

        if ai_is_normal and rules_pass:
            return 0.98  # Both agree: normal
        elif not ai_is_normal and not rules_pass:
            return 0.95  # Both agree: problematic
        elif not rules_pass:
            return 0.90  # Rules override AI (still confident in rejection)
        else:
            return 0.75  # AI flags but rules pass (uncertain)

    def _determine_actions(self, outcome: str, transaction: dict, triggered_rules: list) -> list:
        """Determine post-decision actions."""
        actions = []

        # Always log
        actions.append({
            "type": "log",
            "description": f"Transaction {transaction.get('transaction_id', 'unknown')} logged with outcome: {outcome}",
        })

        if outcome == "FLAG":
            actions.append({
                "type": "alert",
                "description": "Manual review alert sent to compliance team",
                "channel": "compliance_queue",
            })

        elif outcome == "ESCALATE":
            actions.append({
                "type": "escalate",
                "description": "Escalated to senior management for review",
                "channel": "escalation_queue",
            })
            actions.append({
                "type": "alert",
                "description": "High-priority alert sent to CFO dashboard",
                "channel": "executive_alerts",
            })

        elif outcome == "REJECT":
            actions.append({
                "type": "reject",
                "description": "Transaction rejected and blocked from posting",
            })
            actions.append({
                "type": "alert",
                "description": f"Rejection alert with {len(triggered_rules)} rule violation(s)",
                "channel": "compliance_queue",
            })

        return actions
