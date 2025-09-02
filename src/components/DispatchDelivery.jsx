// src/components/DispatchDelivery.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IconButton } from "@mui/material";
import { Delete, Print, Edit } from "@mui/icons-material";

const DispatchDelivery = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    tollFees: 0,
    fuelCost: 0,
    driverPerDiem: 0,
    otherStaff: 0,
    remarks: "",
  });

  const [deliveries, setDeliveries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const printRef = useRef();

  const totalCost = Number(formData.tollFees || 0) +
                    Number(formData.fuelCost || 0) +
                    Number(formData.driverPerDiem || 0) +
                    Number(formData.otherStaff || 0);

  useEffect(() => {
    fetchDeliveries();
  }, [apiUrl]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Required fields
    const required = ["item","quantity","date","customer","driver","vehicle"];
    for (const field of required) if (!formData[field]) return setError(`Please fill in ${field}`);

    setLoading(true);
    try {
      const payload = { ...formData, quantity: Number(formData.quantity) };
      let res;
      if (editingId) {
        res = await axios.put(`${apiUrl}/api/dispatch-delivery/${editingId}`, payload);
        setDeliveries(prev => prev.map(d => d._id === editingId ? res.data : d));
        setSuccessMsg("Delivery updated successfully!");
      } else {
        res = await axios.post(`${apiUrl}/api/dispatch-delivery`, payload);
        setDeliveries(prev => [res.data, ...prev]);
        setSuccessMsg("Delivery recorded successfully!");
      }
      setFormData({
        item: "",
        quantity: "",
        date: "",
        customer: "",
        driver: "",
        vehicle: "",
        tollFees: 0,
        fuelCost: 0,
        driverPerDiem: 0,
        otherStaff: 0,
        remarks: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save delivery.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (delivery) => {
    setFormData({ ...delivery });
    setEditingId(delivery._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    try {
      await axios.delete(`${apiUrl}/api/dispatch-delivery/${id}`);
      setDeliveries(prev => prev.filter(d => d._id !== id));
      setSuccessMsg("Delivery deleted successfully!");
    } catch {
      setError("Failed to delete delivery.");
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <head>
        <title>Dispatch Deliveries</title>
        <style>
          table { width: 100%; border-collapse: collapse; font-family: Arial; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          th { background-color: #1976d2; color: white; }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🚚 Dispatch & Delivery</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        {[
          { name:"item", type:"text", placeholder:"Item" },
          { name:"quantity", type:"number", placeholder:"Quantity" },
          { name:"date", type:"date", placeholder:"Date" },
          { name:"customer", type:"text", placeholder:"Customer" },
          { name:"driver", type:"text", placeholder:"Driver" },
          { name:"vehicle", type:"text", placeholder:"Vehicle" },
          { name:"tollFees", type:"number", placeholder:"Toll Fees" },
          { name:"fuelCost", type:"number", placeholder:"Fuel Cost" },
          { name:"driverPerDiem", type:"number", placeholder:"Driver Per Diem" },
          { name:"otherStaff", type:"number", placeholder:"Other Staff Cost" },
        ].map(f => (
          <input
            key={f.name}
            type={f.type}
            name={f.name}
            value={formData[f.name]}
            placeholder={f.placeholder}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        ))}
        <input
          type="number"
          name="totalCost"
          value={totalCost}
          readOnly
          placeholder="Total Cost"
          className="p-2 border rounded bg-gray-100"
        />
        <input
          type="text"
          name="remarks"
          value={formData.remarks}
          placeholder="Remarks"
          onChange={handleChange}
          className="p-2 border rounded col-span-1 md:col-span-6"
        />
        <button
          type="submit"
          className="col-span-1 md:col-span-6 bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : editingId ? "✏️ Update Delivery" : "➕ Record Delivery"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      {/* Table */}
      <div className="overflow-x-auto border rounded" ref={printRef}>
        <table className="w-full text-left text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              {["Item","Quantity","Date","Customer","Driver","Vehicle","Toll","Fuel","Driver Per Diem","Other Staff","Total Cost","Remarks","Actions"].map(h => (
                <th key={h} className="p-2 border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan="13" className="p-4 text-center text-gray-500">No deliveries recorded.</td>
              </tr>
            ) : deliveries.map(d => (
              <tr key={d._id} className="hover:bg-gray-50">
                <td className="p-2 border">{d.item}</td>
                <td className="p-2 border">{d.quantity}</td>
                <td className="p-2 border">{new Date(d.date).toLocaleDateString()}</td>
                <td className="p-2 border">{d.customer}</td>
                <td className="p-2 border">{d.driver}</td>
                <td className="p-2 border">{d.vehicle}</td>
                <td className="p-2 border">{d.tollFees}</td>
                <td className="p-2 border">{d.fuelCost}</td>
                <td className="p-2 border">{d.driverPerDiem}</td>
                <td className="p-2 border">{d.otherStaff}</td>
                <td className="p-2 border">{d.tollFees + d.fuelCost + d.driverPerDiem + d.otherStaff}</td>
                <td className="p-2 border">{d.remarks || "-"}</td>
                <td className="p-2 border space-x-1">
                  <IconButton onClick={() => handleEdit(d)} color="primary" size="small"><Edit fontSize="small" /></IconButton>
                  <IconButton onClick={() => handleDelete(d._id)} color="error" size="small"><Delete fontSize="small" /></IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handlePrint} className="mt-3 bg-gray-600 text-white py-1 px-3 rounded">🖨 Print Table Only</button>
    </div>
  );
};

export default DispatchDelivery;
