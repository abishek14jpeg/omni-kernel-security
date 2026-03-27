export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function severityColor(severity) {
  const map = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
  return map[severity] || '#a1a1aa';
}

export function severityBg(severity) {
  const map = {
    critical: 'rgba(239,68,68,0.1)',
    high: 'rgba(249,115,22,0.1)',
    medium: 'rgba(245,158,11,0.1)',
    low: 'rgba(34,197,94,0.1)',
  };
  return map[severity] || 'rgba(0,0,0,0.05)';
}

export function severityBadgeClass(severity) {
  return `badge-${severity}`;
}

export function statusColor(status) {
  const map = {
    healthy: '#22c55e',
    warning: '#f59e0b',
    critical: '#ef4444',
    online: '#22c55e',
    offline: '#ef4444',
    normal: '#22c55e',
    anomalous: '#f97316',
    suspicious: '#f59e0b',
    blocked: '#ef4444',
  };
  return map[status] || '#a1a1aa';
}

export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function riskLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function scoreGradient(score) {
  if (score >= 80) return 'from-red-500 to-red-600';
  if (score >= 60) return 'from-orange-500 to-orange-600';
  if (score >= 40) return 'from-yellow-500 to-yellow-600';
  return 'from-emerald-500 to-emerald-600';
}

export function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function mean(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function std(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const avg = mean(values);
  const variance = values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function zScore(value, values) {
  const sigma = std(values);
  if (sigma === 0) return 0;
  return (value - mean(values)) / sigma;
}

export function computeThreatRisk(alert, context = {}) {
  // Risk equation: R = sigma(w1*sev + w2*conf + w3*shap + w4*z_traffic + w5*z_anomaly) * 100
  const sevMap = { low: 0.25, medium: 0.55, high: 0.8, critical: 1 };
  const severity = sevMap[(alert?.severity || '').toLowerCase()] ?? 0.4;
  const confidence = clamp((alert?.confidence || 0) / 100);
  const shapMass = Object.values(alert?.shap || {}).reduce((acc, value) => acc + Math.abs(value), 0);
  const shapIntensity = clamp(shapMass);
  const trafficZ = clamp((context.trafficZ || 0) / 3, -1, 1);
  const anomalyZ = clamp((context.anomalyZ || 0) / 3, -1, 1);
  const base = (alert?.riskScore || 0) / 100;

  const logit = (
    1.4 * severity +
    1.15 * confidence +
    0.95 * shapIntensity +
    0.6 * trafficZ +
    0.5 * anomalyZ +
    0.75 * base -
    2.25
  );

  return clamp(sigmoid(logit) * 100, 0, 100);
}

export function enrichThreatAlerts(alerts = [], telemetry = []) {
  const trafficSeries = telemetry.map((t) => t?.networkEvents || 0);
  const anomalySeries = telemetry.map((t) => t?.anomalies || 0);
  const latestTraffic = trafficSeries[trafficSeries.length - 1] || 0;
  const latestAnomaly = anomalySeries[anomalySeries.length - 1] || 0;

  const trafficZ = zScore(latestTraffic, trafficSeries);
  const anomalyZ = zScore(latestAnomaly, anomalySeries);

  return alerts.map((alert) => {
    const computedRisk = computeThreatRisk(alert, { trafficZ, anomalyZ });
    const topDrivers = Object.entries(alert?.shap || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([feature]) => feature.replace(/_/g, ' '));

    return {
      ...alert,
      computedRisk,
      topDrivers,
      confidenceCalibrated: clamp((alert?.confidence || 0) / 100 + (anomalyZ * 0.03), 0, 1) * 100,
    };
  });
}

export function computeSystemRisk(enrichedAlerts = [], liveRisk = null) {
  if (!Array.isArray(enrichedAlerts) || enrichedAlerts.length === 0) {
    return typeof liveRisk === 'number' ? liveRisk : 0;
  }

  const weighted = enrichedAlerts.reduce((acc, alert) => {
    const confWeight = ((alert.confidenceCalibrated || 50) / 100) * 0.6 + 0.4;
    return acc + (alert.computedRisk || alert.riskScore || 0) * confWeight;
  }, 0);
  const avg = weighted / enrichedAlerts.length;

  if (typeof liveRisk !== 'number') return clamp(avg, 0, 100);
  return clamp((avg * 0.65) + (liveRisk * 0.35), 0, 100);
}

function toNumber(value, fallback = 0) {
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? n : fallback;
}

export function severityScoreToRisk(severityScore, fallback = null) {
  const n = typeof severityScore === 'string' ? Number(severityScore) : severityScore;
  if (!Number.isFinite(n)) return fallback;
  // Convention: backend may output either probability-like 0..1 or percent 0..100.
  // Normalize to a 0..100 risk percentage.
  if (n <= 1.0) return clamp(n * 100, 0, 100);
  return clamp(n, 0, 100);
}

function riskToSeverity(score) {
  return riskLevel(clamp(score, 0, 100));
}

export function deriveShapDistributionFromRisk(riskScore) {
  // Create a deterministic, normalized SHAP-like attribution mass across features.
  // Higher risk shifts mass towards "sequence"/"volume"-type drivers.
  const r = clamp(riskScore, 0, 100) / 100;
  const wSeq = 0.12 + 0.35 * r; // grows with risk
  const wFile = 0.18 + 0.25 * (1 - r) + 0.1 * r; // moderate
  const wAgent = 0.08 + 0.18 * (1 - r);
  const wGeo = 0.12 + 0.12 * (r * (1 - r) * 4);
  const wNet = 0.06 + 0.22 * r;
  const wProc = 0.06 + 0.14 * r;

  // Merge into the feature keys we already render in mock SHAP cards.
  const base = {
    syscall_sequence: wSeq,
    file_access_pattern: wFile,
    user_agent: wAgent,
    geolocation: wGeo,
    request_rate: wNet,
    internal_scan: wProc,
  };

  const desiredKeys = ['file_access_pattern', 'syscall_sequence', 'user_agent', 'geolocation'];
  const mass = desiredKeys.reduce((acc, k) => acc + (base[k] ?? 0), 0) || 1;

  return desiredKeys.reduce((acc, k) => {
    acc[k] = (base[k] ?? 0) / mass;
    return acc;
  }, {});
}

export function applyLiveNsaoToAlerts(enrichedAlerts = [], nsaoData = null) {
  if (!Array.isArray(enrichedAlerts) || !nsaoData) return enrichedAlerts;

  const incident = nsaoData.incident_analysis || {};
  const liveSeverityScore = toNumber(incident.severity_score, null);
  const agentConf = toNumber(nsaoData.agent_confidence, 0.85);

  const liveDashboardState = nsaoData.visual_directives?.dashboard_state || null;
  const activeSubgraph = nsaoData.visual_directives?.active_subgraph || [];

  const hasSeverity = liveSeverityScore !== null && Number.isFinite(liveSeverityScore);

  // Shared synthetic narratives
  const rootCause = incident.root_cause_summary || 'Kernel-level mismatch in temporal-spatio signatures.';
  const temporal = incident.temporal_evolution || 'Sliding-window dynamics deviated from baseline.';
  const mitre = incident.mitre_mapping || 'None';

  const techniqueHint = (() => {
    if (typeof mitre !== 'string') return 'Anomalous Spatio-Temporal Flow';
    if (mitre.startsWith('T1071')) return 'C2 via Application-Layer Protocol';
    if (mitre.startsWith('T1059')) return 'Command & Scripting Interpreter';
    if (mitre.startsWith('T1041')) return 'Exfiltration Over C2 Channel';
    if (mitre.startsWith('T1082')) return 'System Information Discovery';
    return mitre === 'None' ? 'Anomalous Spatio-Temporal Flow' : `Technique ${mitre}`;
  })();

  const containerFromLive = activeSubgraph[0] || null;
  const clusterFromLive = activeSubgraph[1] || null;
  const originFromLive = activeSubgraph[2] || null;

  const alertTypeByTile = (idx) => {
    const types = [
      techniqueHint,
      'SHAP-Driven Attribution Shift',
      'Execution Chain Anomaly',
      'Network Origin Mapping',
      'Data Flow Deviation',
      'Lateral Movement Candidate',
      'Zero-Trust Re-Authentication',
    ];
    return types[idx] || 'Anomalous Spatio-Temporal Flow';
  };

  const severityByTileFactor = [1.0, 0.86, 0.78, 0.72, 0.64, 0.56, 0.5];

  return enrichedAlerts.map((alert, idx) => {
    const baseRisk = hasSeverity ? severityScoreToRisk(liveSeverityScore, alert.riskScore || 0) : (alert.riskScore || 0);
    const factor = severityByTileFactor[idx] ?? 0.6;

    // If the model only tells us NORMAL/WARNING/CRITICAL, bias the risk accordingly.
    const stateFactor =
      liveDashboardState === 'CRITICAL_ALERT' ? 1.08
        : liveDashboardState === 'WARNING' ? 1.03
          : liveDashboardState === 'NORMAL' ? 0.55
            : 1;

    const newRisk = clamp(baseRisk * factor * stateFactor + (agentConf - 0.5) * 8, 0, 100);
    const newSeverity = riskToSeverity(newRisk);
    const shap = deriveShapDistributionFromRisk(newRisk);

    // Recreate top drivers (xAI-lite) from SHAP attributions.
    const topDrivers = Object.entries(shap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([feature]) => feature.replace(/_/g, ' '));

    return {
      ...alert,
      type: alertTypeByTile(idx),
      severity: newSeverity,
      riskScore: newRisk,
      computedRisk: newRisk,
      confidenceCalibrated: clamp((agentConf * 100) * (0.72 + idx * 0.03), 0, 100),
      shap,
      topDrivers,
      container: containerFromLive || alert.container,
      cluster: clusterFromLive || alert.cluster,
      description: idx === 1
        ? `${rootCause} (${temporal})`
        : idx === 3 && originFromLive
          ? `Origin correlation: ${originFromLive}. ${rootCause}`
          : `${rootCause} ${temporal}`,
    };
  });
}
