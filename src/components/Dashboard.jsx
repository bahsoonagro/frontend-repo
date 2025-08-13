import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // States for each tab data (replace with real data fetches later)
  const [stockMovementsSummary, setStockMovementsSummary] = useState(null);
  const [reportsSummary, setReportsSummary] = useState(null);
  const [productsSummary, setProductsSummary] = useState(null);
  const [dispatchSummary, setDispatchSummary] = useState(null);
  const [finishedProductsSummary, setFinishedProductsSummary] = useState(null);
  const [rawMaterialsSummary, setRawMaterialsSummary] = useState(null);
  const [stockManagementSummary, setStockManagementSummary] = useState(null);

  // Mock fetch functions (simulate async data fetch)
  useEffect(() => {
    // For now just simulate loading summaries after 1 second
    setTimeout(() => {
      setStockMovementsSummary('Summary data for Stock Movements');
      setReportsSummary('Summary data for Reports');
      setProductsSummary('Summary data for Products');
      setDispatchSummary('Summary data for Dispatch & Delivery');
      setFinishedProductsSummary('Summary data for Finished Products');
      setRawMaterialsSummary('Summary data for Raw Materials');
      setStockManagementSummary('Summary data for Stock Management');
    }, 1000);
  }, []);

  const cards = [
    { id: 1, title: 'Stock Movements', icon: '🔄', data: stockMovementsSummary },
    { id: 2, title: 'Reports', icon: '📊', data: reportsSummary },
    { id: 3, title: 'Products', icon: '📦', data: productsSummary },
    { id: 4, title: 'Dispatch & Delivery', icon: '🚚', data: dispatchSummary },
    { id: 5, title: 'Finished Products', icon: '🏷️', data: finishedProductsSummary },
    { id: 6, title: 'Raw Materials', icon: '🌾', data: rawMaterialsSummary },
    { id: 7, title: 'Stock Management', icon: '📋', data: stockManagementSummary },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Dashboard Overview</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {cards.map(({ id, title, icon, data }) => (
          <div key={id} className="bg-white shadow rounded-lg p-6 flex flex-col items-center text-center min-h-[180px]">
            <div className="text-5xl mb-4">{icon}</div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <div className="text-gray-600 min-h-[60px]">
              {data ? data : <em>Loading summary...</em>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

