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
import { Delete, Add, Remove, Print } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const LPO_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials/lpo";

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

  // LPO
  const [lpoItems, setLpoItems] = useState([
    { rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" },
  ]);
  const [lpoData, setLpoData] = useState({
    year: new Date().getFullYear(),
    supplier: "",
    payment: "",
    comments: "",
    fuelCost: 0,
    perDiem: 0,
    tollFee: 0,
    miscellaneous: 0,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(API_URL);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching raw materials:", err.response?.data || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const bagsAfterStd = Math.floor(formData.supplierBags || 0);
  const totalWeight = bagsAfterStd * 50 + Number(formData.extraKg || 0);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSaveMaterial = async () => {
    try {
      const newEntry = { ...formData, bagsAfterStd, totalWeight };
      const res = await axios.post(API_URL, newEntry);
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
      console.error("Error saving raw material:", err.response?.data || err.message);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Error deleting material:", err.response?.data || err.message);
    }
  };

  // LPO handlers
  const handleLpoItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...lpoItems];
    updatedItems[index][name] = value;
    setLpoItems(updatedItems);
  };

  const addLpoItem = () =>
    setLpoItems([...lpoItems, { rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
  const removeLpoItem = (index) => setLpoItems(lpoItems.filter((_, i) => i !== index));
  const handleLpoChange = (e) => {
    const { name, value } = e.target;
    setLpoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveLpo = async () => {
    try {
      const totalCost = lpoItems.reduce(
        (acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)),
        0
      );
      const payload = { ...lpoData, items: lpoItems, totalCost };
      await axios.post(LPO_URL, payload);
      setLpoItems([{ rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
      setLpoData({
        year: new Date().getFullYear(),
        supplier: "",
        payment: "",
        comments: "",
        fuelCost: 0,
        perDiem: 0,
        tollFee: 0,
        miscellaneous: 0,
      });
      alert("LPO saved successfully!");
    } catch (err) {
      console.error("Error saving LPO:", err.response?.data || err.message);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Material & LPO Report</title></head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  const exportToExcel = () => {
    const wsData = materials.map((m) => ({
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

  const calculateTotals = (filteredMaterials) => {
    return filteredMaterials.reduce(
      (acc, m) => {
        acc.bagsAfterStd += Number(m.bagsAfterStd || 0);
        acc.totalWeight += Number(m.totalWeight || 0);
        return acc;
      },
      { bagsAfterStd: 0, totalWeight: 0 }
    );
  };

  const rowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>
        Raw Materials & LPO Entry
      </Typography>

      <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <Tab label={tab} key={i} />
        ))}
      </Tabs>

      {/* Multi-Step Form Shrunk by 50% */}
      <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 3, width: "50%", transform: "scale(0.5)", transformOrigin: "top left" }}>
        {step === 1 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <TextField label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Supplier Phone" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Supplier Quantity (bags)" name="supplierBags" type="number" value={formData.supplierBags} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="contained" color="primary" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}
        {step === 2 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <TextField label="Extra Kg" name="extraKg" type="number" value={formData.extraKg} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Bags After Std" value={bagsAfterStd} fullWidth size="small" InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Total Weight (kg)" value={totalWeight} fullWidth size="small" InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={1}>
              <Button variant="outlined" color="secondary" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" color="primary" onClick={handleNext}>Next →</Button>
            </Grid>
          </Grid>
        )}
        {step === 3 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <TextField label="Store Keeper" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Batch Number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={1}>
              <Button variant="outlined" color="secondary" onClick={handlePrev}>← Previous</Button>
              <Button variant="contained" color="success" onClick={handleSaveMaterial}>Save Entry</Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Table with Animated Rows */}
      {materials.length > 0 && (
        <Box ref={printRef}>
          <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
            <Button variant="outlined" onClick={exportToExcel}>Export Excel</Button>
          </Box>

          <Paper elevation={3} sx={{ borderRadius: 3, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Material</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Bags After Std</th>
                  <th style={thStyle}>Total Weight</th>
                  <th style={thStyle}>Batch</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Store Keeper</th>
                  <th style={thStyle}>Supervisor</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {materials
                    .filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab])
                    .map((m) => (
                      <motion.tr key={m._id} variants={rowVariants} initial="hidden" animate="visible" exit="exit" layout>
                        <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                        <td style={tdStyle}>{m.rawMaterialType}</td>
                        <td style={tdStyle}>{m.supplierName}</td>
                        <td style={tdStyle}>{m.bagsAfterStd}</td>
                        <td style={tdStyle}>{m.totalWeight}</td>
                        <td style={tdStyle}>{m.batchNumber}</td>
                        <td style={tdStyle}>{m.location}</td>
                        <td style={tdStyle}>{m.storeKeeper}</td>
                        <td style={tdStyle}>{m.supervisor}</td>
                        <td style={tdStyle}>
                          <IconButton color="error" size="small" onClick={() => handleDeleteMaterial(m._id)}><Delete /></IconButton>
                        </td>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </tbody>
            </table>
          </Paper>

          {/* Animated Totals */}
          <Box display="flex" justifyContent="flex-end" gap={4} mt={2}>
            <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
              <Typography variant="h6">
                Total Bags:{" "}
                {calculateTotals(materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab])).bagsAfterStd}
              </Typography>
            </motion.div>
            <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
              <Typography variant="h6">
                Total Weight:{" "}
                {calculateTotals(materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab])).totalWeight} kg
              </Typography>
            </motion.div>
          </Box>
        </Box>
      )}

      {/* LPO Section */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2, color: "#1976d2" }}>LPO Entry</Typography>
        {lpoItems.map((item, idx) => (
          <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Raw Material"
                name="rawMaterialType"
                value={item.rawMaterialType}
                onChange={(e) => handleLpoItemChange(idx, e)}
                SelectProps={{ native: true }}
                fullWidth
                size="small"
              >
                {RAW_MATERIALS_TABS.map((tab, i) => (<option key={i} value={tab}>{tab}</option>))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(e) => handleLpoItemChange(idx, e)} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Unit Price" name="unitPrice" type="number" value={item.unitPrice} onChange={(e) => handleLpoItemChange(idx, e)} fullWidth size="small" />
            </Grid>
            <Grid item xs={12} md={2} display="flex" alignItems="center">
              <IconButton color="error" onClick={() => removeLpoItem(idx)}><Remove /></IconButton>
            </Grid>
          </Grid>
        ))}
        <Button startIcon={<Add />} onClick={addLpoItem} sx={{ mb: 2 }}>Add Item</Button>
        <Button variant="contained" color="success" onClick={handleSaveLpo}>Save LPO</Button>
      </Box>
    </Box>
  );
}

const thStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "center" };
const tdStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "center" };

const rowVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};
