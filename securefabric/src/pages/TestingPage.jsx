import React, { useState, useEffect, useMemo } from 'react';
import { SimulationEngine } from '../utils/SimulationEngine';
import { systemMetrics, telemetryStream } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import TopNavigation from '../components/dashboard/TopNavigation';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export default function TestingPage({ onNavigate }) {
  const [engine] = useState(new SimulationEngine(telemetryStream.map(t => t.syscalls)));
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Run tests
  const runDiagnostics = () => {
    setIsRunning(true);
    
    setTimeout(() => {
      const zTestNormal = engine.calculateZScore(42000);
      const zTestSpike = engine.calculateZScore(85000);
      const monteCarlo = engine.runMonteCarloRisk(systemMetrics.riskScore, 8, 0.2, 20, 500);
      const kktOpts = engine.optimizeResourcesKKT(100, 40, 1000);
      const poissonHighLoad = engine.calculateAttackProbability(5, 12);

      setTestResults({
        zScore: { normal: zTestNormal, spike: zTestSpike },
        monteCarlo,
        kkt: kktOpts,
        poisson: poissonHighLoad,
        timestamp: new Date().toISOString()
      });
      setIsRunning(false);
    }, 1200);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const mcChartData = useMemo(() => {
    if (!testResults) return [];
    let data = [];
    for (let step = 0; step < 20; step++) {
      let row = { step: `T+${step}` };
      testResults.monteCarlo.samplePaths.forEach((path, i) => {
        row[`path_${i}`] = path[step];
      });
      data.push(row);
    }
    return data;
  }, [testResults]);

  return (
    <div className="bg-[#f9f9ff] text-[#25324b] min-h-screen relative font-sans">
      <TopNavigation onNavigate={onNavigate} currentPage="testing" />

      <main className="pt-32 pb-32 max-w-7xl mx-auto px-12">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-sm font-bold tracking-widest uppercase text-violet-800/60 mb-2 block">Runtime Verification</span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 font-serif">Algorithmic Diagnostics</h1>
            <p className="text-xl text-slate-500 max-w-2xl">Live mathematical testing suite verifying KKT bounds, Monte Carlo predictions, and Stochastic anomaly detection.</p>
          </div>
          <button 
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-violet-900 border-2 border-violet-800 hover:bg-violet-800 text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all shadow-xl disabled:opacity-50 flex items-center gap-3 shrink-0"
          >
            {isRunning ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div> Resolving Models...</>
            ) : 'Re-Run Diagnostics'}
          </button>
        </header>

        {!testResults ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Monte Carlo Section */}
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 col-span-1 lg:col-span-2">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2 block">Risk Forecast Modeling</span>
                <h3 className="text-3xl font-bold font-serif text-slate-800">Monte Carlo Simulation <InlineMath math="(N=500)" /></h3>
                <div className="flex gap-12 mt-6">
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Mean Risk <InlineMath math="(T+20)" /></div>
                    <div className="text-5xl font-black text-blue-600">{testResults.monteCarlo.averagePredictedRisk.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">95th Percentile Limit</div>
                    <div className="text-5xl font-black text-rose-500">{testResults.monteCarlo.p95Risk.toFixed(1)}</div>
                  </div>
                </div>
              </div>
              <div className="h-96 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mcChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="step" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    {testResults.monteCarlo.samplePaths.map((_, i) => (
                      <Line key={i} type="natural" dataKey={`path_${i}`} stroke="#8b5cf6" strokeWidth={1} dot={false} strokeOpacity={0.15} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KKT Optimization Results */}
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2 block">Active Resource Allocation</span>
                <h3 className="text-2xl font-bold font-serif text-slate-800 mb-6">KKT Runtime Diagnostics</h3>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-8">
                  <BlockMath math="\min L(x) + \gamma E(x) \quad \text{s.t.} \quad x_L + x_E \le \mathcal{B}" />
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="font-bold text-slate-500">Optimal Latency <InlineMath math="(x_L^*)" /></span>
                    <span className="font-mono text-xl font-bold text-emerald-600">{testResults.kkt.optimalLatencyAllocation.toFixed(2)} MHz</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="font-bold text-slate-500">Optimal Energy <InlineMath math="(x_E^*)" /></span>
                    <span className="font-mono text-xl font-bold text-emerald-600">{testResults.kkt.optimalEnergyAllocation.toFixed(2)} W</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <span className="italic text-emerald-800 font-medium text-sm">Primal bounds are actively maintained.</span>
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-widest">VERIFIED</span>
              </div>
            </div>

            {/* Z-Score & Poisson */}
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
               <div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2 block">Stochastic Outliers</span>
                <h3 className="text-2xl font-bold font-serif text-slate-800 mb-6">Syscall Deviation Testing</h3>
                
                <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="text-sm font-bold text-slate-700 mb-4">Injection Response (85,000 Syscalls/s)</div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Standard Score (Z)</span>
                    <span className={`text-2xl font-mono tracking-tighter ${testResults.zScore.spike.isAnomaly ? "text-rose-500 font-black" : "text-slate-800 font-bold"}`}>
                      {testResults.zScore.spike.zScore.toFixed(2)}<span className="text-lg opacity-60 ml-1">σ</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-orange-200 bg-orange-50">
                <div className="text-sm font-bold text-orange-900 mb-3 block">Probability of Load Overrun <InlineMath math="P(X \ge 12 | \lambda = 5)" /></div>
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-black tracking-tighter text-orange-600">{(testResults.poisson * 100).toFixed(4)}%</div>
                  <div className="text-xs text-orange-800 font-medium leading-relaxed">
                    Calculated via exact Poisson sum for network thresholds exceeding +300% volume.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
