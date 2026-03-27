const fs = require('fs');

const topbarCode = `import { LogOut, Bell, Settings, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const location = useLocation();
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Global Dashboard';
      case '/architecture': return 'AI-Driven Mesh Architecture';
      case '/alerts': return 'Threat Intelligence Center';
      case '/ebpf': return 'eBPF Kernel Telemetry';
      case '/honeypot': return 'Honeynet Deployment';
      case '/sixg': return '6G & Edge Security';
      case '/compare': return 'System Benchmarks';
      case '/math': return 'Maths & Formulae';
      default: return 'SecureFabric Orchestrator';
    }
  };

  return (
    <header className="h-16 bg-navy-800/80 backdrop-blur-md border-b border-navy-700/50 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Dynamic Title based on Route */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
        <span className="px-2 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
          SYSTEM_NOMINAL
        </span>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-navy-700 rounded-full transition-colors group">
          <Bell className="w-5 h-5 text-slate-300 group-hover:text-cyan-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>
        <button className="p-2 hover:bg-navy-700 rounded-full transition-colors group">
          <Settings className="w-5 h-5 text-slate-300 group-hover:text-cyan-400" />
        </button>
        <button className="p-2 hover:bg-navy-700 rounded-full transition-colors group">
          <User className="w-5 h-5 text-slate-300 group-hover:text-cyan-400" />
        </button>
      </div>
    </header>
  );
}
`;

fs.writeFileSync('C:/Users/Abishek14/WebstormProjects/ET-GENAI-ROUND2-PROJECT/securefabric/src/components/dashboard/TopBar.jsx', topbarCode);
console.log('Fixed TopBar');