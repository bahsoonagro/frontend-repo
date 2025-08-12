import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/stocks";

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState({ name: "", quantity: "" });

  // Fetch stocks from backend
  const fetchStocks = async () => {
    try {
      const res = await axios.get(API_URL);
      setStocks(res.data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Add new stock
  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newStock);
      setNewStock({ name: "", quantity: "" });
      fetchStocks();
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  // Delete stock
  const handleDeleteStock = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchStocks();
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Stock Management</h2>

      {/* Add Stock Form */}
      <form onSubmit={handleAddStock} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Stock Name"
          value={newStock.name}
          onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newStock.quantity}
          onChange={(e) =>
            setNewStock({ ...newStock, quantity: e.target.value })
          }
          required
        />
        <button type="submit">Add Stock</button>
      </form>

      {/* Stock List */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock._id}>
              <td>{stock.name}</td>
              <td>{stock.quantity}</td>
              <td>
                <button onClick={() => handleDeleteStock(stock._id)}>
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
