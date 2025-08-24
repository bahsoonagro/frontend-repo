// frontend/src/components/StockMovements.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://backend-repo-ydwt.onrender.com/api/stockmovements";

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch stock movements
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_BASE);
      setMovements(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch stock movements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  // Delete stock movement
  const handleDelete = async (id) => {
    if (!id) {
      setError("Invalid movement ID.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this movement?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      setMovements((prev) => prev.filter((m) => m._id !== id));
      setSuccessMsg("Stock movement deleted successfully!");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete movement.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">📦 Stock Movements</h2>

      {/* Success / Error Messages */}
      {successMsg && <div className="p-2 mb-2 bg-green-100 text-green-700 rounded">{successMsg}</div>}
      {error && <div className="p-2 mb-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Loading */}
      {loading ? (
        <p>Loading stock movements...</p>
      ) : movements.length === 0 ? (
        <p>No stock movements found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement, index) => (
              <tr key={movement._id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{movement.type}</td>
                <td className="border p-2">{movement.quantity}</td>
                <td className="border p-2">
                  {movement.date ? new Date(movement.date).toLocaleDateString() : "N/A"}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(movement._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
}
