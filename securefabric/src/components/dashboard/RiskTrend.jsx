import React from 'react';
import { riskTrend } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const barColor = (score) => {
  if (score >= 70) return '#ef4444';
  if (score >= 55) return '#f97316';
  if (score >= 40) return '#f59e0b';
  return '#22c55e';
};

export default function RiskTrend() {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">7-Day Risk Trend</div>
          <div className="mono text-xs text-zinc-400 mt-0.5">Daily composite risk score</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={riskTrend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e4e4e7', borderRadius: '8px', fontFamily: 'DM Mono', fontSize: '11px' }}
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            formatter={(v) => [v, 'Risk Score']}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {riskTrend.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
