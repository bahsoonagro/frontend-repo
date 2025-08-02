// StockMovements.jsx
import React, { useState } from 'react';

const StockMovements = () => {
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    from: '',
    to: '',
    date: ''
  });

  const [movements, setMovements] = useState([
    { id: 1, item: 'Maize Grain', quantity: 100, from: 'Raw Materials', to: 'Production', date: '2025-07-28' },
    { id: 2, item: 'Palm Kernel Oil', quantity: 50, from: 'Production', to: 'Finished Products', date: '2025-07-29' }
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMovement = {
      id: movements.length + 1,
      ...formData
    };
    setMovements([...movements, newMovement]);
    setFormData({ item: '', quantity: '', from: '', to: '', date: '' });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🔁 Stock Movements</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          name="item"
          placeholder="Item Name"
          value={formData.item}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <select
          name="from"
          value={formData.from}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        >
          <option value="">From</option>
          <option value="Raw Materials">Raw Materials</option>
          <option value="Production">Production</option>
          <option value="Storage">Storage</option>
        </select>
        <select
          name="to"
          value={formData.to}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        >
          <option value="">To</option>
          <option value="Production">Production</option>
          <option value="Finished Products">Finished Products</option>
          <option value="Storage">Storage</option>
        </select>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <button type="submit" className="col-span-1 md:col-span-5 bg-blue-700 text-white py-2 rounded">
          ➕ Record Movement
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">From</th>
              <th className="p-2 border">To</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((move) => (
              <tr key={move.id} className="hover:bg-gray-50">
                <td className="p-2 border">{move.item}</td>
                <td className="p-2 border">{move.quantity}</td>
                <td className="p-2 border">{move.from}</td>
                <td className="p-2 border">{move.to}</td>
                <td className="p-2 border">{move.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovements;

