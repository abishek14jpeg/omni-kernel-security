import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Environment, Float } from '@react-three/drei';
import { networkFlows } from '../data/mockData';

function NetworkGraph3D({ onNodeClick }) {
  const { nodes, positions, edges, statusColor, nodeRiskCount } = useMemo(() => {
    const nodeSet = new Set();
    networkFlows.forEach((f) => {
      nodeSet.add(f.src);
      nodeSet.add(f.dst);
    });
    const nodes = Array.from(nodeSet);

    const statusColor = {
      normal: '#22c55e',
      anomalous: '#f48fb1',
      suspicious: '#f59e0b',
      blocked: '#ef4444',
    };

    // Distribute nodes in a 3D sphere/cylinder shape
    const positions = nodes.reduce((acc, name, i) => {
      const phi = Math.acos(-1 + (2 * i) / nodes.length);
      const theta = Math.sqrt(nodes.length * Math.PI) * phi;
      const radius = 15;
      
      acc[name] = [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      ];
      return acc;
    }, {});

    const nodeRiskCount = nodes.reduce((acc, n) => {
      acc[n] = 0;
      return acc;
    }, {});

    networkFlows.forEach((f) => {
      if (f.status !== 'normal') {
        nodeRiskCount[f.src] = (nodeRiskCount[f.src] || 0) + 1;
        nodeRiskCount[f.dst] = (nodeRiskCount[f.dst] || 0) + 1;
      }
    });

    const edges = networkFlows.map((f, idx) => ({
      id: `${idx}-${f.src}-${f.dst}`,
      ...f,
      start: positions[f.src] || [0,0,0],
      end: positions[f.dst] || [0,0,0],
      color: statusColor[f.status] || '#94a3b8'
    }));

    return { nodes, positions, edges, statusColor, nodeRiskCount };
  }, []);

  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Environment preset="city" />

      {/* Edges */}
      {edges.map((e) => (
        <Line 
          key={e.id} 
          points={[e.start, e.end]} 
          color={e.color} 
          lineWidth={e.status !== 'normal' ? 3 : 1}
          opacity={e.status !== 'normal' ? 0.8 : 0.3}
          transparent
        />
      ))}

      {/* Nodes */}
      {nodes.map((n) => {
        const risk = nodeRiskCount[n] || 0;
        const color = risk > 2 ? '#ef4444' : risk > 0 ? '#f59e0b' : '#38bdf8';
        const isHovered = hoveredNode === n;
        const scale = isHovered ? [1.5, 1.5, 1.5] : [1 + risk * 0.2, 1 + risk * 0.2, 1 + risk * 0.2];

        return (
          <Float key={n} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere 
              args={[0.8, 32, 32]} 
              position={positions[n]} 
              scale={scale}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(n); }}
              onPointerOut={(e) => { e.stopPropagation(); setHoveredNode(null); }}
              onClick={() => onNodeClick(n)}
            >
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHovered ? 0.8 : 0.2} roughness={0.2} metalness={0.8} />
              
              {isHovered && (
                <Html distanceFactor={30} position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
                  <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 pointer-events-none whitespace-nowrap">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Node</div>
                    <div className="text-lg font-bold text-slate-800">{n}</div>
                    <div className="text-xs text-rose-500 font-bold mt-1">Risk Count: {risk}</div>
                  </div>
                </Html>
              )}
            </Sphere>
          </Float>
        );
      })}
    </group>
  );
}

export default function NetworkPage({ onNavigate }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const { velocityGBs, velocityDeltaPct, blockedCount, uniqueNodes } = useMemo(() => {
    const nodeSet = new Set();
    networkFlows.forEach((f) => { nodeSet.add(f.src); nodeSet.add(f.dst); });
    
    const totalBytes = networkFlows.reduce((acc, f) => acc + f.bytes, 0);
    const normalBytes = networkFlows.filter((f) => f.status === 'normal').reduce((acc, f) => acc + f.bytes, 0);
    
    const velocityGBs = totalBytes / 1e9;
    const normalGBs = normalBytes / 1e9;
    const velocityDeltaPct = normalGBs > 0 ? ((velocityGBs - normalGBs) / normalGBs) * 100 : 12.4;
    const blockedCount = networkFlows.filter((f) => f.status === 'blocked').length;

    return {
      velocityGBs,
      velocityDeltaPct,
      blockedCount,
      uniqueNodes: nodeSet.size,
    };
  }, []);

  return (
    <div className="overflow-hidden bg-[#0f172a] min-h-screen text-slate-100 relative">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-6 bg-[#0f172a]/80 backdrop-blur-2xl border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-rose-400 tracking-tighter">Omni-Kernel 3D</span>
        </div>
        <div className="hidden md:flex gap-12 items-center">
          <a onClick={() => onNavigate('dashboard')} className="cursor-pointer text-slate-400 hover:text-white transition-colors duration-300">Overview</a>
          <a onClick={() => onNavigate('alerts')} className="cursor-pointer text-slate-400 hover:text-white transition-colors duration-300">Threat Intelligence</a>
          <a onClick={() => onNavigate('network')} className="cursor-pointer text-rose-400 font-bold border-b-2 border-rose-500">3D Topology</a>
        </div>
      </nav>

      {/* 3D Canvas Fill */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 35], fov: 60 }}>
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 20, 60]} />
          <NetworkGraph3D onNodeClick={setSelectedNode} />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxDistance={50}
            minDistance={10}
          />
        </Canvas>
      </div>

      {/* Hero Overlay */}
      <div className="absolute top-32 left-12 z-20 pointer-events-none">
        <h1 className="text-5xl lg:text-7xl font-sans font-black tracking-tighter text-white leading-none">
          Spatial<br/>
          <span className="text-rose-400">Topology</span>
        </h1>
        <p className="text-lg text-slate-400 mt-4 max-w-sm">
          Interactive 3D visualization using React Three Fiber. Rotate, pan, and zoom to explore anomalous cluster behaviors in real-time.
        </p>
      </div>

      {/* Glass UI Element (Stats) */}
      <div className="absolute bottom-12 right-12 z-30 flex flex-col gap-6 w-[400px]">
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Fabric Velocity</h4>
              <p className="text-4xl font-sans font-bold text-white">{velocityGBs.toFixed(1)} <span className="text-xl text-slate-400">GB/s</span></p>
            </div>
            <span className={`font-mono font-bold ${velocityDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {velocityDeltaPct >= 0 ? '+' : ''}{velocityDeltaPct.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-[0.6rem] font-bold uppercase tracking-widest text-slate-500 mb-1">Nodes Active</span>
              <span className="text-2xl font-bold text-white">{uniqueNodes}</span>
            </div>
            <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
              <span className="block text-[0.6rem] font-bold uppercase tracking-widest text-rose-500 mb-1">Blocked Actions</span>
              <span className="text-2xl font-bold text-rose-400">{blockedCount}</span>
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="bg-indigo-900/60 backdrop-blur-xl p-6 rounded-2xl border border-indigo-500/30 animate-fade-in shadow-2xl">
            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-300">Monitored Target</span>
            <h3 className="text-xl font-bold text-white mb-2">{selectedNode}</h3>
            <p className="text-sm text-indigo-200/70">
              Node is currently selected in the 3D space. Anomalous edges associated with this node are highlighted in rose/amber.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
