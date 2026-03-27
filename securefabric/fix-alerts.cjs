const fs = require('fs');

const alertsCode = `import React from 'react';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import SOARPlaybooks from '../components/dashboard/SOARPlaybooks';

export default function AlertsPage() {
  return (
    <div className="pt-8 pb-24 px-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          Active Threats & Alerts
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RecentAlerts limit={10} />
        </div>
        <div>
          <SOARPlaybooks />
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('C:/Users/Abishek14/WebstormProjects/ET-GENAI-ROUND2-PROJECT/securefabric/src/pages/AlertsPage.jsx', alertsCode);
console.log('Fixed AlertsPage');
