import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = ({ apiUrl }) => {
  const [summary, setSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    if (!apiUrl) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/api/reports/stock-summary`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSummary(data.summary);
        setRecentMovements(data.recentMovements);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  if (!apiUrl) return <div className="p-4">No API URL provided.</div>;
  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const metricCards = [
    {
      title: "Total Stock Value",
      value: `$${Number(summary.totalStockValue || 0).toLocaleString()}`,
      bg: "bg-green-50",
      color: "text-green-700",
    },
    {
      title: "Total Item Types",
      value: summary.totalItemsCount,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      title: "Total In (30d)",
      value: summary.totalIn30,
      bg: "bg-yellow-50",
      color: "text-yellow-700",
    },
    {
      title: "Total Out (30d)",
      value: summary.totalOut30,
      bg: "bg-red-50",
      color: "text-red-700",
    },
    {
      title: "Low Stock Items",
      value: summary.lowStockCount,
      bg: "bg-gray-100",
      color: "text-gray-700",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        Managerial Dashboard
      </h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {metricCards.map((card) => (
          <div
            key={card.title}
            className={`p-4 rounded shadow ${card.bg} text-center`}
          >
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className={`text-2xl font-bold ${card.color} mt-2`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Top 5 Items by Quantity</h3>
          {summary.topByQty.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.topByQty} margin={{ top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Top 5 Items by Value</h3>
          {summary.topByValue.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.topByValue} margin={{ top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Recent Stock Movements</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Notes</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No recent movements
                  </td>
                </tr>
              ) : (
                recentMovements.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      {new Date(m.date).toLocaleString()}
                    </td>
                    <td className="p-2 border">{m.itemName}</td>
                    <td
                      className={`p-2 border ${
                        m.type === "IN"
                          ? "text-green-600"
                          : m.type === "OUT"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {m.type}
                    </td>
                    <td className="p-2 border">{m.quantity}</td>
                    <td className="p-2 border">{m.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
