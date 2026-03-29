import React, { useState } from 'react';
import TopBar from './components/dashboard/TopBar';
import DashboardPage from './pages/DashboardPage';
import NetworkPage from './pages/NetworkPage';
import AlertsPage from './pages/AlertsPage';
import AssetsPage from './pages/AssetsPage';
import ReportsPage from './pages/ReportsPage';
import TestingPage from './pages/TestingPage';
import ArchitecturePage from './pages/ArchitecturePage';
import MathPage from './pages/MathPage';
import ComparisonPage from './pages/ComparisonPage';
import SixGPage from './pages/SixGPage';
import HoneypotPage from './pages/HoneypotPage';
import AIPage from './pages/AIPage';
import FinancePage from './pages/FinancePage';
import { useRealtime } from './hooks/useRealtime';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { metrics, telemetry, connected, nsaoData } = useRealtime(2500);

  return (
    <div className="bg-[#f9f9ff] text-[#25324b] selection:bg-[#f4dce4] selection:text-[#5e4d54] min-h-screen relative font-sans">
      <div className="relative z-10 w-full min-h-screen">
        {currentPage === 'dashboard' && <DashboardPage metrics={metrics} telemetry={telemetry} nsaoData={nsaoData} onNavigate={setCurrentPage} />}
        {currentPage === 'network' && <NetworkPage onNavigate={setCurrentPage} />}
        {currentPage === 'alerts' && <AlertsPage telemetry={telemetry} nsaoData={nsaoData} onNavigate={setCurrentPage} />}
        {currentPage === 'assets' && <AssetsPage telemetry={telemetry} nsaoData={nsaoData} onNavigate={setCurrentPage} />}
        {currentPage === 'reports' && <ReportsPage nsaoData={nsaoData} onNavigate={setCurrentPage} />}
        {currentPage === 'testing' && <TestingPage onNavigate={setCurrentPage} />}
        {currentPage === 'architecture' && <ArchitecturePage onNavigate={setCurrentPage} />}
        {currentPage === 'math' && <MathPage onNavigate={setCurrentPage} />}
        {currentPage === 'comparison' && <ComparisonPage onNavigate={setCurrentPage} />}
        {currentPage === 'sixg' && <SixGPage onNavigate={setCurrentPage} />}
        {currentPage === 'honeypot' && <HoneypotPage onNavigate={setCurrentPage} />}
        {currentPage === 'ai' && <AIPage onNavigate={setCurrentPage} />}
        {currentPage === 'finance' && <FinancePage onNavigate={setCurrentPage} />}
      </div>
    </div>
  );
}
