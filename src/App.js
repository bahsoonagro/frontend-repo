// App.js
import React, { useState } from "react";

// Import your page components
import Dashboard from "./pages/Dashboard";
import RawMaterials from "./pages/RawMaterials";
import FinishedProducts from "./pages/FinishedProducts";
import StockMovements from "./pages/StockMovements"; // Only stock movement now
import DispatchDelivery from "./pages/DispatchDelivery";
import Reports from "./pages/Reports";

// Main App component
const App = () => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState("dashboard");

  // Array of tabs to render navigation dynamically
  const tabs = [
    { id: "dashboard", label: "Dashboard", component: <Dashboard /> },
    { id: "rawMaterials", label: "Raw Materials", component: <RawMaterials /> },
    { id: "finishedProducts", label: "Finished Products", component: <FinishedProducts /> },
    { id: "stockMovements", label: "Stock Movements", component: <StockMovements /> },
    { id: "dispatchDelivery", label: "Dispatch & Delivery", component: <DispatchDelivery /> },
    { id: "reports", label: "Reports", component: <Reports /> },
  ];

  return (
    <div className="app-container">
      {/* Navigation bar */}
      <nav className="navbar">
        <ul className="nav-list">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content area */}
      <main className="main-content">
        {tabs.map(
          (tab) =>
            tab.id === activeTab && (
              <div key={tab.id} className="tab-content">
                {tab.component}
              </div>
            )
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Bahsoon Agro-Processing</p>
      </footer>
    </div>
  );
};

export default App;
