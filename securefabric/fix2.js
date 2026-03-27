import fs from 'fs';

const c = `import React from 'react';
import { LogOut, Bell, Settings, User } from 'lucide-react';

export default function TopBar({ metrics = {}, connected = true, onPageChange, currentPage }) {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Global Dashboard';
      case 'architecture': return 'AI-Driven Mesh Architecture';
      case 'alerts': return 'Threat Intelligence Center';
      case 'ebpf': return 'eBPF Kernel Telemetry';
      case 'honeypot': return 'Honeynet Deployment';
      case 'sixg': return '6G & Edge Security';
      case 'comparison': return 'System Benchmarks';
      case 'math': return 'Maths & Formulae';
      default: return 'SecureFabric Orchestrator';
    }
  };

  return (
    <header className="h-16 bg-[#1a202c]/90 backdrop-blur-md border-b border-[#2d3748]/50 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
        <span className={\`px-2 py-1 text-xs font-mono rounded-md border \${connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}\`}>
          {connected ? 'SYSTEM_NOMINAL' : 'SYSTEM_OFFLINE'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-[#2d3748] rounded-full transition-colors group">
          <Bell className="w-5 h-5 text-slate-300 group-hover:text-cyan-400" />
          {metrics.activeAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
        <button className="p-2 hover:bg-[#2d3748] rounded-full transition-colors group">
          <Settings className="w-5 h-5 text-slate-300 group-hover:text-cyan-400" />
        </button>
        <button className="p-2 hover:bg-[#2d3748] rounded-full transition-colors group">
          <User className="w-5 h-5 text-slate-300 group-hover:text-cyan-400" />
        </button>
      </div>
    </header>
  );
}
`;

fs.writeFileSync('C:/Users/Abishek14/WebstormProjects/ET-GENAI-ROUND2-PROJECT/securefabric/src/components/dashboard/TopBar.jsx', c);
