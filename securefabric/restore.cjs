const fs = require('fs');

const html = fs.readFileSync('utf8_code.html', 'utf8');

// A simple regex to just grab the bodies of the tags:
const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
const asideMatch = html.match(/<aside[^>]*>([\s\S]*?)<\/aside>/);
const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);

// Helper to convert html to jsx
function toJSX(str) {
  if (!str) return '';
  return str
    .replace(/class=/g, 'className=')
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
    .replace(/<img([^>]+)>/g, '<img$1 />')
    .replace(/<br>/g, '<br />')
    .replace(/<input([^>]+)>/g, '<input$1 />')
    .replace(/<hr([^>]+)>/g, '<hr$1 />')
    .replace(/style="([^"]+)"/g, (match, styleString) => {
        // basic conversion of "animation-delay: 0.2s" to React style
        // we'll just remove inline styles for this specific layout if they aren't critical, or map them loosely
        return match; // Will manually fix if it breaks syntax
    });
}

const navProps = html.match(/<nav([^>]*)>/)[1].replace(/class=/g, 'className=');
const topBarCode = `import React from 'react';

export default function TopBar({ connected = true, onPageChange, currentPage }) {
  return (
    <nav ${navProps}>
      ${toJSX(navMatch[1])}
    </nav>
  );
}
`;

const asideProps = html.match(/<aside([^>]*)>/)[1].replace(/class=/g, 'className=');
const footerProps = html.match(/<footer([^>]*)>/)[1].replace(/class=/g, 'className=');

const appJsxCode = `import React, { useState } from 'react';
import TopBar from './components/dashboard/TopBar';
import DashboardPage from './pages/DashboardPage';
import { useRealtime } from './hooks/useRealtime';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { metrics, telemetry, connected, nsaoData } = useRealtime(2500);

  return (
    <div className="bg-[#f9f9ff] text-[#25324b] selection:bg-[#f4dce4] selection:text-[#5e4d54] min-h-screen relative font-sans">
      <TopBar
        metrics={metrics}
        connected={connected}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
      />

      <aside ${asideProps}>
        ${toJSX(asideMatch[1])}
      </aside>

      <div className="relative z-10 w-full">
        {currentPage === 'dashboard' && <DashboardPage metrics={metrics} telemetry={telemetry} nsaoData={nsaoData} onNavigate={setCurrentPage} />}
      </div>

      <footer ${footerProps}>
        ${toJSX(footerMatch[1])}
      </footer>
    </div>
  );
}
`;

const mainProps = html.match(/<main([^>]*)>/)[1].replace(/class=/g, 'className=');
const dashboardCode = `import React from 'react';

export default function DashboardPage({ metrics, telemetry, nsaoData }) {
  return (
    <main ${mainProps}>
      ${toJSX(mainMatch[1])}
    </main>
  );
}
`;

fs.writeFileSync('src/components/dashboard/TopBar.jsx', topBarCode);
fs.writeFileSync('src/App.jsx', appJsxCode);
fs.writeFileSync('src/pages/DashboardPage.jsx', dashboardCode);

console.log('Successfully wrote the React files back to original design!');
