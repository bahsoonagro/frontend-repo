// src/components/DispatchDeliveryFactory.jsx
import React, { useState, useEffect, useRef } from "react";
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
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

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

const statuses = ["Pending", "In Transit", "Delivered", "Cancelled"];

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function DispatchDeliveryFactory({ personnelList }) {
  const apiUrl = "https://backend-repo-ydwt.onrender.com";

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
    status: "Pending",
    remarks: "",
  });

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const printRef = useRef();

  // Fetch dispatches
  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/dispatch-delivery`);
        setDispatches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("API Error:", err.response || err.message);
        setError("Failed to load dispatches from backend.");
      }
    };
    fetchDispatches();
  }, [apiUrl]);

  // Live total cost calculation
  useEffect(() => {
    const tollFee = tollGroups.find((g) => g.group === formData.tollGroup)?.price || 0;
    const fuel = parseFloat(formData.fuelCost) || 0;
    const perDiem = (parseFloat(formData.perDiem) || 0) * (formData.personnel.length || 1);
    const total = tollFee + fuel + perDiem;
    setFormData(prev => ({ ...prev, totalCost: total }));
  }, [formData.fuelCost, formData.perDiem, formData.tollGroup, formData.personnel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersonnelChange = (e) => {
    setFormData(prev => ({ ...prev, personnel: e.target.value }));
  };

  const validateForm = () => {
    const requiredFields = ["item", "quantity", "date", "customer", "driver", "vehicle"];
    for (const f of requiredFields) {
      if (!formData[f]) return `Please fill in ${f}`;
    }
    if (formData.quantity <= 0) return "Quantity must be greater than 0";
    if (formData.fuelCost < 0) return "Fuel cost cannot be negative";
    if (formData.perDiem < 0) return "Per diem cannot be negative";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
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

      let res;
      if (editId) {
        res = await axios.put(`${apiUrl}/api/dispatch-delivery/${editId}`, payload);
        setDispatches(dispatches.map(d => d._id === editId ? res.data : d));
        setSuccessMsg("Dispatch updated successfully!");
        setEditId(null);
      } else {
        res = await axios.post(`${apiUrl}/api/dispatch-delivery`, payload);
        setDispatches([res.data, ...dispatches]);
        setSuccessMsg("Dispatch recorded successfully!");
      }

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
        status: "Pending",
        remarks: "",
      });
      setError("");
    } catch (err) {
      console.error("Submit Error:", err.response || err.message);
      setError("Failed to save dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispatch?")) return;
    try {
      await axios.delete(`${apiUrl}/api/dispatch-delivery/${id}`);
      setDispatches(dispatches.filter(d => d._id !== id));
    } catch (err) {
      console.error("Delete Error:", err.response || err.message);
      setError("Failed to delete dispatch.");
    }
  };

  const handleEdit = (dispatch) => {
    setFormData({
      ...dispatch,
      fuelCost: dispatch.fuelCost ?? 0,
      perDiem: dispatch.perDiem ?? 0,
      totalCost: dispatch.totalCost ?? 0,
      personnel: dispatch.personnel || [],
    });
    setEditId(dispatch._id);
  };

  const handlePrint = () => {
    const table = printRef.current.querySelector("table");
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Dispatch Deliveries</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:6px;text-align:center;}th{background-color:#1976d2;color:#fff;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(table.outerHTML);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>🚚 Dispatch & Delivery</Typography>

      <Paper elevation={6} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="item-label">Item</InputLabel>
                <Select labelId="item-label" name="item" value={formData.item} onChange={handleChange} input={<OutlinedInput label="Item" />}>
                  {itemsList.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}><TextField type="number" name="quantity" label="Quantity" value={formData.quantity} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" name="date" label="Date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField type="text" name="customer" label="Customer" value={formData.customer} onChange={handleChange} fullWidth size="small" /></Grid>

            <Grid item xs={12} md={3}><TextField type="text" name="driver" label="Driver" value={formData.driver} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField type="text" name="vehicle" label="Vehicle" value={formData.vehicle} onChange={handleChange} fullWidth size="small" /></Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="toll-label">Toll Group</InputLabel>
                <Select labelId="toll-label" name="tollGroup" value={formData.tollGroup} onChange={handleChange} input={<OutlinedInput label="Toll Group" />}>
                  {tollGroups.map((g) => <MenuItem key={g.group} value={g.group}>{g.group} — {g.price} Le</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}><TextField type="number" name="fuelCost" label="Fuel Cost" value={formData.fuelCost} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField type="number" name="perDiem" label="Per Diem (per person)" value={formData.perDiem} onChange={handleChange} fullWidth size="small" /></Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
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
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select labelId="status-label" name="status" value={formData.status} onChange={handleChange} input={<OutlinedInput label="Status" />}>
                  {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}><TextField type="number" label="Total Cost" value={formData.totalCost} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField type="text" label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth size="small" /></Grid>

            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="contained" color="success" type="submit" size="small">{loading ? "Saving..." : (editId ? "✏️ Update Dispatch" : "➕ Record Dispatch")}</Button>
            </Grid>
          </Grid>
        </form>

        {error && <Box sx={{ mt: 2, color: "red", fontWeight: "bold" }}>{error}</Box>}
        {successMsg && <Box sx={{ mt: 2, color: "green", fontWeight: "bold" }}>{successMsg}</Box>}
      </Paper>

      {/* Table Section */}
      <Box ref={printRef} sx={{ mt: 3 }}>
        <Box display="flex" justifyContent="flex-end" gap={2} mb={1}>
          <Button variant="outlined" onClick={handlePrint}>🖨️ Print Table</Button>
        </Box>

        <Paper elevation={6} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                {["Item","Qty","Date","Customer","Driver","Vehicle","Toll Group","Toll Fee","Fuel","Per Diem","Personnel","Total Cost","Status","Remarks","Actions"].map((h) => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {dispatches.map((d, i) => (
                  <motion.tr key={d._id || i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} whileHover={{ backgroundColor: "#e3f2fd" }} transition={{ duration: 0.3 }}>
                    <td style={tdStyle}>{d.item || "-"}</td>
                    <td style={tdStyle}>{d.quantity || 0}</td>
                    <td style={tdStyle}>{d.date ? new Date(d.date).toLocaleDateString() : "-"}</td>
                    <td style={tdStyle}>{d.customer || "-"}</td>
                    <td style={tdStyle}>{d.driver || "-"}</td>
                    <td style={tdStyle}>{d.vehicle || "-"}</td>
                    <td style={tdStyle}>{d.tollGroup || "-"}</td>
                    <td style={tdStyle}>{tollGroups.find(g => g.group === d.tollGroup)?.price || 0}</td>
                    <td style={tdStyle}>{d.fuelCost ?? 0}</td>
                    <td style={tdStyle}>{d.perDiem ?? 0}</td>
                    <td style={tdStyle}>{(d.personnel || []).join(", ")}</td>
                    <td style={tdStyle}>{d.totalCost ?? 0}</td>
                    <td style={tdStyle}>{d.status || "-"}</td>
                    <td style={tdStyle}>{d.remarks || "-"}</td>
                    <td style={tdStyle}>
                      <Button onClick={() => handleEdit(d)} variant="outlined" color="primary" size="small">✏️</Button>
                      <Button onClick={() => handleDelete(d._id)} variant="outlined" color="error" size="small" sx={{ ml: 0.5 }}>❌</Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}

DispatchDeliveryFactory.defaultProps = {
  personnelList: [],
};
