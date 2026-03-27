import React from 'react';
import { Eye, Clock, Target, Cpu, CheckCircle2 } from 'lucide-react';
import TopNavigation from '../components/dashboard/TopNavigation';

const comparisonMetrics = [
  { metric: 'Telemetry Access', traditional: 'Limited to OS/Logs', omniKernel: 'Kernel-Level (Full Access)', improvement: 'High Visibility' },
  { metric: 'Latency (E-W Traffic)', traditional: 'Baseline', omniKernel: '70% Lower', improvement: '70% Reduction' },
  { metric: 'False Positive Rate', traditional: '8.0 - 12.0%', omniKernel: '2.0 - 3.0%', improvement: '75% Reduction' },
  { metric: 'Zero-Day Detection', traditional: 'Reactive (Signatures)', omniKernel: 'Proactive (Behavioral AI)', improvement: '92.8% Detection Rate' },
  { metric: 'Resource Efficiency', traditional: 'High Overhead (Agents)', omniKernel: 'Low Overhead (eBPF)', improvement: '50% More Efficient' },
];

const keyAdvantages = [
  { title: 'Kernel-Level Visibility', desc: 'eBPF agents capture every syscall, network packet, and trace directly from kernel hooks -- providing visibility that no overlay system can match.', icon: Eye, stat: '100%', statLabel: 'Event coverage' },
  { title: '70% Lower Latency', desc: 'Security checks run inline at the kernel level rather than routing through external proxies or sidecars, eliminating the latency penalty.', icon: Clock, stat: '70%', statLabel: 'Latency reduction' },
  { title: 'Proactive Zero-Day Defense', desc: 'Behavioral AI models detect unknown threats by identifying anomalous patterns rather than matching known signatures.', icon: Target, stat: '92.8%', statLabel: 'Detection rate' },
  { title: 'Minimal Resource Overhead', desc: 'eBPF programs run inside the kernel VM sandbox, consuming significantly fewer CPU cycles than traditional agent-based solutions.', icon: Cpu, stat: '<2%', statLabel: 'CPU overhead' },
];

export default function ComparisonPage({ onNavigate }) {
  return (
    <div className="bg-[#f9f9ff] text-[#25324b] min-h-screen relative font-sans">
      <TopNavigation onNavigate={onNavigate} currentPage="comparison" />
      
      <main className="pt-32 pb-32">
        <header className="px-12 mb-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="w-full">
              <span className="text-sm font-bold tracking-widest uppercase text-pink-800/60 mb-6 block">Comparative Analysis</span>
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tighter leading-none mb-8 font-serif">
                Shifting the <br/>
                <span className="text-pink-900 italic font-light">Paradigm</span>
              </h1>
              <p className="text-2xl text-slate-500 max-w-3xl leading-relaxed border-l-4 border-pink-300 pl-6">
                Evaluating the Omni-Kernel architecture against traditional Overlay/IDS security models. The data speaks to a fundamentally superior approach to systemic observation.
              </p>
            </div>
          </div>
        </header>

        {/* Modern Table Overhaul */}
        <section className="px-12 mb-24 max-w-7xl mx-auto">
          <div className="bg-white rounded-[2rem] p-10 shadow-2xl shadow-pink-900/5 border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-bl-full -z-0 opacity-50"></div>
            <div className="relative z-10 w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-xs">Metric</th>
                    <th className="py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-xs">Traditional IDS/Overlay</th>
                    <th className="py-4 px-6 font-bold text-pink-800 uppercase tracking-widest text-xs">Omni-Kernel</th>
                    <th className="py-4 px-6 font-bold text-slate-400 uppercase tracking-widest text-xs">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMetrics.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-pink-50/50 transition-colors">
                      <td className="py-6 px-6 font-bold text-slate-800">{row.metric}</td>
                      <td className="py-6 px-6 text-slate-500">{row.traditional}</td>
                      <td className="py-6 px-6 text-pink-700 font-bold">{row.omniKernel}</td>
                      <td className="py-6 px-6">
                        <span className="bg-emerald-100 text-emerald-800 py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-widest">
                          {row.improvement}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Key Advantages Grid */}
        <section className="px-12 max-w-7xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyAdvantages.map((adv, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-10 shadow-lg shadow-slate-200/50 flex flex-col justify-between border border-slate-100 hover:border-pink-200 transition-colors">
                <div>
                  <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-8">
                    <adv.icon size={32} />
                  </div>
                  <h3 className="text-3xl font-bold font-serif text-slate-800 mb-4">{adv.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-lg mb-8">{adv.desc}</p>
                </div>
                <div className="border-t border-slate-100 pt-6 flex items-baseline gap-3">
                  <span className="text-5xl font-black text-pink-900 tracking-tighter">{adv.stat}</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">{adv.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusion Banner */}
        <section className="px-12 max-w-7xl mx-auto">
          <div className="bg-slate-900 text-white p-12 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={40} className="text-slate-900" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Overall Assessment</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                Omni-Kernel achieves a <span className="text-white font-bold">70% reduction</span> in security-induced latency and a <span className="text-white font-bold">40% improvement</span> in threat detection coverage globally. By embedding defense at the kernel level via eBPF, we execute full-stack visibility with less than 2% CPU overhead.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
