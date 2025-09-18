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

const statusOptions = ["Pending", "In Progress", "Completed"];

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
    remarks: "",
    status: "Pending",
  });

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonnelChange = (e) => {
    setFormData((prev) => ({ ...prev, personnel: e.target.value }));
  };

  useEffect(() => {
    const tollFee = tollGroups.find((g) => g.group === formData.tollGroup)?.price || 0;
    const fuelCost = parseFloat(formData.fuelCost) || 0;
    const perDiem = (parseFloat(formData.perDiem) || 0) * (formData.personnel.length || 1);
    setFormData((prev) => ({ ...prev, totalCost: tollFee + fuelCost + perDiem }));
  }, [formData.tollGroup, formData.fuelCost, formData.perDiem, formData.personnel]);

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
        status: "Pending",
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
      setDispatches(dispatches.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Delete Error:", err.response || err.message);
      setError("Failed to delete dispatch.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`${apiUrl}/api/dispatch-delivery/${id}`, { status: newStatus });
      setDispatches(dispatches.map(d => d._id === id ? res.data : d));
    } catch (err) {
      console.error("Status Update Error:", err.response || err.message);
      setError("Failed to update status.");
    }
  };

  const handlePrint = () => {
    const table = printRef.current.querySelector("table").cloneNode(true);
    const headers = table.querySelectorAll("th");
    const actionIndex = Array.from(headers).findIndex(h => h.innerText === "Actions");
    if (actionIndex > -1) {
      headers[actionIndex].remove();
      table.querySelectorAll("tr").forEach(tr => {
        const cells = tr.querySelectorAll("td");
        if (cells[actionIndex]) cells[actionIndex].remove();
      });
    }

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

  const filteredDispatches = filterStatus ? dispatches.filter(d => d.status === filterStatus) : dispatches;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>🚚 Dispatch & Delivery</Typography>

      <Paper elevation={6} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Form fields */}
            {/* ...existing form fields... */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select labelId="status-label" name="status" value={formData.status} onChange={handleChange} input={<OutlinedInput label="Status" />}>
                  {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button variant="contained" color="success" type="submit">{loading ? "Saving..." : "➕ Record Dispatch"}</Button>
          </Box>
        </form>
        {error && <Box sx={{ mt: 2, color: "red" }}>{error}</Box>}
        {successMsg && <Box sx={{ mt: 2, color: "green" }}>{successMsg}</Box>}
      </Paper>

      {/* Filter & Table */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl size="small">
          <InputLabel id="filter-status-label">Filter Status</InputLabel>
          <Select labelId="filter-status-label" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} input={<OutlinedInput label="Filter Status" />}>
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box ref={printRef} sx={{ mt: 3 }}>
        <Box display="flex" justifyContent="flex-end" gap={2} mb={1}>
          <Button variant="outlined" onClick={handlePrint}>🖨️ Print Table</Button>
        </Box>
        <Paper elevation={6} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                {["Item","Qty","Date","Customer","Driver","Vehicle","Toll Group","Toll Fee","Fuel","Per Diem","Personnel","Total Cost","Remarks","Status","Actions"].map((h) => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredDispatches.map((d) => (
                  <motion.tr key={d._id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} whileHover={{ backgroundColor: "#e3f2fd" }} transition={{ duration: 0.3 }}>
                    <td style={tdStyle}>{d.item}</td>
                    <td style={tdStyle}>{d.quantity}</td>
                    <td style={tdStyle}>{d.date ? new Date(d.date).toLocaleDateString() : "-"}</td>
                    <td style={tdStyle}>{d.customer}</td>
                    <td style={tdStyle}>{d.driver}</td>
                    <td style={tdStyle}>{d.vehicle}</td>
                    <td style={tdStyle}>{d.tollGroup}</td>
                    <td style={tdStyle}>{tollGroups.find(g => g.group === d.tollGroup)?.price || 0}</td>
                    <td style={tdStyle}>{d.fuelCost}</td>
                    <td style={tdStyle}>{d.perDiem}</td>
                    <td style={tdStyle}>{(d.personnel || []).join(", ")}</td>
                    <td style={tdStyle}>{d.totalCost}</td>
                    <td style={tdStyle}>{d.remarks}</td>
                    <td style={tdStyle}>
                      <Select value={d.status} onChange={(e) => handleStatusChange(d._id, e.target.value)} size="small">
                        {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </td>
                    <td style={tdStyle}><Button onClick={() => handleDelete(d._id)} variant="outlined" color="error" size="small">❌</Button></td>
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

DispatchDeliveryFactory.defaultProps = { personnelList: [] };
