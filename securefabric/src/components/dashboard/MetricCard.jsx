import React from 'react';
import { cn, formatNumber } from '../../utils/helpers';

export default function MetricCard({ label, value, unit, icon: Icon, color = '#3b82f6', sub, trend, className }) {
  return (
    <div className={cn('glass-card rounded-xl p-4 relative overflow-hidden group hover:shadow-md transition-all duration-200', className)}>
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-xl transition-opacity group-hover:opacity-10"
        style={{ background: color, transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mono">{label}</div>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon size={14} style={{ color }} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-semibold text-zinc-900 mono leading-none">
          {typeof value === 'number' ? formatNumber(Math.round(value)) : value}
        </span>
        {unit && <span className="text-sm text-zinc-400 mb-0.5">{unit}</span>}
      </div>

      {(sub || trend !== undefined) && (
        <div className="mt-2 flex items-center gap-2">
          {sub && <span className="text-xs text-zinc-400">{sub}</span>}
          {trend !== undefined && (
            <span className={`text-xs font-medium mono ${trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
