import React from 'react';
import TopNavigation from '../components/dashboard/TopNavigation';

const useCaseSteps = [
  { step: '01', name: 'CIoT Telemetry Ingestion', desc: 'Smart meters and IoT sensors stream usage data (water, electricity) to the Omni-Kernel eBPF agents deployed at edge clusters.', icon: 'sensors' },
  { step: '02', name: 'Federated Model Training', desc: 'Each utility sector trains local anomaly detection models without sharing raw telemetry data -- preserving privacy across municipal boundaries.', icon: 'psychology' },
  { step: '03', name: 'Behavioral Baseline', desc: 'The federated model establishes normal consumption patterns per device class, time-of-day, and geographic zone.', icon: 'query_stats' },
  { step: '04', name: 'Anomaly Detection', desc: 'Deviations from baseline trigger real-time alerts -- such as cryptojacking signatures (sudden GPU spikes) or unauthorized API access patterns.', icon: 'crisis_alert' },
  { step: '05', name: 'Kernel-Level Block', desc: 'The eBPF defense layer blocks the offending process at the syscall level within milliseconds, preventing further resource abuse.', icon: 'shield' },
  { step: '06', name: 'Secure Model Rollback', desc: 'If a model version is compromised, the system initiates a rollback to the last verified secure checkpoint automatically.', icon: 'settings_backup_restore' },
];

const federatedFeatures = [
  { title: 'Privacy Preservation', desc: 'Raw telemetry never leaves the local cluster. Only model gradients are shared.', icon: 'lock' },
  { title: 'Cross-Sector Collaboration', desc: 'Water, electricity, and transport sectors collaborate on detection without data exposure.', icon: 'hub' },
  { title: 'Edge Deployment', desc: 'Models run inference at the 6G edge, ensuring sub-millisecond response times.', icon: 'cell_tower' },
  { title: 'Adversarial Robustness', desc: 'Federated aggregation detects and rejects poisoned model updates from compromised nodes.', icon: 'security' },
];

const threatScenarios = [
  {
    threat: 'Cryptojacking on Smart Meters',
    description: 'Attacker deploys cryptocurrency mining malware on compromised smart meters, hijacking compute resources and inflating energy readings.',
    detection: 'Abnormal CPU/GPU utilization pattern detected by temporal LSTM model. SHAP identifies sys_mmap and cpu_frequency as top contributors.',
    response: 'eBPF blocks the mining process. SOAR quarantines the meter and triggers a firmware integrity check.',
    severity: 'CRITICAL',
  },
  {
    threat: 'Unauthorized API Access',
    description: 'Compromised credentials used to access the utility management API from an unusual geographic location and device fingerprint.',
    detection: 'Zero-trust policy flags the session. Geolocation mismatch and device fingerprint anomaly score exceeds threshold.',
    response: 'MFA challenge triggered. Session suspended pending re-authentication. API keys rotated automatically.',
    severity: 'HIGH',
  },
  {
    threat: 'Model Poisoning Attack',
    description: 'Adversary attempts to corrupt the federated learning model by injecting malicious gradient updates from a compromised edge node.',
    detection: 'Gradient magnitude and direction checked against Byzantine-fault-tolerant median. Outlier gradients flagged.',
    response: 'Poisoned updates rejected. Node isolated from federation. Model rolled back to last verified checkpoint.',
    severity: 'HIGH',
  },
];

