// DispatchDelivery.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const DispatchDelivery = ({ apiUrl, finishedProducts }) => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    tollGate: "",
    fuelCost: "",
    personnel: [],
  });

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const TOLL_GATES = [
    { category: "Group 1: Kekeh (Tricycles)", fee: 3 },
    { category: "Group 2: Taxis and Sedans", fee: 5 },
    { category: "Group 3: SUVs, Pickup Jeeps, Mini Buses", fee: 10 },
    { category: "Group 4: Coaches, Light Vans, Small Trucks", fee: 40 },
    { category: "Group 5: Fuel Tankers (2 Axles)", fee: 250 },
    { category: "Group 6: Heavy-Duty Vehicles (10–12 Tyres)", fee: 400 },
    { category: "Group 7: Heavy Trucks, Trailers, Semi-Trailers, Flat Beds, Fuel Tankers (3–4 Axles)", fee: 600 },
  ];

  useEffect(() => {
    fetchDeliveries();
  }, [apiUrl]);

  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");
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
    setError(""); setSuccessMsg("");
  };

  const addPersonnel = () => {
    setFormData({ ...formData, personnel: [...formData.personnel, { name: "", role: "", perDiem: "" }] });
  };

  const removePersonnel = (idx) => {
    const updated = [...formData.personnel];
    updated.splice(idx, 1);
    setFormData({ ...formData, personnel: updated });
  };

  const handlePersonnelChange = (idx, field, value) => {
    const updated = [...formData.personnel];
    updated[idx][field] = value;
    setFormData({ ...formData, personnel: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["item","quantity","date","customer","driver","vehicle","tollGate"];
    for (const field of requiredFields) {
      if (!formData[field]) { setError(`Please fill in ${field}.`); return; }
    }
    setLoading(true); setError(""); setSuccessMsg("");
    try {
      const payload = { ...formData, quantity: Number(formData.quantity), fuelCost: Number(formData.fuelCost || 0) };
      const res = await axios.post(`${apiUrl}/api/dispatch-delivery`, payload);
      setDeliveries(prev => [res.data, ...prev]);
      setSuccessMsg("Delivery recorded successfully!");
      setFormData({ item: "", quantity: "", date: "", customer: "", driver: "", vehicle: "", tollGate: "", fuelCost: "", personnel: [] });
    } catch {
      setError("Failed to save delivery. Please try again.");
    } finally { setLoading(false); }
  };

  const totalPerDiem = formData.personnel.reduce((sum, p) => sum + Number(p.perDiem || 0), 0);
  const totalCost = Number(formData.fuelCost || 0) + Number(formData.tollGate || 0) + totalPerDiem;

  const handlePrint = () => {
    const tableContent = document.getElementById("dispatch-table").outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Dispatch Table</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>${tableContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-600">🚚 Dispatch & Delivery</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Item Dropdown */}
        <FormControl fullWidth size="small">
          <InputLabel>Item</InputLabel>
          <Select name="item" value={formData.item} onChange={handleChange}>
            {finishedProducts.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField label="Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} size="small" />
        <TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
        <TextField label="Customer" name="customer" value={formData.customer} onChange={handleChange} size="small" />
        <TextField label="Driver" name="driver" value={formData.driver} onChange={handleChange} size="small" />
        <TextField label="Vehicle" name="vehicle" value={formData.vehicle} onChange={handleChange} size="small" />

        {/* Toll Gate Dropdown */}
        <FormControl fullWidth size="small">
          <InputLabel>Toll Gate</InputLabel>
          <Select name="tollGate" value={formData.tollGate} onChange={handleChange}>
            {TOLL_GATES.map(t => <MenuItem key={t.category} value={t.fee}>{t.category} - {t.fee} Le</MenuItem>)}
          </Select>
        </FormControl>

        <TextField label="Fuel Cost" name="fuelCost" type="number" value={formData.fuelCost} onChange={handleChange} size="small" />

        {/* Dynamic Personnel */}
        <div className="col-span-1 md:col-span-3">
          <h4 className="font-semibold mb-2">Personnel on Board</h4>
          {formData.personnel.map((p, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <TextField label="Name" size="small" value={p.name} onChange={(e) => handlePersonnelChange(idx,"name",e.target.value)} />
              <TextField label="Role" size="small" value={p.role} onChange={(e) => handlePersonnelChange(idx,"role",e.target.value)} />
              <TextField label="Per Diem" size="small" type="number" value={p.perDiem} onChange={(e) => handlePersonnelChange(idx,"perDiem",e.target.value)} />
              <IconButton color="error" onClick={() => removePersonnel(idx)}><Delete /></IconButton>
            </div>
          ))}
          <Button startIcon={<Add />} onClick={addPersonnel} variant="outlined" size="small">Add Personnel</Button>
        </div>

        <div className="col-span-1 md:col-span-3">
          <strong>Total Cost: </strong> {totalCost.toFixed(2)} Le
        </div>

        <Button type="submit" variant="contained" color="success" className="col-span-1 md:col-span-3">
          {loading ? "Saving..." : "➕ Record Delivery"}
        </Button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      <Button onClick={handlePrint} className="mb-4 bg-gray-600 text-white py-1 px-3 rounded">🖨 Print Dispatch Table</Button>

      <Paper className="overflow-x-auto" id="dispatch-table">
        <Table size="small">
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell>Item</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Toll Gate Fee</TableCell>
              <TableCell>Fuel Cost</TableCell>
              <TableCell>Personnel</TableCell>
              <TableCell>Total Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500">No deliveries recorded.</TableCell>
              </TableRow>
            ) : deliveries.map(d => (
              <TableRow key={d._id}>
                <TableCell>{d.item}</TableCell>
                <TableCell>{d.quantity}</TableCell>
                <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                <TableCell>{d.customer}</TableCell>
                <TableCell>{d.driver}</TableCell>
                <TableCell>{d.vehicle}</TableCell>
                <TableCell>{d.tollGate}</TableCell>
                <TableCell>{d.fuelCost}</TableCell>
                <TableCell>
                  {d.personnel?.map((p,i) => <div key={i}>{p.name} ({p.role}) - {p.perDiem}</div>)}
                </TableCell>
                <TableCell>
                  {d.fuelCost + d.tollGate + (d.personnel?.reduce((sum,p)=>sum + Number(p.perDiem||0),0) || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

export default DispatchDelivery;
