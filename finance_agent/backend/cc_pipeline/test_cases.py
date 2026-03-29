import math

def generate_test_cases():
    """
    Generates diverse transaction payloads to stress test the AI Anomaly Pipeline
    and the Deterministic Compliance Engine.
    Returns: List of dictionaries formatting: 
             {"name": str, "category": str, "expected_decision": str, "payload": dict}
    """
    test_cases = []
    
    # Helper to generate mostly-zero 'standard' principal components (V1-V28)
    def clean_v_features():
        return {f"V{i}": 0.05 for i in range(1, 29)}
        
    def anomalous_v_features():
        # Highly distorted feature vectors (far from mean 0) causing huge reconstruction MSE
        return {f"V{i}": 25.0 if i % 2 == 0 else -18.5 for i in range(1, 29)}

    # ==========================================
    # CATEGORY 1: Normal (Expected APPROVE)
    # ==========================================
    payload_normal = {"Time": 3600, "Amount": 150.0}
    payload_normal.update(clean_v_features())
    test_cases.append({
        "name": "Standard Low-Risk Transaction",
        "category": "Normal",
        "expected_decision": "APPROVE",
        "payload": payload_normal
    })

    # ==========================================
    # CATEGORY 2: Anomalous AI Detection (Expected FLAG)
    # ==========================================
    # Compliant by rules (Amount < 10000, Positive, Valid Time), but AI should flag MSE.
    payload_anomaly = {"Time": 5000, "Amount": 850.0}
    payload_anomaly.update(anomalous_v_features())
    test_cases.append({
        "name": "Probabilistic Fraud Detection (High MSE)",
        "category": "Anomaly",
        "expected_decision": "FLAG",
        "payload": payload_anomaly
    })

    # ==========================================
    # CATEGORY 3: Rule Violations (Expected REJECT)
    # ==========================================
    # Clean vectors (low MSE expected), but hard rules violated.
    
    # 3a. Exceeds Max Limit (Rule R002)
    payload_rule1 = {"Time": 4000, "Amount": 75000.0}
    payload_rule1.update(clean_v_features())
    test_cases.append({
        "name": "Corporate Limit Exceeded (> $10k)",
        "category": "Rule Violation",
        "expected_decision": "REJECT",
        "payload": payload_rule1
    })
    
    # 3b. Negative Amount (Rule R001)
    payload_rule2 = {"Time": 4200, "Amount": -50.0}
    payload_rule2.update(clean_v_features())
    test_cases.append({
        "name": "Negative Transaction Amount",
        "category": "Rule Violation",
        "expected_decision": "REJECT",
        "payload": payload_rule2
    })
    
    # 3c. Timing Violation (R003: simulated off-hours 2am-4am -> 7200-14400s)
    payload_rule3 = {"Time": 8000, "Amount": 200.0}
    payload_rule3.update(clean_v_features())
    test_cases.append({
        "name": "Suspicious Timing (Off-Hours Matrix)",
        "category": "Rule Violation",
        "expected_decision": "REJECT",
        "payload": payload_rule3
    })

    # ==========================================
    # CATEGORY 4: Combined Failure (Expected REJECT)
    # ==========================================
    # Both anomalous V vectors AND compliance rule violation. 
    # Must prioritize REJECT (Compliance override) over FLAG (AI probability).
    payload_combined = {"Time": 9000, "Amount": 150000.0} # Rule R002 & R003
    payload_combined.update(anomalous_v_features())
    test_cases.append({
        "name": "AI Anomaly + Rule Violations Override",
        "category": "Combined",
        "expected_decision": "REJECT",
        "payload": payload_combined
    })

    # ==========================================
    # CATEGORY 5: Edge Cases (Expected REJECT / GRACEFUL EXCEPTION HANDLING)
    # ==========================================
    
    # 5a. Vector Integrity Failure (R004) - Includes NaN
    payload_edge1 = {"Time": 3600, "Amount": 500.0}
    payload_edge1.update(clean_v_features())
    payload_edge1["V5"] = float('nan')
    test_cases.append({
        "name": "Vector Integrity (NaN presence)",
        "category": "Edge Case",
        "expected_decision": "REJECT",
        "payload": payload_edge1
    })
    
    # 5b. Missing Fields & Malformed Type (Handled by preprocessor / Rules)
    # We will simulate injecting strings where floats are expected to see system resilience.
    # Note: If the system crashes, the test runner catches it as a failure. We expect REJECT or gracefully handled error.
    payload_edge2 = {"Time": 3600, "Amount": 150.0}
    payload_edge2.update(clean_v_features())
    payload_edge2["V12"] = "String Injection" # Invalid Datatype
    test_cases.append({
        "name": "Malformed Datatype Injection",
        "category": "Edge Case",
        "expected_decision": "REJECT",
        "payload": payload_edge2
    })

    return test_cases
