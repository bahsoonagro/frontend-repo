// Reports.jsx
import React, { useState } from 'react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Placeholder sample data
  const rawMaterials = 1250; // kg
  const finishedProducts = 870; // units
  const deliveries = [
    { customer: 'Kroo Bay Wholesalers', quantity: 200, date: '2025-07-29' },
    { customer: 'Freetown Mart', quantity: 120, date: '2025-07-28' },
    { customer: 'Kroo Bay Wholesalers', quantity: 180, date: '2025-07-27' },
  ];

  const totalDeliveries = deliveries.length;
  const totalDeliveredQty = deliveries.reduce((acc, curr) => acc + curr.quantity, 0);

  const topCustomer = deliveries.reduce((acc, curr) => {
    acc[curr.customer] = (acc[curr.customer] || 0) + curr.quantity;
    return acc;
  }, {});
  const bestCustomer = Object.keys(topCustomer).reduce((a, b) => (topCustomer[a] > topCustomer[b] ? a : b), '');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📊 Stock & Delivery Reports</h2>

      {/* Date Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="date"
          name="from"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="p-2 border rounded"
          placeholder="From Date"
        />
        <input
          type="date"
          name="to"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="p-2 border rounded"
          placeholder="To Date"
        />
        <button
          className="md:col-span-2 bg-blue-700 text-white py-2 rounded"
          onClick={() => alert('Date filtering not yet connected to data')}
        >
          🔍 Filter Reports
        </button>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h3 className="text-sm font-semibold">Raw Materials Stock</h3>
          <p className="text-2xl">{rawMaterials} kg</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h3 className="text-sm font-semibold">Finished Products</h3>
          <p className="text-2xl">{finishedProducts} units</p>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow">
          <h3 className="text-sm font-semibold">Total Deliveries</h3>
          <p className="text-2xl">{totalDeliveries}</p>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded shadow p-4">
          <h4 className="text-md font-bold mb-2">📦 Total Quantity Delivered</h4>
          <p className="text-lg">{totalDeliveredQty} units</p>
        </div>
        <div className="bg-white border rounded shadow p-4">
          <h4 className="text-md font-bold mb-2">🏆 Top Customer</h4>
          <p className="text-lg">{bestCustomer}</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-6 p-6 bg-gray-100 border rounded text-center text-gray-600">
        📈 Charts will be added soon (Bar/Line/Pie)
      </div>
    </div>
  );
};

export default Reports;

