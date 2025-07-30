// StockManagement.jsx
import React, { useState } from 'react';
import RawMaterials from '../components/stock/RawMaterials';
import FinishedProducts from '../components/stock/FinishedProducts';
import StockMovements from '../components/stock/StockMovements';
import DispatchDelivery from '../components/stock/DispatchDelivery';
import Dashboard from '../components/stock/Dashboard';
import Reports from '../components/stock/Reports';

const StockManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'raw':
        return <RawMaterials />;
      case 'finished':
        return <FinishedProducts />;
      case 'movements':
        return <StockMovements />;
      case 'dispatch':
        return <DispatchDelivery />;
      case 'reports':
        return <Reports />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Factory Stock Management</h1>
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('raw')} className={`px-4 py-2 rounded ${activeTab === 'raw' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Raw Materials</button>
        <button onClick={() => setActiveTab('finished')} className={`px-4 py-2 rounded ${activeTab === 'finished' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Finished Products</button>
        <button onClick={() => setActiveTab('movements')} className={`px-4 py-2 rounded ${activeTab === 'movements' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Stock Movements</button>
        <button onClick={() => setActiveTab('dispatch')} className={`px-4 py-2 rounded ${activeTab === 'dispatch' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Dispatch & Delivery</button>
        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Reports</button>
      </div>
      <div>{renderTab()}</div>
    </div>
  );
};

export default StockManagement;

