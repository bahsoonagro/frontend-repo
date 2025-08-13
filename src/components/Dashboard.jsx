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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  if (loading) return <div className="p-6">Loading charts...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-4 w-full min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Top 5 by Quantity Chart */}
        <div className="flex-1 bg-white p-4 rounded shadow h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.topByQty}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 by Value Chart */}
        <div className="flex-1 bg-white p-4 rounded shadow h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.topByValue}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
