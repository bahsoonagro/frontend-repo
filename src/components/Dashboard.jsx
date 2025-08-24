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

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rawRes, finishedRes, stockRes, dispatchRes] = await Promise.all([
          axios.get(`${apiUrl}/api/raw-materials`),
          axios.get(`${apiUrl}/api/finished-products`),
          axios.get(`${apiUrl}/api/stockmovements`),
          axios.get(`${apiUrl}/api/dispatch-delivery`),
        ]);

        setRawMaterials(rawRes.data);
        setFinishedProducts(finishedRes.data);
        setStockMovements(stockRes.data);
        setDispatches(dispatchRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Filter dispatches by date range
  const filteredDispatches = dispatches
    .filter(d => {
      const date = new Date(d.date);
      const afterStart = startDate ? date >= new Date(startDate) : true;
      const beforeEnd = endDate ? date <= new Date(endDate) : true;
      const matchesProduct =
        selectedProduct === "all" ? true : d.item === selectedProduct;
      return afterStart && beforeEnd && matchesProduct;
    });

  // Prepare data for charts
  const monthlyDispatch = filteredDispatches.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleString("default", { month: "short" });
    const existing = acc.find(d => d.month === month);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ month, quantity: item.quantity });
    }
    return acc;
  }, []);

  const finishedProductsData = finishedProducts.map(p => ({
    name: p.name,
    quantity: p.quantity,
  }));

  const stockMovementData = stockMovements.map(m => ({
    item: m.item,
    in: m.quantityIn || 0,
    out: m.quantityOut || 0,
  }));

  const rawMaterialData = rawMaterials.map(r => ({
    name: r.name,
    quantity: r.quantity,
  }));

  const productOptions = Array.from(
    new Set(dispatches.map(d => d.item))
  );

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">📊 BFC Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="block font-semibold">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Product</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            {productOptions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Dispatches Line Chart */}
        <div className="p-4 border rounded bg-white">
          <h3 className="font-bold mb-2">Monthly Dispatch Quantity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyDispatch}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="quantity" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Finished Products Bar Chart */}
        <div className="p-4 border rounded bg-white">
          <h3 className="font-bold mb-2">Finished Products Quantity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={finishedProductsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Movements Bar Chart */}
        <div className="p-4 border rounded bg-white">
          <h3 className="font-bold mb-2">Stock Movements (In vs Out)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockMovementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="in" fill="#4ade80" />
              <Bar dataKey="out" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Raw Materials Bar Chart */}
        <div className="p-4 border rounded bg-white">
          <h3 className="font-bold mb-2">Raw Materials Quantity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rawMaterialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

