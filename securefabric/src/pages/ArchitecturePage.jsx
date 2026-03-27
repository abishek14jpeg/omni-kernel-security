import React from 'react';
import { Layers, Cpu, Network, Bug, Shield, Server, Brain, Workflow, Box } from 'lucide-react';
import TopNavigation from '../components/dashboard/TopNavigation';

const architectureLayers = [
  {
    name: 'Telemetry Layer (eBPF)',
    desc: 'Deployed as a DaemonSet in Kubernetes, lightweight eBPF agents capture system calls (syscalls), network packets, and application traces directly from the Linux kernel hooks (kprobes and tracepoints).',
    icon: Cpu,
    details: ['Sandboxed BPF programs in kernel VM', 'Less than 2% CPU overhead', 'kprobes and tracepoint hooks', 'No context-switching to user space'],
  },
  {
    name: 'AI Orchestration & Decision Engine',
    desc: 'The central intelligence layer that integrates multiple machine learning models to analyze unified telemetry in real-time.',
    icon: Brain,
    details: ['CNN for spatial analysis of network flows', 'Transformer/LSTM for temporal sequences', 'SHAP/LIME explainability rationale', 'Federated learning across clusters'],
  },
  {
    name: 'Microservices Mesh',
    desc: 'Functional components like network traffic classification, intrusion detection, and malware analysis are containerized to run independently, ensuring fault tolerance and scalability.',
    icon: Network,
    details: ['Independent containerized services', 'Traffic classification module', 'Intrusion detection service', 'Malware analysis pipeline'],
  },
  {
    name: 'Honeypot Subsystem',
    desc: 'A proactive environment that traps attackers to gather real-world data, which is then used to retrain the global AI models.',
    icon: Bug,
    details: ['Deceptive attack surfaces', 'Real-world data collection', 'Automated model retraining', '6-hour retrain cycles'],
  },
];

const workflowSteps = [
  { step: '01', name: 'Event Collection & Ingestion', desc: 'eBPF agents monitor system-level events (e.g., execve for process creation) without the overhead of context-switching to user space.' },
  { step: '02', name: 'Privacy-Preserving Featurization', desc: 'A local pipeline immediately converts raw events into compact feature vectors (e.g., frequency histograms or sequence embeddings). Raw data never leaves the cluster.' },
  { step: '03', name: 'Spatial Analysis (CNN)', desc: 'A Convolutional Neural Network identifies complex spatial patterns in network flows for anomaly detection.' },
  { step: '04', name: 'Temporal Analysis (LSTM/Transformer)', desc: 'Captures long-range dependencies and fine-grained characteristics of intrusion behavior using sequence models.' },
  { step: '05', name: 'Explainability (XAI)', desc: 'SHAP calculates the contribution of each feature to the anomaly score, providing analysts with a Rationale Chip that explains the alert.' },
  { step: '06', name: 'Autonomous Response (SOAR)', desc: 'If the risk score exceeds a threshold, the system triggers SOAR playbooks to automatically quarantine affected pods or block malicious IPs.' },
];

const techStack = [
  { category: 'Infrastructure', items: ['Kubernetes (Orchestration)', 'Docker (Containerization)'], icon: Server },
  { category: 'Backend', items: ['Node.js / Flask (API)', 'Python (ML Core)'], icon: Box },
  { category: 'Kernel Monitoring', items: ['C-based eBPF programs', 'kprobes & tracepoints'], icon: Cpu },
  { category: 'AI/ML', items: ['TensorFlow & Keras', 'Swin Transformer', 'SHAP/LIME'], icon: Brain },
  { category: 'Frontend', items: ['Tailwind CSS', 'Shadcn UI Components'], icon: Layers },
  { category: 'Compute', items: ['Cloud GPUs & TPUs'], icon: Workflow },
];

export default function ArchitecturePage({ onNavigate }) {
  return (
    <div className="bg-[#f9f9ff] text-[#25324b] min-h-screen relative font-sans">
      <TopNavigation onNavigate={onNavigate} currentPage="architecture" />
      
      <main className="pt-32 pb-32">
        <header className="px-12 mb-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="w-full">
              <span className="text-sm font-bold tracking-widest uppercase text-pink-800/60 mb-6 block">Omni-Kernel Architecture</span>
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tighter leading-none mb-8 font-serif">
                Security as a <br/>
                <span className="text-pink-900 italic font-light">Fabric</span>
              </h1>
              <p className="text-2xl text-slate-500 max-w-3xl leading-relaxed border-l-4 border-pink-300 pl-6">
                The architecture is built on the principle of integrating distributed security services across the entire compute stack -- from kernel-level telemetry to AI-driven autonomous response. Security is not bolted on; it is built in.
              </p>
            </div>
          </div>
        </header>

        {/* System Architecture */}
        <section className="px-12 mb-24 max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold font-serif mb-2">System Architecture</h2>
            <p className="text-lg text-slate-500">Four-layer security fabric</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {architectureLayers.map((layer, index) => (
              <div key={layer.name} className="bg-white p-10 rounded-3xl shadow-xl shadow-pink-900/5 group hover:-translate-y-2 transition-transform duration-500 border border-slate-100">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-500">
                  <layer.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-serif text-slate-800">{layer.name}</h3>
                <p className="text-slate-500 leading-relaxed mb-6">{layer.desc}</p>
                <ul className="space-y-3">
                  {layer.details.map(detail => (
                    <li key={detail} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="bg-pink-950 text-white py-32 px-12 mb-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-4">Full System Workflow</h2>
              <p className="text-xl text-pink-200/60 font-light">Automated relay from kernel-level capture to autonomous mitigation</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workflowSteps.map((s) => (
                <div key={s.step} className="border border-pink-800/50 bg-pink-900/20 p-8 rounded-3xl backdrop-blur-sm">
                  <span className="text-4xl font-black text-pink-500/30 font-serif block mb-6">{s.step}</span>
                  <h4 className="text-xl font-bold mb-3">{s.name}</h4>
                  <p className="text-pink-100/60 leading-relaxed text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="px-12 max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold font-serif mb-2">Tech Stack</h2>
            <p className="text-lg text-slate-500">Core technologies powering Omni-Kernel</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {techStack.map(ts => (
              <div key={ts.category} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:border-pink-300 transition-colors">
                <ts.icon size={32} className="text-pink-400 mb-4" />
                <h4 className="font-bold text-slate-800 mb-4">{ts.category}</h4>
                <div className="space-y-2">
                  {ts.items.map(item => (
                    <div key={item} className="text-sm text-slate-500 bg-slate-50 py-1 px-3 rounded-full">{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
