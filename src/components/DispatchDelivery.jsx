import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import axios from "axios";

export default function DispatchDeliveryFactory({ apiUrl, personnelList }) {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    batchNumber: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    personnel: [],
    tollFee: 0,
    fuelCost: 0,
    perDiem: 0,
    totalCost: 0,
    remarks: "",
    status: "Pending",
    receivedQty: 0,
  });
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchDispatches();
  }, [apiUrl]);

  const fetchDispatches = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/dispatches`);
      setDispatches(res.data);
    } catch {
      setError("Failed to load dispatches.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonnelChange = (e) => {
    setFormData((prev) => ({ ...prev, personnel: e.target.value }));
  };

  // Auto-calculate total cost
  useEffect(() => {
    const perDiemTotal = (parseFloat(formData.perDiem) || 0) * (formData.personnel.length || 1);
    const total = parseFloat(formData.tollFee || 0) + parseFloat(formData.fuelCost || 0) + perDiemTotal;
    setFormData((prev) => ({ ...prev, totalCost: total }));
  }, [formData.tollFee, formData.fuelCost, formData.perDiem, formData.personnel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["item", "quantity", "date", "customer", "driver", "vehicle"];
    for (const f of requiredFields) {
      if (!formData[f]) {
        setError(`Please fill in ${f}`);
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        fuelCost: Number(formData.fuelCost),
        perDiem: Number(formData.perDiem),
        totalCost: Number(formData.totalCost),
      };
      const res = await axios.post(`${apiUrl}/api/dispatches`, payload);
      setDispatches((prev) => [res.data, ...prev]);
      setFormData({
        item: "",
        quantity: "",
        batchNumber: "",
        date: "",
        customer: "",
        driver: "",
        vehicle: "",
        personnel: [],
        tollFee: 0,
        fuelCost: 0,
        perDiem: 0,
        totalCost: 0,
        remarks: "",
        status: "Pending",
        receivedQty: 0,
      });
      setError("");
      setSuccessMsg("Dispatch recorded successfully!");
    } catch {
      setError("Failed to save dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/dispatches/${id}`);
      fetchDispatches();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    const table = document.getElementById("dispatch-table").outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Dispatches</title>
      <style>
        table { width: 100%; border-collapse: collapse; font-family: Arial; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #e2e8f0; }
      </style></head><body>${table}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <Box className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-600">🚚 Dispatch & Delivery</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormControl fullWidth>
          <InputLabel>Item</InputLabel>
          <Select
            name="item"
            value={formData.item}
            onChange={handleChange}
            input={<OutlinedInput label="Item" />}
          >
            <MenuItem value="Bennimix 50g">Bennimix 50g</MenuItem>
            <MenuItem value="Bennimix 400g">Bennimix 400g</MenuItem>
            <MenuItem value="Pikinmix 500g">Pikinmix 500g</MenuItem>
            <MenuItem value="Pikinmix 1kg">Pikinmix 1kg</MenuItem>
            <MenuItem value="Pikinmix 2kg">Pikinmix 2kg</MenuItem>
            <MenuItem value="Supermix 50g">Supermix 50g</MenuItem>
            <MenuItem value="Pikinmix 4kg">Pikinmix 4kg</MenuItem>
            <MenuItem value="Pikinmix 5kg">Pikinmix 5kg</MenuItem>
          </Select>
        </FormControl>

        <TextField type="number" name="quantity" label="Quantity" value={formData.quantity} onChange={handleChange} fullWidth />
        <TextField type="date" name="date" label="Date" value={formData.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField type="text" name="customer" label="Customer" value={formData.customer} onChange={handleChange} fullWidth />
        <TextField type="text" name="driver" label="Driver" value={formData.driver} onChange={handleChange} fullWidth />
        <TextField type="text" name="vehicle" label="Vehicle" value={formData.vehicle} onChange={handleChange} fullWidth />

        <FormControl fullWidth>
          <InputLabel>Personnel</InputLabel>
          <Select
            multiple
            value={formData.personnel}
            onChange={handlePersonnelChange}
            input={<OutlinedInput label="Personnel" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {personnelList.map((p) => (
              <MenuItem key={p} value={p}>
                <Checkbox checked={formData.personnel.includes(p)} />
                <ListItemText primary={p} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField type="number" name="tollFee" label="Toll Fee" value={formData.tollFee} onChange={handleChange} fullWidth />
        <TextField type="number" name="fuelCost" label="Fuel Cost" value={formData.fuelCost} onChange={handleChange} fullWidth />
        <TextField type="number" name="perDiem" label="Per Diem (per person)" value={formData.perDiem} onChange={handleChange} fullWidth />

        <TextField type="number" label="Total Cost" value={formData.totalCost} InputProps={{ readOnly: true }} fullWidth />
        <TextField type="text" name="remarks" label="Remarks" value={formData.remarks} onChange={handleChange} fullWidth />

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select name="status" value={formData.status} onChange={handleChange}>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </FormControl>

        <TextField type="number" name="receivedQty" label="Received Quantity" value={formData.receivedQty} onChange={handleChange} fullWidth />

        <Button type="submit" variant="contained" color="primary" className="col-span-1 md:col-span-3">
          {loading ? "Saving..." : "➕ Record Dispatch"}
        </Button>
      </form>

      {error && <Box className="mb-4 text-red-600 font-semibold">{error}</Box>}
      {successMsg && <Box className="mb-4 text-green-600 font-semibold">{successMsg}</Box>}

      <Box className="overflow-x-auto border rounded" id="dispatch-table">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {["Item","Qty","Batch","Date","Customer","Driver","Vehicle","Personnel","Toll","Fuel","Per Diem","Total Cost","Status","Received","Remarks"].map((h) => <th key={h} className="p-2 border">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {dispatches.length === 0 ? (
              <tr><td colSpan="14" className="p-4 text-center text-gray-500">No dispatches recorded.</td></tr>
            ) : dispatches.map((d, i) => (
              <tr key={d._id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-2 border">{d.item}</td>
                <td className="p-2 border">{d.quantity}</td>
                <td className="p-2 border">{d.batchNumber}</td>
                <td className="p-2 border">{new Date(d.date).toLocaleDateString()}</td>
                <td className="p-2 border">{d.customer}</td>
                <td className="p-2 border">{d.driver}</td>
                <td className="p-2 border">{d.vehicle}</td>
                <td className="p-2 border">{d.personnel.join(", ")}</td>
                <td className="p-2 border">{d.tollFee}</td>
                <td className="p-2 border">{d.fuelCost}</td>
                <td className="p-2 border">{d.perDiem}</td>
                <td className="p-2 border">{d.totalCost}</td>
                <td className="p-2 border">{d.status}</td>
                <td className="p-2 border">{d.receivedQty}</td>
                <td className="p-2 border">{d.remarks || "-"}</td>
                <td className="p-2 border">
                  <Button onClick={() => handleDelete(d._id)} variant="outlined" color="error">❌</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Button variant="outlined" onClick={handlePrint} className="mt-4 bg-gray-600 text-white">🖨️ Print Table</Button>
    </Box>
  );
}
