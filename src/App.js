import React, { useState } from 'react';

// Import all your components
import Dashboard from './components/Dashboard';
import RawMaterials from './components/RawMaterials';
import StockMovements from './components/StockMovements';
import FinishedProducts from './components/FinishedProducts';
import DispatchDelivery from './components/DispatchDelivery';
import StockManagement from './pages/StockManagement';
import Reports from './components/Reports';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', component: Dashboard },
  { id: 'rawMaterials', label: 'Raw Materials', component: RawMaterials },
  { id: 'finishedProducts', label: 'Finished Products', component: FinishedProducts },
  { id: 'stockMovements', label: 'Stock Movements', component: StockMovements },
  { id: 'dispatchDelivery', label: 'Dispatch & Delivery', component: DispatchDelivery },
  { id: 'stockManagement', label: 'Stock Management', component: StockManagement },
  { id: 'reports', label: 'Reports', component: Reports },
];

const API_URL = 'http://localhost:3001/api/raw-materials';



export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-700">BFC Stock Management</h1>
      </header>

      <nav className="bg-white shadow flex overflow-x-auto border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-3 border-b-4 transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {ActiveComponent ? <ActiveComponent /> : <p>Component not found</p>}
      </main>
    </div>
  );
}

