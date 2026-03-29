import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for real-time finance agent WebSocket connection.
 * Connects to the finance backend on port 8001.
 * Falls back to simulated data when backend is offline.
 */
export function useFinanceRealtime() {
  const [connected, setConnected] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [anomalyScores, setAnomalyScores] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_processed: 0,
    approved: 0,
    flagged: 0,
    escalated: 0,
    rejected: 0,
    approval_rate: 0,
    rejection_rate: 0,
  });
  const [complianceMatrix, setComplianceMatrix] = useState([]);
  const [latestAuditRecord, setLatestAuditRecord] = useState(null);
  const [pipelineStage, setPipelineStage] = useState('idle');
  const [rules, setRules] = useState([]);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const fallbackInterval = useRef(null);

  const connectWs = useCallback(() => {
    try {
      ws.current = new WebSocket('ws://localhost:8001/ws/finance');

      ws.current.onopen = () => {
        console.log('[FinanceAI] Connected to backend WebSocket');
        setConnected(true);
        if (fallbackInterval.current) {
          clearInterval(fallbackInterval.current);
          fallbackInterval.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === 'DASHBOARD_INIT' || payload.type === 'DASHBOARD_UPDATE') {
          const data = payload.data;
          if (data.stats) setDashboardStats(data.stats);
          if (data.compliance_matrix) setComplianceMatrix(data.compliance_matrix);
          if (data.recent_scores) {
            setAnomalyScores(data.recent_scores.slice(0, 30));
          }
        }

        if (payload.type === 'TRANSACTION_PROCESSED') {
          const summary = payload.data;
          const txnId = payload.transaction_id;

          // Animate pipeline stages
          animatePipeline();

          // Add to transactions list
          setTransactions(prev => {
            const newTxn = {
              id: txnId,
              timestamp: payload.timestamp,
              ...summary,
            };
            return [newTxn, ...prev].slice(0, 50);
          });

          // Add anomaly score to timeline
          setAnomalyScores(prev => {
            const point = {
              transaction_id: txnId,
              timestamp: payload.timestamp,
              anomaly_score: summary.anomaly_score,
              threshold: 0.05, // Will be updated from backend
              outcome: summary.decision,
            };
            return [...prev, point].slice(-30);
          });

          // Update stats incrementally
          setDashboardStats(prev => {
            const outcome = (summary.decision || '').toLowerCase();
            return {
              ...prev,
              total_processed: prev.total_processed + 1,
              [outcome]: (prev[outcome] || 0) + 1,
              approval_rate: outcome === 'approve'
                ? Math.round(((prev.approved + 1) / (prev.total_processed + 1)) * 1000) / 10
                : Math.round((prev.approved / (prev.total_processed + 1)) * 1000) / 10,
              rejection_rate: outcome === 'reject'
                ? Math.round(((prev.rejected + 1) / (prev.total_processed + 1)) * 1000) / 10
                : Math.round((prev.rejected / (prev.total_processed + 1)) * 1000) / 10,
            };
          });

          // Track latest audit record
          if (payload.audit_record) {
            setLatestAuditRecord(payload.audit_record);
          }
        }
      };

      ws.current.onerror = () => {
        setConnected(false);
        startFallback();
      };

      ws.current.onclose = () => {
        setConnected(false);
        // Attempt reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(connectWs, 5000);
        startFallback();
      };
    } catch {
      setConnected(false);
      startFallback();
    }
  }, []);

  const animatePipeline = useCallback(() => {
    const stages = ['ingest', 'validate', 'detect', 'comply', 'decide', 'log'];
    let i = 0;
    const advanceStage = () => {
      if (i < stages.length) {
        setPipelineStage(stages[i]);
        i++;
        setTimeout(advanceStage, 200);
      } else {
        setPipelineStage('complete');
        setTimeout(() => setPipelineStage('idle'), 500);
      }
    };
    advanceStage();
  }, []);

  const startFallback = useCallback(() => {
    if (fallbackInterval.current) return;

    // Simulated data when backend is offline
    let counter = 0;
    fallbackInterval.current = setInterval(() => {
      counter++;
      animatePipeline();

      const outcomes = ['APPROVE', 'APPROVE', 'APPROVE', 'FLAG', 'REJECT', 'APPROVE', 'ESCALATE', 'APPROVE'];
      const outcome = outcomes[counter % outcomes.length];
      const score = outcome === 'APPROVE' ? Math.random() * 0.04 : 0.05 + Math.random() * 0.1;
      const classifications = {
        APPROVE: 'Normal', FLAG: 'Suspicious', ESCALATE: 'High Anomaly', REJECT: 'Critical Anomaly'
      };

      const txn = {
        id: `TXN-SIM-${String(counter).padStart(4, '0')}`,
        timestamp: new Date().toISOString(),
        anomaly_score: Math.round(score * 1000000) / 1000000,
        anomaly_classification: classifications[outcome],
        rules_passed: outcome !== 'REJECT',
        rules_failed_count: outcome === 'REJECT' ? Math.ceil(Math.random() * 3) : 0,
        decision: outcome,
        reasoning: outcome === 'APPROVE'
          ? 'All compliance rules passed. AI classification: Normal.'
          : `${outcome}: Compliance or AI flagged this transaction.`,
        processing_time_ms: Math.round(Math.random() * 30 + 5),
      };

      setTransactions(prev => [txn, ...prev].slice(0, 50));

      setAnomalyScores(prev => [
        ...prev,
        {
          transaction_id: txn.id,
          timestamp: txn.timestamp,
          anomaly_score: txn.anomaly_score,
          threshold: 0.05,
          outcome: txn.decision,
        }
      ].slice(-30));

      setDashboardStats(prev => {
        const o = outcome.toLowerCase();
        const newTotal = prev.total_processed + 1;
        const newApproved = o === 'approve' ? prev.approved + 1 : prev.approved;
        const newRejected = o === 'reject' ? prev.rejected + 1 : prev.rejected;
        return {
          total_processed: newTotal,
          approved: newApproved,
          flagged: o === 'flag' ? prev.flagged + 1 : prev.flagged,
          escalated: o === 'escalate' ? prev.escalated + 1 : prev.escalated,
          rejected: newRejected,
          approval_rate: Math.round((newApproved / newTotal) * 1000) / 10,
          rejection_rate: Math.round((newRejected / newTotal) * 1000) / 10,
        };
      });
    }, 2500);
  }, [animatePipeline]);

  useEffect(() => {
    connectWs();
    return () => {
      if (ws.current) ws.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (fallbackInterval.current) clearInterval(fallbackInterval.current);
    };
  }, [connectWs]);

  const runDemo = useCallback(async (normalCount = 20, anomalyCount = 5) => {
    try {
      const res = await fetch(`http://localhost:8001/api/demo/run?normal_count=${normalCount}&anomaly_count=${anomalyCount}`, {
        method: 'POST',
      });
      return await res.json();
    } catch {
      console.warn('[FinanceAI] Cannot reach backend for demo run.');
      return null;
    }
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8001/api/compliance/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.warn('[FinanceAI] Could not fetch rules.', e);
    }
  }, []);

  const updateRule = useCallback(async (ruleId, updates) => {
    try {
      const res = await fetch(`http://localhost:8001/api/compliance/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchRules(); // Refresh all rules from backend after update
      }
    } catch (e) {
      console.warn('[FinanceAI] Could not update rule.', e);
    }
  }, [fetchRules]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    connected,
    transactions,
    anomalyScores,
    dashboardStats,
    complianceMatrix,
    latestAuditRecord,
    pipelineStage,
    runDemo,
    rules,
    fetchRules,
    updateRule,
  };
}
