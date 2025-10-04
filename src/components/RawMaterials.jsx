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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete, Edit, Print } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const RAW_MATERIALS_TABS = ["Sorghum", "Pigeon Peas", "Sesame Seeds", "Rice", "Sugar"];

const thStyle = { padding: "8px", border: "1px solid #ddd", textAlign: "center", fontWeight: 600 };
const tdStyle = { padding: "8px", border: "1px solid #eee", textAlign: "center" };

export default function RawMaterials() {
  const [currentTab, setCurrentTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [step, setStep] = useState(1);
  const [editId, setEditId] = useState(null);
  const printRef = useRef();

  // form state matching backend model
  const initialForm = {
    date: new Date().toISOString().substring(0, 10), // default to today (YYYY-MM-DD)
    openingBal: "",
    newStock: "",
    totalStock: 0,
    stockOut: "",
    balance: 0,
    remarks: "",
    requisitionNumber: "",
    storeKeeper: "",
    supervisor: "",
    batchNumber: "",
    location: "",
    rawMaterialType: RAW_MATERIALS_TABS[0],
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Ensure rawMaterialType follows active tab
  useEffect(() => {
    setFormData((f) => ({ ...f, rawMaterialType: RAW_MATERIALS_TABS[currentTab] }));
  }, [currentTab]);

  // Auto-calculations whenever relevant fields change
  useEffect(() => {
    const opening = Number(formData.openingBal || 0);
    const added = Number(formData.newStock || 0);
    const out = Number(formData.stockOut || 0);
    const total = opening + added;
    const bal = total - out;
    setFormData((prev) => ({ ...prev, totalStock: total, balance: bal }));
  }, [formData.openingBal, formData.newStock, formData.stockOut]);

  async function fetchMaterials() {
    try {
      const res = await axios.get(API_URL);
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch materials error:", err.response?.data || err.message);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    // keep string inputs for text fields, numbers typed as numbers but stored as strings until save
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goNext = () => setStep((s) => Math.min(2, s + 1));
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const resetForm = () => {
    setFormData({ ...initialForm, rawMaterialType: RAW_MATERIALS_TABS[currentTab], date: new Date().toISOString().substring(0, 10) });
    setEditId(null);
    setStep(1);
  };

  const handleEdit = (m) => {
    // map backend model fields to form
    setFormData({
      date: m.date ? new Date(m.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
      openingBal: m.openingBal ?? "",
      newStock: m.newStock ?? "",
      totalStock: m.totalStock ?? 0,
      stockOut: m.stockOut ?? "",
      balance: m.balance ?? 0,
      remarks: m.remarks ?? "",
      requisitionNumber: m.requisitionNumber ?? "",
      storeKeeper: m.storeKeeper ?? "",
      supervisor: m.supervisor ?? "",
      batchNumber: m.batchNumber ?? "",
      location: m.location ?? "",
      rawMaterialType: m.rawMaterialType ?? RAW_MATERIALS_TABS[currentTab],
    });
    setEditId(m._id);
    // switch tab to the material's type (so edits reflect correct tab)
    const idx = RAW_MATERIALS_TABS.indexOf(m.rawMaterialType);
    if (idx >= 0) setCurrentTab(idx);
    setStep(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert("Failed to delete record");
    }
  };

  const handleSave = async () => {
    // validation: required according to model
    const required = ["date", "openingBal", "newStock", "totalStock", "stockOut", "balance", "storeKeeper", "supervisor", "batchNumber", "location"];
    for (let f of required) {
      // allow numeric 0 but forbid empty string / null / undefined
      if (formData[f] === "" || formData[f] === null || typeof formData[f] === "undefined") {
        alert(`Please fill required field: ${f}`);
        return;
      }
    }

    const payload = {
      date: formData.date ? new Date(formData.date) : new Date(),
      openingBal: Number(formData.openingBal || 0),
      newStock: Number(formData.newStock || 0),
      totalStock: Number(formData.totalStock || 0),
      stockOut: Number(formData.stockOut || 0),
      balance: Number(formData.balance || 0),
      remarks: formData.remarks || "",
      requisitionNumber: formData.requisitionNumber || "",
      storeKeeper: formData.storeKeeper,
      supervisor: formData.supervisor,
      batchNumber: formData.batchNumber,
      location: formData.location,
      rawMaterialType: formData.rawMaterialType || RAW_MATERIALS_TABS[currentTab],
    };

    try {
      let res;
      if (editId) {
        res = await axios.put(`${API_URL}/${editId}`, payload);
        setMaterials((prev) => prev.map((m) => (m._id === editId ? res.data : m)));
        setEditId(null);
      } else {
        res = await axios.post(API_URL, payload);
        setMaterials((prev) => [...prev, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      alert("Failed to save. Check console for details.");
    }
  };

  // filtered list for current tab
  const filteredMaterials = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);

  // totals
  const totals = filteredMaterials.reduce(
    (acc, m) => {
      acc.openingBal += Number(m.openingBal || 0);
      acc.newStock += Number(m.newStock || 0);
      acc.totalStock += Number(m.totalStock || 0);
      acc.stockOut += Number(m.stockOut || 0);
      acc.balance += Number(m.balance || 0);
      return acc;
    },
    { openingBal: 0, newStock: 0, totalStock: 0, stockOut: 0, balance: 0 }
  );

  // print
  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    if (!WinPrint) return alert("Popup blocked");
    WinPrint.document.write("<html><head><title>Raw Materials</title>");
    WinPrint.document.write("<style>body{font-family:Arial,Helvetica,sans-serif;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:6px;text-align:center;}th{background-color:#1976d2;color:#fff;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent || "<div>No content</div>");
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  // export excel
  const handleExportExcel = () => {
    const wsData = filteredMaterials.map((m, i) => ({
      "S/N": i + 1,
      Date: new Date(m.date).toLocaleDateString(),
      "Opening bal": m.openingBal,
      "New stock": m.newStock,
      "Total stock": m.totalStock,
      "Stock out": m.stockOut,
      Balance: m.balance,
      Remarks: m.remarks,
      "Requisition number": m.requisitionNumber,
      "Store keeper": m.storeKeeper,
      Supervisor: m.supervisor,
      "Batch number": m.batchNumber,
      Location: m.location,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, RAW_MATERIALS_TABS[currentTab]);
    XLSX.writeFile(wb, `RawMaterials-${RAW_MATERIALS_TABS[currentTab]}.xlsx`);
  };

  // export pdf (using jspdf + autotable)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const head = [["S/N", "Date", "Opening bal", "New stock", "Total stock", "Stock out", "Balance", "Remarks", "Requisition number", "Store keeper", "Supervisor", "Batch", "Location"]];
    const body = filteredMaterials.map((m, i) => [
      i + 1,
      new Date(m.date).toLocaleDateString(),
      m.openingBal,
      m.newStock,
      m.totalStock,
      m.stockOut,
      m.balance,
      m.remarks,
      m.requisitionNumber,
      m.storeKeeper,
      m.supervisor,
      m.batchNumber,
      m.location,
    ]);
    doc.text(`${RAW_MATERIALS_TABS[currentTab]} - Raw Materials`, 14, 14);
    // autopopulate table
    // jsPDF + autotable should be registered by the import "jspdf-autotable" at top
    // eslint-disable-next-line no-undef
    doc.autoTable({ head, body, startY: 20, styles: { fontSize: 8 } });
    doc.save(`RawMaterials-${RAW_MATERIALS_TABS[currentTab]}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>
        Raw materials
      </Typography>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => { setCurrentTab(v); resetForm(); }} textColor="primary" indicatorColor="primary">
          {RAW_MATERIALS_TABS.map((t, i) => (
            <Tab key={t} label={t} />
          ))}
        </Tabs>
      </Box>

      {/* Multi-step form (styled like FinishedProducts) */}
      <Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        {step === 1 && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Opening bal"
                name="openingBal"
                type="number"
                value={formData.openingBal}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="New stock"
                name="newStock"
                type="number"
                value={formData.newStock}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
              <Button variant="contained" size="small" onClick={goNext}>Next →</Button>
            </Grid>
          </Grid>
        )}

        {step === 2 && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Total stock"
                name="totalStock"
                type="number"
                value={formData.totalStock}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Stock out"
                name="stockOut"
                type="number"
                value={formData.stockOut}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Balance"
                name="balance"
                type="number"
                value={formData.balance}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={3} display="flex" justifyContent="space-between">
              <Button variant="outlined" size="small" onClick={goPrev}>← Previous</Button>
              <Button variant="contained" size="small" onClick={goNext}>Next →</Button>
            </Grid>

            {/* second row on step 2 for meta info */}
            <Grid item xs={12} md={3}>
              <TextField label="Requisition number" name="requisitionNumber" value={formData.requisitionNumber} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Batch number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField label="Store keeper" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth size="small" />
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button variant="outlined" size="small" onClick={goPrev}>← Previous</Button>
              <Button variant="contained" size="small" color="success" onClick={handleSave}>{editId ? "Update" : "Save"}</Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Controls */}
      <Box display="flex" justifyContent="flex-end" gap={2} mb={1}>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print Table</Button>
        <Button variant="outlined" onClick={handleExportExcel}>Export Excel</Button>
        <Button variant="outlined" onClick={handleExportPDF}>Export PDF</Button>
      </Box>

      {/* Table */}
      <Box ref={printRef}>
        <Paper elevation={6} sx={{ borderRadius: 3, overflowX: "auto" }}>
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
                <th style={thStyle}>Store keeper</th>
                <th style={thStyle}>Supervisor</th>
                <th style={thStyle}>Batch</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {filteredMaterials.map((m, i) => (
                  <motion.tr
                    key={m._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    whileHover={{ backgroundColor: "#f4f8ff" }}
                  >
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{m.openingBal}</td>
                    <td style={tdStyle}>{m.newStock}</td>
                    <td style={tdStyle}>{m.totalStock}</td>
                    <td style={tdStyle}>{m.stockOut}</td>
                    <td style={tdStyle}>{m.balance}</td>
                    <td style={tdStyle}>{m.remarks}</td>
                    <td style={tdStyle}>{m.requisitionNumber}</td>
                    <td style={tdStyle}>{m.storeKeeper}</td>
                    <td style={tdStyle}>{m.supervisor}</td>
                    <td style={tdStyle}>{m.batchNumber}</td>
                    <td style={tdStyle}>{m.location}</td>
                    <td style={tdStyle}>
                      <IconButton color="primary" size="small" onClick={() => handleEdit(m)}><Edit fontSize="small" /></IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(m._id)}><Delete fontSize="small" /></IconButton>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {/* Totals Row */}
              <tr style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                <td style={tdStyle} colSpan={2}>Totals</td>
                <td style={tdStyle}>{totals.openingBal}</td>
                <td style={tdStyle}>{totals.newStock}</td>
                <td style={tdStyle}>{totals.totalStock}</td>
                <td style={tdStyle}>{totals.stockOut}</td>
                <td style={tdStyle}>{totals.balance}</td>
                <td style={tdStyle} colSpan={7}></td>
              </tr>

              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={14} style={{ padding: 16, textAlign: "center", color: "#666" }}>
                    No records for {RAW_MATERIALS_TABS[currentTab]}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}
