import React from 'react';

export default function TopNavigation({ onNavigate, currentPage }) {
  const getNavClass = (pageName) => {
    const baseClass = "cursor-pointer hover:scale-105 transition-transform duration-300 font-bold ";
    return currentPage === pageName 
      ? baseClass + "text-pink-900 dark:text-pink-100 border-b-2 border-pink-400" 
      : baseClass + "text-slate-500 dark:text-slate-400";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(37,50,75,0.06)] flex justify-between items-center px-12 py-6 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="text-2xl font-bold text-pink-900 dark:text-pink-100 tracking-tighter font-serif italic cursor-pointer" onClick={() => onNavigate('dashboard')}>
        Omni-Kernel
      </div>
      <div className="hidden md:flex gap-10 items-center">
        <a onClick={() => onNavigate('dashboard')} className={getNavClass('dashboard')}>Overview</a>
        <a onClick={() => onNavigate('alerts')} className={getNavClass('alerts')}>Threat Intelligence</a>
        <a onClick={() => onNavigate('testing')} className={getNavClass('testing')}>Math Testing</a>
        
        <div className="relative group">
          <span className="cursor-pointer text-slate-500 dark:text-slate-400 font-bold hover:scale-105 transition-transform duration-300 flex items-center gap-1 py-2">
            Modules <span className="material-symbols-outlined text-[1rem]">expand_more</span>
          </span>
          {/* Invisible bridge to prevent hover dead-zone between trigger and dropdown */}
          <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl border border-pink-100 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-1 min-w-[220px]">
              <a onClick={() => onNavigate('architecture')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">Architecture</a>
              <a onClick={() => onNavigate('math')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">Mathematical Foundation</a>
              <a onClick={() => onNavigate('comparison')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">Comparison</a>
              <a onClick={() => onNavigate('sixg')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">6G Smart Infra</a>
              <a onClick={() => onNavigate('honeypot')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">Honeypot Mesh</a>
              <a onClick={() => onNavigate('ai')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">AI Models</a>
              <a onClick={() => onNavigate('reports')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">Neural Reports</a>
              <a onClick={() => onNavigate('assets')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors">Assets</a>
              <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
              <a onClick={() => onNavigate('finance')} className="cursor-pointer text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors flex items-center gap-2">Finance AI Agent <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">NEW</span></a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6">
          <span className="material-symbols-outlined text-pink-700 dark:text-pink-300 cursor-pointer active:opacity-80 transition-all">account_circle</span>
          <span className="material-symbols-outlined text-pink-700 dark:text-pink-300 cursor-pointer active:opacity-80 transition-all">notifications</span>
        </div>
      </div>
    </nav>
  );
}
