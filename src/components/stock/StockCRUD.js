import React, { useEffect, useState } from 'react';

const API_URL = 'https://backend-repo-6bhr.onrender.com/api/stocks';


export default function StockManagement() {
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
    } catch (err) {
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
    <div>
      <h2>{editingId ? 'Edit Stock Item' : 'Add Stock Item'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={editingId ? handleUpdate : handleCreate}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <input name="unitPrice" type="number" step="0.01" placeholder="Unit Price" value={form.unitPrice} onChange={handleChange} required />
        <input name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleChange} />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', quantity: '', category: '', unitPrice: '', supplier: '' }); }}>Cancel</button>}
      </form>

      <h2>Stock List</h2>
      {loading ? <p>Loading...</p> : (
        <ul>
          {stocks.map(item => (
            <li key={item._id}>
              <strong>{item.name}</strong> | Qty: {item.quantity} | Category: {item.category} | Price: ${item.unitPrice.toFixed(2)} | Supplier: {item.supplier || 'N/A'}
              <button onClick={() => startEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

