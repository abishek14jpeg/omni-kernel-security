import React from 'react';
import { clusterHealth } from '../../data/mockData';
import { statusColor } from '../../utils/helpers';
import { Server, AlertTriangle } from 'lucide-react';

export default function ClusterHealth() {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-zinc-900">Cluster Health</div>
        <div className="mono text-xs text-zinc-400">{clusterHealth.length} clusters</div>
      </div>

      <div className="space-y-2">
        {clusterHealth.map(c => {
          const sc = statusColor(c.status);
          return (
            <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 transition-colors group cursor-default">
              {/* Status dot */}
              <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse-slow" style={{ background: sc, boxShadow: `0 0 6px ${sc}80` }} />

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="mono text-xs font-medium text-zinc-700 truncate">{c.name}</div>
                <div className="text-xs text-zinc-400">{c.pods} pods · {c.region}</div>
              </div>

              {/* CPU/MEM bars */}
              <div className="hidden sm:flex flex-col gap-1 w-20">
                <div className="flex items-center gap-1.5">
                  <span className="mono text-[10px] text-zinc-400 w-6">CPU</span>
                  <div className="flex-1 h-1 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.cpu}%`, background: c.cpu > 80 ? '#ef4444' : c.cpu > 60 ? '#f59e0b' : '#22c55e' }}
                    />
                  </div>
                  <span className="mono text-[10px] text-zinc-400 w-6 text-right">{c.cpu}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="mono text-[10px] text-zinc-400 w-6">MEM</span>
                  <div className="flex-1 h-1 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.mem}%`, background: c.mem > 80 ? '#ef4444' : c.mem > 60 ? '#f59e0b' : '#3b82f6' }}
                    />
                  </div>
                  <span className="mono text-[10px] text-zinc-400 w-6 text-right">{c.mem}%</span>
                </div>
              </div>

              {/* Alerts badge */}
              {c.alerts > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md badge-high">
                  <AlertTriangle size={10} />
                  <span className="mono text-[10px] font-medium">{c.alerts}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
