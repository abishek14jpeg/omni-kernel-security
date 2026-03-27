import React from 'react';
import { motion } from 'framer-motion';
import { BsCpuFill, BsEyeFill, BsDiagram3Fill, BsShieldLockFill, BsLightningChargeFill } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import CanvasDataMesh from '../components/visualizations/CanvasDataMesh';
import TopNavigation from '../components/dashboard/TopNavigation';
import { mlModelStats } from '../data/mockData';

const modelIcons = {
  'Federated VAE': BsDiagram3Fill,
  'Isolation Forest': BsShieldLockFill,
  'Random Forest': BsCpuFill,
  'Deep Classifier': BsLightningChargeFill,
  'Semantic Monitor': BsEyeFill,
};

// Map soft themed colors instead of standard strict colors
const modelColors = {
  'Federated VAE': '#d8b4e2', // Soft Purple
  'Isolation Forest': '#c5e1a5', // Soft Green
  'Random Forest': '#ffe0b2', // Soft Amber
  'Deep Classifier': '#b3e5fc', // Soft Blue
  'Semantic Monitor': '#b2ebf2', // Soft Light Cyan
};

const FadeInScroll = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function AIPage({ onNavigate }) {
  const ensembleScore = (
    mlModelStats.reduce((acc, model) => {
      const accuracyWeight = model.accuracy / 100;
      const latencyPenalty = Math.max(0.2, 1 - model.latency / 100);
      return acc + (accuracyWeight * latencyPenalty);
    }, 0) / mlModelStats.length
  ) * 100;

  const pipelineSteps = [
    { step: '01', name: 'Ingestion', desc: 'Secure intercept of system calls', color: '#b3e5fc' },
    { step: '02', name: 'Featurization', desc: 'Abstracted behavioral embeddings', color: '#81d4fa' },
    { step: '03', name: 'Global Baseline', desc: 'Federated continuous learning', color: '#d8b4e2' },
    { step: '04', name: 'Local Anomaly', desc: 'Cluster-specific deviation detection', color: '#ffe0b2' },
    { step: '05', name: 'Classification', desc: 'Deep attack categorization', color: '#ffcc80' },
    { step: '06', name: 'XAI Rationale', desc: 'Human-readable threat synthesis', color: '#f48fb1' },
    { step: '07', name: 'SOAR Response', desc: 'Autonomous playbook execution', color: '#c5e1a5' },
  ];

  return (
    <div className="relative min-h-[120vh] w-full pb-20 -mx-4 sm:-mx-6 lg:-mx-8">
      <TopNavigation onNavigate={onNavigate} currentPage="ai" />
      {/* 3D Background - Fixed Edge to Edge */}
      <div className="fixed inset-0 z-0 pointer-events-none w-screen top-14 h-[50vh]">
        <CanvasDataMesh />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent z-10" />
      </div>

      <div className="relative z-10 space-y-24">
        {/* Hero Section */}
        <section className="px-4 sm:px-8 lg:px-16 pt-24 pb-12 w-full max-w-screen-2xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-sans font-medium text-zinc-900 leading-tight tracking-tight mb-6 max-w-4xl"
          >
            Intelligence Embedded <br/>
            <span className="italic text-zinc-500">at the Kernel Level</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-zinc-500 max-w-2xl font-light leading-relaxed"
          >
            A fluid, continuously learning security fabric that adapts to emerging threat vectors intuitively, seamlessly blending rigorous mathematics with automated mitigation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/70 border border-white px-4 py-2"
          >
            <span className="mono text-[10px] tracking-widest uppercase text-zinc-500">Ensemble Score</span>
            <span className="text-sm font-medium text-zinc-900">{ensembleScore.toFixed(2)}%</span>
            <span className="mono text-[10px] text-zinc-400">S = mean(acc * (1 - latency/100))</span>
          </motion.div>
        </section>

        {/* Floating Model Metrics Section */}
        <section className="w-full bg-[#fce4ec]/30 py-24 border-y border-white/50 backdrop-blur-md">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16">
            <FadeInScroll>
              <h2 className="text-3xl font-sans text-zinc-900 mb-12">Active Defense Models</h2>
            </FadeInScroll>
            
            <div className="flex flex-nowrap overflow-x-auto gap-8 pb-8 no-scrollbar -mx-4 px-4 mask-edges scroll-smooth">
              {mlModelStats.map((m, index) => {
                const IconComponent = modelIcons[m.name] || BsShieldLockFill;
                const iconColor = modelColors[m.name] || '#b3e5fc';
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    key={m.name} 
                    className="min-w-[280px] bg-white/70 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/90 transition-all duration-300 border border-white flex-shrink-0"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: iconColor }}>
                      <IconComponent size={20} className="text-zinc-800" />
                    </div>
                    <h3 className="font-sans text-lg text-zinc-900 mb-1">{m.name}</h3>
                    <p className="mono text-[10px] tracking-widest text-zinc-400 uppercase mb-8">{m.type}</p>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">Accuracy</span>
                          <span className="font-sans text-sm font-medium text-zinc-800">{m.accuracy}%</span>
                        </div>
                        <div className="h-1 bg-zinc-100/50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${m.accuracy}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            className="h-full rounded-full" 
                            style={{ background: iconColor }} 
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-end pt-2 border-t border-zinc-100">
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Latency</div>
                          <div className="text-sm font-medium text-zinc-800">{m.latency}ms</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                          <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Combined Pipeline & Accuracy Visualization */}
        <section className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Visual Analytics */}
            <FadeInScroll>
              <div className="w-full">
                <h2 className="text-3xl font-sans text-zinc-900 mb-4">Precision Analytics</h2>
                <p className="text-zinc-500 font-light mb-12 max-w-md">Real-time performance evaluation of deep inference layers reacting to synthetic and live threat telemetry.</p>
                
                <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mlModelStats} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#71717a' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        domain={[85, 100]} 
                        tick={{ fontSize: 11, fill: '#71717a' }} 
                        axisLine={false} 
                        tickLine={false} 
                        width={30}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{ 
                          background: 'rgba(255,255,255,0.9)', 
                          border: 'none', 
                          borderRadius: '16px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Bar 
                        dataKey="accuracy" 
                        fill="#cfd8dc" 
                        radius={[6, 6, 6, 6]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeInScroll>

            {/* Inference Pipeline */}
            <FadeInScroll delay={0.2}>
              <div>
                <h2 className="text-3xl font-sans text-zinc-900 mb-4">Cognitive Pipeline</h2>
                <p className="text-zinc-500 font-light mb-12 max-w-md">The natural flow of data from kernel interception to autonomous healing.</p>
                
                <div className="relative pl-4 space-y-8">
                  {/* Subtle connecting line */}
                  <div className="absolute top-4 left-6 bottom-4 w-[1px] bg-gradient-to-b from-[#b3e5fc] via-[#f48fb1] to-[#c5e1a5] opacity-50" />
                  
                  {pipelineSteps.map((s, i) => (
                    <motion.div 
                      key={s.step} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="relative flex items-center gap-6 group"
                    >
                      <div 
                        className="w-5 h-5 rounded-full flex-shrink-0 z-10 border-4 border-[#fafafa]"
                        style={{ backgroundColor: s.color }}
                      />
                      <div className="flex-1 bg-white/40 hover:bg-white/80 transition-colors backdrop-blur-sm px-6 py-4 rounded-2xl">
                        <div className="font-sans text-base text-zinc-900 mb-1">{s.name}</div>
                        <div className="text-sm text-zinc-500 font-light">{s.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeInScroll>
            
          </div>
        </section>
      </div>
    </div>
  );
}


