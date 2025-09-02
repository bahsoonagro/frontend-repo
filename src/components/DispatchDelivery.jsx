// src/components/DispatchDelivery.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Print, Delete, Edit } from "@mui/icons-material";

const DispatchDelivery = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    toll: 0,
    fuelCost: 0,
    driverPerDiem: 0,
    staffPerDiem: 0,
    remarks: "",
  });
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const printRef = useRef();

  const calculateTotalCost = () => {
    const { toll, fuelCost, driverPerDiem, staffPerDiem } = formData;
    return Number(toll || 0) + Number(fuelCost || 0) + Number(driverPerDiem || 0) + Number(staffPerDiem || 0);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["item","quantity","date","customer","driver","vehicle"];
    for (const field of requiredFields) {
      if (!formData[field]) { setError(`Please fill in ${field}.`); return; }
    }
    setLoading(true);
    setError(""); setSuccessMsg("");
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        totalCost: calculateTotalCost(),
      };
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
        item: "", quantity: "", date: "", customer: "", driver: "", vehicle: "",
        toll: 0, fuelCost: 0, driverPerDiem: 0, staffPerDiem: 0, remarks: ""
      });
      setEditingId(null);
    } catch {
      setError("Failed to save delivery. Please try again.");
    } finally { setLoading(false); }
  };

  const handleEdit = (delivery) => {
    setFormData(delivery);
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
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Dispatch Deliveries</title></head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <Box className="p-4 max-w-6xl mx-auto">
      <Typography variant="h5" className="mb-4 font-bold">🚚 Dispatch & Delivery</Typography>

      <Paper elevation={3} className="p-4 mb-6">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {["item","quantity","date","customer","driver","vehicle"].map(f => (
              <Grid item xs={12} md={4} key={f}>
                <TextField
                  fullWidth
                  size="small"
                  type={f==="quantity"?"number":f==="date"?"date":"text"}
                  label={f.charAt(0).toUpperCase()+f.slice(1)}
                  name={f}
                  value={formData[f]}
                  onChange={handleChange}
                  required
                />
              </Grid>
            ))}
            {["toll","fuelCost","driverPerDiem","staffPerDiem"].map(f => (
              <Grid item xs={12} md={3} key={f}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={f.replace(/([A-Z])/g," $1")}
                  name={f}
                  value={formData[f]}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            ))}
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                size="small"
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Delivery" : "Record Delivery"}
              </Button>
            </Grid>
          </Grid>
        </form>
        {error && <Typography className="text-red-600 mt-2">{error}</Typography>}
        {successMsg && <Typography className="text-green-600 mt-2">{successMsg}</Typography>}
      </Paper>

      <Box className="mb-4 flex justify-end">
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print Table</Button>
      </Box>

      <TableContainer component={Paper} ref={printRef}>
        <Table size="small">
          <TableHead className="bg-gray-100">
            <TableRow>
              {["Item","Quantity","Date","Customer","Driver","Vehicle","Toll","Fuel","Driver Per Diem","Staff Per Diem","Total Cost","Remarks","Actions"].map(h => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center">No deliveries recorded.</TableCell>
              </TableRow>
            ) : deliveries.map((d,i) => (
              <TableRow key={d._id} hover className={i%2===0?"bg-gray-50":""}>
                <TableCell>{d.item}</TableCell>
                <TableCell>{d.quantity}</TableCell>
                <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                <TableCell>{d.customer}</TableCell>
                <TableCell>{d.driver}</TableCell>
                <TableCell>{d.vehicle}</TableCell>
                <TableCell>{d.toll}</TableCell>
                <TableCell>{d.fuelCost}</TableCell>
                <TableCell>{d.driverPerDiem}</TableCell>
                <TableCell>{d.staffPerDiem}</TableCell>
                <TableCell>{d.totalCost}</TableCell>
                <TableCell>{d.remarks || "-"}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(d)} size="small"><Edit /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(d._id)} size="small"><Delete /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DispatchDelivery;
