// FinishedProducts.jsx
import React, { useState } from 'react';

const FinishedProducts = () => {
  const [formData, setFormData] = useState({
    product: '',
    batch: '',
    quantity: '',
    unit: '',
    date: ''
  });

  const [products, setProducts] = useState([
    { id: 1, product: 'Cornmeal Pack', batch: 'B001', quantity: 150, unit: 'kg', date: '2025-07-25' },
    { id: 2, product: 'Palm Oil Bottle', batch: 'B002', quantity: 200, unit: 'liters', date: '2025-07-26' }
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: products.length + 1,
      ...formData
    };
    setProducts([...products, newProduct]);
    setFormData({ product: '', batch: '', quantity: '', unit: '', date: '' });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🏷️ Finished Products</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          name="product"
          placeholder="Product Name"
          value={formData.product}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="batch"
          placeholder="Batch Number"
          value={formData.batch}
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
        <input
          type="text"
          name="unit"
          placeholder="Unit (e.g. kg, cartons)"
          value={formData.unit}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <button type="submit" className="col-span-1 md:col-span-5 bg-blue-600 text-white py-2 rounded">
          ➕ Add Product
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Batch</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Unit</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="p-2 border">{prod.product}</td>
                <td className="p-2 border">{prod.batch}</td>
                <td className="p-2 border">{prod.quantity}</td>
                <td className="p-2 border">{prod.unit}</td>
                <td className="p-2 border">{prod.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinishedProducts;

