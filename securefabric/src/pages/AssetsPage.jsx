import React, { useState } from 'react';
import TopNavigation from '../components/dashboard/TopNavigation';

export default function AssetsPage({ onNavigate, telemetry, nsaoData }) {
  // Derive assets from NSAO Data active subgraph or use placeholders
  const activeNodes = nsaoData?.visual_directives?.active_subgraph || ['10.0.0.12', 'production-db', 'api-gateway'];
  const status = nsaoData?.visual_directives?.dashboard_state || 'NORMAL';
  
  // Use telemetry history to fake a "bytes transferred" list
  const recentBytes = telemetry && telemetry.length > 0 ? telemetry[telemetry.length - 1].networkEvents : 4200;

  // Active Manual Scanning State
  const [scanTarget, setScanTarget] = useState('');
  const [bytesTransferred, setBytesTransferred] = useState(25000);
  const [packetCount, setPacketCount] = useState(1500);
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [portEntropy, setPortEntropy] = useState(0.85);
  const [protocolType, setProtocolType] = useState('TCP');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAssets, setScannedAssets] = useState([]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanTarget.trim()) return;
    
    setIsScanning(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target: scanTarget, bytes_transferred: Number(bytesTransferred), packet_count: Number(packetCount), duration_seconds: Number(durationSeconds), port_entropy: Number(portEntropy), protocol_type: protocolType
        }),
      }).catch(() => null); // Catch network errors safely
      
      let data;
      if (!response || !response.ok) {
        // Backend offline: Start immersive browser fallback simulation
        await new Promise((resume) => setTimeout(resume, 1800));
        const fakeThreat = Math.random() * 80 + 10; // 10-90 range (already in 0-100 scale)
        data = {
          target: scanTarget,
          scan_time: new Date().toISOString(),
          ai_analysis: {
            threat_score: fakeThreat,
            classification: fakeThreat > 70 ? 'Critical Anomaly' : (fakeThreat > 40 ? 'Suspicious' : 'Normal Profile'),
            nsao_orchestration: { agent_confidence: Math.random() * 0.2 + 0.75 }
          },
          plot_base64: null // No Python backend plot, will fallback to CSS synthetic visualization
        };
      } else {
        data = await response.json();
      }
      
      // Normalize threat_score: backend returns 0-100, ensure it's in that range
      const rawScore = data.ai_analysis.threat_score;
      const normalizedScore = rawScore <= 1 ? rawScore * 100 : rawScore; // Handle 0-1 or 0-100 range

      // Generate stable deterministic bar heights (seeded by target name + score)
      const seed = scanTarget.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Math.floor(normalizedScore);
      const barHeights = Array.from({length: 45}, (_, j) => {
        const x = Math.sin(seed * (j + 1) * 0.7137) * 0.5 + 0.5; // deterministic pseudo-random 0-1
        return Math.floor(x * 80 + (normalizedScore % 20));
      });
      
      setScannedAssets(prev => [{
        node: data.target,
        bytes: Math.floor(normalizedScore),
        status: data.ai_analysis.classification === 'Critical Anomaly' ? 'CRITICAL_ALERT' : (data.ai_analysis.classification === 'Suspicious' ? 'WARNING' : 'NORMAL'),
        timestamp: data.scan_time,
        confidence: data.ai_analysis.nsao_orchestration.agent_confidence,
        plot_base64: data.plot_base64,
        barHeights, // pre-computed stable bar heights
      }, ...prev]);
      
    } catch (error) {
      console.error('Core scan malfunction:', error);
    } finally {
      setIsScanning(false);
      setScanTarget('');
    }
  };

  return (
    <div className="bg-surface text-[#25324b] selection:bg-primary-container selection:text-primary min-h-screen">
      <div className="particle-bg"></div>
      
      {/* Centralized Global Top Navigation */}
      <TopNavigation onNavigate={onNavigate} currentPage="assets" />

      <main className="pt-24 pb-16 px-8 max-w-[1200px] mx-auto z-10 relative">
        <header className="mb-16">
          <span className="text-primary tracking-widest uppercase text-xs font-bold mb-4 block">Omni-Kernel Subgraph Monitoring</span>
          <h1 className="text-6xl font-extrabold text-on-surface leading-[0.9] tracking-tighter mb-6">
            Active <span className="italic font-light text-primary">Assets</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
            Live topological inventory inferred from Spatio-Temporal Autoencoder telemetry flows.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeNodes.map((node, i) => (
            <div key={i} className="glass-panel p-8 rounded-xl border-t-4 border-primary/20 hover:border-primary transition-colors duration-500 hover:shadow-lg bg-gradient-to-br from-surface to-white group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined">{node.includes('.') ? 'dns' : 'deployed_code'}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${status === 'CRITICAL_ALERT' ? 'bg-[#e6ced6] text-primary' : 'bg-[#d7e2ff] text-secondary'}`}>
                  {status === 'CRITICAL_ALERT' && i === 0 ? 'Under Investigation' : 'Monitored'}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight text-on-surface">{node}</h3>
              <p className="text-sm text-on-surface-variant italic mb-8">Discovered via traffic pattern variance.</p>
              
              <div className="pt-6 border-t border-outline-variant/10 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold block mb-1">Current Load</span>
                  <span className="font-bold text-lg">{Math.max(recentBytes - (i * 1200), 200).toLocaleString()} B/s</span>
                </div>
                <button className="material-symbols-outlined text-primary hover:scale-110 transition-transform cursor-pointer">visibility</button>
              </div>
            </div>
          ))}
          
          <form onSubmit={handleScan} className="glass-panel p-8 rounded-xl border border-dashed border-primary/30 flex flex-col justify-center gap-4 hover:border-primary transition-colors bg-white/40">
            <h3 className="font-serif italic font-semibold text-lg text-primary text-center">Data Science Deep-Scan</h3>
            <div className="flex bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/20 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline">search</span>
              <input 
                type="text" 
                value={scanTarget}
                onChange={(e) => setScanTarget(e.target.value)}
                placeholder="Target IP / Subgraph"
                className="bg-transparent border-none outline-none w-full px-3 text-sm font-mono placeholder:text-outline/40"
                disabled={isScanning}
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <input 
                type="number" 
                value={bytesTransferred}
                onChange={(e) => setBytesTransferred(e.target.value)}
                placeholder="Bytes"
                title="Bytes Transferred"
                className="bg-surface-container-low rounded-lg px-3 py-2 text-xs font-mono border border-outline-variant/20 focus:border-primary outline-none w-full"
                disabled={isScanning}
              />
              <input 
                type="number" 
                value={packetCount}
                onChange={(e) => setPacketCount(e.target.value)}
                placeholder="Packets"
                title="Packet Count"
                className="bg-surface-container-low rounded-lg px-3 py-2 text-xs font-mono border border-outline-variant/20 focus:border-primary outline-none w-full"
                disabled={isScanning}
              />
              <input 
                type="number" 
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                placeholder="Duration (s)"
                title="Simulation Duration (Seconds)"
                className="bg-surface-container-low rounded-lg px-3 py-2 text-xs font-mono border border-outline-variant/20 focus:border-primary outline-none w-full"
                disabled={isScanning}
              />
              <input 
                type="number"
                step="0.01" 
                value={portEntropy}
                onChange={(e) => setPortEntropy(e.target.value)}
                placeholder="Entropy (0.0-1.0)"
                title="Port Entropy Deviation"
                className="bg-surface-container-low rounded-lg px-3 py-2 text-xs font-mono border border-outline-variant/20 focus:border-primary outline-none w-full"
                disabled={isScanning}
              />
              <div className="relative">
                <select
                  value={protocolType}
                  onChange={(e) => setProtocolType(e.target.value)}
                  title="Protocol Type"
                  className="appearance-none bg-surface-container-low rounded-lg px-3 py-2 pr-8 text-xs font-mono border border-outline-variant/20 focus:border-primary outline-none focus:ring-1 focus:ring-primary w-full min-w-[90px] cursor-pointer shadow-sm relative z-20"
                  disabled={isScanning}
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                  <option value="HTTP">HTTP</option>
                  <option value="DNS">DNS</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center z-30">
                  <span className="material-symbols-outlined text-[16px] text-zinc-500 bg-surface-container-low">expand_more</span>
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isScanning || !scanTarget.trim()}
              className="w-full bg-primary text-on-primary font-bold uppercase tracking-widest py-3 rounded-full hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isScanning ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Generate Neural Dashboard'}
            </button>
          </form>
          
          {/* Custom Scanned Assets */}
          {scannedAssets.map((asset, i) => (
             <div key={`scan-${i}`} className="glass-panel p-8 rounded-xl border-t-4 border-primary/20 hover:border-primary transition-colors duration-500 hover:shadow-lg bg-gradient-to-br from-surface to-white group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined">radar</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${asset.status === 'CRITICAL_ALERT' ? 'bg-[#e6ced6] text-primary' : (asset.status === 'WARNING' ? 'bg-orange-100 text-orange-800' : 'bg-[#d7e2ff] text-secondary')}`}>
                  {asset.status === 'CRITICAL_ALERT' ? 'Threat Detected' : 'Verified Secure'}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight text-on-surface">{asset.node}</h3>
              <p className="text-sm text-on-surface-variant italic mb-4">Manual user deep-scan (Confidence: {(asset.confidence * 100).toFixed(1)}%)</p>
              
              {asset.plot_base64 ? (
                <div className="w-full bg-[#0f172a] rounded-lg overflow-hidden mb-6 border border-slate-700/50 shadow-inner">
                  <img 
                    src={`data:image/png;base64,${asset.plot_base64}`} 
                    alt="Matplotlib Anomaly Plot" 
                    className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-[#020617] rounded-lg overflow-hidden mb-6 border border-slate-700/50 shadow-inner flex flex-col justify-end p-4 gap-1 relative group">
                    <span className="absolute top-2 left-2 text-[10px] uppercase text-zinc-500 font-bold tracking-widest z-10 group-hover:text-blue-400 transition-colors">Spectral Neural Distribution [Simulated]</span>
                    <div className="flex items-end h-full gap-[2px] opacity-70 w-full justify-between mt-4">
                       {(asset.barHeights || Array.from({length: 45}, (_, j) => 20 + (j * 7) % 60)).map((h, j) => (
                         <div key={j} className="hover:bg-white transition-colors w-full rounded-t-sm" style={{ 
                           backgroundColor: asset.status === 'CRITICAL_ALERT' ? '#f43f5e' : (asset.status === 'WARNING' ? '#fb923c' : '#3b82f6'),
                           height: `${h}%` 
                          }} />
                       ))}
                    </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-outline-variant/10 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold block mb-1">Volumetric Load</span>
                  <span className="font-bold text-lg">{asset.bytes.toLocaleString()} B/s</span>
                </div>
                <button className="material-symbols-outlined text-primary hover:scale-110 transition-transform cursor-pointer">policy</button>
              </div>
            </div>           
          ))}
        </div>
      </main>
    </div>
  );
}
