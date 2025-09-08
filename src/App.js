import React, { useState, useEffect } from "react";

import Dashboard from "./components/Dashboard";
import RawMaterials from "./components/RawMaterials";
import StockMovements from "./components/StockMovements";
import FinishedProducts from "./components/FinishedProducts";
import DispatchDelivery from "./components/DispatchDelivery";
import StockManagement from "./pages/StockManagement";
import Reports from "./components/Reports";

const tabs = [
  { id: "dashboard", label: "Dashboard", component: Dashboard },
  { id: "rawMaterials", label: "Raw Materials", component: RawMaterials },
  { id: "finishedProducts", label: "Finished Products", component: FinishedProducts },
  { id: "stockMovements", label: "Stock Movements", component: StockMovements },
  { id: "dispatchDelivery", label: "Dispatch & Delivery", component: DispatchDelivery },
  { id: "stockManagement", label: "Stock Management", component: StockManagement },
  { id: "reports", label: "Reports", component: Reports },
];

export default function App() {
  const API_URL = "https://backend-repo-ydwt.onrender.com/api"; // Backend base URL
  const [activeTab, setActiveTab] = useState("dashboard");

  // Optional: ping backend to check connection
  useEffect(() => {
    fetch(`${API_URL}/api/ping`)
      .then((res) => res.json())
      .then((data) => console.log("Backend ping:", data))
      .catch((err) => console.error("Backend unreachable:", err));
  }, [API_URL]);

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-700">BFC Stock Management</h1>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow flex overflow-x-auto border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-3 border-b-4 transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-700 font-semibold"
                : "border-transparent hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Active Tab Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {ActiveComponent ? <ActiveComponent apiUrl={API_URL} /> : <p>Component not found</p>}
      </main>
    </div>
  );
}
