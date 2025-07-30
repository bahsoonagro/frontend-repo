// DispatchDelivery.jsx
import React, { useState } from 'react';

const DispatchDelivery = () => {
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    date: '',
    customer: '',
    driver: '',
    vehicle: ''
  });

  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      item: 'Finished Nutri-Corn',
      quantity: 200,
      date: '2025-07-29',
      customer: 'Kroo Bay Wholesalers',
      driver: 'Musa Kamara',
      vehicle: 'AS 3249 SL'
    }
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDelivery = {
      id: deliveries.length + 1,
      ...formData
    };
    setDeliveries([...deliveries, newDelivery]);
    setFormData({ item: '', quantity: '', date: '', customer: '', driver: '', vehicle: '' });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🚚 Dispatch & Delivery</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <input
          type="text"
          name="item"
          placeholder="Item"
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
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="customer"
          placeholder="Customer"
          value={formData.customer}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="driver"
          placeholder="Driver Name"
          value={formData.driver}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="vehicle"
          placeholder="Vehicle Number"
          value={formData.vehicle}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <button type="submit" className="col-span-1 md:col-span-6 bg-green-700 text-white py-2 rounded">
          ➕ Record Delivery
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Driver</th>
              <th className="p-2 border">Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="p-2 border">{d.item}</td>
                <td className="p-2 border">{d.quantity}</td>
                <td className="p-2 border">{d.date}</td>
                <td className="p-2 border">{d.customer}</td>
                <td className="p-2 border">{d.driver}</td>
                <td className="p-2 border">{d.vehicle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchDelivery;

