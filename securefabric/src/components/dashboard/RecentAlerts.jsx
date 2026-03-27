import React from 'react';
import { threatAlerts } from '../../data/mockData';
import { severityColor, timeAgo } from '../../utils/helpers';
import { AlertOctagon, ChevronRight } from 'lucide-react';

export default function RecentAlerts({ onNavigate }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-zinc-900">Recent Threats</div>
        <button
          onClick={() => onNavigate && onNavigate('alerts')}
          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
        >
          View all <ChevronRight size={12} />
        </button>
      </div>

      <div className="space-y-2">
        {threatAlerts.slice(0, 5).map(a => {
          const color = severityColor(a.severity);
          return (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg border hover:border-zinc-300 transition-all cursor-default group" style={{ borderColor: `${color}20` }}>
              <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="mono text-xs font-medium text-zinc-900">{a.type}</span>
                  <span className="mono text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${color}15`, color }}>
                    {a.severity.toUpperCase()}
                  </span>
                </div>
                <div className="mono text-[10px] text-zinc-400 mt-0.5 truncate">{a.container} · {a.cluster}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="mono text-[10px] text-zinc-400">{timeAgo(a.timestamp)}</span>
                <span className="mono text-[10px] font-medium" style={{ color }}>
                  {Math.round(a.confidence)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
