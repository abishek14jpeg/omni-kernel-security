class CCComplianceEngine:
    """
    Deterministic Financial Guardrails mapping for the CreditCard dataset.
    Validates logical invariants and policy limits using RAW original values (not standardized).
    """
    def __init__(self):
        self.rules_config = {
            "R001": {"name": "Negative Amount Check", "description": "Transaction amounts must be strictly non-negative."},
            "R002": {"name": "Maximum Authorized Limit", "description": "Amounts cannot exceed strict $10,000 corporate limit.", "max_amount": 10000},
            "R003": {"name": "Timing Anomaly", "description": "Transactions strictly outside standard deviation bands (e.g. extreme off-hours) raise concern."},
            "R004": {"name": "Vector Integrity", "description": "PCA V-vectors must contain valid finite numbers."}
        }

    def evaluate(self, raw_txn: dict) -> tuple[bool, list[str]]:
        """
        Runs deterministic checks on a raw transaction dictionary.
        Returns (passed_bool, list_of_failed_rule_ids).
        """
        failed_rules = []
        amount = raw_txn.get('Amount', 0)
        
        # R001: Negative Amount
        if amount < 0:
            failed_rules.append("R001")
            
        # R002: Corporate Spending Limit Break
        if amount > self.rules_config["R002"]["max_amount"]:
            failed_rules.append("R002")
            
        # R004: Vector Integrity (NaN checks)
        has_nans = False
        for k, v in raw_txn.items():
            # If value is string and not a valid float, or is actually nan
            if isinstance(v, float) and v != v:
                has_nans = True
        if has_nans:
            failed_rules.append("R004")
            
        # Optional dummy rule R003 for off-hours (Simulating 2am-4am using Time % 86400)
        time_seconds = raw_txn.get('Time', 0) % 86400
        # 2am = 7200, 4am = 14400
        if 7200 <= time_seconds <= 14400:
            # We fail this rule just to demonstrate rules failing
            failed_rules.append("R003")

        is_compliant = len(failed_rules) == 0
        return is_compliant, failed_rules
