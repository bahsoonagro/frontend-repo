import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://backend-repo-ydwt.onrender.com/api/stockmovements";

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    type: "IN",
    date: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // Fetch stock movements on load
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setMovements(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch stock movements.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit (create new movement)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_BASE, form);
      setMovements([...movements, res.data]); // Add new movement to list
      setForm({ product: "", quantity: "", type: "IN", date: "", notes: "" });
      setSuccessMsg("Stock movement added successfully!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add stock movement.");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movement?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setMovements((prev) => prev.filter((m) => m._id !== id));
      setSuccessMsg("Stock movement deleted successfully!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete movement.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Stock Movements</h2>

      {/* Success/Error Messages */}
      {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          name="product"
          placeholder="Product Name"
          value={form.product}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Movement
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <p>Loading stock movements...</p>
      ) : movements.length === 0 ? (
        <p>No stock movements found.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Notes</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m._id}>
                <td className="border p-2">{m.product}</td>
                <td className="border p-2">{m.quantity}</td>
                <td className="border p-2">{m.type}</td>
                <td className="border p-2">
                  {new Date(m.date).toLocaleDateString()}
                </td>
                <td className="border p-2">{m.notes}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockMovements;
