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
import { Delete, Print } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";

const RAW_MATERIALS_TABS = ["Sorghum", "Sesame Seeds", "Pigeon Peas", "Rice", "Sugar"];
const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function RawMaterials() {
  const [currentTab, setCurrentTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    rawMaterialType: RAW_MATERIALS_TABS[0],
    supplierName: "",
    supplierPhone: "",
    supplierBags: "",
    extraKg: "",
    storeKeeper: "",
    supervisor: "",
    location: "",
    date: "",
    batchNumber: "",
    finishedProductKg: "", // New: finished product input
  });
  const [step, setStep] = useState(1);
  const printRef = useRef();

  const LOSS_TOLERANCE = 0.15; // 15% tolerance

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

  const bagsAfterStd = Math.floor(formData.supplierBags || 0);
  const totalWeight = bagsAfterStd * 50 + Number(formData.extraKg || 0);

  // Loss calculations
  const totalInputWithTolerance = totalWeight * (1 + LOSS_TOLERANCE);
  const actualLoss = totalInputWithTolerance - Number(formData.finishedProductKg || 0);
  const lossPercentage = (actualLoss / totalInputWithTolerance) * 100;
  const isLossExceedingTolerance = lossPercentage > LOSS_TOLERANCE * 100;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSaveMaterial = async () => {
    try {
      const newEntry = { ...formData, bagsAfterStd, totalWeight, totalInputWithTolerance, actualLoss, lossPercentage };
      const res = await axios.post(API_URL, newEntry);
      setMaterials([...materials, res.data]);
      setFormData({
        rawMaterialType: RAW_MATERIALS_TABS[currentTab],
        supplierName: "",
        supplierPhone: "",
        supplierBags: "",
        extraKg: "",
        storeKeeper: "",
        supervisor: "",
        location: "",
        date: "",
        batchNumber: "",
        finishedProductKg: "",
      });
      setStep(1);
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

  const calculateTotals = (filtered) =>
    filtered.reduce(
      (acc, m) => {
        acc.bagsAfterStd += Number(m.bagsAfterStd || 0);
        acc.totalWeight += Number(m.totalWeight || 0);
        return acc;
      },
      { bagsAfterStd: 0, totalWeight: 0 }
    );

  const handlePrintTable = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Materials Inventory</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:5px;text-align:center;}th{background-color:#1976d2;color:#fff;} tr:hover{background-color:#e3f2fd;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  const exportTableToExcel = () => {
    const filtered = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((m, i) => ({
        "S/N": i + 1,
        Date: new Date(m.date).toLocaleDateString(),
        Material: m.rawMaterialType,
        Supplier: m.supplierName,
        "Bags After Std": m.bagsAfterStd,
        "Total Weight (kg)": m.totalWeight,
        "Finished Product (kg)": m.finishedProductKg,
        "Actual Loss (kg)": m.actualLoss,
        "Loss %": m.lossPercentage.toFixed(2),
        "Batch Number": m.batchNumber,
        "Store Keeper": m.storeKeeper,
        Supervisor: m.supervisor,
        Location: m.location,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raw Materials");
    XLSX.writeFile(wb, "RawMaterials.xlsx");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>Raw Materials Entry</Typography>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => <Tab label={tab} key={i} />)}
      </Tabs>

      {/* Raw Material Multi-Step Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        {step === 1 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={4}><TextField label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={4}><TextField label="Supplier Phone" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supplier Quantity (bags)" name="supplierBags" type="number" value={formData.supplierBags} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}><Button variant="contained" size="small" color="primary" onClick={handleNext}>Next →</Button></Grid>
          </Grid>
        )}
        {step === 2 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}><TextField label="Extra Kg" name="extraKg" type="number" value={formData.extraKg} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Bags After Std" value={bagsAfterStd} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField label="Total Weight (kg)" value={totalWeight} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField label="Finished Product (kg)" name="finishedProductKg" type="number" value={formData.finishedProductKg} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={1}>
              <Button variant="outlined" size="small" color="secondary" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" size="small" color="primary" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}
        {step === 3 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}><TextField label="Store Keeper" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Batch Number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={1}>
              <Button variant="outlined" size="small" color="secondary" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" size="small" color="success" onClick={handleSaveMaterial}>Save Material</Button>
            </Grid>
            {isLossExceedingTolerance && (
              <Grid item xs={12}><Typography color="error">Warning: Loss exceeds 15% tolerance!</Typography></Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Table Section */}
      <Box ref={printRef} sx={{ mt: 3 }}>
        <Box display="flex" justifyContent="flex-end" gap={2} mb={1}>
          <Button variant="outlined" startIcon={<Print />} onClick={handlePrintTable}>Print Table</Button>
          <Button variant="outlined" onClick={exportTableToExcel}>Export Excel</Button>
        </Box>

        <Paper elevation={6} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>S/N</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Supplier</th>
                <th style={thStyle}>Bags After Std</th>
                <th style={thStyle}>Total Weight (kg)</th>
                <th style={thStyle}>Finished Product (kg)</th>
                <th style={thStyle}>Actual Loss (kg)</th>
                <th style={thStyle}>Loss %</th>
                <th style={thStyle}>Batch Number</th>
                <th style={thStyle}>Store Keeper</th>
                <th style={thStyle}>Supervisor</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab])
                  .map((m, i) => (
                  <motion.tr key={m._id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} whileHover={{ backgroundColor: "#e3f2fd" }} transition={{ duration: 0.3 }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{m.rawMaterialType}</td>
                    <td style={tdStyle}>{m.supplierName}</td>
                    <td style={tdStyle}>{m.bagsAfterStd}</td>
                    <td style={tdStyle}>{m.totalWeight}</td>
                    <td style={tdStyle}>{m.finishedProductKg}</td>
                    <td style={tdStyle}>{m.actualLoss}</td>
                    <td style={tdStyle}>{m.lossPercentage.toFixed(2)}%</td>
                    <td style={tdStyle}>{m.batchNumber}</td>
                    <td style={tdStyle}>{m.storeKeeper}</td>
                    <td style={tdStyle}>{m.supervisor}</td>
                    <td style={tdStyle}>{m.location}</td>
                    <td style={tdStyle}><IconButton color="error" size="small" onClick={() => handleDeleteMaterial(m._id)}><Delete /></IconButton></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            <tfoot style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
              <tr>
                <td style={tdStyle} colSpan={4}>Totals</td>
                {(() => {
                  const totals = calculateTotals(materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]));
                  return (
                    <>
                      <td style={tdStyle}>{totals.bagsAfterStd}</td>
                      <td style={tdStyle}>{totals.totalWeight}</td>
                      <td style={tdStyle} colSpan={7}></td>
                    </>
                  );
                })()}
              </tr>
            </tfoot>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}