export default function SixGPage({ onNavigate }) {
  return (
    <div className="bg-[#f9f9ff] text-[#25324b] selection:bg-primary-container selection:text-primary min-h-screen relative font-sans">
      <div className="particle-bg"></div>
      <TopNavigation onNavigate={onNavigate} currentPage="sixg" />

      <main className="pt-24 pb-32">
        {/* Hero Section — Editorial Magazine Style */}
        <header className="px-12 mb-24 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="w-full md:w-2/3">
              <span className="text-primary tracking-widest uppercase text-xs font-bold mb-6 block">Omni-Kernel | 6G Infrastructure Defense</span>
              <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none mb-8">
                Securing the<br/>
                <span className="text-primary italic font-light">Smart City</span>
              </h1>
              <p className="text-2xl text-on-surface-variant max-w-xl leading-relaxed">
                In a 6G-ready smart city, Omni-Kernel protects Critical Industrial IoT (CIoT) by monitoring water and electricity usage behaviors through Federated Learning — without sharing sensitive local telemetry between utility sectors.
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl rotate-3 translate-y-12 bg-surface-container-high border border-primary/10 flex flex-col justify-between p-8">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>cell_tower</span>
                  <span className="text-secondary font-bold tracking-widest text-xs uppercase">6G Edge</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-[16px] border-primary-container/20">
                    <span className="text-5xl font-extrabold text-primary tracking-tighter">&lt;5ms</span>
                    <span className="absolute bottom-8 text-xs font-bold uppercase tracking-widest text-primary/60">Latency</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-on-surface mb-2">Defense Metrics</h4>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2 mb-2 text-sm pt-2">
                    <span className="text-on-surface-variant">Block Response</span>
                    <span className="font-bold">&lt;1ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Model Rollback</span>
                    <span className="font-bold">&lt;500ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Protection Workflow — Narrative Style */}
        <section className="px-12 mb-24 max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-sm tracking-widest uppercase text-outline mb-4 block">End-to-End Pipeline</span>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-4">Protection <span className="italic font-light text-primary">Workflow</span></h2>
            <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
              Six-stage CIoT defense pipeline from telemetry ingestion to autonomous model recovery.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCaseSteps.map((s, i) => (
              <div key={s.step} className="glass-panel p-8 rounded-xl border-t-4 border-primary/20 hover:border-primary transition-all duration-500 hover:shadow-lg bg-gradient-to-br from-surface to-white group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary-container/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>{s.icon}</span>
                  </div>
                  <span className="text-4xl font-black text-on-surface/10 tracking-tighter">{s.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight text-on-surface">{s.name}</h3>
                <p className="text-sm text-on-surface-variant italic leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Federated Learning — Branching Diagram Section */}
        <section className="bg-surface-container-high py-24 px-8 mb-24 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20 text-center">
              <h3 className="text-4xl font-bold italic mb-4">Federated Learning Architecture</h3>
              <p className="text-outline">Privacy-preserving collaborative model training across utility sectors.</p>
            </div>
            
            <div className="relative flex flex-col items-center">
              {/* Root Node */}
              <div className="relative z-10 bg-white p-8 rounded-full border border-outline-variant/20 shadow-sm mb-16 px-10">
                <span className="font-bold text-lg flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>hub</span>
                  Global Model Aggregator
                </span>
              </div>
              
              <div className="w-full flex justify-between max-w-5xl relative">
                {/* Connecting Lines */}
                <div className="absolute top-[-4rem] left-1/2 w-px h-16 branch-line"></div>
                <div className="absolute top-0 left-[12%] right-[12%] h-px bg-outline-variant/30"></div>
                
                {federatedFeatures.map((f, i) => (
                  <div key={f.title} className="w-1/4 flex flex-col items-center text-center px-3">
                    <div className="h-12 w-px bg-outline-variant/30"></div>
                    <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <span className="material-symbols-outlined text-primary mb-3" style={{fontVariationSettings: "'FILL' 1"}}>{f.icon}</span>
                      <h4 className="font-bold mb-2">{f.title}</h4>
                      <p className="text-sm text-secondary italic leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Threat Scenarios — Magazine Article Cards */}
        <section className="px-12 mb-24 max-w-7xl mx-auto space-y-24">
          <div className="mb-8">
            <span className="text-sm tracking-widest uppercase text-outline mb-4 block">CIoT-Specific Threats</span>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">Real-World <span className="italic font-light text-primary">Threat Scenarios</span></h2>
          </div>

          {/* Threat 1 — Full Width Feature */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8">
              <span className="text-sm tracking-widest uppercase text-outline mb-4 block">Scenario Alpha</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">{threatScenarios[0].threat}</h2>
              <div className="bg-surface-container-low p-8 rounded-lg border-l-4 border-[#c93b5d] mb-6">
                <p className="text-xl leading-relaxed text-on-surface-variant italic">
                  "{threatScenarios[0].description}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Detection Method</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{threatScenarios[0].detection}</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Autonomous Response</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{threatScenarios[0].response}</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col justify-center">
              <div className="p-8 bg-[#e6ced6]/30 rounded-full text-center">
                <span className="text-5xl font-bold text-[#c93b5d] italic">CRITICAL</span>
                <p className="text-sm mt-2 text-on-surface-variant uppercase tracking-widest">Severity Rating</p>
              </div>
            </div>
          </div>

          {/* Threat 2 — Right Aligned */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-start-5 md:col-span-8 text-right">
              <span className="text-sm tracking-widest uppercase text-outline mb-4 block">Scenario Beta</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">{threatScenarios[1].threat}</h2>
              <div className="bg-surface-container-low p-8 rounded-lg border-r-4 border-primary text-left mb-6">
                <p className="text-xl leading-relaxed text-on-surface-variant italic">
                  "{threatScenarios[1].description}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="glass-panel p-6 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Detection Method</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{threatScenarios[1].detection}</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Autonomous Response</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{threatScenarios[1].response}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Threat 3 — Left Aligned */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8">
              <span className="text-sm tracking-widest uppercase text-outline mb-4 block">Scenario Gamma</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">{threatScenarios[2].threat}</h2>
              <div className="bg-[#f4dce4]/30 p-8 rounded-lg border-l-4 border-primary mb-6">
                <p className="text-xl leading-relaxed text-on-surface-variant italic">
                  "{threatScenarios[2].description}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Detection Method</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{threatScenarios[2].detection}</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Autonomous Response</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{threatScenarios[2].response}</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col justify-center">
              <div className="glass-panel p-8 rounded-xl flex flex-col items-center text-center gap-4">
                <span className="material-symbols-outlined text-5xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                <div>
                  <p className="font-bold text-lg text-on-surface">Byzantine Fault Tolerance</p>
                  <p className="text-sm text-on-surface-variant italic mt-1">Gradient auditing prevents federated model corruption</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Response Time Metrics — Clean Footer Stats */}
        <section className="px-12 max-w-7xl mx-auto">
          <div className="border-t border-primary/10 pt-16 flex flex-col md:flex-row justify-between items-center gap-10">
            {[
              { label: 'Detection Latency', value: '<5ms', desc: 'Edge inference time', icon: 'bolt' },
              { label: 'Block Response', value: '<1ms', desc: 'Kernel-level process block', icon: 'shield' },
              { label: 'Model Rollback', value: '<500ms', desc: 'Secure checkpoint restore', icon: 'settings_backup_restore' },
            ].map(item => (
              <div key={item.label} className="flex-1 text-center">
                <span className="material-symbols-outlined text-primary text-3xl mb-4" style={{fontVariationSettings: "'FILL' 1"}}>{item.icon}</span>
                <div className="text-5xl font-black text-on-surface tracking-tighter mb-2">{item.value}</div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-1">{item.label}</span>
                <span className="text-sm text-on-surface-variant italic">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
