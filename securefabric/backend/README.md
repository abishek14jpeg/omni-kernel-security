# SecureFabric Python AI Backend

This is the AI-driven Engine that powers the SecureFabric React frontend, deeply inspired by IEEE Xplore concepts on network forensics.

## Novel Concept: Spatio-Temporal Graph Autoencoder (ST-GAE)
Traditional signature-based IDS fail at Zero-Day attacks. Our `st_gae.py` model runs network telemetry through a sequence-aware PyTorch LSTM Autoencoder. 
By forcing the model to "reconstruct" normal network traffic, any data that maps with a high Mean Squared Error (Reconstruction Loss) is mathematically anomalous—allowing us to detect novel threats without requiring pre-existing signatures. 

## Tech Stack
*   **Engine:** PyTorch (Neural Networks)
*   **Transport:** FastAPI & WebSockets (Async, Real-time JSON pushing)
*   **Data Structure:** Pandas/Numpy (for scaling into actual CSV payloads)

## How to Run it

1. Ensure you have Python installed.
2. Open a new terminal in this `backend` folder.
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The server runs on `http://localhost:8000`.
Your React frontend (`useRealtime.js`) is already configured to connect to `ws://localhost:8000/ws/telemetry`!
If the Python backend is off, the frontend gracefully falls back to mock data.