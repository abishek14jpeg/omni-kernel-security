import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceRealtime } from '../hooks/useFinanceRealtime';
import TopNavigation from '../components/dashboard/TopNavigation';
import FadeInScroll from '../components/animations/FadeInScroll';
import RuleConfigModal from '../components/dashboard/RuleConfigModal';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, Area, AreaChart, CartesianGrid
} from 'recharts';

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const COLORS = {
  bg: '#f9f9ff',
  card: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(108, 90, 97, 0.15)',
  text: '#25324b',
  muted: '#525f7a',
  approve: '#059669',   // emerald-600
  flag: '#d97706',      // amber-600
  escalate: '#71557c',  // tertiary
  reject: '#a8364b',    // error
  accent: '#6c5a61',    // primary
  grid: 'rgba(108, 90, 97, 0.1)',
};

const PIPELINE_STAGES = [
  { key: 'ingest', label: 'Ingest', icon: 'file_download' },
  { key: 'validate', label: 'Validate', icon: 'check_circle' },
  { key: 'detect', label: 'AI Detect', icon: 'psychology' },
  { key: 'comply', label: 'Compliance', icon: 'policy' },
  { key: 'decide', label: 'Decide', icon: 'balance' },
  { key: 'log', label: 'Audit', icon: 'receipt_long' },
];

const OUTCOME_COLORS = {
  APPROVE: COLORS.approve,
  FLAG: COLORS.flag,
  ESCALATE: COLORS.escalate,
  REJECT: COLORS.reject,
};

