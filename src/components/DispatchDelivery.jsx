// DispatchDelivery.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IconButton, Tooltip } from "@mui/material";
import { Delete, Print, Edit } from "@mui/icons-material";

const DispatchDelivery = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    tollFee: "",
    fuelCost: "",
    driverPerDiem: "",
    staffAllowance: "",
  });
  const [deliveries, setDeliveries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const tableRef = useRef();

  // Auto-calculate total cost
  const totalCost =
    Number(formData.tollFee || 0) +
    Number(formData.fuelCost || 0) +
    Number(formData.driverPerDiem || 0) +
    Number(formData.staffAllowance || 0);

  useEffect(() => {
    fetchDeliveries();
  }, [apiUrl]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/dispatch-delivery`);
      setDeliveries(res.data);
    } catch {
      setError("Failed to load deliveries.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["item", "quantity", "date", "customer", "driver", "vehicle"];
    for (const field of requiredFields) {
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
        tollFee: Number(formData.tollFee || 0),
        fuelCost: Number(formData.fuelCost || 0),
        driverPerDiem: Number(formData.driverPerDiem || 0),
        staffAllowance: Number(formData.staffAllowance || 0),
        totalCost,
      };
      let res;
      if (editingId) {
        res = await axios.put(`${apiUrl}/api/dispatch-delivery/${editingId}`, payload);
        setDeliveries((prev) =>
          prev.map((d) => (d._id === editingId ? res.data : d))
        );
        setSuccessMsg("Delivery updated successfully!");
      } else {
        res = await axios.post(`${apiUrl}/api/dispatch-delivery`, payload);
        setDeliveries([res.data, ...deliveries]);
        setSuccessMsg("Delivery recorded successfully!");
      }
      setFormData({
        item: "",
        quantity: "",
        date: "",
        customer: "",
        driver: "",
        vehicle: "",
        tollFee: "",
        fuelCost: "",
        driverPerDiem: "",
        staffAllowance: "",
      });
      setEditingId(null);
    } catch {
      setError("Failed to save delivery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (d) => {
    setFormData({
      item: d.item,
      quantity: d.quantity,
      date: d.date.split("T")[0],
      customer: d.customer,
      driver: d.driver,
      vehicle: d.vehicle,
      tollFee: d.tollFee || "",
      fuelCost: d.fuelCost || "",
      driverPerDiem: d.driverPerDiem || "",
      staffAllowance: d.staffAllowance || "",
    });
    setEditingId(d._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    try {
      await axios.delete(`${apiUrl}/api/dispatch-delivery/${id}`);
      setDeliveries((prev) => prev.filter((d) => d._id !== id));
      setSuccessMsg("Delivery deleted successfully!");
    } catch {
      setError("Failed to delete delivery.");
    }
  };

  const handlePrint = () => {
    const printContent = tableRef.current.outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Dispatch & Delivery</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #1976d2; color: white; }
      </style>
      </head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">🚚 Dispatch & Delivery</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input type="text" name="item" placeholder="Item" value={formData.item} onChange={handleChange} className="p-2 border rounded" required />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} className="p-2 border rounded" required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="customer" placeholder="Customer" value={formData.customer} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="driver" placeholder="Driver" value={formData.driver} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="vehicle" placeholder="Vehicle No." value={formData.vehicle} onChange={handleChange} className="p-2 border rounded" required />
        <input type="number" name="tollFee" placeholder="Toll Fee" value={formData.tollFee} onChange={handleChange} className="p-2 border rounded" />
        <input type="number" name="fuelCost" placeholder="Fuel Cost" value={formData.fuelCost} onChange={handleChange} className="p-2 border rounded" />
        <input type="number" name="driverPerDiem" placeholder="Driver Per Diem" value={formData.driverPerDiem} onChange={handleChange} className="p-2 border rounded" />
        <input type="number" name="staffAllowance" placeholder="Staff Allowance" value={formData.staffAllowance} onChange={handleChange} className="p-2 border rounded" />
        <div className="p-2 font-bold flex items-center">Total Cost: {totalCost.toFixed(2)}</div>
        <button type="submit" className="col-span-1 md:col-span-4 bg-blue-600 text-white py-2 rounded">
          {editingId ? "✏️ Update Delivery" : "➕ Record Delivery"}
        </button>
      </form>

      {error && <div className="mb-2 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-2 text-green-600 font-semibold">{successMsg}</div>}

      <button onClick={handlePrint} className="mb-4 bg-gray-700 text-white py-1 px-3 rounded">🖨 Print Table</button>

      <div className="overflow-x-auto border rounded" ref={tableRef}>
        <table className="w-full text-left text-sm">
          <thead className="bg-blue-700 text-white">
            <tr>
              {["Item","Quantity","Date","Customer","Driver","Vehicle","Toll Fee","Fuel Cost","Driver Per Diem","Staff Allowance","Total Cost","Actions"].map(h => <th key={h} className="p-2 border">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr><td colSpan="12" className="p-4 text-center text-gray-500">No deliveries recorded.</td></tr>
            ) : (
              deliveries.map(d => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{d.item}</td>
                  <td className="p-2 border">{d.quantity}</td>
                  <td className="p-2 border">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="p-2 border">{d.customer}</td>
                  <td className="p-2 border">{d.driver}</td>
                  <td className="p-2 border">{d.vehicle}</td>
                  <td className="p-2 border">{d.tollFee || 0}</td>
                  <td className="p-2 border">{d.fuelCost || 0}</td>
                  <td className="p-2 border">{d.driverPerDiem || 0}</td>
                  <td className="p-2 border">{d.staffAllowance || 0}</td>
                  <td className="p-2 border font-bold">{d.totalCost || 0}</td>
                  <td className="p-2 border space-x-1">
                    <Tooltip title="Edit">
                      <IconButton color="primary" size="small" onClick={() => handleEdit(d)}><Edit fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" size="small" onClick={() => handleDelete(d._id)}><Delete fontSize="small" /></IconButton>
                    </Tooltip>
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
