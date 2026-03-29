def make_decision(rules_passed: bool, is_anomaly: bool) -> tuple[str, str]:
    """
    Fuses the deterministic compliance rules output with the probabilistic AI score.
    
    Decision Matrix (Requested by User):
    - Compliance rules fail -> REJECT
    - Compliance rules pass & Anomaly score > threshold -> FLAG
    - Otherwise -> APPROVE
    """
    if not rules_passed:
        return "REJECT", "Transaction violates deterministic compliance guardrails (Hard Rule Failure)."
        
    if is_anomaly:
         return "FLAG", "AI detected unusual latent patterns (High MSE score). Flagging for human review."
         
    return "APPROVE", "Transaction strictly cleared all rules and AI anomaly thresholds."