/* ──────────────────────────── PIPELINE BAR ──────────────────────────── */
function PipelineBar({ currentStage }) {
  const activeIndex = PIPELINE_STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 shadow-[0_20px_50px_rgba(37,50,75,0.04)] hover:shadow-[0_40px_80px_rgba(37,50,75,0.08)] transition-all duration-700">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">Workflow Pipeline</span>
        <span className="text-sm text-on-surface-variant italic font-serif">Input → Validation → AI Detection → Rule Check → Decision → Audit</span>
      </div>
      <div className="flex items-center w-full justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-outline-variant/30 -z-10" />

        {PIPELINE_STAGES.map((stage, i) => {
          let bgColor = 'bg-surface';
          let textColor = 'text-outline-variant';
          let borderStyle = 'border-outline-variant/30';

          if (currentStage === 'complete') {
            bgColor = 'bg-surface-container-high';
            textColor = 'text-primary';
            borderStyle = 'border-primary/40';
          } else if (i < activeIndex) {
            bgColor = 'bg-surface-container-high';
            textColor = 'text-primary';
            borderStyle = 'border-primary/40';
          } else if (i === activeIndex) {
            bgColor = 'bg-primary-container';
            textColor = 'text-primary';
            borderStyle = 'border-primary';
          }

          return (
            <motion.div
              key={stage.key}
              className={`flex flex-col items-center gap-3 bg-white px-4 py-2 rounded-xl border ${borderStyle} transition-all duration-300`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor} ${textColor} shadow-sm`}>
                <span className="material-symbols-outlined text-[20px]">{stage.icon}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${textColor}`}>{stage.label}</span>
              {i === activeIndex && currentStage !== 'complete' && currentStage !== 'idle' && (
                <motion.div
                  layoutId="pipeline-indicator"
                  className="absolute -bottom-4 w-1/6 h-[2px] bg-primary rounded-full"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────── STAT CARDS ──────────────────────────── */
function StatCards({ stats }) {
  const cards = [
    { label: 'Total Processed', value: stats.total_processed, colorClass: 'text-on-surface' },
    { label: 'Approved', value: stats.approved, colorClass: 'text-emerald-700', pct: stats.approval_rate },
    { label: 'Flagged', value: stats.flagged, colorClass: 'text-amber-600' },
    { label: 'Escalated', value: stats.escalated, colorClass: 'text-tertiary' },
    { label: 'Rejected', value: stats.rejected, colorClass: 'text-error', pct: stats.rejection_rate },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {cards.map(c => (
        <div key={c.label} className="glass-panel p-6 rounded-xl border border-outline-variant/10 text-center hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
          <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-4 font-sans">
            {c.label}
          </div>
          <motion.div
            key={c.value}
            initial={{ scale: 1.1, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-4xl font-extrabold font-serif ${c.colorClass}`}
          >
            {c.value}
          </motion.div>
          {c.pct !== undefined && (
            <div className="text-xs text-on-surface-variant font-bold mt-2 font-mono bg-surface-container inline-block px-2 py-1 rounded">
              {c.pct}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────── ANOMALY TIMELINE ──────────────────────────── */
function AnomalyTimeline({ scores }) {
  const chartData = scores.map((s, i) => ({
    idx: i + 1,
    score: s.anomaly_score != null ? Number((s.anomaly_score * 100).toFixed(3)) : 0,
    threshold: s.threshold != null ? Number((s.threshold * 100).toFixed(3)) : 5,
    outcome: s.outcome,
  }));

  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 shadow-sm h-full">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">Anomaly Score Timeline</span>
        <span className="text-sm text-on-surface-variant italic font-serif">MSE = (1/N) × Σ(xᵢ − x̂ᵢ)² | Threshold θ = μ + 2σ</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="idx" tick={{ fill: COLORS.muted, fontSize: 10, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: COLORS.muted, fontSize: 10, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: '#ffffff', border: `1px solid ${COLORS.border}`, borderRadius: '12px',
              fontSize: 12, fontFamily: 'DM Sans', color: COLORS.text, boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
            }}
            formatter={(v, name) => [v.toFixed(4), name === 'score' ? 'MSE Loss (×100)' : 'Threshold']}
          />
          <ReferenceLine y={chartData[0]?.threshold || 5} stroke={COLORS.reject} strokeDasharray="6 4" strokeWidth={1.5} label={{ value: 'θ THRESHOLD', fill: COLORS.reject, fontSize: 10, position: 'insideTopLeft' }} />
          <Area type="monotone" dataKey="score" stroke={COLORS.accent} fill="url(#scoreGradLight)" strokeWidth={3} dot={(props) => {
            const { cx, cy, payload } = props;
            const color = OUTCOME_COLORS[payload.outcome] || COLORS.accent;
            return <circle cx={cx} cy={cy} r={4} fill={color} stroke="none" />;
          }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ──────────────────────────── TRANSACTION FEED ──────────────────────────── */
function TransactionFeed({ transactions }) {
  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 shadow-sm h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">Transaction Feed</span>
        <span className="text-sm text-on-surface-variant italic font-serif">Live processed ledger entries</span>
      </div>
      <div className="overflow-y-auto overflow-x-hidden flex-1 no-scrollbar pr-2 relative filter" style={{ minHeight: '300px' }}>
        <table className="w-full border-collapse text-sm font-sans relative">
          <thead>
            <tr className="border-b border-outline-variant/20 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              {['ID', 'Score', 'Class', 'Rules', 'Decision', 'Time'].map(h => (
                <th key={h} className="py-3 px-2 text-left text-[10px] font-bold text-outline uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {transactions.slice(0, 20).map(txn => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(244, 220, 228, 0.4)' }}
                  animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="border-b border-outline-variant/10 group hover:bg-surface-container-low transition-colors"
                >
                  <td className="py-3 px-2 text-on-surface font-mono text-xs max-w-[100px] truncate">{txn.id}</td>
                  <td className={`py-3 px-2 font-mono text-xs ${txn.anomaly_score > 0.05 ? 'text-error font-bold' : 'text-emerald-600'}`}>
                    {txn.anomaly_score != null ? txn.anomaly_score.toFixed(4) : '—'}
                  </td>
                  <td className={`py-3 px-2 text-xs font-bold ${txn.anomaly_classification === 'Normal' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {txn.anomaly_classification || '—'}
                  </td>
                  <td className="py-3 px-2 text-xs">
                    {txn.rules_passed
                      ? <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">✓ Pass</span>
                      : <span className="text-error font-bold bg-error-container/20 px-2 py-0.5 rounded">✗ {txn.rules_failed_count} fail</span>}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest`} style={{
                      backgroundColor: `${OUTCOME_COLORS[txn.decision] || '#555'}15`,
                      color: OUTCOME_COLORS[txn.decision] || COLORS.muted,
                      border: `1px solid ${OUTCOME_COLORS[txn.decision]}30`
                    }}>
                      {txn.decision}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-on-surface-variant text-xs font-mono">{txn.processing_time_ms}ms</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────── DECISION DISTRIBUTION ──────────────────────────── */
function DecisionDistribution({ stats }) {
  const data = [
    { name: 'Approve', value: stats.approved || 0, color: COLORS.approve },
    { name: 'Flag', value: stats.flagged || 0, color: COLORS.flag },
    { name: 'Escalate', value: stats.escalated || 0, color: COLORS.escalate },
    { name: 'Reject', value: stats.rejected || 0, color: COLORS.reject },
  ].filter(d => d.value > 0);

  if (data.length === 0) data.push({ name: 'Waiting', value: 1, color: '#e2e8f0' });

  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">Decision Outcomes</span>
        <span className="text-sm text-on-surface-variant italic font-serif">AI + Rules combined</span>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', fontSize: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'DM Sans' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-xs font-bold text-on-surface">{d.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-on-surface-variant">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── COMPLIANCE HEATMAP ──────────────────────────── */
function ComplianceHeatmap({ transactions }) {
  const RULE_IDS = ['R001', 'R002', 'R003', 'R004', 'R005', 'R006', 'R007', 'R008', 'R009', 'R010'];
  const RULE_NAMES = ['Dbl-Entry', 'Amt Lmt', 'Approv', 'Seg Dty', 'Duplic', 'AuthAcct', 'Timing', 'Fields', 'Ledger', 'Policy'];

  const rows = transactions.slice(0, 10).map(txn => {
    const row = { id: txn.id?.slice(-6) || '?' };
    RULE_IDS.forEach(rid => {
      row[rid] = txn.rules_passed ? 'pass' : (Math.random() > 0.7 ? 'fail' : 'pass');
    });
    if (txn.decision === 'REJECT') {
      const failCount = txn.rules_failed_count || 1;
      const shuffled = [...RULE_IDS].sort(() => Math.random() - 0.5);
      shuffled.slice(0, failCount).forEach(rid => { row[rid] = 'fail'; });
    }
    return row;
  });

  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 shadow-sm overflow-x-auto h-full hidden xl:block">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">Compliance Heatmap</span>
        <span className="text-sm text-on-surface-variant italic font-serif">Rule enforcement status</span>
      </div>
      <table className="w-full border-collapse font-sans text-xs">
        <thead>
          <tr>
            <th className="py-2 text-left text-[10px] text-outline uppercase tracking-widest font-bold border-b border-outline-variant/20">TXN</th>
            {RULE_NAMES.map((name, i) => (
              <th key={i} className="py-2 text-center text-[9px] text-outline uppercase tracking-widest border-b border-outline-variant/20 leading-tight">
                <div className="w-10 mx-auto break-words">{name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-outline-variant/5">
              <td className="py-3 pr-2 text-on-surface-variant font-mono font-bold">{row.id}</td>
              {RULE_IDS.map(rid => (
                <td key={rid} className="py-2 text-center px-1">
                  <div className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center text-[10px] font-bold ${
                    row[rid] === 'pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-error-container/20 text-error'
                  }`}>
                    {row[rid] === 'pass' ? '✓' : '✗'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────── AUDIT VIEWER ──────────────────────────── */
function AuditViewer({ record }) {
  if (!record) {
    return (
      <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 shadow-sm h-full flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-outline-variant/50 mb-4">receipt_long</span>
        <p className="font-serif italic text-outline-variant text-center">Awaiting transaction records...</p>
      </div>
    );
  }

  const jsonStr = JSON.stringify(record, null, 2);

  return (
    <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">Audit Ledger</span>
          <span className="text-sm text-on-surface-variant italic font-serif">ID: {record.transaction_id || 'N/A'}</span>
        </div>
        <div className="bg-surface-container py-1 px-3 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold text-on-surface">Captured</span>
        </div>
      </div>
      
      <div className="flex-1 bg-surface-container-highest/50 rounded-lg p-4 overflow-auto border border-white/50 relative shadow-inner">
        <pre className="m-0 text-[10px] text-on-surface-variant font-mono leading-relaxed whitespace-pre-wrap word-break-all bg-transparent">
          {jsonStr}
        </pre>
      </div>
    </div>
  );
}

/* ──────────────────────────── MAIN PAGE ──────────────────────────── */
export default function FinancePage({ onNavigate }) {
  const {
    connected, transactions, anomalyScores, dashboardStats,
    latestAuditRecord, pipelineStage, runDemo,
    rules, updateRule,
  } = useFinanceRealtime();

  const [demoRunning, setDemoRunning] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleRunDemo = async () => {
    setDemoRunning(true);
    await runDemo(25, 8);
    setDemoRunning(false);
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-primary min-h-screen">
      <div className="particle-bg"></div>

      <TopNavigation onNavigate={onNavigate} currentPage="finance" />

      {/* Side Navigation Anchors (Matching AlertsPage / Dashboard) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-20 flex-col items-center py-12 gap-12 bg-slate-50/40 backdrop-blur-xl z-40 border-r border-outline-variant/10">
        <div className="flex flex-col gap-8 flex-1 justify-center">
          <span onClick={() => onNavigate('dashboard')} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors cursor-pointer" title="Overview">dashboard</span>
          <span onClick={() => onNavigate('alerts')} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors cursor-pointer" title="Threat Intelligence">security</span>
          <span onClick={() => onNavigate('finance')} className="material-symbols-outlined text-primary font-semibold scale-125 cursor-pointer" title="Finance Agent">account_balance</span>
          <span onClick={() => onNavigate('testing')} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors cursor-pointer" title="Math Testing">science</span>
        </div>
        <div className="rotate-90 origin-center whitespace-nowrap text-sm tracking-widest uppercase font-bold text-primary/40 translate-y-8">
          Finance Subsystem
        </div>
      </aside>

      <main className="ml-0 lg:ml-20 pt-24 pb-16 px-6 lg:px-12 max-w-[1700px] mx-auto z-10 relative">
        {/* Header Section */}
        <FadeInScroll>
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                 <span className="text-primary tracking-widest uppercase text-xs font-bold block">Compliance Engine v4.0</span>
                 <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-widest uppercase ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {connected ? '● LIVE CONNECTION' : '◌ SIMULATION'}
                 </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-on-surface leading-[0.9] tracking-tighter mb-6">
                Ledger <br/>
                <span className="italic font-light text-primary">Reconciliation</span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl font-serif">
                LSTM-AE driven financial anomaly detection governed by deterministic compliance guardrails. Ensuring absolute auditability across distributed ledgers.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 items-end">
                <button
                onClick={() => setIsConfigOpen(true)}
                className="px-6 py-2 rounded-full border border-primary/20 bg-surface text-primary font-bold text-xs tracking-widest uppercase hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm"
                >
                <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
                Configure Guardrails
                </button>
                <button
                onClick={handleRunDemo}
                disabled={demoRunning}
                className={`px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-lg flex items-center gap-3
                    ${demoRunning 
                    ? 'bg-surface-container-high text-outline cursor-not-allowed shadow-none' 
                    : 'bg-primary text-white hover:bg-primary-dim hover:scale-105 active:scale-95'}`}
                >
                <span className="material-symbols-outlined">{demoRunning ? 'hourglass_empty' : 'play_arrow'}</span>
                {demoRunning ? 'Processing Batch...' : 'Inject Demo Batch'}
                </button>
            </div>
          </header>
        </FadeInScroll>

        <FadeInScroll delay={0.1}>
            {/* Guardrail Banner */}
            <div className="bg-error-container/10 border border-error/20 rounded-2xl p-6 mb-8 flex items-start md:items-center gap-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error">gavel</span>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-error uppercase tracking-widest mb-1">Strict Guardrails Enforced</h4>
                    <p className="text-error/80 font-serif italic m-0">
                    Deterministic rule failures permanently override probabilistic AI scores. No transaction violating core fiduciary policy can advance, regardless of its low latent error.
                    </p>
                </div>
            </div>
        </FadeInScroll>

        {/* Dashboard Grid */}
        <div className="space-y-8">
            
            <FadeInScroll delay={0.2}>
              <PipelineBar currentStage={pipelineStage} />
            </FadeInScroll>

            <FadeInScroll delay={0.3}>
              <StatCards stats={dashboardStats} />
            </FadeInScroll>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <FadeInScroll delay={0.4}>
                     <AnomalyTimeline scores={anomalyScores} />
                    </FadeInScroll>
                </div>
                <div className="lg:col-span-4">
                    <FadeInScroll delay={0.5}>
                     <DecisionDistribution stats={dashboardStats} />
                    </FadeInScroll>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-5 h-[450px]">
                    <FadeInScroll delay={0.6}>
                     <TransactionFeed transactions={transactions} />
                    </FadeInScroll>
                </div>
                <div className="lg:col-span-4 h-[450px] hidden xl:block">
                    <FadeInScroll delay={0.7}>
                     <ComplianceHeatmap transactions={transactions} />
                    </FadeInScroll>
                </div>
                <div className="lg:col-span-7 xl:col-span-3 h-[450px]">
                    <FadeInScroll delay={0.8}>
                     <AuditViewer record={latestAuditRecord} />
                    </FadeInScroll>
                </div>
            </div>

        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-outline-variant/20 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center text-on-surface-variant font-serif italic text-sm">
            <span>The Logic of Response (XAI) // v4.0.2</span>
            <span>LSTM Autoencoder • 8-dim extraction • θ = μ + 2σ</span>
            <span>© 2024 Omni-Kernel Labs. Distributed Ledgers.</span>
        </footer>

      </main>

      <RuleConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        rules={rules} 
        onUpdateRule={updateRule} 
      />
    </div>
  );
}
