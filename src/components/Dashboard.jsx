import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
  LineChart, Line, ResponsiveContainer
} from "recharts";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    fetch("https://backend-repo-ydwt.onrender.com/api/reports/stock-summary")
      .then(res => res.json())
      .then(data => {
        setSummary(data.summary);
        setRecentMovements(data.recentMovements);
      })
      .catch(err => console.error("Error fetching dashboard data:", err));
  }, []);

  if (!summary) {
    return <div className="text-center text-lg p-10">Loading dashboard...</div>;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

  return (
    <div className="p-2 md:p-6 w-full">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[350px]">

        {/* Top 5 by Quantity */}
        <div className="bg-white rounded-lg shadow p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.topByQty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 by Value */}
        <div className="bg-white rounded-lg shadow p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.topByValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.lowStockItems}
                dataKey="quantity"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
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
        <div className="bg-white rounded-lg shadow p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: "IN", quantity: summary.totalIn30 },
              { name: "OUT", quantity: summary.totalOut30 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-lg shadow p-2 sm:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentMovements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="itemName" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="quantity" stroke="#AA00FF" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white rounded-lg shadow p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Total Value", value: summary.totalStockValue },
                  { name: "Remaining", value: summary.totalStockValue * 0.1 }
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                <Cell fill="#00C49F" />
                <Cell fill="#E0E0E0" />
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
