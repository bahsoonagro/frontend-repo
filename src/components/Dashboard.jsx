import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://backend-repo-ydwt.onrender.com/api/reports/stock-summary")
      .then(res => res.json())
      .then(data => {
        console.log("Dashboard API data:", data);
        setSummary(data.summary || {});
        setRecentMovements(data.recentMovements || []);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      });
  }, []);

  if (error) {
    return <div className="text-center text-red-600 p-10">{error}</div>;
  }

  if (!summary) {
    return <div className="text-center text-lg p-10">Loading dashboard...</div>;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

  return (
    <div className="p-4 md:p-8 max-w-screen overflow-x-hidden">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[350px]">

        {/* Top by Quantity */}
        {summary?.topByQty?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-center font-semibold mb-2">Top 5 by Quantity</h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={summary.topByQty}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top by Value */}
        {summary?.topByValue?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-center font-semibold mb-2">Top 5 by Value</h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={summary.topByValue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Low Stock Items */}
        {summary?.lowStockItems?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-center font-semibold mb-2">Low Stock Items</h2>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={summary.lowStockItems}
                  dataKey="quantity"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#FF8042"
                  label
                >
                  {summary.lowStockItems.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stock Movements Last 30 Days */}
        {(summary?.totalIn30 !== undefined && summary?.totalOut30 !== undefined) && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-center font-semibold mb-2">Stock Movements (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={[
                { name: "IN", quantity: summary.totalIn30 || 0 },
                { name: "OUT", quantity: summary.totalOut30 || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Movements */}
        {recentMovements?.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 col-span-1 sm:col-span-2">
            <h2 className="text-center font-semibold mb-2">Recent Stock Movements</h2>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={recentMovements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="itemName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantity" stroke="#AA00FF" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Total Stock Value */}
        {summary?.totalStockValue !== undefined && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-center font-semibold mb-2">Total Stock Value</h2>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Total Value", value: summary.totalStockValue || 0 },
                    { name: "Remaining", value: (summary.totalStockValue || 0) * 0.1 }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#0088FE"
                  label
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#E0E0E0" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
