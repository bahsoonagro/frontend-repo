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

// Toll groups and items
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

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function DispatchDeliveryFactory({ personnelList }) {
  const apiUrl = "https://backend-repo-ydwt.onrender.com/api/dispatch-delivery";

  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    tollGroup: "",
    tollFee: 0,
    fuelCost: 0,
    perDiem: 0,
    personnel: [],
    totalCost: 0,
    remarks: "",
    status: "pending",
  });

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const printRef = useRef();

  // Fetch dispatches from backend
  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const res = await axios.get(apiUrl);
        setDispatches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError("Failed to load dispatches from backend.");
      }
    };
    fetchDispatches();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonnelChange = (e) => {
    setFormData((prev) => ({ ...prev, personnel: e.target.value }));
  };

  // Auto-calculate toll fee + total cost
  useEffect(() => {
    const tollFee = tollGroups.find((g) => g.group === formData.tollGroup)?.price || 0;
    const fuelCost = parseFloat(formData.fuelCost) || 0;
    const perDiem = (parseFloat(formData.perDiem) || 0) * (formData.personnel.length || 1);
    setFormData((prev) => ({
      ...prev,
      tollFee,
      totalCost: tollFee + fuelCost + perDiem,
    }));
  }, [formData.tollGroup, formData.fuelCost, formData.perDiem, formData.personnel]);

  // Submit handler
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
        tollFee: Number(formData.tollFee),
        fuelCost: Number(formData.fuelCost),
        perDiem: Number(formData.perDiem),
        totalCost: Number(formData.totalCost),
      };

      if (editingId) {
        const res = await axios.put(`${apiUrl}/${editingId}`, payload);
        setDispatches((prev) => prev.map((d) => (d._id === editingId ? res.data : d)));
        setSuccessMsg("Dispatch updated successfully!");
      } else {
        const res = await axios.post(apiUrl, payload);
        setDispatches((prev) => [res.data, ...prev]);
        setSuccessMsg("Dispatch recorded successfully!");
      }

      // Reset form
      setFormData({
        item: "",
        quantity: "",
        date: "",
        customer: "",
        driver: "",
        vehicle: "",
        tollGroup: "",
        tollFee: 0,
        fuelCost: 0,
        perDiem: 0,
        personnel: [],
        totalCost: 0,
        remarks: "",
        status: "pending",
      });
      setEditingId(null);
      setError("");
    } catch (err) {
      setError("Failed to save dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dispatch) => {
    setFormData({ ...dispatch, date: dispatch.date?.slice(0, 10) });
    setEditingId(dispatch._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispatch?")) return;
    try {
      await axios.delete(`${apiUrl}/${id}`);
      setDispatches(dispatches.filter((d) => d._id !== id));
    } catch (err) {
      setError("Failed to delete dispatch.");
    }
  };

  const handlePrint = () => {
    const tableHtml = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Dispatch Deliveries</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:6px;text-align:center;}th{background:#1976d2;color:#fff;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(tableHtml);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>
        🚚 Dispatch & Delivery
      </Typography>

      {/* Form Section */}
      <Paper elevation={6} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Item */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="item-label">Item</InputLabel>
                <Select labelId="item-label" name="item" value={formData.item} onChange={handleChange} input={<OutlinedInput label="Item" />}>
                  {itemsList.map((i) => (
                    <MenuItem key={i} value={i}>{i}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Qty */}
            <Grid item xs={12} md={3}>
              <TextField type="number" name="quantity" label="Quantity" value={formData.quantity} onChange={handleChange} fullWidth size="small" />
            </Grid>

            {/* Date */}
            <Grid item xs={12} md={3}>
              <TextField type="date" name="date" label="Date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>

            {/* Customer */}
            <Grid item xs={12} md={3}>
              <TextField type="text" name="customer" label="Customer" value={formData.customer} onChange={handleChange} fullWidth size="small" />
            </Grid>

            {/* Driver */}
            <Grid item xs={12} md={3}>
              <TextField type="text" name="driver" label="Driver" value={formData.driver} onChange={handleChange} fullWidth size="small" />
            </Grid>

            {/* Vehicle */}
            <Grid item xs={12} md={3}>
              <TextField type="text" name="vehicle" label="Vehicle" value={formData.vehicle} onChange={handleChange} fullWidth size="small" />
            </Grid>

            {/* Toll Group */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="toll-label">Toll Group</InputLabel>
                <Select labelId="toll-label" name="tollGroup" value={formData.tollGroup} onChange={handleChange} input={<OutlinedInput label="Toll Group" />}>
                  {tollGroups.map((g) => (
                    <MenuItem key={g.group} value={g.group}>{g.group} — {g.price} Le</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fuel */}
            <Grid item xs={12} md={3}>
              <TextField type="number" name="fuelCost" label="Fuel Cost" value={formData.fuelCost} onChange={handleChange} fullWidth size="small" />
            </Grid>

            {/* Per Diem */}
            <Grid item xs={12} md={3}>
              <TextField type="number" name="perDiem" label="Per Diem (per person)" value={formData.perDiem} onChange={handleChange} fullWidth size="small" />
            </Grid>

            {/* Personnel */}
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

            {/* Status */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select labelId="status-label" name="status" value={formData.status} onChange={handleChange} input={<OutlinedInput label="Status" />}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-transit">In-Transit</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Total Cost */}
            <Grid item xs={12} md={3}>
              <TextField type="number" label="Total Cost" value={formData.totalCost} InputProps={{ readOnly: true }} fullWidth size="small" />
            </Grid>

            {/* Remarks */}
            <Grid item xs={12} md={3}>
              <TextField type="text" label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth size="small" />
            </Grid>

            {/* Submit */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="contained" color="success" type="submit" size="small">
                {loading ? "Saving..." : editingId ? "✏️ Update Dispatch" : "➕ Record Dispatch"}
              </Button>
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
                {["Item","Qty","Date","Customer","Driver","Vehicle","Toll Group","Toll Fee","Fuel","Per Diem","Personnel","Total Cost","Remarks","Status","Actions"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {dispatches.map((d, i) => (
                  <motion.tr
                    key={d._id || i}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ backgroundColor: "#e3f2fd" }}
                    transition={{ duration: 0.3 }}
                  >
                    <td style={tdStyle}>{d.item || "-"}</td>
                    <td style={tdStyle}>{d.quantity || 0}</td>
                    <td style={tdStyle}>{d.date ? new Date(d.date).toLocaleDateString() : "-"}</td>
                    <td style={tdStyle}>{d.customer || "-"}</td>
                    <td style={tdStyle}>{d.driver || "-"}</td>
                    <td style={tdStyle}>{d.vehicle || "-"}</td>
                    <td style={tdStyle}>{d.tollGroup || "-"}</td>
                    <td style={tdStyle}>{d.tollFee ?? 0}</td>
                    <td style={tdStyle}>{d.fuelCost ?? 0}</td>
                    <td style={tdStyle}>{d.perDiem ?? 0}</td>
                    <td style={tdStyle}>{(d.personnel || []).join(", ")}</td>
                    <td style={tdStyle}>{d.totalCost ?? 0}</td>
                    <td style={tdStyle}>{d.remarks || "-"}</td>
                    <td style={tdStyle}>{d.status || "pending"}</td>
                    <td style={tdStyle}>
                      <Button onClick={() => handleEdit(d)} variant="outlined" size="small">✏️</Button>{" "}
                      <Button onClick={() => handleDelete(d._id)} variant="outlined" color="error" size="small">❌</Button>
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
