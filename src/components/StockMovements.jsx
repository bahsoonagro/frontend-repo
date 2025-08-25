import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://backend-repo-ydwt.onrender.com/api/stockmovements";

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [newMovement, setNewMovement] = useState({
    item: "",
    quantity: "",
    type: "in",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ✅ Fetch stock movements
  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setMovements(res.data);
    } catch (err) {
      setError("Failed to fetch stock movements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // ✅ Add new stock movement
  const handleAddMovement = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const res = await axios.post(API_BASE, newMovement);
      setMovements((prev) => [...prev, res.data]);
      setSuccessMsg("Stock movement added successfully!");
      setNewMovement({ item: "", quantity: "", type: "in", date: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add movement.");
    }
  };

  // ✅ Delete stock movement
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movement?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setMovements((prev) => prev.filter((m) => m._id !== id));
      setSuccessMsg("Stock movement deleted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete movement.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Stock Movements</h1>

      {/* ✅ Error & Success Messages */}
      {error && <p className="text-red-500 mb-3">{error}</p>}
      {successMsg && <p className="text-green-500 mb-3">{successMsg}</p>}

      {/* ✅ Add Movement Form */}
      <form onSubmit={handleAddMovement} className="mb-6 bg-white shadow p-4 rounded-xl">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Item"
            value={newMovement.item}
            onChange={(e) => setNewMovement({ ...newMovement, item: e.target.value })}
            required
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newMovement.quantity}
            onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
            required
            className="border p-2 rounded"
          />
          <select
            value={newMovement.type}
            onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="in">In</option>
            <option value="out">Out</option>
          </select>
          <input
            type="date"
            value={newMovement.date}
            onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
            required
            className="border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Movement
        </button>
      </form>

      {/* ✅ Loading */}
      {loading && <p>Loading stock movements...</p>}

      {/* ✅ Movements Table */}
      <table className="w-full bg-white shadow rounded-xl overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Item</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Type</th>
            <th className="p-2">Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movements.length > 0 ? (
            movements.map((m) => (
              <tr key={m._id} className="border-b">
                <td className="p-2">{m.item}</td>
                <td className="p-2">{m.quantity}</td>
                <td className="p-2">{m.type}</td>
                <td className="p-2">{new Date(m.date).toLocaleDateString()}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No stock movements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockMovements;
