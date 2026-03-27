import React, { useState } from 'react';
import { soarPlaybooks } from '../../data/mockData';
import { Play, CheckCircle, Clock, Zap, Lock, Ban, Brain, OctagonX, ShieldAlert, KeyRound, ShieldOff } from 'lucide-react';

const playbookIcons = {
  QUARANTINE_POD: Lock,
  RATE_LIMIT_BLOCK: Ban,
  SEMANTIC_FILTER: Brain,
  KILL_PROCESS: Zap,
  BLOCK_EGRESS: OctagonX,
  NETWORK_ISOLATE: ShieldOff,
  MFA_CHALLENGE: KeyRound,
};

const playbookColors = {
  QUARANTINE_POD: '#ef4444',
  RATE_LIMIT_BLOCK: '#f97316',
  SEMANTIC_FILTER: '#8b5cf6',
  KILL_PROCESS: '#f59e0b',
  BLOCK_EGRESS: '#ef4444',
  NETWORK_ISOLATE: '#3b82f6',
  MFA_CHALLENGE: '#22c55e',
};

export default function SOARPlaybooks() {
  const [running, setRunning] = useState(null);
  const [executed, setExecuted] = useState([]);

  function runPlaybook(id) {
    setRunning(id);
    setTimeout(() => {
      setRunning(null);
      setExecuted(prev => [id, ...prev]);
    }, 1800);
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">SOAR Playbooks</div>
          <div className="mono text-xs text-zinc-400 mt-0.5">Automated response workflows</div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
          <Zap size={10} className="text-emerald-500" />
          <span className="mono text-[10px] text-emerald-600 font-medium">{soarPlaybooks.length} ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {soarPlaybooks.map(pb => {
          const isRunning = running === pb.id;
          const isDone = executed.includes(pb.id);
          const IconComp = playbookIcons[pb.id] || ShieldAlert;
          const iconColor = playbookColors[pb.id] || '#a1a1aa';

          return (
            <div
              key={pb.id}
              className={`p-3 rounded-xl border transition-all ${
                isRunning ? 'border-blue-200 bg-blue-50' :
                isDone ? 'border-emerald-200 bg-emerald-50' :
                'border-zinc-100 bg-zinc-50 hover:border-zinc-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor}15` }}>
                    <IconComp size={15} style={{ color: iconColor }} />
                  </div>
                  <div>
                    <div className="mono text-xs font-medium text-zinc-900">{pb.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{pb.desc}</div>
                  </div>
                </div>

                <button
                  onClick={() => !isRunning && runPlaybook(pb.id)}
                  disabled={isRunning}
                  className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isRunning ? 'bg-blue-100 cursor-wait' :
                    isDone ? 'bg-emerald-100' :
                    'bg-zinc-200 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {isRunning ? (
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : isDone ? (
                    <CheckCircle size={13} className="text-emerald-500" />
                  ) : (
                    <Play size={11} className="text-zinc-600 group-hover:text-white" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Clock size={9} className="text-zinc-400" />
                  <span className="mono text-[9px] text-zinc-400">{pb.execTime}</span>
                </div>
                <span className="mono text-[9px] text-zinc-400">Last: {pb.lastRun}</span>
                {isRunning && <span className="mono text-[9px] text-blue-500 animate-pulse">Executing...</span>}
                {isDone && <span className="mono text-[9px] text-emerald-500">Done</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
