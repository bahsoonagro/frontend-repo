import React, { useState, useEffect } from "react";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/dispatches";

export default function DispatchDelivery() {
  const [dispatches, setDispatches] = useState([]);
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    tollFee: 0,
    fuelCost: 0,
    perDiem: 0,
    personnel: "",
    totalCost: 0,
    remarks: "",
  });

  // ✅ Fetch all dispatches
  const fetchDispatches = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setDispatches(data);
    } catch (error) {
      console.error("Error fetching dispatches:", error);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Add new dispatch
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          personnel: formData.personnel
            ? formData.personnel.split(",").map((p) => p.trim())
            : [],
        }),
      });

      if (res.ok) {
        setFormData({
          item: "",
          quantity: "",
          date: "",
          customer: "",
          driver: "",
          vehicle: "",
          tollFee: 0,
          fuelCost: 0,
          perDiem: 0,
          personnel: "",
          totalCost: 0,
          remarks: "",
        });
        fetchDispatches();
      }
    } catch (error) {
      console.error("Error adding dispatch:", error);
    }
  };

  // ✅ Delete dispatch
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchDispatches();
    } catch (error) {
      console.error("Error deleting dispatch:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🚚 Dispatch Deliveries</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input name="item" placeholder="Item" value={formData.item} onChange={handleChange} className="border p-2 rounded" required />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} className="border p-2 rounded" required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="border p-2 rounded" required />
        <input name="customer" placeholder="Customer" value={formData.customer} onChange={handleChange} className="border p-2 rounded" required />
        <input name="driver" placeholder="Driver" value={formData.driver} onChange={handleChange} className="border p-2 rounded" required />
        <input name="vehicle" placeholder="Vehicle" value={formData.vehicle} onChange={handleChange} className="border p-2 rounded" required />
        <input type="number" name="tollFee" placeholder="Toll Fee" value={formData.tollFee} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="fuelCost" placeholder="Fuel Cost" value={formData.fuelCost} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="perDiem" placeholder="Per Diem" value={formData.perDiem} onChange={handleChange} className="border p-2 rounded" />
        <input name="personnel" placeholder="Personnel (comma separated)" value={formData.personnel} onChange={handleChange} className="border p-2 rounded" />
        <input type="number" name="totalCost" placeholder="Total Cost" value={formData.totalCost} onChange={handleChange} className="border p-2 rounded" />
        <input name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} className="border p-2 rounded col-span-2" />
        <button type="submit" className="col-span-2 bg-blue-500 text-white py-2 rounded">Add Dispatch</button>
      </form>

      {/* List */}
      <h3 className="text-lg font-semibold mb-2">📋 Dispatch List</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Item</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Customer</th>
            <th className="border px-2 py-1">Driver</th>
            <th className="border px-2 py-1">Vehicle</th>
            <th className="border px-2 py-1">Total Cost</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dispatches.map((d) => (
            <tr key={d._id}>
              <td className="border px-2 py-1">{d.item}</td>
              <td className="border px-2 py-1">{d.quantity}</td>
              <td className="border px-2 py-1">{d.customer}</td>
              <td className="border px-2 py-1">{d.driver}</td>
              <td className="border px-2 py-1">{d.vehicle}</td>
              <td className="border px-2 py-1">{d.totalCost}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDelete(d._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
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
