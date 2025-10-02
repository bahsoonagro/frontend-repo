// src/components/RawMaterials.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Paper,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { Delete, Print, Add, Edit, Save } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const RAW_MATERIALS_TABS = ["Sorghum", "Sesame Seeds", "Pigeon Peas", "Rice", "Sugar"];

const thStyle = { padding: "8px", border: "1px solid #ccc", textAlign: "center" };
const tdStyle = { padding: "8px", border: "1px solid #ccc", textAlign: "center" };

export default function RawMaterials() {
  const [currentTab, setCurrentTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    rawMaterialType: RAW_MATERIALS_TABS[0],
    date: "",
    openingBal: "",
    newStock: "",
    totalStock: "",
    stockOut: "",
    balance: "",
    remarks: "",
    requisitionNumber: "",
    batchNumber: "",
    storeKeeper: "",
    supervisor: "",
  });
  const [step, setStep] = useState(1);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // auto calculate total stock & balance
  useEffect(() => {
    const total = (Number(formData.openingBal) || 0) + (Number(formData.newStock) || 0);
    const balance = total - (Number(formData.stockOut) || 0);
    setFormData((prev) => ({ ...prev, totalStock: total, balance }));
  }, [formData.openingBal, formData.newStock, formData.stockOut]);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const resetForm = () => {
    setFormData({
      rawMaterialType: RAW_MATERIALS_TABS[currentTab],
      date: "",
      openingBal: "",
      newStock: "",
      totalStock: "",
      stockOut: "",
      balance: "",
      remarks: "",
      requisitionNumber: "",
      batchNumber: "",
      storeKeeper: "",
      supervisor: "",
    });
    setStep(1);
    setEditingId(null);
  };

  const handleSaveMaterial = async () => {
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, formData);
        setMaterials(materials.map((m) => (m._id === editingId ? res.data : m)));
      } else {
        const res = await axios.post(API_URL, formData);
        setMaterials([...materials, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleEditMaterial = (m) => {
    setFormData({ ...m });
    setEditingId(m._id);
    setStep(1);
  };

  const handleExportExcel = () => {
    const filtered = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((m, i) => ({
        "S/N": i + 1,
        Date: new Date(m.date).toLocaleDateString(),
        "Opening bal": m.openingBal,
        "New stock": m.newStock,
        "Total stock": m.totalStock,
        "Stock out": m.stockOut,
        Balance: m.balance,
        Remarks: m.remarks,
        "Requisition number": m.requisitionNumber,
        "Batch number": m.batchNumber,
        "Store keeper": m.storeKeeper,
        Supervisor: m.supervisor,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raw Materials");
    XLSX.writeFile(wb, "RawMaterials.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const filtered = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);
    doc.text("Raw Materials Report", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [[
        "S/N","Date","Opening bal","New stock","Total stock","Stock out","Balance","Remarks","Requisition number","Batch number","Store keeper","Supervisor"
      ]],
      body: filtered.map((m, i) => [
        i + 1,
        new Date(m.date).toLocaleDateString(),
        m.openingBal,
        m.newStock,
        m.totalStock,
        m.stockOut,
        m.balance,
        m.remarks,
        m.requisitionNumber,
        m.batchNumber,
        m.storeKeeper,
        m.supervisor,
      ]),
    });
    doc.save("RawMaterials.pdf");
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Materials</title></head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>
        Raw Materials Entry
      </Typography>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => <Tab label={tab} key={i} />)}
      </Tabs>

      {/* Multi-step form */}
      <Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        {step === 1 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}>
              <TextField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Opening bal" name="openingBal" value={formData.openingBal} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="New stock" name="newStock" value={formData.newStock} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" size="small" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}
        {step === 2 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}>
              <TextField label="Stock out" name="stockOut" value={formData.stockOut} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Requisition number" name="requisitionNumber" value={formData.requisitionNumber} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button variant="outlined" size="small" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" size="small" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}
        {step === 3 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}><TextField label="Batch number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Store keeper" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button variant="outlined" size="small" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" size="small" color="success" onClick={handleSaveMaterial}>
                {editingId ? "Update" : "Save"}
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Export & Print buttons */}
      <Box display="flex" justifyContent="flex-end" gap={2} mb={1}>
        <Button variant="outlined" onClick={handleExportExcel}>Export Excel</Button>
        <Button variant="outlined" onClick={handleExportPDF}>Export PDF</Button>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
      </Box>

      {/* Table */}
      <Box ref={printRef}>
        <Paper elevation={6} sx={{ borderRadius: 2, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>S/N</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Opening bal</th>
                <th style={thStyle}>New stock</th>
                <th style={thStyle}>Total stock</th>
                <th style={thStyle}>Stock out</th>
                <th style={thStyle}>Balance</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Requisition number</th>
                <th style={thStyle}>Batch number</th>
                <th style={thStyle}>Store keeper</th>
                <th style={thStyle}>Supervisor</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab])
                  .map((m, i) => (
                  <motion.tr key={m._id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{m.openingBal}</td>
                    <td style={tdStyle}>{m.newStock}</td>
                    <td style={tdStyle}>{m.totalStock}</td>
                    <td style={tdStyle}>{m.stockOut}</td>
                    <td style={tdStyle}>{m.balance}</td>
                    <td style={tdStyle}>{m.remarks}</td>
                    <td style={tdStyle}>{m.requisitionNumber}</td>
                    <td style={tdStyle}>{m.batchNumber}</td>
                    <td style={tdStyle}>{m.storeKeeper}</td>
                    <td style={tdStyle}>{m.supervisor}</td>
                    <td style={tdStyle}>
                      <IconButton size="small" color="primary" onClick={() => handleEditMaterial(m)}><Edit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteMaterial(m._id)}><Delete /></IconButton>
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
