// src/components/RawMaterial.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Grid, TextField, Paper, Typography, IconButton, Tooltip
} from "@mui/material";
import { Delete, Print, FileDownload } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function RawMaterial() {
  const [formData, setFormData] = useState({
    date: "", openingBal: "", newStock: "", totalStock: "", stockOut: "",
    balance: "", remarks: "", requisitionNumber: "", storeKeeper: "", supervisor: "",
    batchNumber: "", location: ""
  });
  const [materials, setMaterials] = useState([]);
  const printRef = useRef();

  // Fetch all raw materials
  const fetchMaterials = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let updated = { ...prev, [name]: value };

      // auto-calculate totalStock & balance
      const opening = parseFloat(updated.openingBal) || 0;
      const newS = parseFloat(updated.newStock) || 0;
      const out = parseFloat(updated.stockOut) || 0;

      updated.totalStock = opening + newS;
      updated.balance = updated.totalStock - out;

      return updated;
    });
  };

  // Save raw material
  const handleSave = async () => {
    const requiredFields = ["date", "batchNumber", "storeKeeper", "supervisor", "location"];
    for (let field of requiredFields) {
      if (!formData[field]) return alert("Please fill all required fields!");
    }

    try {
      const payload = {
        ...formData,
        date: new Date(formData.date),
        openingBal: parseFloat(formData.openingBal) || 0,
        newStock: parseFloat(formData.newStock) || 0,
        totalStock: parseFloat(formData.totalStock) || 0,
        stockOut: parseFloat(formData.stockOut) || 0,
        balance: parseFloat(formData.balance) || 0,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMaterials([...materials, data]);

      setFormData({
        date: "", openingBal: "", newStock: "", totalStock: "", stockOut: "",
        balance: "", remarks: "", requisitionNumber: "", storeKeeper: "", supervisor: "",
        batchNumber: "", location: ""
      });

    } catch (err) {
      console.error("Save error:", err.message);
    }
  };

  // Delete raw material
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setMaterials(materials.filter(m => m._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(materials.map(m => ({
      "Date": new Date(m.date).toLocaleDateString(),
      "Opening Qty": m.openingBal,
      "New Stock": m.newStock,
      "Total Stock": m.totalStock,
      "Stock Out": m.stockOut,
      "Balance": m.balance,
      "Remarks": m.remarks,
      "REQ No": m.requisitionNumber,
      "Store Keeper": m.storeKeeper,
      "Supervisor": m.supervisor,
      "Batch": m.batchNumber,
      "Location": m.location
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raw Materials");
    XLSX.writeFile(wb, "RawMaterials.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Raw Materials", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [[
        "DATE","OPENING BAL","NEW STOCK","TOTAL STOCK","STOCK OUT","BALANCE",
        "REMARKS","REQUISITION NUMBER","STORE KEEPER","SUPERVISOR","BATCH","LOCATION"
      ]],
      body: materials.map(m => [
        new Date(m.date).toLocaleDateString(),
        m.openingBal, m.newStock, m.totalStock, m.stockOut, m.balance,
        m.remarks, m.requisitionNumber, m.storeKeeper, m.supervisor, m.batchNumber, m.location
      ]),
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    });
    doc.save("RawMaterials.pdf");
  };

  // Print
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Materials</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:5px;text-align:center;}th{background-color:#1976d2;color:#fff;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>
        Raw Materials
      </Typography>

      <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <TextField label="Date" type="date" size="small" name="date" value={formData.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField label="Opening Bal" type="number" size="small" name="openingBal" value={formData.openingBal} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField label="New Stock" type="number" size="small" name="newStock" value={formData.newStock} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField label="Total Stock" type="number" size="small" name="totalStock" value={formData.totalStock} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField label="Stock Out" type="number" size="small" name="stockOut" value={formData.stockOut} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField label="Balance" type="number" size="small" name="balance" value={formData.balance} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Remarks" size="small" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField label="Requisition Number" size="small" name="requisitionNumber" value={formData.requisitionNumber} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="Store Keeper" size="small" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="Supervisor" size="small" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="Batch" size="small" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField label="Location" size="small" name="location" value={formData.location} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="success" onClick={handleSave}>Save</Button>
          </Grid>
        </Grid>
      </Paper>

      <Box mb={2} display="flex" gap={2}>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print Table</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportExcel}>Export Excel</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportPDF}>Export PDF</Button>
      </Box>

      <Box ref={printRef}>
        <Paper elevation={3} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>DATE</th>
                <th style={thStyle}>OPENING BAL</th>
                <th style={thStyle}>NEW STOCK</th>
                <th style={thStyle}>TOTAL STOCK</th>
                <th style={thStyle}>STOCK OUT</th>
                <th style={thStyle}>BALANCE</th>
                <th style={thStyle}>REMARKS</th>
                <th style={thStyle}>REQUISITION NUMBER</th>
                <th style={thStyle}>STORE KEEPER</th>
                <th style={thStyle}>SUPERVISOR</th>
                <th style={thStyle}>BATCH</th>
                <th style={thStyle}>LOCATION</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {materials.map((mat) => (
                  <motion.tr key={mat._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td style={tdStyle}>{new Date(mat.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{mat.openingBal}</td>
                    <td style={tdStyle}>{mat.newStock}</td>
                    <td style={tdStyle}>{mat.totalStock}</td>
                    <td style={tdStyle}>{mat.stockOut}</td>
                    <td style={tdStyle}>{mat.balance}</td>
                    <td style={tdStyle}>{mat.remarks}</td>
                    <td style={tdStyle}>{mat.requisitionNumber}</td>
                    <td style={tdStyle}>{mat.storeKeeper}</td>
                    <td style={tdStyle}>{mat.supervisor}</td>
                    <td style={tdStyle}>{mat.batchNumber}</td>
                    <td style={tdStyle}>{mat.location}</td>
                    <td style={tdStyle}>
                      <Tooltip title="Delete">
                        <IconButton color="error" size="small" onClick={() => handleDelete(mat._id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </motion.tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan="13" style={{ textAlign: "center", padding: "10px" }}>No raw materials found.</td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}
