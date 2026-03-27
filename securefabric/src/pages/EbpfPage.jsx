import React, { useState } from 'react';
import { ebpfEvents } from '../data/mockData';
import { useLiveEbpfEvents } from '../hooks/useRealtime';
import { Terminal, Pause, Play, Download, Filter } from 'lucide-react';

const verdictStyle = {
  ALLOW: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  FLAGGED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  BLOCKED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const typeColor = {
  sys_open: '#3b82f6',
  tcp_connect: '#8b5cf6',
  sys_execve: '#ef4444',
  sys_setuid: '#f97316',
  socket_send: '#06b6d4',
  sys_read: '#a1a1aa',
  tcp_accept: '#22c55e',
  sys_mmap: '#f59e0b',
};

export default function EbpfPage() {
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const liveEvents = useLiveEbpfEvents();

  const allEvents = paused ? ebpfEvents : [...liveEvents, ...ebpfEvents].slice(0, 24);
  const filtered = filter === 'ALL' ? allEvents : allEvents.filter(e => e.verdict === filter);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-zinc-500" />
            <span className="font-semibold text-sm text-zinc-900">eBPF Kernel Event Stream</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">
              <div className={`w-1.5 h-1.5 rounded-full ${paused ? 'bg-zinc-400' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="mono text-[10px] text-zinc-500">{paused ? 'PAUSED' : 'LIVE'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Verdict filter */}
            <div className="flex items-center gap-1">
              {['ALL', 'ALLOW', 'FLAGGED', 'BLOCKED'].map(v => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`px-2.5 py-1 rounded-md mono text-[10px] font-medium transition-all ${
                    filter === v ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPaused(!paused)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700"
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      </div>

      {/* Event stream - terminal style */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="bg-zinc-900 px-4 py-2.5 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
          </div>
          <div className="mono text-xs text-zinc-400 ml-2">ebpf-trace — DaemonSet: securefabric-agent</div>
          <div className="ml-auto mono text-[10px] text-zinc-500">
            {filtered.length} events
          </div>
        </div>

        {/* Column headers */}
        <div className="bg-zinc-800 px-4 py-2 grid grid-cols-12 gap-2">
          {['TIME', 'TYPE', 'PID', 'COMM', 'PATH/ADDRESS', 'VERDICT'].map((h, i) => (
            <div
              key={h}
              className={`mono text-[9px] text-zinc-400 uppercase font-medium ${
                i === 0 ? 'col-span-2' : i === 4 ? 'col-span-3' : i === 1 ? 'col-span-2' : 'col-span-1'
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Events */}
        <div className="bg-zinc-950 max-h-[500px] overflow-y-auto scrollbar-thin">
          {filtered.map((event, i) => {
            const vs = verdictStyle[event.verdict] || { color: '#a1a1aa', bg: 'transparent' };
            const tc = typeColor[event.type] || '#a1a1aa';
            return (
              <div
                key={event.id || i}
                className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-zinc-900 hover:bg-zinc-900 transition-colors animate-fadeIn"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className="col-span-2 mono text-[10px] text-zinc-500">{event.ts}</div>
                <div className="col-span-2">
                  <span className="mono text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${tc}20`, color: tc }}>
                    {event.type}
                  </span>
                </div>
                <div className="col-span-1 mono text-[10px] text-zinc-500">{event.pid}</div>
                <div className="col-span-2 mono text-[10px] text-zinc-300 font-medium">{event.comm}</div>
                <div className="col-span-3 mono text-[10px] text-zinc-400 truncate">{event.path}</div>
                <div className="col-span-1">
                  <span className="mono text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: vs.bg, color: vs.color }}>
                    {event.verdict}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Blinking cursor */}
          {!paused && (
            <div className="px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-3.5 bg-emerald-500 animate-pulse" />
              <span className="mono text-[10px] text-zinc-600">awaiting events...</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl p-4">
        <div className="text-sm font-semibold text-zinc-900 mb-3">Event Type Legend</div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(typeColor).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-100 bg-zinc-50">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="mono text-[10px] text-zinc-600">{type}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="mono text-xs text-blue-700 font-medium mb-1">eBPF Architecture</div>
          <div className="text-xs text-blue-600 leading-relaxed">
            Events are captured via kernel tracepoints using BPF programs loaded as a DaemonSet on every node. 
            Programs run in a sandboxed VM at kernel level with &lt;2% CPU overhead. All events are featurized 
            locally before transmission to the AI orchestration layer.
          </div>
        </div>
      </div>
    </div>
  );
}
