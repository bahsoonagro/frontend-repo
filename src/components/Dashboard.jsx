import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const Dashboard = ({ apiUrl }) => {
  const [summary, setSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

  useEffect(() => {
    if (!apiUrl) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiUrl}/api/reports/stock-summary`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Use fallback mock data if any field is missing
        setSummary({
          topByQty: data.summary.topByQty || [
            { name: "Item A", quantity: 50 },
            { name: "Item B", quantity: 40 },
            { name: "Item C", quantity: 30 },
          ],
          topByValue: data.summary.topByValue || [
            { name: "Item A", value: 5000 },
            { name: "Item B", value: 4000 },
            { name: "Item C", value: 3000 },
          ],
          lowStockItems: data.summary.lowStockItems || [
            { name: "Item D", quantity: 5 },
            { name: "Item E", quantity: 2 },
          ],
          totalIn30: data.summary.totalIn30 ?? 120,
          totalOut30: data.summary.totalOut30 ?? 80,
          totalStockValue: data.summary.totalStockValue ?? 10000,
        });

        setRecentMovements(data.recentMovements || [
          { itemName: "Item A", quantity: 20 },
          { itemName: "Item B", quantity: 15 },
          { itemName: "Item C", quantity: 10 },
        ]);
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
  if (loading) return <div className="p-6 text-center">Loading charts...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-4 md:p-8 w-full min-h-screen bg-gray-50">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[400px]">

        {/* Top 5 by Quantity */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-center font-semibold mb-2">Top 5 by Quantity</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={summary.topByQty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 by Value */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-center font-semibold mb-2">Top 5 by Value</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={summary.topByValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-4 rounded shadow">
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

        {/* Stock Movements Last 30 Days */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-center font-semibold mb-2">Stock Movements (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={[
                { name: "IN", quantity: summary.totalIn30 },
                { name: "OUT", quantity: summary.totalOut30 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Movements */}
        <div className="bg-white p-4 rounded shadow col-span-1 sm:col-span-2">
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

        {/* Total Stock Value */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-center font-semibold mb-2">Total Stock Value</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={[
                  { name: "Total Value", value: summary.totalStockValue },
                  { name: "Remaining", value: summary.totalStockValue * 0.1 },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#00C49F" />
                <Cell fill="#E5E7EB" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
