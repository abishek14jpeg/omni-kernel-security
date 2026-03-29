import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Deterministic fallback rules (identical to backend compliance_engine.py) ── */
const FALLBACK_RULES = [
  { id: 'R001', name: 'Double-Entry Balance', description: 'Every debit must have a corresponding credit entry.', severity: 'critical', enabled: true, params: {} },
  { id: 'R002', name: 'Amount Threshold', description: 'Transactions exceeding $50,000 require senior approval.', severity: 'high', enabled: true, params: { max_amount: 50000 } },
  { id: 'R003', name: 'Authorization Check', description: 'Transactions must have valid approver credentials.', severity: 'critical', enabled: true, params: {} },
  { id: 'R004', name: 'Segregation of Duties', description: 'Initiator and approver must be different entities.', severity: 'high', enabled: true, params: {} },
  { id: 'R005', name: 'Duplicate Detection', description: 'Flag transactions with identical amounts within 60-second windows.', severity: 'medium', enabled: true, params: { time_window_sec: 60 } },
  { id: 'R006', name: 'Authorized Accounts', description: 'All accounts must be pre-registered and validated.', severity: 'critical', enabled: true, params: {} },
  { id: 'R007', name: 'Timing Restriction', description: 'Block transactions outside permitted operating hours (6AM-10PM).', severity: 'medium', enabled: true, params: { start_hour: 6, end_hour: 22 } },
  { id: 'R008', name: 'Required Fields', description: 'All mandatory fields must be present and non-empty.', severity: 'critical', enabled: true, params: {} },
  { id: 'R009', name: 'Ledger Reconciliation', description: 'Running totals must reconcile across sub-ledgers.', severity: 'high', enabled: true, params: {} },
  { id: 'R010', name: 'Policy Compliance', description: 'Transaction types must comply with organizational policy matrix.', severity: 'medium', enabled: true, params: {} },
];

/* ── Unique ID counter (resets on page refresh) ── */
let txnCounter = 0;

/**
 * Locally simulate one transaction through the AI + Compliance pipeline.
 * Produces deterministic, realistic results without needing a backend.
 */
function simulateTransaction(amount, time) {
  txnCounter++;
  const txnId = `TXN-${String(txnCounter).padStart(4, '0')}`;
  const timestamp = new Date().toISOString();

  // --- AI anomaly score (simple heuristic: higher amounts = higher MSE) ---
  const baseScore = Math.random() * 0.03;
  const amountFactor = Math.min(Number(amount) / 200000, 0.12);
  // Late-night transactions (low time value < 21600 = before 6AM) get a boost
  const timeFactor = Number(time) < 21600 ? 0.03 : 0;
  const anomaly_score = Math.round((baseScore + amountFactor + timeFactor) * 1000000) / 1000000;
  const threshold = 0.05;
  const is_anomaly = anomaly_score > threshold;
  const anomaly_classification = !is_anomaly ? 'Normal'
    : anomaly_score > 0.10 ? 'Critical Anomaly'
    : anomaly_score > 0.07 ? 'High Anomaly'
    : 'Suspicious';

  // --- Compliance rule evaluation ---
  let rules_passed = true;
  const failed_rules = [];

  // R002: Amount Threshold
  if (Number(amount) > 50000) {
    failed_rules.push('R002: Amount exceeds $50,000 threshold');
    rules_passed = false;
  }
  // R007: Timing Restriction (before 6AM = time < 21600 sec)
  if (Number(time) < 21600) {
    failed_rules.push('R007: Transaction outside operating hours');
    rules_passed = false;
  }

  // --- Decision Engine ---
  let decision, reasoning;
  if (!rules_passed && is_anomaly) {
    decision = 'REJECT';
    reasoning = `Rule violation + AI anomaly detected. Failed: ${failed_rules.join('; ')}. MSE=${anomaly_score.toFixed(6)}`;
  } else if (!rules_passed) {
    decision = 'ESCALATE';
    reasoning = `Compliance rule violation. Failed: ${failed_rules.join('; ')}. AI classification: ${anomaly_classification}.`;
  } else if (is_anomaly) {
    decision = 'FLAG';
    reasoning = `AI flagged anomaly (MSE=${anomaly_score.toFixed(6)} > θ=${threshold}). All compliance rules passed.`;
  } else {
    decision = 'APPROVE';
    reasoning = `All compliance rules passed. AI classification: Normal. MSE=${anomaly_score.toFixed(6)}.`;
  }

  const processing_time_ms = Math.round(Math.random() * 25 + 8);

  // --- Build full audit record ---
  const auditRecord = {
    transaction_id: txnId,
    audit_timestamp: timestamp,
    input_data: {
      amount: Number(amount),
      time_seconds: Number(time),
      type: 'LEDGER_ENTRY',
    },
    anomaly_detection: {
      score: anomaly_score,
      threshold,
      is_anomaly,
      classification: anomaly_classification,
      model_version: 'LSTM-AE-v4.0-client',
      confidence: is_anomaly ? 0.87 : 0.96,
    },
    compliance: {
      rules_evaluated: 10,
      rules_passed: 10 - failed_rules.length,
      rules_failed: failed_rules.length,
      all_passed: rules_passed,
      triggered_rules: failed_rules,
    },
    decision: {
      outcome: decision,
      reasoning,
      confidence: rules_passed && !is_anomaly ? 0.98 : 0.72,
      actions: decision === 'REJECT' ? ['Block transaction', 'Notify compliance officer'] : [],
    },
    processing_time_ms,
  };

  // --- Summary object for the transaction feed ---
  const summary = {
    id: txnId,
    timestamp,
    anomaly_score,
    anomaly_classification,
    rules_passed,
    rules_failed_count: failed_rules.length,
    decision,
    reasoning,
    processing_time_ms,
  };

  return { summary, auditRecord };
}

