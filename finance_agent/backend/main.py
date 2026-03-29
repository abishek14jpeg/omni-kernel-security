"""
Finance AI Agent — FastAPI Backend
=====================================
Layer 7: API and Real-Time Communication Layer
Provides REST endpoints and WebSocket for live monitoring.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import json
import time
from datetime import datetime

from data_ingestion import TransactionInput, BatchIngestRequest
from pipeline import FinancePipeline
from ml_models.anomaly_detector import initialize_model, get_model_info
from synthetic_data import generate_normal_transactions, generate_anomalous_transactions

# -------------------------------------------------------------------
# App initialization
# -------------------------------------------------------------------
app = FastAPI(
    title="Finance AI Agent — Automated Financial Close & Compliance",
    description="LSTM Autoencoder anomaly detection + Rule-based compliance guardrails",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
pipeline: Optional[FinancePipeline] = None
ws_manager = None


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
async def startup():
    global pipeline
    print("=" * 60)
    print("  FINANCE AI AGENT — Starting Up")
    print("=" * 60)
    # Initialize the LSTM model (trains on synthetic data)
    initialize_model()
    # Initialize the pipeline
    pipeline = FinancePipeline()
    print("=" * 60)
    print("  FINANCE AI AGENT — Ready on port 8001")
    print("=" * 60)


# -------------------------------------------------------------------
# REST Endpoints
# -------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "Finance AI Agent",
        "version": "1.0.0",
        "status": "online",
        "model": get_model_info(),
    }


@app.post("/api/transactions/process")
async def process_transaction(txn: TransactionInput):
    """Process a single transaction through the full pipeline."""
    result = pipeline.process_transaction(txn)

    # Broadcast to WebSocket clients
    ws_payload = {
        "type": "TRANSACTION_PROCESSED",
        "data": result["summary"],
        "transaction_id": result["transaction_id"],
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    await ws_manager.broadcast(json.dumps(ws_payload, default=str))

    return result


@app.post("/api/transactions/batch-process")
async def process_batch(batch: BatchIngestRequest):
    """Process a batch of transactions through the pipeline."""
    results = pipeline.process_batch(batch.transactions)

    # Broadcast batch summary
    ws_payload = {
        "type": "BATCH_PROCESSED",
        "batch_size": results["batch_size"],
        "outcomes": results["outcomes"],
        "total_time_ms": results["total_processing_time_ms"],
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    await ws_manager.broadcast(json.dumps(ws_payload, default=str))

    return results


@app.post("/api/transactions/ingest")
async def ingest_transactions(batch: BatchIngestRequest):
    """Ingest and validate a batch of transactions (no processing)."""
    from data_ingestion import ingest_batch
    results = ingest_batch(batch)
    return {
        "ingested": len(results),
        "valid": sum(1 for r in results if r.valid),
        "invalid": sum(1 for r in results if not r.valid),
        "results": [r.model_dump() for r in results],
    }


@app.get("/api/anomaly/scores")
def get_anomaly_scores(limit: int = Query(50, ge=1, le=500)):
    """Retrieve recent anomaly scores."""
    records = pipeline.audit_logger.get_records(limit=limit)
    return {
        "count": len(records),
        "scores": [
            {
                "transaction_id": r["transaction_id"],
                "timestamp": r["audit_timestamp"],
                "score": r["anomaly_detection"]["score"],
                "threshold": r["anomaly_detection"]["threshold"],
                "classification": r["anomaly_detection"]["classification"],
                "is_anomaly": r["anomaly_detection"]["is_anomaly"],
            }
            for r in records
        ],
    }


@app.get("/api/compliance/status")
def get_compliance_status():
    """Get compliance dashboard status."""
    stats = pipeline.audit_logger.get_stats()
    return {
        "status": "compliant" if stats["rejection_rate"] < 20 else "at_risk",
        "stats": stats,
        "rules_active": len([r for r in pipeline.compliance_engine.get_rules() if r.get("enabled")]),
    }


@app.get("/api/compliance/rules")
def get_compliance_rules():
    """List all compliance rules."""
    return {"rules": pipeline.compliance_engine.get_rules()}


class RuleUpdate(BaseModel):
    enabled: Optional[bool] = None
    severity: Optional[str] = None
    params: Optional[dict] = None


@app.put("/api/compliance/rules/{rule_id}")
def update_compliance_rule(rule_id: str, update: RuleUpdate):
    """Update a compliance rule dynamically (no model retraining needed)."""
    result = pipeline.compliance_engine.update_rule(rule_id, update.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")
    return {"updated": True, "rule": result}


@app.get("/api/audit/log")
def get_audit_log(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    outcome: Optional[str] = None,
):
    """Retrieve structured audit logs."""
    records = pipeline.audit_logger.get_records(limit=limit, offset=offset, outcome_filter=outcome)
    return {"count": len(records), "records": records}


@app.get("/api/audit/report")
def get_audit_report():
    """Generate a compliance-ready audit report."""
    return pipeline.audit_logger.generate_compliance_report()


@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    """Get aggregated dashboard metrics for the frontend."""
    return pipeline.get_dashboard_summary()


@app.get("/api/model/info")
def get_model_information():
    """Get current model metadata."""
    return get_model_info()


# -------------------------------------------------------------------
# Demo Endpoint — Auto-generate and process sample transactions
# -------------------------------------------------------------------

@app.post("/api/demo/run")
async def run_demo(
    normal_count: int = Query(20, ge=1, le=100),
    anomaly_count: int = Query(5, ge=0, le=50),
):
    """
    Generate synthetic transactions and process them through the pipeline.
    Useful for demonstration and testing.
    """
    normal_txns = generate_normal_transactions(n=normal_count)
    anomalous_txns = generate_anomalous_transactions(n=anomaly_count)

    all_txns = normal_txns + anomalous_txns
    # Shuffle to interleave
    import random
    random.shuffle(all_txns)

    results = []
    for txn_data in all_txns:
        txn_input = TransactionInput(**{
            k: v for k, v in txn_data.items() if k != "_anomaly_type"
        })
        result = pipeline.process_transaction(txn_input)
        results.append(result["summary"])

        # Broadcast each processed transaction to WebSocket
        ws_payload = {
            "type": "TRANSACTION_PROCESSED",
            "data": result["summary"],
            "transaction_id": result["transaction_id"],
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        await ws_manager.broadcast(json.dumps(ws_payload, default=str))
        await asyncio.sleep(0.05)  # Small delay for streaming effect

    stats = pipeline.audit_logger.get_stats()
    return {
        "demo_completed": True,
        "total_processed": len(results),
        "normal_generated": normal_count,
        "anomalies_generated": anomaly_count,
        "outcomes": stats,
        "results": results,
    }


# -------------------------------------------------------------------
# WebSocket — Real-time Financial Monitoring
# -------------------------------------------------------------------

@app.websocket("/ws/finance")
async def websocket_finance(websocket: WebSocket):
    """
    Real-time financial monitoring endpoint.
    Streams:
    - Live transaction processing results
    - Periodic dashboard summary updates
    - Simulated transaction flow when no external input
    """
    await ws_manager.connect(websocket)
    print("[WebSocket] Finance monitoring client connected.")

    try:
        # Send initial dashboard state
        summary = pipeline.get_dashboard_summary()
        await websocket.send_text(json.dumps({
            "type": "DASHBOARD_INIT",
            "data": summary,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }, default=str))

        # Simulation loop — generates and processes transactions
        while True:
            # Generate a mix of normal and occasional anomalous transactions
            import random
            if random.random() < 0.15:
                txns = generate_anomalous_transactions(n=1)
            else:
                txns = generate_normal_transactions(n=1)

            txn_data = txns[0]
            txn_input = TransactionInput(**{
                k: v for k, v in txn_data.items() if k != "_anomaly_type"
            })

            result = pipeline.process_transaction(txn_input)

            # Stream the result
            payload = {
                "type": "TRANSACTION_PROCESSED",
                "data": result["summary"],
                "transaction_id": result["transaction_id"],
                "audit_record": result["audit_record"],
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            await websocket.send_text(json.dumps(payload, default=str))

            # Periodic dashboard summary (every 5th transaction)
            if pipeline.audit_logger._stats["total_processed"] % 5 == 0:
                summary = pipeline.get_dashboard_summary()
                await websocket.send_text(json.dumps({
                    "type": "DASHBOARD_UPDATE",
                    "data": summary,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                }, default=str))

            await asyncio.sleep(2.0)  # 2-second interval

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        print("[WebSocket] Finance monitoring client disconnected.")
    except Exception as e:
        ws_manager.disconnect(websocket)
        print(f"[WebSocket] Error: {e}")


# -------------------------------------------------------------------
# Entry point
# -------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
