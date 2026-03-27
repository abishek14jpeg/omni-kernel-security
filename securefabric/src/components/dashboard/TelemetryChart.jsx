import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatNumber } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-overlay rounded-lg p-3 shadow-xl">
      <div className="mono text-xs text-zinc-500 mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs mono">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-500">{p.name}:</span>
          <span className="font-medium text-zinc-900">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function TelemetryChart({ data }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Telemetry Stream</div>
          <div className="text-xs text-zinc-400 mono mt-0.5">eBPF kernel events — live feed</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#3b82f6' }} />
            <span className="text-xs text-zinc-500">Syscalls</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#06b6d4' }} />
            <span className="text-xs text-zinc-500">Net Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#ef4444' }} />
            <span className="text-xs text-zinc-500">Anomalies</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} width={44} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="syscalls" name="Syscalls" stroke="#3b82f6" strokeWidth={1.5} fill="url(#gradBlue)" dot={false} />
          <Area type="monotone" dataKey="networkEvents" name="Net Events" stroke="#06b6d4" strokeWidth={1.5} fill="url(#gradCyan)" dot={false} />
          <Area type="monotone" dataKey="anomalies" name="Anomalies" stroke="#ef4444" strokeWidth={2} fill="url(#gradRed)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