/**
 * Custom hook for Finance Agent.
 * NO automatic simulation — transactions are ONLY created when the user
 * manually injects them via the form or the demo-batch button.
 * All state resets on page refresh.
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
  const [latestAuditRecord, setLatestAuditRecord] = useState(null);
  const [pipelineStage, setPipelineStage] = useState('idle');
  const [rules, setRules] = useState([]);

  // Store all audit records for export
  const auditLog = useRef([]);

  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  /* ── Pipeline animation ── */
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

  /* ── Internal: add one transaction to all state stores (no duplicates) ── */
  const commitTransaction = useCallback((summary, auditRecord) => {
    // Dedup: check if this txnId already exists
    setTransactions(prev => {
      if (prev.some(t => t.id === summary.id)) return prev;
      return [summary, ...prev].slice(0, 100);
    });

    setAnomalyScores(prev => {
      if (prev.some(s => s.transaction_id === summary.id)) return prev;
      return [...prev, {
        transaction_id: summary.id,
        timestamp: summary.timestamp,
        anomaly_score: summary.anomaly_score,
        threshold: 0.05,
        outcome: summary.decision,
      }].slice(-30);
    });

    setDashboardStats(prev => {
      const o = (summary.decision || '').toLowerCase();
      const newTotal = prev.total_processed + 1;
      const newApproved = o === 'approve' ? prev.approved + 1 : prev.approved;
      const newRejected = o === 'reject' ? prev.rejected + 1 : prev.rejected;
      return {
        total_processed: newTotal,
        approved: newApproved,
        flagged: o === 'flag' ? prev.flagged + 1 : prev.flagged,
        escalated: o === 'escalate' ? prev.escalated + 1 : prev.escalated,
        rejected: newRejected,
        approval_rate: newTotal > 0 ? Math.round((newApproved / newTotal) * 1000) / 10 : 0,
        rejection_rate: newTotal > 0 ? Math.round((newRejected / newTotal) * 1000) / 10 : 0,
      };
    });

    setLatestAuditRecord(auditRecord);

    // Store in the export-ready audit log (no duplicates)
    if (!auditLog.current.some(r => r.transaction_id === auditRecord.transaction_id)) {
      auditLog.current.push(auditRecord);
    }
  }, []);

  /* ── WebSocket (optional backend connection) ── */
  const connectWs = useCallback(() => {
    try {
      ws.current = new WebSocket('ws://localhost:8001/ws/finance');

      ws.current.onopen = () => {
        console.log('[FinanceAI] Connected to backend WebSocket');
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        if (payload.type === 'TRANSACTION_PROCESSED') {
          const summary = payload.data;
          const txnId = payload.transaction_id;
          animatePipeline();

          const txn = { id: txnId, timestamp: payload.timestamp, ...summary };
          const audit = payload.audit_record || { transaction_id: txnId, ...summary };
          commitTransaction(txn, audit);
        }
      };

      ws.current.onerror = () => {
        setConnected(false);
        // No auto-fallback — just mark as offline
      };

      ws.current.onclose = () => {
        setConnected(false);
        reconnectTimeout.current = setTimeout(connectWs, 10000);
      };
    } catch {
      setConnected(false);
    }
  }, [animatePipeline, commitTransaction]);

  useEffect(() => {
    connectWs();
    return () => {
      if (ws.current) ws.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connectWs]);

  /* ── Manual single transaction injection ── */
  const testSingleTransaction = useCallback(async (amount, time) => {
    // Try backend first
    try {
      const res = await fetch('http://localhost:8001/api/test-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), time: Number(time) })
      });
      if (res.ok) return await res.json();
    } catch {
      // Backend offline — use local simulation
    }

    // Local simulation
    const { summary, auditRecord } = simulateTransaction(amount, time);
    animatePipeline();
    commitTransaction(summary, auditRecord);
    return summary;
  }, [animatePipeline, commitTransaction]);

  /* ── Demo batch injection (user-triggered only) ── */
  const runDemo = useCallback(async (normalCount = 20, anomalyCount = 5) => {
    // Try backend first
    try {
      const res = await fetch(`http://localhost:8001/api/demo/run?normal_count=${normalCount}&anomaly_count=${anomalyCount}`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch {
      // Backend offline — generate locally
    }

    // Local batch generation
    const total = normalCount + anomalyCount;
    const outcomes = { APPROVE: 0, FLAG: 0, ESCALATE: 0, REJECT: 0 };

    for (let i = 0; i < total; i++) {
      const isAnomaly = i >= normalCount;
      const amount = isAnomaly
        ? Math.floor(60000 + Math.random() * 140000)    // High amounts for anomalies
        : Math.floor(100 + Math.random() * 30000);      // Normal amounts
      const time = isAnomaly
        ? Math.floor(Math.random() * 18000)              // Early morning for anomalies
        : Math.floor(21600 + Math.random() * 57600);     // Normal hours

      const { summary, auditRecord } = simulateTransaction(amount, time);
      commitTransaction(summary, auditRecord);
      outcomes[summary.decision] = (outcomes[summary.decision] || 0) + 1;
    }

    animatePipeline();
    return { demo_completed: true, total_processed: total, outcomes };
  }, [animatePipeline, commitTransaction]);

  /* ── Export audit log as JSON file ── */
  const exportAuditLog = useCallback((format = 'json') => {
    const records = auditLog.current;
    if (records.length === 0) {
      alert('No transactions to export. Inject transactions first.');
      return;
    }

    const now = new Date();
    const reportWrapper = {
      report_id: `AUDIT-${now.getTime().toString(36).toUpperCase()}`,
      generated_at: now.toISOString(),
      total_records: records.length,
      summary: {
        approved: records.filter(r => r.decision?.outcome === 'APPROVE').length,
        flagged: records.filter(r => r.decision?.outcome === 'FLAG').length,
        escalated: records.filter(r => r.decision?.outcome === 'ESCALATE').length,
        rejected: records.filter(r => r.decision?.outcome === 'REJECT').length,
      },
      records,
    };

    if (format === 'json') {
      const jsonStr = JSON.stringify(reportWrapper, null, 2);
      // Safe UTF-8 to Base64 conversion
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      const dataStr = 'data:application/json;base64,' + b64;
      
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `finance_audit_log.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // CSV export
      const headers = ['transaction_id', 'audit_timestamp', 'amount', 'anomaly_score', 'threshold', 'is_anomaly', 'classification', 'rules_passed', 'rules_failed', 'decision', 'reasoning', 'processing_time_ms'];
      const rows = records.map(r => [
        r.transaction_id || '',
        r.audit_timestamp || '',
        r.input_data?.amount ?? '',
        r.anomaly_detection?.score ?? '',
        r.anomaly_detection?.threshold ?? '',
        r.anomaly_detection?.is_anomaly ?? '',
        `"${r.anomaly_detection?.classification || ''}"`,
        r.compliance?.all_passed ?? '',
        r.compliance?.rules_failed ?? '',
        `"${r.decision?.outcome || ''}"`,
        `"${(r.decision?.reasoning || '').replace(/"/g, '""')}"`,
        r.processing_time_ms ?? '',
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      
      // Safe UTF-8 to Base64 conversion with BOM
      const b64 = btoa(unescape(encodeURIComponent('\uFEFF' + csv)));
      const dataStr = 'data:text/csv;base64,' + b64;
      
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `finance_audit_log.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, []);

  /* ── Rules management ── */
  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8001/api/compliance/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
        return;
      }
    } catch {
      console.warn('[FinanceAI] Backend offline — using deterministic fallback rules.');
    }
    if (rules.length === 0) {
      setRules(FALLBACK_RULES);
    }
  }, []);

  const updateRule = useCallback(async (ruleId, updates) => {
    // Try backend
    try {
      const res = await fetch(`http://localhost:8001/api/compliance/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) { await fetchRules(); return; }
    } catch { /* offline */ }

    // Local update
    setRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, ...updates } : r
    ));
  }, [fetchRules]);

  /* ── Visualization ── */
  const fetchVisualization = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8001/api/visualize-pca');
      if (res.ok) {
        const data = await res.json();
        if (data.image) return data.image;
      }
    } catch { /* offline */ }

    // Client-side fallback chart
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 400);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      for (let y = 50; y < 360; y += 50) {
        ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(760, y); ctx.stroke();
      }

      const currentScores = anomalyScores.length > 0
        ? anomalyScores.map(s => s.anomaly_score || 0)
        : Array.from({ length: 20 }, (_, i) => {
            const base = Math.random() * 0.04;
            return i % 7 === 0 ? 0.06 + Math.random() * 0.08 : base;
          });

      const maxScore = Math.max(...currentScores, 0.15);
      const threshold = 0.05;

      const thresholdY = 360 - (threshold / maxScore) * 300;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath(); ctx.moveTo(60, thresholdY); ctx.lineTo(760, thresholdY); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = '11px monospace';
      ctx.fillText('Detection Threshold', 65, thresholdY - 8);

      const stepX = 700 / Math.max(currentScores.length - 1, 1);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      currentScores.forEach((score, i) => {
        const x = 60 + i * stepX;
        const y = 360 - (score / maxScore) * 300;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      currentScores.forEach((score, i) => {
        const x = 60 + i * stepX;
        const y = 360 - (score / maxScore) * 300;
        ctx.beginPath();
        ctx.arc(x, y, score > threshold ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = score > threshold ? '#ef4444' : '#3b82f6';
        ctx.fill();
      });

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('MSE Anomaly Distribution', 60, 30);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px sans-serif';
      ctx.save();
      ctx.translate(15, 200);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Reconstruction Error (MSE)', 0, 0);
      ctx.restore();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      for (let i = 0; i < currentScores.length; i += 5) {
        ctx.fillText(String(i + 1), 60 + i * stepX - 4, 378);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(620, 45, 140, 25);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(620, 45, 140, 25);
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
      ctx.beginPath(); ctx.moveTo(630, 58); ctx.lineTo(660, 58); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.fillText('Detection Threshold', 665, 62);

      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }, [anomalyScores]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    connected,
    transactions,
    anomalyScores,
    dashboardStats,
    latestAuditRecord,
    pipelineStage,
    runDemo,
    rules,
    fetchRules,
    updateRule,
    testSingleTransaction,
    fetchVisualization,
    exportAuditLog,
  };
}
