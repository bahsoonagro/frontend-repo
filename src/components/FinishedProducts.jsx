import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Tooltip,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import { Delete, Edit, Print, FileDownload } from "@mui/icons-material";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const StockMovements = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    requisitionNo: "",
    dateTime: "",
    rawMaterial: "",
    batchNumber: "",
    quantityBags: "",
    weightRemovedKg: "",
    weightReceivedKg: "",
    storeman: "",
    cleaningReceiver: "",
    remarks: "",
  });
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const tableRef = useRef();

  useEffect(() => {
    fetchMovements();
  }, [apiUrl]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/stock-movements`);
      setMovements(res.data);
    } catch (err) {
      setError("Failed to load stock movements.");
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
    // Validate required fields
    const required = [
      "requisitionNo",
      "dateTime",
      "rawMaterial",
      "batchNumber",
      "quantityBags",
      "weightRemovedKg",
      "weightReceivedKg",
      "storeman",
      "cleaningReceiver",
    ];
    for (let f of required) {
      if (!formData[f]) return setError(`Please fill in ${f}`);
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantityBags: Number(formData.quantityBags),
        weightRemovedKg: Number(formData.weightRemovedKg),
        weightReceivedKg: Number(formData.weightReceivedKg),
      };

      let res;
      if (editingId) {
        res = await axios.put(`${apiUrl}/api/stock-movements/${editingId}`, payload);
        setMovements((prev) =>
          prev.map((m) => (m._id === editingId ? res.data : m))
        );
        setSuccessMsg("Stock movement updated successfully!");
      } else {
        res = await axios.post(`${apiUrl}/api/stock-movements`, payload);
        setMovements((prev) => [res.data.movement, ...prev]);
        setSuccessMsg("Stock movement recorded successfully!");
      }

      setFormData({
        requisitionNo: "",
        dateTime: "",
        rawMaterial: "",
        batchNumber: "",
        quantityBags: "",
        weightRemovedKg: "",
        weightReceivedKg: "",
        storeman: "",
        cleaningReceiver: "",
        remarks: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save movement.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movement) => {
    setFormData({
      requisitionNo: movement.requisitionNo,
      dateTime: movement.dateTime,
      rawMaterial: movement.rawMaterial,
      batchNumber: movement.batchNumber,
      quantityBags: movement.quantityBags || "",
      weightRemovedKg: movement.weightRemovedKg || "",
      weightReceivedKg: movement.weightReceivedKg || "",
      storeman: movement.storeman,
      cleaningReceiver: movement.cleaningReceiver,
      remarks: movement.remarks || "",
    });
    setEditingId(movement._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this movement?")) return;
    try {
      await axios.delete(`${apiUrl}/api/stock-movements/${id}`);
      setMovements((prev) => prev.filter((m) => m._id !== id));
      setSuccessMsg("Stock movement deleted successfully!");
    } catch (err) {
      setError("Failed to delete movement.");
    }
  };

  const handlePrint = () => {
    const printContent = tableRef.current.outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Stock Movements</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #1976d2; color: white; }
      </style>
    </head><body>${printContent}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(movements.map(m => ({
      "Requisition No": m.requisitionNo,
      "Date/Time": new Date(m.dateTime).toLocaleString(),
      "Raw Material": m.rawMaterial,
      "Batch": m.batchNumber,
      "Qty (Bags)": m.quantityBags,
      "Weight Removed (Kg)": m.weightRemovedKg,
      "Weight Received (Kg)": m.weightReceivedKg,
      "Storeman": m.storeman,
      "Cleaning Receiver": m.cleaningReceiver,
      "Remarks": m.remarks,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockMovements");
    XLSX.writeFile(wb, "StockMovements.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [[
        "Req. No","Date/Time","Raw Material","Batch","Qty (Bags)",
        "Weight Removed","Weight Received","Storeman","Cleaning Receiver","Remarks"
      ]],
      body: movements.map(m => [
        m.requisitionNo,
        new Date(m.dateTime).toLocaleString(),
        m.rawMaterial,
        m.batchNumber,
        m.quantityBags,
        m.weightRemovedKg,
        m.weightReceivedKg,
        m.storeman,
        m.cleaningReceiver,
        m.remarks || "-"
      ])
    });
    doc.save("StockMovements.pdf");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">🔁 Stock Movements</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

      {/* Input Form */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField label="Requisition No" name="requisitionNo" value={formData.requisitionNo} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Date/Time" name="dateTime" type="datetime-local" value={formData.dateTime} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><TextField label="Raw Material" name="rawMaterial" value={formData.rawMaterial} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Batch Number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Qty (Bags)" name="quantityBags" type="number" value={formData.quantityBags} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Weight Removed (Kg)" name="weightRemovedKg" type="number" value={formData.weightRemovedKg} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Weight Received (Kg)" name="weightReceivedKg" type="number" value={formData.weightReceivedKg} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Storeman" name="storeman" value={formData.storeman} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Cleaning Receiver" name="cleaningReceiver" value={formData.cleaningReceiver} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={6}><TextField label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={6}>
            <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>{editingId ? "✏️ Update Movement" : "➕ Record Movement"}</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Print & Export Buttons */}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportExcel}>Export Excel</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportPDF}>Export PDF</Button>
      </Box>

      {/* Table */}
      <Paper ref={tableRef} elevation={3}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
              <tr>
                <th style={thStyle}>Req. No</th>
                <th style={thStyle}>Date/Time</th>
                <th style={thStyle}>Raw Material</th>
                <th style={thStyle}>Batch</th>
                <th style={thStyle}>Qty (Bags)</th>
                <th style={thStyle}>Weight Removed (Kg)</th>
                <th style={thStyle}>Weight Received (Kg)</th>
                <th style={thStyle}>Storeman</th>
                <th style={thStyle}>Cleaning Receiver</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr><td colSpan={11} style={tdStyleCenter}>No stock movements</td></tr>
              ) : (
                movements.map((m, i) => (
                  <tr key={m._id} style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                    <td style={tdStyle}>{m.requisitionNo}</td>
                    <td style={tdStyle}>{new Date(m.dateTime).toLocaleString()}</td>
                    <td style={tdStyle}>{m.rawMaterial}</td>
                    <td style={tdStyle}>{m.batchNumber}</td>
                    <td style={tdStyle}>{m.quantityBags}</td>
                    <td style={tdStyle}>{m.weightRemovedKg}</td>
                    <td style={tdStyle}>{m.weightReceivedKg}</td>
                    <td style={tdStyle}>{m.storeman}</td>
                    <td style={tdStyle}>{m.cleaningReceiver}</td>
                    <td style={tdStyle}>{m.remarks || "-"}</td>
                    <td style={tdStyle}>
                      <IconButton color="primary" size="small" onClick={() => handleEdit(m)}><Edit /></IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(m._id)}><Delete /></IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

// Styles
const thStyle = { padding: "8px", border: "1px solid #333", textAlign: "left" };
const tdStyle = { padding: "8px", border: "1px solid #ccc" };
const tdStyleCenter = { padding: "8px", border: "1px solid #ccc", textAlign: "center", color: "#777" };

export default StockMovements;
