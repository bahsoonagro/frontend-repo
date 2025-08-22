import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const API_URL = "https://backend-repo-ydwt.onrender.com/api";

const Dashboard = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [lpos, setLpos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rmRes, lpoRes] = await Promise.all([
          fetch(`${API_URL}/raw-materials`),
          fetch(`${API_URL}/raw-materials/lpo`),
        ]);

        const rmData = await rmRes.json();
        const lpoData = await lpoRes.json();

        setRawMaterials(Array.isArray(rmData) ? rmData : []);
        setLpos(Array.isArray(lpoData) ? lpoData : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Prepare bar chart data (e.g., total weight per material)
  const barData = rawMaterials.reduce((acc, item) => {
    const existing = acc.find(d => d.name === item.rawMaterialType);
    if (existing) {
      existing.value += Number(item.weightKg) || 0;
    } else {
      acc.push({ name: item.rawMaterialType, value: Number(item.weightKg) || 0 });
    }
    return acc;
  }, []);

  // Prepare pie chart data (e.g., damaged vs not damaged)
  const damagedCount = rawMaterials.filter(rm => rm.damaged === "Yes").length;
  const notDamagedCount = rawMaterials.length - damagedCount;
  const pieData = [
    { name: "Not Damaged", value: notDamagedCount },
    { name: "Damaged", value: damagedCount },
  ];

  if (loading) {
    return <div className="p-6 text-center text-gray-700">Loading dashboard...</div>;
  }

  return (
    <div className="p-4 w-full min-h-screen bg-gray-50">
      <div className="flex flex-wrap gap-6">
        {/* Bar Chart */}
        <div className="flex-1 bg-white p-4 rounded shadow h-[300px] min-w-[300px]">
          <h3 className="font-bold mb-2">Raw Material Weights (Kg)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="flex-1 bg-white p-4 rounded shadow h-[300px] min-w-[300px]">
          <h3 className="font-bold mb-2">Damaged vs Not Damaged</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optional: Summary Table */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Summary Table</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Material</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Weight (Kg)</th>
              <th className="border p-2">Damaged</th>
            </tr>
          </thead>
          <tbody>
            {rawMaterials.map(rm => (
              <tr key={rm._id || rm.date + rm.rawMaterialType}>
                <td className="border p-2">{rm.rawMaterialType}</td>
                <td className="border p-2">{rm.date}</td>
                <td className="border p-2">{rm.weightKg}</td>
                <td className="border p-2">{rm.damaged}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

