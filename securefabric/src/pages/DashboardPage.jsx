import React from 'react';
import { systemMetrics, threatAlerts } from '../data/mockData';
import { applyLiveNsaoToAlerts, computeSystemRisk, enrichThreatAlerts } from '../utils/helpers';
import TopNavigation from '../components/dashboard/TopNavigation';

export default function DashboardPage({ metrics, telemetry, nsaoData, onNavigate }) {
  const enrichedAlerts = enrichThreatAlerts(threatAlerts, telemetry);
  const enrichedAlertsLive = applyLiveNsaoToAlerts(enrichedAlerts, nsaoData);
  const blendedRisk = computeSystemRisk(enrichedAlertsLive, metrics?.riskScore ?? systemMetrics.riskScore);
  const liveModelConfidence = enrichedAlertsLive.length
    ? enrichedAlertsLive.reduce((acc, alert) => acc + alert.confidenceCalibrated, 0) / enrichedAlertsLive.length
    : systemMetrics.modelsAccuracy;

  return (
    <div className="bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* Top Navigation via Global Component */}
      <TopNavigation onNavigate={onNavigate} currentPage="dashboard" />
      
      <main className="pt-24 pb-32 ml-12">
        {/* Hero Section */}
        <header className="px-8 mb-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="w-full md:w-2/3">
              <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none mb-8">
                Clarity in the <br/>
                <span className="text-primary italic font-light">Chaos</span>
              </h1>
              <p className="text-2xl text-on-surface-variant max-w-xl leading-relaxed">
                An editorial lens on cryptographic anomalies. We don't just detect threats; we compose their resolution through explainable logic.
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl rotate-3 translate-y-12 bg-surface-container-high border border-primary/10 flex flex-col justify-between p-8">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary text-4xl">policy</span>
                  <span className="text-secondary font-bold tracking-widest text-xs uppercase">System State</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-[16px] border-primary-container/20">
                    <span className="text-5xl font-extrabold text-primary tracking-tighter">{blendedRisk.toFixed(1)}</span>
                    <span className="absolute bottom-8 text-xs font-bold uppercase tracking-widest text-primary/60">Risk</span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="42%" className="stroke-primary" strokeWidth="8" fill="none" strokeDasharray="200" strokeDashoffset={200 - (200 * blendedRisk) / 100}></circle>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-on-surface mb-2">Metrics Validated</h4>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2 mb-2 text-sm pt-2">
                    <span className="text-on-surface-variant">Active Alerts</span>
                    <span className="font-bold">{systemMetrics.activeAlerts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Uptime SLA</span>
                    <span className="font-bold">{systemMetrics.uptimePct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Threat Narratives (Vertical Columns) */}
        <section className="px-8 mb-24 max-w-7xl mx-auto space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8">
              <span className="text-sm tracking-widest uppercase text-outline mb-4 block">Current Narrative: {threatAlerts[0]?.id || "001"}</span>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-8">Detected: {threatAlerts[0]?.type}</h2>
              <div className="bg-surface-container-low p-8 rounded-lg border-l-4 border-primary">
                <p className="text-xl leading-relaxed text-secondary-dim">
                  {threatAlerts[0]?.description || "A rhythmic oscillation in packet headers suggested a non-human cadence. Unlike brute-force attempts, this was a whisper—a sequence of micro-adjustments aimed at the Kernel's temporal synchronization."}
                </p>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col justify-center">
              <div className="p-8 bg-primary-container/30 rounded-full text-center">
                <span className="text-5xl font-bold text-primary italic">{liveModelConfidence.toFixed(1)}%</span>
                <p className="text-sm font-label mt-2 text-on-primary-container uppercase tracking-widest">Confidence Index</p>
              </div>
            </div>
          </div>
          
          {threatAlerts[1] && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-start-5 md:col-span-8 text-right">
                <span className="text-sm tracking-widest uppercase text-outline mb-4 block">Current Narrative: {threatAlerts[1].id}</span>
                <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-8">Detected: {threatAlerts[1].type}</h2>
                <div className="bg-surface-container-low p-8 rounded-lg border-r-4 border-tertiary text-left">
                  <p className="text-xl leading-relaxed text-secondary-dim">
                    {threatAlerts[1].description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* The Rationale (Naked Branching Diagram) */}
        <section className="bg-surface-container-high py-24 px-8 mb-24 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20 text-center">
              <h3 className="text-4xl font-bold italic mb-4">The Rationale</h3>
              <p className="text-outline">The path of algorithmic decision making.</p>
            </div>
            <div className="relative flex flex-col items-center">
              {/* Root Node */}
              <div className="relative z-10 bg-white p-8 rounded-full border border-outline-variant/20 shadow-sm mb-16 px-8">
                <span className="font-bold text-lg">Initial Anomaly Detected</span>
              </div>
              <div className="w-full flex justify-between max-w-4xl relative">
                {/* Connecting Lines */}
                <div className="absolute top-[-4rem] left-1/2 w-px h-16 branch-line"></div>
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-outline-variant/30"></div>
                
                {/* Left Path */}
                <div className="w-1/3 flex flex-col items-center text-center">
                  <div className="h-12 w-px bg-outline-variant/30"></div>
                  <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary mb-2">fingerprint</span>
                    <h4 className="font-bold mb-2">Signature Match</h4>
                    <p className="text-sm text-secondary italic">Cross-referenced with 4M known hashes.</p>
                  </div>
                </div>
                
                {/* Middle Path */}
                <div className="w-1/3 flex flex-col items-center text-center">
                  <div className="h-12 w-px bg-outline-variant/30"></div>
                  <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm scale-110 border border-primary/20">
                    <span className="material-symbols-outlined text-tertiary mb-2">psychology</span>
                    <h4 className="font-bold mb-2">Heuristic Shift</h4>
                    <p className="text-sm text-secondary italic">Deviation from historical baseline.</p>
                  </div>
                </div>
                
                {/* Right Path */}
                <div className="w-1/3 flex flex-col items-center text-center">
                  <div className="h-12 w-px bg-outline-variant/30"></div>
                  <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-secondary mb-2">hub</span>
                    <h4 className="font-bold mb-2">Network Origin</h4>
                    <p className="text-sm text-secondary italic">Mapped to ephemeral ingress points.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Side Navigation Anchor (Hidden on Mobile) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-20 flex-col items-center py-12 gap-12 bg-slate-50/40 backdrop-blur-xl z-40">
        <div className="flex flex-col gap-8 flex-1 justify-center">
          <span onClick={() => onNavigate('dashboard')} className="material-symbols-outlined text-pink-900 font-semibold italic scale-125 cursor-pointer" title="Overview">dashboard</span>
          <span onClick={() => onNavigate('alerts')} className="material-symbols-outlined text-slate-400 hover:text-pink-500 transition-colors cursor-pointer" title="Threat Intelligence">security</span>
          <span onClick={() => onNavigate('network')} className="material-symbols-outlined text-slate-400 hover:text-pink-500 transition-colors cursor-pointer" title="Network Topology">hub</span>
          <span onClick={() => onNavigate('testing')} className="material-symbols-outlined text-slate-400 hover:text-pink-500 transition-colors cursor-pointer" title="Math Testing">science</span>
        </div>
        <div className="rotate-90 origin-center whitespace-nowrap text-sm tracking-widest uppercase font-bold text-pink-900/40 translate-y-8">
          Omni-Kernel Admin
        </div>
      </aside>

      {/* Footer Decoration */}
      <footer className="w-full py-8 px-8 border-t border-outline-variant/5 ml-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-outline-variant italic">
          <span>The Logic of Response (XAI) // v4.0.2</span>
          <span>© 2024 Omni-Kernel Labs. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
