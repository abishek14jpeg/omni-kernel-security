import React from 'react';

export default function TopBar({ connected = true, onPageChange, currentPage }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(37,50,75,0.06)] flex justify-between items-center px-12 py-6">

      <div className="text-2xl font-bold text-pink-900 dark:text-pink-100 tracking-tighter font-serif italic">Omni-Kernel</div>
      <div className="hidden md:flex gap-10 items-center">
        <a className="text-pink-900 dark:text-pink-100 font-bold border-b-2 border-pink-400 hover:scale-105 transition-transform duration-300" href="#">Overview</a>
        <a className="text-slate-500 dark:text-slate-400 hover:scale-105 transition-transform duration-300" href="#">Threat Intelligence</a>
        <a className="text-slate-500 dark:text-slate-400 hover:scale-105 transition-transform duration-300" href="#">Kernel Logs</a>
        <div className="flex items-center gap-4 ml-6">
          <span className="material-symbols-outlined text-pink-700 dark:text-pink-300 cursor-pointer active:opacity-80 transition-all">account_circle</span>
          <span className="material-symbols-outlined text-pink-700 dark:text-pink-300 cursor-pointer active:opacity-80 transition-all">notifications</span>
        </div>
      </div>

    </nav>
  );
}
