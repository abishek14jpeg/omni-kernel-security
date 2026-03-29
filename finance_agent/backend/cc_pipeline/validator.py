class TestingValidator:
    """
    Validates output precision of the CC Pipeline and tracks robust test coverage statistics.
    """
    def __init__(self):
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.results = []
    
    def validate(self, case_name: str, category: str, expected: str, actual: str, mse: float, rules_triggered: list):
        """Assesses adherence to expected system behavior."""
        self.total_tests += 1
        
        passed = (actual == expected)
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = f"❌ FAIL (Expected: {expected}, Got: {actual})"
            
        result = {
            "name": case_name,
            "category": category,
            "status": status,
            "mse": mse,
            "rules": rules_triggered
        }
        self.results.append(result)
        
        print(f"[{status}] {category}: {case_name}")
        if not passed:
            print(f"    ↳ MSE: {mse:.4f} | Triggered Rules: {rules_triggered}")
            
        return passed

    def print_summary(self):
        """Generates a professional terminal report."""
        print("\n" + "="*50)
        print("  AI AGENT TESTING DOMAIN VALIDATION REPORT")
        print("="*50)
        print(f"Total Test Cases Executed : {self.total_tests}")
        print(f"Passed Correctly          : {self.passed_tests}")
        print(f"Execution Failures        : {self.failed_tests}")
        
        accuracy = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        print(f"System Accuracy           : {accuracy:.2f}%")
        
        if self.failed_tests == 0:
            print("\n✅ SYSTEM IS FULLY COMPLIANT AND PRODUCTION-READY.")
        else:
            print("\n❌ SYSTEM FAILS COMPLIANCE REQUIREMENTS.")
        print("="*50 + "\n")
