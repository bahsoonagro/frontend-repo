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
  Collapse,
  Tabs,
  Tab
} from "@mui/material";
import { ExpandMore, Delete, Print, Add, Remove } from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials"; // note small 'm'
const RAW_MATERIALS_TABS = ["Sorghum", "Sesame Seeds", "Pigeon Peas", "Rice", "Sugar"];

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
  });
  const [step, setStep] = useState(1);
  const printRef = useRef();

  // --- Fetch raw materials ---
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("Fetched raw materials:", res.data);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching raw materials:", err);
    }
  };

  // --- Set rawMaterialType automatically from tab ---
  useEffect(() => {
    setFormData(prev => ({ ...prev, rawMaterialType: RAW_MATERIALS_TABS[currentTab] }));
  }, [currentTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const bagsAfterStd = Math.floor(formData.supplierBags || 0);
  const totalWeight = bagsAfterStd * 50 + Number(formData.extraKg || 0);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSaveMaterial = async () => {
    try {
      const newEntry = { ...formData, bagsAfterStd, totalWeight };
      const res = await axios.post(API_URL, newEntry);
      console.log("Saved material:", res.data);
      setMaterials([...materials, res.data]);
      setFormData({
        ...formData,
        supplierName: "",
        supplierPhone: "",
        supplierBags: "",
        extraKg: "",
        storeKeeper: "",
        supervisor: "",
        location: "",
        date: "",
        batchNumber: "",
      });
      setStep(1);
    } catch (err) {
      console.error("Error saving material:", err);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials(materials.filter(m => m._id !== id));
      console.log("Deleted material ID:", id);
    } catch (err) {
      console.error("Error deleting material:", err);
    }
  };

  const toggleExpandMaterial = (id) => {
    setMaterials(materials.map(m => (m._id === id ? { ...m, expanded: !m.expanded } : m)));
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Material Report</title></head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  const exportToExcel = () => {
    const wsData = materials.map(m => ({
      Date: new Date(m.date).toLocaleDateString(),
      Material: m.rawMaterialType,
      Supplier: m.supplierName,
      BagsAfterStd: m.bagsAfterStd,
      TotalWeight: m.totalWeight,
      Batch: m.batchNumber,
      Location: m.location,
      StoreKeeper: m.storeKeeper,
      Supervisor: m.supervisor,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "RawMaterials");
    XLSX.writeFile(wb, "RawMaterials.xlsx");
  };

  // --- Filter materials per tab ---
  const filteredMaterials = materials.filter(m => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>Raw Materials Entry</Typography>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => <Tab label={tab} key={i} />)}
      </Tabs>

      {/* Multi-Step Form */}
      <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        {step === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Supplier Phone" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Supplier Quantity (bags)" name="supplierBags" type="number" value={formData.supplierBags} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="contained" color="primary" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}

        {step === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField label="Extra Kg" name="extraKg" type="number" value={formData.extraKg} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Bags After Std" value={bagsAfterStd} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField label="Total Weight (kg)" value={totalWeight} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={2}>
              <Button variant="outlined" color="secondary" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" color="primary" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}

        {step === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField label="Store Keeper" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Batch Number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={2}>
              <Button variant="outlined" color="secondary" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" color="success" onClick={handleSaveMaterial}>Save Entry</Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Summary & Print/Excel */}
      {filteredMaterials.length > 0 && (
        <Box ref={printRef}>
          <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
            <Button variant="outlined" onClick={exportToExcel}>Export Excel</Button>
          </Box>
          {filteredMaterials.map((m) => (
            <motion.div key={m._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: "1rem" }}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={2}><Typography>{new Date(m.date).toLocaleDateString()}</Typography></Grid>
                  <Grid item xs={2}><Typography>{m.rawMaterialType}</Typography></Grid>
                  <Grid item xs={2}><Typography>{m.supplierName}</Typography></Grid>
                  <Grid item xs={1}><Typography>{m.bagsAfterStd}</Typography></Grid>
                  <Grid item xs={1}><Typography>{m.totalWeight}</Typography></Grid>
                  <Grid item xs={2}><Typography>{m.batchNumber}</Typography></Grid>
                  <Grid item xs={2} display="flex" justifyContent="flex-end" gap={1}>
                    <IconButton color="error" onClick={() => handleDeleteMaterial(m._id)}><Delete /></IconButton>
                    <IconButton onClick={() => toggleExpandMaterial(m._id)}><ExpandMore /></IconButton>
                  </Grid>
                  <Grid item xs={12}>
                    <Collapse in={m.expanded}>
                      <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                        <Typography>Supplier Phone: {m.supplierPhone}</Typography>
                        <Typography>Extra Kg: {m.extraKg}</Typography>
                        <Typography>Storekeeper: {m.storeKeeper}</Typography>
                        <Typography>Supervisor: {m.supervisor}</Typography>
                        <Typography>Location: {m.location}</Typography>
                      </Box>
                    </Collapse>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}
