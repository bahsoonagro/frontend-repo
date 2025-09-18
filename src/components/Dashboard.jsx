import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { FaBox, FaCubes, FaTruck, FaWarehouse } from "react-icons/fa";

// Shimmer loader
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
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  // Filters
  const filteredDispatches = dispatches.filter(d => {
    const date = new Date(d.date);
    const afterStart = startDate ? date >= new Date(startDate) : true;
    const beforeEnd = endDate ? date <= new Date(endDate) : true;
    const matchesProduct = selectedProduct === "all" ? true : (d.item || d.productName) === selectedProduct;
    return afterStart && beforeEnd && matchesProduct;
  });

  // Monthly dispatch aggregation
  const monthlyDispatch = filteredDispatches.reduce((acc, item) => {
    if (!item.date || !item.quantity) return acc;
    const month = new Date(item.date).toLocaleString("default", { month: "short" });
    const existing = acc.find(d => d.month === month);
    if (existing) existing.quantity += item.quantity;
    else acc.push({ month, quantity: item.quantity });
    return acc;
  }, []);

  // Chart data
  const finishedProductsData = finishedProducts.length
    ? finishedProducts.map(p => ({ name: p.name || p.productName || "Unnamed", quantity: Number(p.quantity || p.qty || 0) }))
    : [{ name: "No Data", quantity: 0 }];

  const stockMovementData = stockMovements.length
    ? stockMovements.map(m => ({ item: m.item || m.productName || "Unnamed", in: Number(m.quantityIn || m.qtyIn || 0), out: Number(m.quantityOut || m.qtyOut || 0) }))
    : [{ item: "No Data", in: 0, out: 0 }];

  const rawMaterialData = rawMaterials.length
    ? rawMaterials.map(r => ({ name: r.rawMaterialType || "Unnamed", quantity: Number(r.bagsAfterStd || 0) }))
    : [{ name: "No Data", quantity: 0 }];

  const productOptions = Array.from(new Set(dispatches.map(d => d.item || d.productName).filter(Boolean)));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6361"];

  if (loading) return <div className="p-4 space-y-6"><Shimmer /><Shimmer /><Shimmer /><Shimmer /></div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  // Summary totals
  const totalRawMaterials = rawMaterials.reduce((a,b)=>a+(b.bagsAfterStd||0),0);
  const totalFinishedProducts = finishedProducts.reduce((a,b)=>a+(b.quantity||0),0);
  const totalDispatches = dispatches.length;
  const totalStockIn = stockMovements.reduce((a,b)=>a+(b.quantityIn||0),0);
  const totalStockOut = stockMovements.reduce((a,b)=>a+(b.quantityOut||0),0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">📊 BFC Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-4">
          <FaWarehouse className="text-3xl text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">Total Raw Materials</p>
            <p className="text-2xl font-bold">{totalRawMaterials}</p>
          </div>
        </div>
        <div className="bg-white shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-4">
          <FaBox className="text-3xl text-green-500" />
          <div>
            <p className="text-gray-500 text-sm">Finished Products</p>
            <p className="text-2xl font-bold">{totalFinishedProducts}</p>
          </div>
        </div>
        <div className="bg-white shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-4">
          <FaTruck className="text-3xl text-purple-500" />
          <div>
            <p className="text-gray-500 text-sm">Dispatches</p>
            <p className="text-2xl font-bold">{totalDispatches}</p>
          </div>
        </div>
        <div className="bg-white shadow hover:shadow-lg transition p-4 rounded-lg flex items-center gap-4">
          <FaCubes className="text-3xl text-red-500" />
          <div>
            <p className="text-gray-500 text-sm">Stock In vs Out</p>
            <p className="text-2xl font-bold">In: {totalStockIn} / Out: {totalStockOut}</p>
          </div>
        </div>
      </div>

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

        {/* Monthly Dispatch */}
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

        {/* Finished Products */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Finished Products Quantity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={finishedProductsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Movements (Stacked) */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Stock Movements (In vs Out)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockMovementData} stackOffset="expand">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="item" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="in" stackId="a" fill="#2563eb" />
              <Bar dataKey="out" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Raw Materials (Pie Chart) */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Raw Materials Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rawMaterialData}
                dataKey="quantity"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {rawMaterialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
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
