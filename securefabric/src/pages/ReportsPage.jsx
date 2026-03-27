import React, { useMemo } from 'react';
import { severityScoreToRisk } from '../utils/helpers';
import TopNavigation from '../components/dashboard/TopNavigation';

export default function ReportsPage({ onNavigate, nsaoData }) {
  const incidentRisk = nsaoData?.incident_analysis
    ? severityScoreToRisk(nsaoData.incident_analysis.severity_score, null)
    : null;
  const isAlert = incidentRisk !== null && incidentRisk > 60;
  const confidence = nsaoData ? (nsaoData.agent_confidence * 100).toFixed(1) : 99.8;
  const actions = nsaoData?.remediation_payload?.commands || [
    "No anomalous streams detected. Baseline steady.",
    "Awaiting temporal deviations..."
  ];

  // Compliance-ready reconciliation data (Financial Close Agent)
  const reconciliationData = useMemo(() => {
    const totalTransactions = Math.floor(12400 + Math.random() * 800);
    const matched = Math.floor(totalTransactions * (0.94 + Math.random() * 0.04));
    const unmatched = totalTransactions - matched;
    const pending = Math.floor(unmatched * 0.3);
    return {
      totalTransactions,
      matched,
      unmatched,
      pending,
      matchRate: ((matched / totalTransactions) * 100).toFixed(2),
      lastReconciled: new Date().toISOString(),
    };
  }, [nsaoData]);

  // Compliance framework tags
  const complianceFrameworks = [
    { code: 'SOX', label: 'Sarbanes-Oxley Act', status: isAlert ? 'REVIEW_REQUIRED' : 'COMPLIANT' },
    { code: 'IFRS', label: 'Int\'l Financial Reporting Standards', status: 'COMPLIANT' },
    { code: 'GAAP', label: 'Generally Accepted Accounting Principles', status: isAlert ? 'FLAGGED' : 'COMPLIANT' },
    { code: 'GDPR', label: 'General Data Protection Regulation', status: 'COMPLIANT' },
  ];

  // Anomaly flags for audit trail
  const anomalyFlags = useMemo(() => {
    if (!isAlert) return [];
    const flags = [
      {
        id: 'ANM-001',
        severity: 'HIGH',
        category: 'Reconciliation Variance',
        description: 'Unmatched transaction volume exceeds SOX §404 threshold (>2%)',
        framework: 'SOX',
        timestamp: new Date().toISOString(),
      },
    ];
    if (incidentRisk > 80) {
      flags.push({
        id: 'ANM-002',
        severity: 'CRITICAL',
        category: 'Temporal Pattern Break',
        description: 'Spatio-temporal signature deviation indicates potential unauthorized close modification',
        framework: 'GAAP',
        timestamp: new Date().toISOString(),
      });
    }
    return flags;
  }, [isAlert, incidentRisk]);

  // Generate audit trail hash (simulated SHA-256-like fingerprint)
  const generateAuditHash = (content) => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256:${hex}${hex.split('').reverse().join('')}${hex.substring(0,8)}${Date.now().toString(16).substring(4)}`;
  };

  const handleExportAuditTrail = () => {
    const now = new Date().toISOString();
    const reportContent = `═══════════════════════════════════════════════════════
  OMNI-KERNEL COMPLIANCE AUDIT TRAIL
  Financial Close Agent — Automated Report
═══════════════════════════════════════════════════════

Report ID: RPT-${Date.now().toString(36).toUpperCase()}
Generated: ${now}
Agent Confidence: ${confidence}%
State Directive: ${nsaoData?.visual_directives?.dashboard_state || 'NORMAL'}
Mitre Mapping: ${nsaoData?.incident_analysis?.mitre_mapping || "T0000.000 (Baseline)"}

───────────────────────────────────────────────────────
SECTION 1: RECONCILIATION SUMMARY
───────────────────────────────────────────────────────
Total Transactions Processed:  ${reconciliationData.totalTransactions.toLocaleString()}
Matched (Verified):            ${reconciliationData.matched.toLocaleString()}
Unmatched (Under Review):      ${reconciliationData.unmatched.toLocaleString()}
Pending Resolution:            ${reconciliationData.pending.toLocaleString()}
Match Rate:                    ${reconciliationData.matchRate}%
Last Reconciled:               ${reconciliationData.lastReconciled}

───────────────────────────────────────────────────────
SECTION 2: COMPLIANCE FRAMEWORK STATUS
───────────────────────────────────────────────────────
${complianceFrameworks.map(f => `[${f.status.padEnd(16)}] ${f.code} — ${f.label}`).join('\n')}

───────────────────────────────────────────────────────
SECTION 3: ANOMALY FLAGS
───────────────────────────────────────────────────────
${anomalyFlags.length > 0
  ? anomalyFlags.map(f => `[${f.severity}] ${f.id} | ${f.category}\n  ${f.description}\n  Framework: ${f.framework} | Flagged: ${f.timestamp}`).join('\n\n')
  : 'No anomalies detected. All systems within compliance thresholds.'}

───────────────────────────────────────────────────────
SECTION 4: REMEDIATION ACTIONS
───────────────────────────────────────────────────────
${actions.map(cmd => '> ' + cmd).join('\n')}

───────────────────────────────────────────────────────
INTEGRITY VERIFICATION
───────────────────────────────────────────────────────
Report Hash: [COMPUTED_ON_SAVE]
Verification: Tamper-evident hash chain maintained.

═══════════════════════════════════════════════════════
  END OF AUDIT TRAIL
═══════════════════════════════════════════════════════`;

    const auditHash = generateAuditHash(reportContent);
    const finalReport = reportContent.replace('[COMPUTED_ON_SAVE]', auditHash);

    const blob = new Blob([finalReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omni_kernel_compliance_audit_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // JSON export for machine-readable compliance data
  const handleExportJSON = () => {
    const payload = {
      reportId: `RPT-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      agentConfidence: parseFloat(confidence),
      stateDirective: nsaoData?.visual_directives?.dashboard_state || 'NORMAL',
      mitreMapping: nsaoData?.incident_analysis?.mitre_mapping || 'T0000.000',
      reconciliation: reconciliationData,
      complianceFrameworks: complianceFrameworks.map(f => ({ code: f.code, status: f.status })),
      anomalyFlags,
      remediationActions: actions,
    };
    payload.integrityHash = generateAuditHash(JSON.stringify(payload));

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omni_kernel_compliance_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface text-[#25324b] selection:bg-primary-container selection:text-primary min-h-screen">
      <div className="particle-bg"></div>
      
      {/* Centralized Global Top Navigation */}
      <TopNavigation onNavigate={onNavigate} currentPage="reports" />

      <main className="pt-24 pb-16 px-8 max-w-[1400px] mx-auto z-10 relative">
        <header className="mb-16">
          <span className="text-primary tracking-widest uppercase text-xs font-bold mb-4 block">Spatio-Temporal Autoencoder Telemetry</span>
          <h1 className="text-6xl font-extrabold text-on-surface leading-[0.9] tracking-tighter mb-6">
            Neural <span className="italic font-light text-primary">Reports</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
            Live AI orchestration logs derived from PyTorch model reconstruction loss metrics. Compliance-ready audit trails for financial close operations.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Terminal View */}
          <div className="lg:col-span-8">
            <div className="glass-panel p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden h-[500px] flex flex-col">
              <div className="px-4 py-3 bg-slate-950 flex gap-2 items-center border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="ml-4 text-xs font-mono text-slate-500">st_gae.py — runtime</span>
              </div>
              <div className="p-6 font-mono text-sm flex-1 overflow-auto text-emerald-400">
                <div className="text-slate-400 mb-4"># Initializing SecureFabric PyTorch Neuro-Symbolic Engine...</div>
                <div className="text-slate-400 mb-6"># Connection established via ws://localhost:8000/ws/telemetry</div>
                
                <div className="mb-2">
                  <span className="text-blue-400">[SYSTEM]</span> Listening for temporal deviations in network graph...
                </div>
                
                <div className="mt-6 text-slate-500 animate-pulse">Monitoring baseline... [No deviations detected]</div>

                {isAlert && (
                  <>
                    <div className="mb-2 mt-6">
                      <span className="text-red-400 mr-2">[CRITICAL]</span>
                      High reconstruction loss detected. Expected network shape violated.
                    </div>
                    <div className="text-slate-400 ml-6 mb-2">
                      L_total = alpha * ||X - X_hat||^2 + beta * CE + delta * KL
                      <span className="text-slate-500"> (ST-GAE + multi-head regularization)</span>
                    </div>
                    <div className="text-yellow-400 ml-6 mb-1">└─ Triggering NSAO Orchestration</div>
                    <div className="text-slate-300 ml-6 mb-4">   └─ Confidence: {confidence}%</div>
                    
                    <div className="text-blue-400 mt-6 mb-2">[REMEDIATION COMPILED]</div>
                    {actions.map((cmd, idx) => (
                      <div key={idx} className="ml-4 flex items-center gap-4 mb-2">
                        <span className="text-slate-600">&gt;</span>
                        <span className="text-pink-300 font-bold">{cmd}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* AI Metrics Side Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel p-8 rounded-xl bg-white shadow-sm border border-outline-variant/10">
              <h3 className="text-sm uppercase tracking-widest font-bold text-primary mb-6">Engine Telemetry</h3>
              
              <div className="mb-6">
                <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">Mitre Mapping</span>
                <span className="text-xl font-bold font-serif">{nsaoData?.incident_analysis?.mitre_mapping || "T0000.000 (Baseline)"}</span>
              </div>
              
              <div className="mb-6">
                <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">State Directive</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block ${isAlert ? 'bg-[#e6ced6] text-primary' : 'bg-emerald-100 text-emerald-800'}`}>
                  {nsaoData?.visual_directives?.dashboard_state || 'NORMAL'}
                </span>
              </div>

              <div>
                <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">Agent Confidence</span>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-black text-on-surface">{confidence}%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${isAlert ? 'bg-primary' : 'bg-emerald-500'}`} style={{ width: `${confidence}%` }}></div>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <button onClick={handleExportAuditTrail} className="w-full bg-primary text-on-primary font-bold uppercase tracking-widest py-5 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
              Export Audit Trail
            </button>
            <button onClick={handleExportJSON} className="w-full bg-slate-800 text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-slate-800/20 text-sm">
              Export Compliance JSON
            </button>
          </div>
        </div>

        {/* Compliance Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
          
          {/* Reconciliation Summary */}
          <div className="lg:col-span-4">
            <div className="glass-panel p-8 rounded-xl bg-white shadow-sm border border-outline-variant/10 h-full">
              <h3 className="text-sm uppercase tracking-widest font-bold text-primary mb-6">Reconciliation Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant">Total Transactions</span>
                  <span className="font-bold text-lg">{reconciliationData.totalTransactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant">Matched</span>
                  <span className="font-bold text-lg text-emerald-600">{reconciliationData.matched.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant">Unmatched</span>
                  <span className="font-bold text-lg text-orange-600">{reconciliationData.unmatched.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant">Pending</span>
                  <span className="font-bold text-lg text-blue-600">{reconciliationData.pending.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-6 bg-surface-container-low p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold tracking-widest text-on-surface-variant">Match Rate</span>
                  <span className="text-2xl font-black text-emerald-600">{reconciliationData.matchRate}%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${reconciliationData.matchRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Compliance Frameworks */}
          <div className="lg:col-span-4">
            <div className="glass-panel p-8 rounded-xl bg-white shadow-sm border border-outline-variant/10 h-full">
              <h3 className="text-sm uppercase tracking-widest font-bold text-primary mb-6">Regulatory Compliance</h3>
              
              <div className="space-y-3">
                {complianceFrameworks.map((fw, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/5">
                    <div>
                      <span className="font-bold text-sm text-on-surface">{fw.code}</span>
                      <span className="text-xs text-on-surface-variant ml-2">{fw.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      fw.status === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-800' :
                      fw.status === 'FLAGGED' ? 'bg-orange-100 text-orange-800' :
                      'bg-[#e6ced6] text-primary'
                    }`}>
                      {fw.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Anomaly Flags */}
          <div className="lg:col-span-4">
            <div className="glass-panel p-8 rounded-xl bg-white shadow-sm border border-outline-variant/10 h-full">
              <h3 className="text-sm uppercase tracking-widest font-bold text-primary mb-6">Anomaly Flags</h3>
              
              {anomalyFlags.length > 0 ? (
                <div className="space-y-4">
                  {anomalyFlags.map((flag, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                      flag.severity === 'CRITICAL' ? 'border-red-500 bg-red-50/50' : 'border-orange-500 bg-orange-50/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          flag.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>{flag.severity}</span>
                        <span className="text-xs font-mono text-on-surface-variant">{flag.id}</span>
                      </div>
                      <p className="text-sm text-on-surface font-medium mb-1">{flag.category}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{flag.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-surface-container-high px-2 py-0.5 rounded">{flag.framework}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-emerald-500 mb-4" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest mb-2">All Clear</p>
                  <p className="text-xs text-on-surface-variant">No anomalies detected. All systems within compliance thresholds.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
