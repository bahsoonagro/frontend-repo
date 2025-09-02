// src/components/DispatchDelivery.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, IconButton, Tooltip, TextField, MenuItem } from "@mui/material";
import { Delete, Edit, Print } from "@mui/icons-material";

const TOLL_FEES = [
  { label: "Group 1: Kekeh (Tricycles)", fee: 3 },
  { label: "Group 2: Taxis and Sedans", fee: 5 },
  { label: "Group 3: SUVs, Pickup Jeeps, Mini Buses", fee: 10 },
  { label: "Group 4: Coaches, Light Vans, Small Trucks", fee: 40 },
  { label: "Group 5: Fuel Tankers (2 Axles)", fee: 250 },
  { label: "Group 6: Heavy-Duty Vehicles (10–12 Tyres)", fee: 400 },
  { label: "Group 7: Heavy Trucks, Trailers, Semi-Trailers, Flat Beds, Fuel Tankers (3–4 Axles)", fee: 600 },
];

const DispatchDelivery = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    item: "", quantity: "", date: "", customer: "", driver: "", vehicle: "", tollFee: 0, fuelCost: 0
  });
  const [personnel, setPersonnel] = useState([{ name: "", role: "", perDiem: 0 }]);
  const [deliveries, setDeliveries] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDeliveries();
    fetchFinishedProducts();
  }, [apiUrl]);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/dispatch-delivery`);
      setDeliveries(res.data);
    } catch {
      setError("Failed to load deliveries.");
    }
  };

  const fetchFinishedProducts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/finished-products`);
      setFinishedProducts(res.data);
    } catch {
      setError("Failed to load products.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); setSuccessMsg("");
  };

  const handlePersonnelChange = (index, e) => {
    const newPersonnel = [...personnel];
    newPersonnel[index][e.target.name] = e.target.name === "perDiem" ? Number(e.target.value) : e.target.value;
    setPersonnel(newPersonnel);
  };

  const addPersonnel = () => setPersonnel([...personnel, { name: "", role: "", perDiem: 0 }]);
  const removePersonnel = (index) => setPersonnel(personnel.filter((_, i) => i !== index));

  const calculateTotalPerDiem = () => personnel.reduce((sum, p) => sum + Number(p.perDiem || 0), 0);
  const calculateTotalCost = () => Number(formData.fuelCost || 0) + Number(formData.tollFee || 0) + calculateTotalPerDiem();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.quantity || !formData.date || !formData.customer || !formData.driver || !formData.vehicle) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      const payload = { ...formData, personnel, totalCost: calculateTotalCost() };
      const res = await axios.post(`${apiUrl}/api/dispatch-delivery`, payload);
      setDeliveries([res.data, ...deliveries]);
      setFormData({ item: "", quantity: "", date: "", customer: "", driver: "", vehicle: "", tollFee: 0, fuelCost: 0 });
      setPersonnel([{ name: "", role: "", perDiem: 0 }]);
      setSuccessMsg("Dispatch recorded successfully!");
    } catch {
      setError("Failed to save dispatch. Try again.");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this dispatch?")) return;
    try {
      await axios.delete(`${apiUrl}/api/dispatch-delivery/${id}`);
      setDeliveries(deliveries.filter(d => d._id !== id));
    } catch {
      setError("Failed to delete dispatch.");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("dispatch-table").outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Dispatch</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
      </style>
      </head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-600">🚚 Dispatch & Delivery</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <TextField select label="Item" name="item" value={formData.item} onChange={handleChange} required className="col-span-1 md:col-span-2">
          {finishedProducts.map(p => <MenuItem key={p._id} value={p.productName}>{p.productName}</MenuItem>)}
        </TextField>
        <TextField type="number" label="Quantity" name="quantity" value={formData.quantity} onChange={handleChange} required className="col-span-1 md:col-span-1" />
        <TextField type="date" label="Date" name="date" value={formData.date} onChange={handleChange} required className="col-span-1 md:col-span-1" />
        <TextField label="Customer" name="customer" value={formData.customer} onChange={handleChange} required className="col-span-1 md:col-span-1" />
        <TextField label="Driver" name="driver" value={formData.driver} onChange={handleChange} required className="col-span-1 md:col-span-1" />
        <TextField label="Vehicle" name="vehicle" value={formData.vehicle} onChange={handleChange} required className="col-span-1 md:col-span-1" />
        <TextField select label="Toll Fee" name="tollFee" value={formData.tollFee} onChange={handleChange} className="col-span-1 md:col-span-1">
          {TOLL_FEES.map((t, i) => <MenuItem key={i} value={t.fee}>{t.label} ({t.fee} Le)</MenuItem>)}
        </TextField>
        <TextField type="number" label="Fuel Cost" name="fuelCost" value={formData.fuelCost} onChange={handleChange} className="col-span-1 md:col-span-1" />

        <div className="col-span-1 md:col-span-6 border p-2 rounded">
          <h3 className="font-semibold mb-2">Personnel on Board</h3>
          {personnel.map((p, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2 items-center">
              <TextField label="Name" name="name" value={p.name} onChange={(e) => handlePersonnelChange(i, e)} />
              <TextField label="Role" name="role" value={p.role} onChange={(e) => handlePersonnelChange(i, e)} />
              <TextField type="number" label="Per Diem" name="perDiem" value={p.perDiem} onChange={(e) => handlePersonnelChange(i, e)} />
              <IconButton color="error" onClick={() => removePersonnel(i)}>✖️</IconButton>
            </div>
          ))}
          <Button variant="outlined" onClick={addPersonnel}>+ Add Personnel</Button>
        </div>

        <Button type="submit" variant="contained" color="primary" className="col-span-1 md:col-span-6 mt-2">
          {loading ? "Saving..." : "Record Dispatch"}
        </Button>
      </form>

      {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
      {successMsg && <div className="text-green-600 font-semibold mb-2">{successMsg}</div>}

      <Button startIcon={<Print />} onClick={handlePrint} variant="contained" color="secondary" className="mb-2">🖨 Print Table</Button>

      <div className="overflow-x-auto border rounded" id="dispatch-table">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Item","Quantity","Date","Customer","Driver","Vehicle","Toll Fee","Fuel","Personnel","Total Cost","Actions"].map(h => <th key={h} className="p-2 border">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr><td colSpan="11" className="p-4 text-center text-gray-500">No dispatches recorded.</td></tr>
            ) : deliveries.map((d, i) => (
              <tr key={d._id} className="hover:bg-gray-50">
                <td className="p-2 border">{d.item}</td>
                <td className="p-2 border">{d.quantity}</td>
                <td className="p-2 border">{new Date(d.date).toLocaleDateString()}</td>
                <td className="p-2 border">{d.customer}</td>
                <td className="p-2 border">{d.driver}</td>
                <td className="p-2 border">{d.vehicle}</td>
                <td className="p-2 border">{d.tollFee}</td>
                <td className="p-2 border">{d.fuelCost}</td>
                <td className="p-2 border">
                  {d.personnel?.map((p, idx) => `${p.name} (${p.role}, ${p.perDiem})`).join(", ")}
                </td>
                <td className="p-2 border">{d.totalCost}</td>
                <td className="p-2 border space-x-2">
                  <Button color="error" size="small" onClick={() => handleDelete(d._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchDelivery;
