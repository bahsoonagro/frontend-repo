// src/components/RawMaterials.jsx
import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Grid, TextField, Paper, Typography, IconButton } from "@mui/material";
import { Delete, Edit, Print, Inventory } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const RAW_MATERIALS_TABS = ["Sorghum", "Pigeon Peas", "Sesame Seeds", "Rice", "Sugar"];

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function RawMaterials() {
  const [currentTab, setCurrentTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    openingQty: "",
    newStock: "",
    stockOut: "",
    totalStock: 0,
    balance: 0,
    requisitionNumber: "",
    remarks: "",
    location: "",
    batchNumber: "",
    storeKeeper: "",
    supervisor: "",
  });
  const [step, setStep] = useState(1);
  const [editId, setEditId] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(API_URL);
      setMaterials(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (["openingQty", "newStock", "stockOut"].includes(name)) {
        const opening = Number(updated.openingQty || 0);
        const newS = Number(updated.newStock || 0);
        const out = Number(updated.stockOut || 0);
        updated.totalStock = opening + newS;
        updated.balance = updated.totalStock - out;
      }
      return updated;
    });
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSaveMaterial = async () => {
    try {
      const payload = {
        rawMaterialType: RAW_MATERIALS_TABS[currentTab],
        date: new Date(formData.date),
        openingQty: Number(formData.openingQty || 0),
        newStock: Number(formData.newStock || 0),
        stockOut: Number(formData.stockOut || 0),
        totalStock: Number(formData.totalStock || 0),
        balance: Number(formData.balance || 0),
        requisitionNumber: formData.requisitionNumber,
        remarks: formData.remarks,
        location: formData.location,
        batchNumber: formData.batchNumber,
        storeKeeper: formData.storeKeeper,
        supervisor: formData.supervisor,
      };

      let res;
      if (editId) {
        res = await axios.put(`${API_URL}/${editId}`, payload);
        setMaterials((prev) =>
          prev.map((m) => (m._id === editId ? res.data : m))
        );
        setEditId(null);
      } else {
        res = await axios.post(API_URL, payload);
        setMaterials((prev) => [...prev, res.data]);
      }

      setFormData({
        date: new Date().toISOString().substring(0, 10),
        openingQty: "",
        newStock: "",
        stockOut: "",
        totalStock: 0,
        balance: 0,
        requisitionNumber: "",
        remarks: "",
        location: "",
        batchNumber: "",
        storeKeeper: "",
        supervisor: "",
      });
      setStep(1);

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error saving material. Check required fields.");
    }
  };

  const handleEdit = (m) => {
    setFormData({
      date: new Date(m.date).toISOString().substring(0, 10),
      openingQty: m.openingQty,
      newStock: m.newStock,
      stockOut: m.stockOut,
      totalStock: m.totalStock,
      balance: m.balance,
      requisitionNumber: m.requisitionNumber,
      remarks: m.remarks,
      location: m.location,
      batchNumber: m.batchNumber,
      storeKeeper: m.storeKeeper,
      supervisor: m.supervisor,
    });
    setEditId(m._id);
    setStep(1);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const calculateTotals = (filtered) => ({
    openingQty: filtered.reduce((acc, m) => acc + Number(m.openingQty || 0), 0),
    newStock: filtered.reduce((acc, m) => acc + Number(m.newStock || 0), 0),
    totalStock: filtered.reduce((acc, m) => acc + Number(m.totalStock || 0), 0),
    stockOut: filtered.reduce((acc, m) => acc + Number(m.stockOut || 0), 0),
    balance: filtered.reduce((acc, m) => acc + Number(m.balance || 0), 0),
  });

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Materials</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:5px;text-align:center;}th{background-color:#1976d2;color:#fff;}tr:hover{background-color:#e3f2fd;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  const exportExcel = () => {
    const filtered = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((m, i) => ({
        "S/N": i + 1,
        Date: new Date(m.date).toLocaleDateString(),
        "Opening Qty": m.openingQty,
        "New Stock": m.newStock,
        "Total Stock": m.totalStock,
        "Stock Out": m.stockOut,
        Balance: m.balance,
        Remarks: m.remarks,
        "Requisition Number": m.requisitionNumber,
        "Store Keeper": m.storeKeeper,
        Supervisor: m.supervisor,
        Batch: m.batchNumber,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RawMaterials");
    XLSX.writeFile(wb, "RawMaterials.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const filtered = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);
    const tableData = filtered.map((m, i) => [
      i + 1,
      new Date(m.date).toLocaleDateString(),
      m.openingQty,
      m.newStock,
      m.totalStock,
      m.stockOut,
      m.balance,
      m.remarks,
      m.requisitionNumber,
      m.storeKeeper,
      m.supervisor,
      m.batchNumber
    ]);
    doc.autoTable({
      head: [["S/N","Date","Opening Qty","New Stock","Total Stock","Stock Out","Balance","Remarks","Requisition Number","Store Keeper","Supervisor","Batch"]],
      body: tableData,
    });
    doc.save("RawMaterials.pdf");
  };

  const filteredMaterials = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);
  const totals = calculateTotals(filteredMaterials);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Icon */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <Inventory sx={{ fontSize: 32, color: "#1976d2" }} />
        <Typography variant="h4" sx={{ color: "#1976d2" }}>Raw Materials Management</Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <Button key={i} variant={currentTab === i ? "contained" : "outlined"} onClick={() => setCurrentTab(i)} sx={{ mr: 1 }}>
            {tab}
          </Button>
        ))}
      </Box>

      {/* Multi-step Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        {step === 1 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={2}><TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField label="Opening Qty" name="openingQty" type="number" value={formData.openingQty} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={2}><TextField label="New Stock" name="newStock" type="number" value={formData.newStock} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={2}><TextField label="Stock Out" name="stockOut" type="number" value={formData.stockOut} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={2}><TextField label="Total Stock" value={formData.totalStock} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={2}><TextField label="Balance" value={formData.balance} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={12} display="flex" justifyContent="flex-end"><Button variant="contained" size="small" onClick={handleNext}>Next →</Button></Grid>
          </Grid>
        )}
        {step === 2 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}><TextField label="Requisition Number" name="requisitionNumber" value={formData.requisitionNumber} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Batch Number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button variant="outlined" size="small" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" size="small" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}
        {step === 3 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}><TextField label="Store Keeper" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={6}><TextField label="Supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button variant="outlined" size="small" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" size="small" color="success" onClick={handleSaveMaterial}>{editId ? "Update" : "Save"}</Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Table */}
      <Box ref={printRef}>
        <Box display="flex" justifyContent="flex-end" gap={2} mb={1}>
          <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print Table</Button>
          <Button variant="outlined" onClick={exportExcel}>Export Excel</Button>
          <Button variant="outlined" onClick={exportPDF}>Export PDF</Button>
        </Box>

        <Paper elevation={6} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>S/N</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Opening Qty</th>
                <th style={thStyle}>New Stock</th>
                <th style={thStyle}>Total Stock</th>
                <th style={thStyle}>Stock Out</th>
                <th style={thStyle}>Balance</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Requisition Number</th>
                <th style={thStyle}>Store Keeper</th>
                <th style={thStyle}>Supervisor</th>
                <th style={thStyle}>Batch</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredMaterials.map((m, i) => (
                  <motion.tr key={m._id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} whileHover={{ backgroundColor: "#e3f2fd" }} transition={{ duration: 0.3 }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{m.openingQty}</td>
                    <td style={tdStyle}>{m.newStock}</td>
                    <td style={tdStyle}>{m.totalStock}</td>
                    <td style={tdStyle}>{m.stockOut}</td>
                    <td style={tdStyle}>{m.balance}</td>
                    <td style={tdStyle}>{m.remarks}</td>
                    <td style={tdStyle}>{m.requisitionNumber}</td>
                    <td style={tdStyle}>{m.storeKeeper}</td>
                    <td style={tdStyle}>{m.supervisor}</td>
                    <td style={tdStyle}>{m.batchNumber}</td>
                    <td style={tdStyle}>
                      <IconButton color="primary" size="small" onClick={() => handleEdit(m)}><Edit /></IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(m._id)}><Delete /></IconButton>
                    </td>
                  </motion.tr>
                ))}
                {/* Totals Row */}
                <tr style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                  <td style={tdStyle} colSpan={2}>Totals</td>
                  <td style={tdStyle}>{totals.openingQty}</td>
                  <td style={tdStyle}>{totals.newStock}</td>
                  <td style={tdStyle}>{totals.totalStock}</td>
                  <td style={tdStyle}>{totals.stockOut}</td>
                  <td style={tdStyle}>{totals.balance}</td>
                  <td style={tdStyle} colSpan={5}></td>
                </tr>
              </AnimatePresence>
            </tbody>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}
