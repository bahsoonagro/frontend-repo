import React, { useEffect, useState } from 'react';

import { BACKEND_URL } from './config'; // adjust path if needed
const API_URL = `${BACKEND_URL}/api/stocks`;

const API_URL = 'https://backend-repo-6bhr.onrender.com/api/stocks';
 // Adjust if backend URL differs

export default function StockCRUD() {
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: '', category: '', unitPrice: '', supplier: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all stock items
  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStocks(data);
      setError(null);
    } catch {
      setError('Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Create new stock item
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Create failed');
      setForm({ name: '', quantity: '', category: '', unitPrice: '', supplier: '' });
      fetchStocks();
    } catch {
      setError('Failed to create stock item');
    }
  };

  // Start editing an item
  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
    });
  };

  // Update stock item
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Update failed');
      setEditingId(null);
      setForm({ name: '', quantity: '', category: '', unitPrice: '', supplier: '' });
      fetchStocks();
    } catch {
      setError('Failed to update stock item');
    }
  };

  // Delete stock item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchStocks();
    } catch {
      setError('Failed to delete stock item');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-neutral-50 p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-navy-900 text-center">
        {editingId ? 'Edit Stock Item' : 'Add Stock Item'}
      </h2>

      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      <form
        onSubmit={editingId ? handleUpdate : handleCreate}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
          min={0}
          className="border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          className="border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          name="unitPrice"
          type="number"
          step="0.01"
          placeholder="Unit Price"
          value={form.unitPrice}
          onChange={handleChange}
          required
          min={0}
          className="border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <input
          name="supplier"
          placeholder="Supplier"
          value={form.supplier}
          onChange={handleChange}
          className="border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            className={`px-4 py-2 rounded font-semibold text-white transition
              ${editingId ? 'bg-light-brown hover:bg-brown-600' : 'bg-sky-600 hover:bg-sky-700'}`}
          >
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: '', quantity: '', category: '', unitPrice: '', supplier: '' });
                setError(null);
              }}
              className="px-4 py-2 rounded font-semibold bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-navy-900 text-center">Stock List</h2>

      {loading ? (
        <p className="text-center text-navy-700">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {stocks.map((item) => (
            <li
              key={item._id}
              className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-neutral-300 rounded p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:space-x-6 md:items-center flex-grow">
                <span className="font-bold text-navy-900">{item.name}</span>
                <span>Qty: {item.quantity}</span>
                <span>Category: {item.category}</span>
                <span>
                  Price: ${Number(item.unitPrice).toFixed(2)}
                </span>
                <span>Supplier: {item.supplier || 'N/A'}</span>
              </div>
              <div className="mt-3 md:mt-0 flex space-x-2">
                <button
                  onClick={() => startEdit(item)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-light-brown hover:bg-brown-600 text-white px-3 py-1 rounded transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

