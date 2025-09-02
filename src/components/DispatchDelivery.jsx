// src/components/DispatchDeliveryFactory.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
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

const tollGroups = [
  { group: "Group 1: Kekeh (Tricycles)", price: 3 },
  { group: "Group 2: Taxis and Sedans", price: 5 },
  { group: "Group 3: SUVs, Pickup Jeeps, Mini Buses", price: 10 },
  { group: "Group 4: Coaches, Light Vans, Small Trucks", price: 40 },
  { group: "Group 5: Fuel Tankers (2 Axles)", price: 250 },
  { group: "Group 6: Heavy-Duty Vehicles (10–12 Tyres)", price: 400 },
  { group: "Group 7: Heavy Trucks, Trailers, Semi-Trailers, Flat Beds, Fuel Tankers (3–4 Axles)", price: 600 },
];

const itemsList = [
  "Bennimix 50g",
  "Bennimix 400g",
  "Pikinmix 500g",
  "Pikinmix 1kg",
  "Pikinmix 2kg",
  "Supermix 50g",
  "Pikinmix 4kg",
  "Pikinmix 5kg",
];

export default function DispatchDeliveryFactory({ apiUrl, personnelList }) {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    tollGroup: "",
    fuelCost: 0,
    perDiem: 0,
    personnel: [],
    totalCost: 0,
    remarks: "",
  });

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch dispatch data from backend
  useEffect(() => {
    if (!apiUrl) return;
    fetchDispatches();
  }, [apiUrl]);

  const fetchDispatches = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/dispatch-delivery`);
      setDispatches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dispatches.");
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonnelChange = (e) => {
    setFormData((prev) => ({ ...prev, personnel: e.target.value }));
  };

  // Auto-calculate total cost
  useEffect(() => {
    const tollFee = tollGroups.find((g) => g.group === formData.tollGroup)?.price || 0;
    const fuelCost = parseFloat(formData.fuelCost) || 0;
    const perDiem = (parseFloat(formData.perDiem) || 0) * (formData.personnel.length || 1);
    setFormData((prev) => ({ ...prev, totalCost: tollFee + fuelCost + perDiem }));
  }, [formData.tollGroup, formData.fuelCost, formData.perDiem, formData.personnel]);

  // Submit new dispatch
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
      const res = await axios.post(`${apiUrl}/api/dispatch-delivery`, payload);
      setDispatches((prev) => [res.data, ...prev]);
      setSuccessMsg("Dispatch recorded successfully!");
      setFormData({
        item: "",
        quantity: "",
        date: "",
        customer: "",
        driver: "",
        vehicle: "",
        tollGroup: "",
        fuelCost: 0,
        perDiem: 0,
        personnel: [],
        totalCost: 0,
        remarks: "",
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to save dispatch.");
    } finally {
      setLoading(false);
    }
  };

  // Optional: Delete dispatch
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispatch?")) return;
    try {
      await axios.delete(`${apiUrl}/api/dispatch-delivery/${id}`);
      setDispatches(dispatches.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete dispatch.");
    }
  };

  const handlePrint = () => {
    const table = document.getElementById("dispatch-table")?.outerHTML;
    if (!table) return;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Dispatch Deliveries</title>
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
          <InputLabel id="item-label">Item</InputLabel>
          <Select
            labelId="item-label"
            name="item"
            value={formData.item}
            onChange={handleChange}
            input={<OutlinedInput label="Item" />}
          >
            {itemsList.map((i) => (
              <MenuItem key={i} value={i}>{i}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField type="number" name="quantity" label="Quantity" value={formData.quantity} onChange={handleChange} fullWidth />
        <TextField type="date" name="date" label="Date" value={formData.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
        <TextField type="text" name="customer" label="Customer" value={formData.customer} onChange={handleChange} fullWidth />
        <TextField type="text" name="driver" label="Driver" value={formData.driver} onChange={handleChange} fullWidth />
        <TextField type="text" name="vehicle" label="Vehicle" value={formData.vehicle} onChange={handleChange} fullWidth />

        <FormControl fullWidth>
          <InputLabel id="toll-label">Toll Group</InputLabel>
          <Select
            labelId="toll-label"
            name="tollGroup"
            value={formData.tollGroup}
            onChange={handleChange}
            input={<OutlinedInput label="Toll Group" />}
          >
            {tollGroups.map((g) => (
              <MenuItem key={g.group} value={g.group}>{g.group} — {g.price} Le</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField type="number" name="fuelCost" label="Fuel Cost" value={formData.fuelCost} onChange={handleChange} fullWidth />
        <TextField type="number" name="perDiem" label="Per Diem (per person)" value={formData.perDiem} onChange={handleChange} fullWidth />

        <FormControl fullWidth>
          <InputLabel id="personnel-label">Personnel</InputLabel>
          <Select
            labelId="personnel-label"
            multiple
            value={formData.personnel}
            onChange={handlePersonnelChange}
            input={<OutlinedInput label="Personnel" />}
            renderValue={(selected) => selected.join(", ")}
          >
            {(personnelList || []).map((p) => (
              <MenuItem key={p} value={p}>
                <Checkbox checked={formData.personnel.includes(p)} />
                <ListItemText primary={p} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField type="number" label="Total Cost" value={formData.totalCost} InputProps={{ readOnly: true }} fullWidth />
        <TextField type="text" label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth />

        <Button type="submit" variant="contained" color="primary" className="col-span-1 md:col-span-3">
          {loading ? "Saving..." : "➕ Record Dispatch"}
        </Button>
      </form>

      {error && <Box className="mb-4 text-red-600 font-semibold">{error}</Box>}
      {successMsg && <Box className="mb-4 text-green-600 font-semibold">{successMsg}</Box>}

      <Box className="overflow-x-auto border rounded" id="dispatch-table">
        {dispatches.length === 0 ? (
          <div className="text-center text-gray-500 p-4">No dispatches recorded.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Item","Qty","Date","Customer","Driver","Vehicle","Toll Group","Toll Fee","Fuel","Per Diem","Personnel","Total Cost","Remarks","Actions"].map((h) => (
                  <th key={h} className="p-2 border bg-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dispatches.map((d, i) => (
                <tr key={d._id || i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-2 border">{d.item || "-"}</td>
                  <td className="p-2 border">{d.quantity || 0}</td>
                  <td className="p-2 border">{d.date ? new Date(d.date).toLocaleDateString() : "-"}</td>
                  <td className="p-2 border">{d.customer || "-"}</td>
                  <td className="p-2 border">{d.driver || "-"}</td>
                  <td className="p-2 border">{d.vehicle || "-"}</td>
                  <td className="p-2 border">{d.tollGroup || "-"}</td>
                  <td className="p-2 border">{d.tollFee ?? 0}</td>
                  <td className="p-2 border">{d.fuelCost ?? 0}</td>
                  <td className="p-2 border">{d.perDiem ?? 0}</td>
                  <td className="p-2 border">{(d.personnel || []).join(", ")}</td>
                  <td className="p-2 border">{d.totalCost ?? 0}</td>
                  <td className="p-2 border">{d.remarks || "-"}</td>
                  <td className="p-2 border">
                    <Button onClick={() => handleDelete(d._id)} variant="outlined" color="error" size="small">❌</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>

      <Button variant="outlined" onClick={handlePrint} className="mt-4 bg-gray-600 text-white">🖨️ Print Table</Button>
    </Box>
  );
}

// Default props
DispatchDeliveryFactory.defaultProps = {
  personnelList: [],
  apiUrl: "",
};
