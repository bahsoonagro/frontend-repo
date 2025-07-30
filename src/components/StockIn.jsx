// src/components/stock/StockIn.jsx
import React, { useState } from 'react';

const StockIn = () => {
  const [formData, setFormData] = useState({ name: '', quantity: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Stocked In: ${formData.quantity} units of ${formData.name}`);
    setFormData({ name: '', quantity: '' });
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-2">Stock In</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={e => setFormData({ ...formData, quantity: e.target.value })}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Stock
        </button>
      </form>
    </div>
  );
};

export default StockIn;

