import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "/assets/bennimix_logo.png"; // place your logo in public/assets

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

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
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
      const payload = { ...formData, quantity: Number(formData.quantity) };
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

  const handlePrint = (delivery) => {
    const printWindow = window.open("", "", "width=800,height=900");
    printWindow.document.write(`
      <html>
        <head>
          <title>Delivery Note</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; }
            .header img { height: 70px; }
            .title { font-size: 22px; font-weight: bold; margin-top: 5px; }
            .details { margin-top: 20px; }
            .details div { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
            .signatures div { width: 45%; }
            .blank { border-bottom: 1px solid black; display: inline-block; width: 200px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logo}" alt="Logo" />
            <div>BENNIMIX FOOD COMPANY LIMITED</div>
            <div>44 Bathurst Street Off Pademba Road, Freetown</div>
            <div>Tel: +23278 200250 / 88 598003 / 76 966613</div>
            <div class="title">DELIVERY NOTE</div>
          </div>
          <div class="details">
            <div>Customer's Name: <span class="blank">${delivery.customer}</span></div>
            <div>Address: <span class="blank"></span></div>
            <div>Date: <span class="blank">${new Date(delivery.date).toLocaleDateString()}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>S/No</th>
                <th>Description</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01</td>
                <td>${delivery.item}</td>
                <td>${delivery.quantity}</td>
              </tr>
            </tbody>
          </table>
          <div class="signatures">
            <div>Authorized by: <span class="blank"></span></div>
            <div>Received by: <span class="blank"></span></div>
          </div>
          <div class="signatures">
            <div>Delivered by: <span class="blank">${delivery.driver}</span></div>
            <div>Lorry No: <span class="blank">${delivery.vehicle}</span></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🚚 Dispatch & Delivery</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <input type="text" name="item" placeholder="Item" value={formData.item} onChange={handleChange} className="p-2 border rounded" />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} className="p-2 border rounded" />
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="customer" placeholder="Customer" value={formData.customer} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="driver" placeholder="Driver" value={formData.driver} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="vehicle" placeholder="Vehicle Number" value={formData.vehicle} onChange={handleChange} className="p-2 border rounded" />
        <button type="submit" disabled={loading} className="col-span-1 md:col-span-6 bg-green-700 text-white py-2 rounded">
          {loading ? "Saving..." : "➕ Record Delivery"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      {/* Delivery Table */}
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
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No deliveries recorded.
                </td>
              </tr>
            ) : (
              deliveries.map((d) => (
                <tr key={d._id}>
                  <td className="p-2 border">{d.item}</td>
                  <td className="p-2 border">{d.quantity}</td>
                  <td className="p-2 border">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="p-2 border">{d.customer}</td>
                  <td className="p-2 border">{d.driver}</td>
                  <td className="p-2 border">{d.vehicle}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handlePrint(d)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      🖨️ Print
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchDelivery;
