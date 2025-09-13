import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Optional debug toggle
const Shimmer = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
    <div className="h-72 bg-gray-200 rounded"></div>
  </div>
);

const Dashboard = ({ apiUrl }) => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rawRes, finishedRes, stockRes, dispatchRes] = await Promise.all([
          axios.get(`${apiUrl}/api/raw-materials`),
          axios.get(`${apiUrl}/api/finished-products`),
          axios.get(`${apiUrl}/api/stock-movements`),
          axios.get(`${apiUrl}/api/dispatch-delivery`),
        ]);

        setRawMaterials(Array.isArray(rawRes.data) ? rawRes.data : []);
        setFinishedProducts(Array.isArray(finishedRes.data) ? finishedRes.data : []);
        setStockMovements(Array.isArray(stockRes.data) ? stockRes.data : []);
        setDispatches(Array.isArray(dispatchRes.data) ? dispatchRes.data : []);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  const filteredDispatches = dispatches.filter(d => {
    const date = new Date(d.date);
    const afterStart = startDate ? date >= new Date(startDate) : true;
    const beforeEnd = endDate ? date <= new Date(endDate) : true;
    const matchesProduct = selectedProduct === "all" ? true : (d.item || d.productName) === selectedProduct;
    return afterStart && beforeEnd && matchesProduct;
  });

  const monthlyDispatch = filteredDispatches.reduce((acc, item) => {
    if (!item.date || !item.quantity) return acc;
    const month = new Date(item.date).toLocaleString("default", { month: "short" });
    const existing = acc.find(d => d.month === month);
    if (existing) existing.quantity += item.quantity;
    else acc.push({ month, quantity: item.quantity });
    return acc;
  }, []);

  const finishedProductsData = finishedProducts.length
    ? finishedProducts.map(p => ({
        name: p.name || p.productName || "Unnamed",
        quantity: Number(p.quantity || p.qty || 0),
      }))
    : [{ name: "No Data", quantity: 0 }];

  const stockMovementData = stockMovements.length
    ? stockMovements.map(m => ({
        item: m.item || m.productName || "Unnamed",
        in: Number(m.quantityIn || m.qtyIn || 0),
        out: Number(m.quantityOut || m.qtyOut || 0),
      }))
    : [{ item: "No Data", in: 0, out: 0 }];

  const rawMaterialData = rawMaterials.length
    ? rawMaterials.map(r => ({
        name: r.rawMaterialType || "Unnamed",
        quantity: Number(r.bagsAfterStd || 0),
      }))
    : [{ name: "No Data", quantity: 0 }];

  const productOptions = Array.from(new Set(dispatches.map(d => d.item || d.productName).filter(Boolean)));

  if (loading) return <div className="p-4 space-y-6"><Shimmer /><Shimmer /><Shimmer /><Shimmer /></div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">📊 BFC Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Product</label>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
            className="border-gray-300 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="all">All</option>
            {productOptions.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Dispatch Chart */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Monthly Dispatch Quantity</h3>
          {monthlyDispatch.length === 0 ? <p className="text-gray-500">No dispatch data available</p> :
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyDispatch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantity" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Finished Products Chart */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Finished Products Quantity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={finishedProductsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Movements */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Stock Movements (In vs Out)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockMovementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="item" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="in" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Raw Materials */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Raw Materials Quantity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rawMaterialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#facc15" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
