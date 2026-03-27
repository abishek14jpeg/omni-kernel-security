import React from 'react';
import { riskLevel, severityColor } from '../../utils/helpers';

export default function RiskGauge({ score }) {
  const level = riskLevel(score);
  const color = severityColor(level);
  const pct = score / 100;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ * 0.75; // 75% arc
  const offset = circ * 0.125; // start at 135deg

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mono mb-4">System Risk Score</div>

      <div className="relative w-36 h-36">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-[135deg]">
          {/* Track */}
          <circle
            cx="70" cy="70" r={r}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="10"
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="70" cy="70" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="mono text-3xl font-semibold leading-none" style={{ color }}>
            {Math.round(score)}
          </div>
          <div className="mono text-xs uppercase mt-1 font-medium" style={{ color }}>
            {level}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3">
        {[['low', '#22c55e'], ['med', '#f59e0b'], ['high', '#f97316'], ['crit', '#ef4444']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="mono text-xs text-zinc-400">{l}</span>
          </div>
        ))}
      </div>

      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)` }}
      />
    </div>
  );
}
