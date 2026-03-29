from fastapi import FastAPI, Query, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import math
import sys
import os
import json
import asyncio
from datetime import datetime

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64

from data_loader import load_data
from preprocessing import CCPipelinePreprocessor
from model import LSTMAutoencoder, train_model, predict_anomaly
from compliance_engine import CCComplianceEngine
from decision_engine import make_decision
from audit_logger import CCAuditLogger
import torch
import numpy as np

# Core Instance Setup
app = FastAPI(title="Credit Card Fraud XAI Testing Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = CCAuditLogger()

# Global State for the Pipeline
class PipelineState:
    def __init__(self):
        self.preprocessor = None
        self.model = None
        self.threshold = 0.0
        self.compliance = CCComplianceEngine()
        self.train_df = None
        self.test_df = None
        self.is_ready = False

state = PipelineState()

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for conn in self.active_connections:
            try:
                await conn.send_text(message)
            except Exception:
                disconnected.append(conn)
        for conn in disconnected:
            self.disconnect(conn)

ws_manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    print("="*60)
    print("  INITIALIZING CREDIT CARD MOCK/REAL AI PIPELINE")
    print("="*60)
    try:
        # Load up to 15,000 requests to make it fast but robust
        train_df, test_df = load_data(subset_size=15000)
        state.train_df = train_df
        state.test_df = test_df
        
        preprocessor = CCPipelinePreprocessor()
        preprocessor.fit(train_df)
        train_tensor = preprocessor.transform(train_df)
        
        model = LSTMAutoencoder(input_dim=30)
        model, threshold = train_model(model, train_tensor, epochs=3, batch_size=256)
        
        state.preprocessor = preprocessor
        state.model = model
        state.threshold = threshold
        state.is_ready = True
        print("[System] Pipeline is Armored and Ready.")
    except Exception as e:
        print(f"[System Error] Initialization failed: {e}")

@app.websocket("/ws/finance")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

class SingleTransaction(BaseModel):
    time: float
    amount: float

@app.post("/api/test-single")
async def process_single_transaction(txn: SingleTransaction):
    if not state.is_ready:
        raise HTTPException(status_code=503, detail="Model is still calibrating.")

    # Create a dummy transaction filling v1-v28 with 0.0s (mean of standard scaler)
    raw_dict = {"Time": txn.time, "Amount": txn.amount}
    for i in range(1, 29):
        raw_dict[f"V{i}"] = 0.0
        
    import pandas as pd
    single_df = pd.DataFrame([raw_dict])
    
    # Process
    tensor_input = state.preprocessor.transform(single_df)
    mse_scores, is_anomalies = predict_anomaly(state.model, tensor_input, state.threshold)
    
    mse = float(mse_scores[0])
    is_anomaly = bool(is_anomalies[0])
    rules_passed, failed_rules = state.compliance.evaluate(raw_dict)
    decision, reasoning = make_decision(rules_passed, is_anomaly)
    
    # Log
    result = logger.log_transaction(
        raw_txn=raw_dict,
        mse_score=mse,
        threshold=state.threshold,
        triggered_rules=failed_rules,
        decision=decision,
        reasoning=reasoning
    )
    
    # Format for frontend
    ws_payload = {
        "type": "TRANSACTION_PROCESSED",
        "data": {
            "anomaly_score": mse,
            "decision": decision,
            "reasoning": reasoning,
            "rules_failed_count": len(failed_rules)
        },
        "transaction_id": result["transaction_id"],
        "timestamp": result["system_timestamp"],
    }
    
    await ws_manager.broadcast(json.dumps(ws_payload))
    return result

@app.post("/api/demo/run")
async def process_demo_batch(normal_count: int = 10, anomaly_count: int = 2):
    if not state.is_ready:
        raise HTTPException(status_code=503, detail="Model is not ready.")
        
    num_samples = normal_count + anomaly_count
    batch_df = state.test_df.sample(n=min(num_samples, len(state.test_df)), replace=True)
    
    tensor_input = state.preprocessor.transform(batch_df)
    mse_scores, is_anomalies = predict_anomaly(state.model, tensor_input, state.threshold)
    
    outcomes = {"APPROVE": 0, "FLAG": 0, "REJECT": 0}
    
    for i in range(len(batch_df)):
        raw_txn = batch_df.iloc[i].to_dict()
        mse = float(mse_scores[i])
        is_anomaly = bool(is_anomalies[i])
        
        rules_passed, failed_rules = state.compliance.evaluate(raw_txn)
        decision, reasoning = make_decision(rules_passed, is_anomaly)
        
        outcomes[decision] += 1
        
        result = logger.log_transaction(raw_txn, mse, state.threshold, failed_rules, decision, reasoning)
        
        ws_payload = {
            "type": "TRANSACTION_PROCESSED",
            "data": {
                "anomaly_score": mse,
                "decision": decision,
                "reasoning": reasoning,
                "rules_failed_count": len(failed_rules)
            },
            "transaction_id": result["transaction_id"],
            "timestamp": result["system_timestamp"],
        }
        await ws_manager.broadcast(json.dumps(ws_payload))
        await asyncio.sleep(0.1) # Visually space out websocket events
        
    return {"status": "Complete", "processed": len(batch_df), "outcomes": outcomes}

@app.get("/api/visualize-pca")
def get_visualization():
    """Generates a Matplotlib plot of the Anomaly Distribution"""
    if not state.is_ready or len(logger._logs) == 0:
        return Response(content="Not enough data to scheme", status_code=400)
        
    scores = [log['anomaly_score_mse'] for log in logger._logs[-100:]] # last 100
    times = range(len(scores))
    
    plt.figure(figsize=(8, 4), facecolor='#0f172a')
    ax = plt.axes()
    ax.set_facecolor('#0f172a')
    
    # Styling
    ax.spines['bottom'].set_color('#334155')
    ax.spines['top'].set_color('none') 
    ax.spines['right'].set_color('none')
    ax.spines['left'].set_color('#334155')
    ax.tick_params(axis='x', colors='#94a3b8')
    ax.tick_params(axis='y', colors='#94a3b8')
    
    plt.plot(times, scores, color='#3b82f6', marker='o', markersize=4, linestyle='-', linewidth=1.5, alpha=0.8)
    plt.axhline(y=state.threshold, color='#ef4444', linestyle='--', linewidth=2, label='Detection Threshold')
    
    for i, score in enumerate(scores):
        if score > state.threshold:
            plt.plot(i, score, marker='o', markersize=8, color='#ef4444')
            
    plt.title('MSE Anomaly Distribution (Last 100 Txs)', color='white', pad=20)
    plt.ylabel('Reconstruction Error (MSE)', color='#cbd5e1')
    plt.legend(facecolor='#1e293b', edgecolor='#334155', labelcolor='white')
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return {"image": f"data:image/png;base64,{img_base64}"}

@app.get("/api/compliance/rules")
def get_compliance_rules():
    rules_list = []
    for k, v in state.compliance.rules_config.items():
        rules_list.append({"id": k, **v})
    return {"rules": rules_list}

@app.put("/api/compliance/rules/{rule_id}")
def update_compliance_rule(rule_id: str, update: dict):
    if rule_id in state.compliance.rules_config:
        state.compliance.rules_config[rule_id].update(update)
        return {"updated": True}
    raise HTTPException(status_code=404)

@app.get("/export-audit")
def export_audit_endpoint(format: str = Query("json", regex="(?i)^(json|csv)$")):
    path = logger.export_audit_logs(format=format.lower())
    if not path or not os.path.exists(path):
         raise HTTPException(status_code=404, detail="No audit logs available. Run pipeline first.")
    return FileResponse(path, filename=f"audit_logs.{format.lower()}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
