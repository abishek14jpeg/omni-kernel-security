from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import time
from datetime import datetime
from pydantic import BaseModel
import matplotlib
import matplotlib.pyplot as plt
import io
import base64
import numpy as np

# Ensure matplotlib runs headless and doesn't block
matplotlib.use('Agg')

# Import our PyTorch Anomaly Detector
from ml_models.st_gae import initialize_model, detect_anomaly

app = FastAPI(title="SecureFabric AI Core Backend", version="2.0")

# CORS so React can hit the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the PyTorch Model into memory on startup
ai_model = initialize_model()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass # ignore closed connections

manager = ConnectionManager()


@app.get("/")
def read_root():
    return {"status": "SecureFabric AI Engine is Online.", "gpu_accelerated": False}

class ScanRequest(BaseModel):
    target: str
    bytes_transferred: int = 25000
    packet_count: int = 1500
    duration_seconds: int = 30
    port_entropy: float = 0.5
    protocol_type: str = "TCP"

@app.post("/api/scan")
def active_scan(request: ScanRequest):
    """
    Allows the user to manually input a target with custom parameters 
    and run a synchronous PyTorch Spatio-Temporal evaluation with Matplotlib output.
    """
    # Simulate synthesizing the raw node data for the requested target
    raw_node_data = {
        "source_ip": request.target,
        "bytes_transferred": request.bytes_transferred,
        "packet_count": request.packet_count,
        "duration": request.duration_seconds,
        "timestamp": datetime.now().isoformat()
    }
    
    # Run through the PyTorch Spatio-Temporal Model
    ai_inference = detect_anomaly(ai_model, raw_node_data)
    
    # -----------------------------------------------------
    # Matplotlib Generation: Multi-Panel Data Science Dashboard
    # -----------------------------------------------------
    plt.style.use('dark_background')
    fig = plt.figure(figsize=(10, 6))
    gs = fig.add_gridspec(2, 2, height_ratios=[1.2, 1])
    
    # -----------------------------------------------------
    # Ax1: Top full width (Line Chart - Spatio-Temporal Loss)
    # -----------------------------------------------------
    ax1 = fig.add_subplot(gs[0, :])
    time_steps = np.linspace(0, request.duration_seconds, 100)
    baseline_loss = np.random.normal(0.2, 0.05, 100)
    threat_score = ai_inference["threat_score"] / 100.0
    actual_loss = baseline_loss + (time_steps / request.duration_seconds) * threat_score * 0.8
    
    plot_color = '#c93b5d' if threat_score > 0.6 else '#4ade80'
    fill_color = '#e6ced6' if threat_score > 0.6 else '#15803d'
    
    ax1.plot(time_steps, actual_loss, color=plot_color, linewidth=2)
    ax1.fill_between(time_steps, actual_loss, alpha=0.2, color=fill_color)
    ax1.axhline(y=0.6, color='yellow', linestyle='--', alpha=0.5, label='Anomaly Threshold')
    
    ax1.set_title(f'Spatio-Temporal Edge Loss: {request.target}', fontsize=12, color='#f8fafc', fontfamily='serif', style='italic')
    ax1.set_ylabel('MSE Loss', fontsize=9, color='#94a3b8')
    ax1.tick_params(colors='#64748b', labelsize=8)
    ax1.grid(True, linestyle=':', alpha=0.3, color='#334155')
    ax1.legend(fontsize=8, loc='upper left', frameon=False, labelcolor='#94a3b8')
    
    # -----------------------------------------------------
    # Ax2: Bottom Left (Bar Chart - Protocol Distribution)
    # -----------------------------------------------------
    ax2 = fig.add_subplot(gs[1, 0])
    protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'DNS']
    base_dist = [np.random.randint(50, 200) for _ in protocols]
    
    if request.protocol_type in protocols:
        base_dist[protocols.index(request.protocol_type)] += int(request.packet_count)
        
    ax2.bar(protocols, base_dist, color=['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'])
    ax2.set_title('Protocol Vector Distribution (Packets)', fontsize=10, color='#f8fafc', fontfamily='serif', style='italic')
    ax2.tick_params(colors='#64748b', labelsize=8)
    ax2.grid(True, axis='y', linestyle=':', alpha=0.3, color='#334155')

    # -----------------------------------------------------
    # Ax3: Bottom Right (Pie Chart - Threat Categorization)
    # -----------------------------------------------------
    ax3 = fig.add_subplot(gs[1, 1])
    if threat_score > 0.6:
        labels = ['Lateral Movement', 'Anomalous Port Scan', 'Benign Baseline']
        # Use port_entropy to arbitrarily size the anomaly slices
        sizes = [abs(request.port_entropy) * 100, (threat_score * 100) * 0.5, 20]
        colors = ['#c93b5d', '#f43f5e', '#1e293b']
        explode = (0.1, 0, 0)
    else:
        labels = ['Benign Baseline', 'Minor Variance', 'Noise']
        sizes = [70, 20, 10]
        colors = ['#10b981', '#34d399', '#1e293b']
        explode = (0.05, 0, 0)
        
    ax3.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%',
            shadow=False, startangle=90, textprops={'fontsize': 8, 'color': '#f8fafc'})
    ax3.set_title(f'AI Risk Categorization (Entropy: {request.port_entropy})', fontsize=10, color='#f8fafc', fontfamily='serif', style='italic')

    plt.tight_layout()
    
    # Save to buffer as base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png', transparent=True, dpi=120)
    buf.seek(0)
    plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    
    return {
        "target": request.target,
        "scan_time": raw_node_data["timestamp"],
        "ai_analysis": ai_inference,
        "input_params": {
            "bytes": request.bytes_transferred,
            "packets": request.packet_count,
            "duration": request.duration_seconds,
            "entropy": request.port_entropy,
            "protocol": request.protocol_type
        },
        "plot_base64": plot_base64
    }


@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """
    This endpoint pushes live, AI-analyzed telemetry data directly to the React frontend.
    It runs an infinite loop generating network frames, running them through PyTorch, 
    and broadcasting the results.
    """
    await manager.connect(websocket)
    try:
        while True:
            # 1. Simulate pulling raw network telemetry
            raw_node_data = {
                "source_ip": f"10.0.0.{random.randint(1, 255)}",
                "bytes_transferred": random.randint(100, 5000),
                "timestamp": datetime.now().isoformat()
            }
            
            # 2. Feed raw data to the PyTorch Spatio-Temporal Model
            ai_inference = detect_anomaly(ai_model, raw_node_data)
            
            # 3. Combine it into a rich payload for the Editorial UI
            payload = {
                "type": "NETWORK_TELEMETRY",
                "data": raw_node_data,
                "ai_analysis": ai_inference
            }
            
            # 4. Stream to frontend clients
            await manager.broadcast(json.dumps(payload))
            
            # 5. Wait a moment to create a "pulsing" data flow effect
            await asyncio.sleep(1.5)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Frontend client disconnected.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
