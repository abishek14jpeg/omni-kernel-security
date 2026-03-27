import { useState, useEffect, useRef } from 'react';
import { systemMetrics, telemetryStream } from '../data/mockData';

export function useRealtime(intervalMs = 2000) {
  const [metrics, setMetrics] = useState(systemMetrics);
  const [tick, setTick] = useState(0);
  const [telemetry, setTelemetry] = useState(telemetryStream);
  const [connected, setConnected] = useState(false);
  const [nsaoData, setNsaoData] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    // 1. Attempt to connect to the new Python AI Backend
    ws.current = new WebSocket("ws://localhost:8000/ws/telemetry");

    ws.current.onopen = () => {
      console.log("Connected to SecureFabric PyTorch Backend");
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "NETWORK_TELEMETRY") {
        setTick(t => t + 1);
        
        // Store the NSAO orchestration data
        if (payload.ai_analysis.nsao_orchestration) {
          setNsaoData(payload.ai_analysis.nsao_orchestration);
        }

        // Use AI inference to drive the Risk Score
        setMetrics(prev => ({
          ...prev,
          eventsPerSecond: payload.data.bytes_transferred * 10,
          riskScore: payload.ai_analysis.threat_score, // Live risk score from ST-GAE PyTorch Model
          anomaliesDetected: payload.ai_analysis.classification === "Benign" ? prev.anomaliesDetected : prev.anomaliesDetected + 1,
        }));

        setTelemetry(prev => {
          const newPoint = { 
            time: new Date().toLocaleTimeString().split(' ')[0], 
            syscalls: payload.data.bytes_transferred * 12, 
            networkEvents: payload.data.bytes_transferred,
            anomalies: payload.ai_analysis.reconstruction_loss * 10,
            ai_loss: payload.ai_analysis.reconstruction_loss // Explicit ML stat
          };
          const trimmed = prev.length >= 12 ? prev.slice(1) : prev;
          return [...trimmed, newPoint];
        });
      }
    };

    ws.current.onerror = (error) => {
      console.warn("WebSocket not found. Falling back to simulated interval data.");
      setConnected(false);
    };

    // 2. Fallback: If Backend isn't running, use the interval simulation
    const interval = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) return; // Skip if connected

      setTick(t => t + 1);
      
      setMetrics(prev => {
        const mockedScore = Math.max(40, Math.min(95, prev.riskScore + (Math.random() - 0.45) * 4));
        
        if (mockedScore > 75) {
          setNsaoData({
            incident_analysis: {
              mitre_mapping: "T1071.001",
              severity_score: (mockedScore / 100).toFixed(2),
              root_cause_summary: `Anomaly detected in subgraph. Spatio-Temporal pattern matches simulated threat.`,
              temporal_evolution: "Traffic intensity increased dramatically over the sliding window."
            },
            visual_directives: {
              active_subgraph: ["10.0.0.15", "Database_Mock", "External_Mock"],
              dashboard_state: mockedScore > 85 ? "CRITICAL_ALERT" : "WARNING",
              ui_vibrancy_modifier: 0.8
            },
            remediation_payload: {
              action_type: "CONTAINMENT",
              commands: ["iptables -A INPUT -s 10.0.0.15 -j DROP", "kubectl isolate ns/threat"],
              policy_check: "SUCCESS"
            },
            agent_confidence: 0.98
          });
        } else {
          setNsaoData({
            visual_directives: { dashboard_state: "NORMAL" }
          });
        }
  
        return {
          ...prev,
          eventsPerSecond: Math.floor(38000 + Math.random() * 10000),
          activeAlerts: Math.floor(12 + Math.random() * 6),
          riskScore: mockedScore,
          anomaliesDetected: Math.floor(Math.random() * 8),
        };
      });

      setTelemetry(prev => {
        const last = prev[prev.length - 1];
        const newPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          syscalls: Math.floor(38000 + Math.random() * 12000),
          networkEvents: Math.floor(11000 + Math.random() * 7000),
          anomalies: Math.floor(Math.random() * 18),
        };
        return [...prev.slice(-11), newPoint];
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { metrics, telemetry, tick, connected, nsaoData };
}

export function useLiveEbpfEvents() {
  const [events, setEvents] = useState([]);
  
  const eventTypes = ['sys_open', 'tcp_connect', 'sys_execve', 'sys_setuid', 'socket_send', 'sys_read', 'tcp_accept'];
  const verdicts = ['ALLOW', 'ALLOW', 'ALLOW', 'FLAGGED', 'BLOCKED'];
  const comms = ['python3', 'node', 'nginx', 'envoy', 'sh', 'worker', 'db-proxy', 'auth-srv'];

  useEffect(() => {
    const interval = setInterval(() => {
      const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      const newEvent = {
        id: Date.now(),
        ts: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(Math.floor(Math.random() * 999)).padStart(3, '0'),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        pid: Math.floor(10000 + Math.random() * 90000),
        comm: comms[Math.floor(Math.random() * comms.length)],
        path: ['10.0.0.' + Math.floor(Math.random() * 255), '/proc/self/fd/' + Math.floor(Math.random() * 20), '0.0.0.0:443'][Math.floor(Math.random() * 3)],
        verdict,
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 20));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return events;
}
