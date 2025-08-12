import React, { useState, useEffect } from "react";
import axios from "axios";

const DispatchDelivery = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
  });

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch deliveries on mount
  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${apiUrl}/api/dispatch-delivery`);
        setDeliveries(res.data);
      } catch (err) {
        setError("Failed to load deliveries.");
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, [apiUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    for (const field of ["item", "quantity", "date", "customer", "driver", "vehicle"]) {
      if (!formData[field]) {
        setError(`Please fill in the ${field}.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
      };

      const res = await axios.post(`${apiUrl}/api/dispatch-delivery`, payload);

      setDeliveries((prev) => [res.data, ...prev]);
      setSuccessMsg("Delivery recorded successfully!");
      setFormData({
        item: "",
        quantity: "",
        date: "",
        customer: "",
        driver: "",
        vehicle: "",
      });
    } catch (err) {
      setError("Failed to save delivery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
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
          min="1"
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
        <button
          type="submit"
          disabled={loading}
          className="col-span-1 md:col-span-6 bg-green-700 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Saving..." : "➕ Record Delivery"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      {loading && deliveries.length === 0 ? (
        <div>Loading deliveries...</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Driver</th>
                <th className="p-2 border">Vehicle</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No deliveries recorded.
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{d.item}</td>
                    <td className="p-2 border">{d.quantity}</td>
                    <td className="p-2 border">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="p-2 border">{d.customer}</td>
                    <td className="p-2 border">{d.driver}</td>
                    <td className="p-2 border">{d.vehicle}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DispatchDelivery;
