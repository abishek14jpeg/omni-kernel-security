import React, { useMemo } from 'react';
import { systemMetrics, threatAlerts } from '../data/mockData';
import { applyLiveNsaoToAlerts, computeSystemRisk, enrichThreatAlerts, severityScoreToRisk } from '../utils/helpers';
import TopNavigation from '../components/dashboard/TopNavigation';

export default function AlertsPage({ onNavigate, nsaoData, telemetry = [] }) {
  const enrichedAlerts = useMemo(() => enrichThreatAlerts(threatAlerts, telemetry), [telemetry]);
  const enrichedAlertsLive = useMemo(
    () => applyLiveNsaoToAlerts(enrichedAlerts, nsaoData),
    [enrichedAlerts, nsaoData],
  );

  const threatFeed = useMemo(
    () =>
      enrichedAlertsLive.map((alert) => ({
        ...alert,
        riskScore: Math.max(alert.riskScore, alert.computedRisk).toFixed(1),
      })),
    [enrichedAlertsLive],
  );

  const adaptiveSystemRisk = useMemo(
    () => computeSystemRisk(enrichedAlertsLive, systemMetrics.riskScore),
    [enrichedAlertsLive, systemMetrics.riskScore],
  );

  const incidentRisk = nsaoData?.incident_analysis
    ? severityScoreToRisk(nsaoData.incident_analysis.severity_score, null)
    : null;

  // Override the first alert if we have live Python backend anomalies
  const primaryAlert = incidentRisk !== null && incidentRisk > 60
    ? {
      severity: incidentRisk > 85 ? 'CRITICAL' : 'HIGH',
      container: nsaoData.visual_directives?.active_subgraph?.[0] || 'Unknown Origin',
      riskScore: incidentRisk.toFixed(1),
      type: nsaoData.incident_analysis.mitre_mapping !== 'None'
        ? nsaoData.incident_analysis.mitre_mapping
        : 'Anomalous Spatio-Temporal Flow',
      description: nsaoData.incident_analysis.root_cause_summary,
      cluster: nsaoData.visual_directives?.active_subgraph?.[1] || 'Internal Network',
    }
    : threatFeed[0];
  return (
    <div className="bg-surface text-[#25324b] selection:bg-primary-container selection:text-primary min-h-screen">
      <div className="particle-bg"></div>
      
      {/* Centralized Global Navigation */}
      <TopNavigation onNavigate={onNavigate} currentPage="alerts" />

      {/* SideNavBar */}
      <aside className="h-screen w-72 fixed left-0 top-0 border-r border-[#6c5a61]/10 bg-[#f1f3ff] dark:bg-slate-950/40 backdrop-blur-2xl flex flex-col py-10 px-4 gap-8 z-40">
        <div className="mt-16 px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#6c5a61] font-serif">Command Center</h3>
              <p className="text-xs text-[#6c5a61]/60 italic font-serif">Tier 1 Access</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <a onClick={() => onNavigate('alerts')} className="cursor-pointer bg-[#d7e2ff] dark:bg-[#6c5a61]/20 text-[#6c5a61] font-bold rounded-full px-6 py-3 flex items-center gap-4 transition-transform hover:scale-105">
            <span className="material-symbols-outlined">radar</span> Threat Feed
          </a>
        </nav>
        
        <div className="px-4 pb-4">
          <div className="mt-8 flex flex-col gap-2">
            <a onClick={() => onNavigate('dashboard')} className="cursor-pointer text-[#6c5a61]/70 px-6 py-2 flex items-center gap-4 text-sm hover:bg-white/20 rounded-full">
              <span className="material-symbols-outlined">logout</span> Back to Dashboard
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-72 pt-24 pb-16 px-8 max-w-[1600px] mx-auto z-10 relative">
        {/* Header Section */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="text-primary tracking-widest uppercase text-xs font-bold mb-4 block">Omni-Kernel Security Operations</span>
            <h1 className="text-7xl font-extrabold text-on-surface leading-[0.9] tracking-tighter mb-8">
              Chronicle of <br/>
              <span className="italic font-light text-primary">Compromise</span>
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl">
              An editorial orchestration of real-time architectural fractures. Monitoring active security alerts through a lens of narrative precision.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="glass-panel p-8 rounded-xl border border-outline-variant/10 min-w-[220px]">
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2 block">Global Risk</span>
              <div className="text-5xl font-bold tracking-tight text-on-surface">{adaptiveSystemRisk.toFixed(1)}</div>
              <div className="mt-4 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${adaptiveSystemRisk}%` }}></div>
              </div>
            </div>
          </div>
        </header>

        {/* Threat Feed Bento Grid mapped statically to match the CSS layout precisely */}
        <div className="grid grid-cols-12 gap-10">
          
          {/* Alert 1 */}
          <section className="col-span-12 lg:col-span-8 group">
            <div className="relative overflow-hidden glass-panel rounded-xl p-10 hover:shadow-[0_40px_80px_rgba(37,50,75,0.08)] transition-all duration-700 h-full">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-4">
                  <span className={`text-on-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${primaryAlert.severity === 'CRITICAL' ? 'bg-[#c93b5d]' : 'bg-primary'}`}>{primaryAlert.severity}</span>
                  <span className="text-on-surface-variant font-medium">{primaryAlert.container}</span>
                </div>
                <div className="text-right">
                  <span className="block text-4xl font-bold text-on-surface">{primaryAlert.riskScore}</span>
                  <span className="text-xs text-primary font-bold uppercase tracking-tighter">Severity Score</span>
                  {incidentRisk === null && (
                    <span className="block text-[10px] text-on-surface/50 mt-1">sigma(w·x) calibrated</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-12 items-end">
                <div className="flex-1">
                  <h2 className="text-4xl font-bold tracking-tight mb-4 text-on-surface">{primaryAlert.type}</h2>
                  <p className="text-lg text-on-surface-variant leading-relaxed italic mb-8">
                    "{primaryAlert.description}"
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="px-6 py-2 bg-surface-container-high rounded-full text-sm text-primary font-semibold">{primaryAlert.cluster}</div>
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-200"></div>
                      <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-300"></div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-64 h-32 relative">
                  {/* Naked Chart Simulation */}
                  <div className="absolute inset-0 flex items-end justify-between gap-1">
                    <div className="w-3 bg-primary/20 rounded-t-full h-[40%]"></div>
                    <div className="w-3 bg-primary/30 rounded-t-full h-[60%]"></div>
                    <div className="w-3 bg-primary/40 rounded-t-full h-[85%]"></div>
                    <div className="w-3 bg-primary/60 rounded-t-full h-[70%]"></div>
                    <div className="w-3 bg-primary rounded-t-full h-[100%]"></div>
                    <div className="w-3 bg-primary/80 rounded-t-full h-[90%]"></div>
                    <div className="w-3 bg-primary/40 rounded-t-full h-[55%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Alert 2 */}
          <section className="col-span-12 lg:col-span-4">
            <div className="h-full glass-panel rounded-xl p-8 bg-gradient-to-br from-surface-container-low to-white shadow-sm hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between mb-8">
                <span className="bg-[#e6ced6] text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase">{threatFeed[1].severity}</span>
                <span className="text-2xl font-bold italic">{threatFeed[1].riskScore}</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">{threatFeed[1].type}</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                {threatFeed[1].description}
              </p>
              
              {/* SHAP Data Vis replacing abstract image */}
              <div className="w-full bg-surface-container-low rounded-lg p-6 mb-6">
                <span className="text-[10px] uppercase font-bold text-primary block mb-4 tracking-widest">SHAP Intervention Model</span>
                <div className="flex flex-col gap-3">
                  {Object.entries(threatFeed[1].shap).slice(0, 3).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-on-surface-variant font-medium uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-primary">{(value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${value * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest mb-2">
                Top drivers: {threatFeed[1].topDrivers?.join(', ') || '—'}
              </div>
              <div className="text-xs font-bold text-primary uppercase tracking-widest">{threatFeed[1].cluster}</div>
            </div>
          </section>

          {/* Alert 3 */}
          <section className="col-span-12 lg:col-span-5">
            <div className="glass-panel rounded-xl p-10 bg-[#f4dce4]/30 border-l-4 border-primary h-full">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{threatFeed[2].severity} Priority</span>
              </div>
              <h3 className="text-4xl font-bold mb-6 tracking-tight">{threatFeed[2].type}</h3>
              <div className="text-5xl font-light text-primary mb-8">{Number(threatFeed[2].riskScore).toFixed(1)}</div>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                {threatFeed[2].description} <span className="bg-primary/5 px-1 font-semibold text-on-surface">{threatFeed[2].container}</span>
              </p>
              <div className="mt-8 pt-8 border-t border-primary/10 flex justify-between items-center">
                <span className="text-sm italic font-medium">{threatFeed[2].cluster}</span>
                <button className="text-primary font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
                  Isolate <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          {/* Alert 4 */}
          <section className="col-span-12 lg:col-span-7">
            <div className="glass-panel rounded-xl p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden h-full">
              <div className="flex-1">
                <span className="text-xs font-bold bg-surface-container-highest px-3 py-1 rounded-full text-secondary mb-4 inline-block">{threatFeed[3].container}</span>
                <h3 className="text-5xl font-bold mb-6 tracking-tighter">{threatFeed[3].type}</h3>
                <p className="text-on-surface-variant mb-8 leading-relaxed">
                  {threatFeed[3].description}
                </p>
                <div className="flex gap-4">
                  <span className="text-sm font-bold border-b border-on-surface pb-1">{threatFeed[3].riskScore} RISK</span>
                  <span className="text-sm font-medium text-on-surface/60 italic">{threatFeed[3].cluster}</span>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square rounded-full border-[12px] border-primary-container/30 flex items-center justify-center p-8 text-center relative">
                <div className="text-3xl font-black text-primary">{threatFeed[3].riskScore}%</div>
                <div className="absolute -top-2 right-4 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-sm">security_update_warning</span>
                </div>
              </div>
            </div>
          </section>

          {/* Alert 5 */}
          <section className="col-span-12 lg:col-span-6">
            <div className="glass-panel rounded-xl p-10 flex gap-10 bg-gradient-to-tr from-white to-[#d7e2ff]/20 h-full">
              <div className="w-2 rounded-full min-h-full bg-secondary-container"></div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between mb-8 items-center">
                  <h3 className="text-3xl font-bold tracking-tight">{threatFeed[4].type}</h3>
                  <span className="text-lg font-bold">{threatFeed[4].riskScore}</span>
                </div>
                <p className="text-lg text-on-surface-variant italic mb-10 leading-relaxed flex-1">
                  "{threatFeed[4].description}"
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-on-surface/40 block mb-1">Source</span>
                    <span className="font-bold text-sm">{threatFeed[4].container}</span>
                  </div>
                  <div className="bg-surface p-4 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-on-surface/40 block mb-1">Region</span>
                    <span className="font-bold text-sm">{threatFeed[4].cluster.replace('prod-', '')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Alert 6 */}
          <section className="col-span-12 lg:col-span-3">
            <div className="glass-panel rounded-xl p-8 h-full flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest text-primary uppercase mb-4 block">Lateral Movement</span>
                <h4 className="text-2xl font-bold mb-4">{threatFeed[5].type}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {threatFeed[5].description}
                </p>
              </div>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{threatFeed[5].riskScore}</span>
                <span className="text-xs uppercase text-primary/60 font-bold">{threatFeed[5].severity}</span>
              </div>
            </div>
          </section>

          {/* Alert 7 */}
          <section className="col-span-12 lg:col-span-3">
            <div className="glass-panel rounded-xl p-8 h-full bg-[#f1f3ff] border border-outline-variant/5 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                </div>
                <h4 className="text-2xl font-bold mb-4">{threatFeed[6].type}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {threatFeed[6].description}
                </p>
              </div>
              <div className="mt-8">
                <span className="text-3xl font-bold text-on-surface/30">{threatFeed[6].riskScore}</span>
                <div className="text-[10px] font-bold text-on-surface/40 uppercase mt-2">{threatFeed[6].severity} Priority</div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Decoration */}
        <footer className="mt-16 border-t border-primary/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex gap-12">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-2">Active Alerts</span>
              <span className="text-3xl font-bold">{systemMetrics.activeAlerts}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-2">Resolved</span>
              <span className="text-3xl font-bold text-on-surface/40">{systemMetrics.anomaliesDetected}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
