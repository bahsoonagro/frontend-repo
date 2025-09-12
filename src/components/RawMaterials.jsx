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
  Tab,
} from "@mui/material";
import { ExpandMore, Delete, Add, Remove, Print, FileDownload } from "@mui/icons-material";
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
      setFormData({ ...formData, supplierName: "", supplierPhone: "", supplierBags: "", extraKg: "", storeKeeper: "", supervisor: "", location: "", date: "", batchNumber: "" });
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

  const toggleExpandMaterial = (id) => {
    setMaterials(materials.map((m) => (m._id === id ? { ...m, expanded: !m.expanded } : m)));
  };

  // LPO handlers
  const handleLpoItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...lpoItems];
    updatedItems[index][name] = value;
    setLpoItems(updatedItems);
  };
  const addLpoItem = () => setLpoItems([...lpoItems, { rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
  const removeLpoItem = (index) => setLpoItems(lpoItems.filter((_, i) => i !== index));
  const handleLpoChange = (e) => {
    const { name, value } = e.target;
    setLpoData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveLpo = async () => {
    try {
      const totalCost = lpoItems.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
      const payload = { ...lpoData, items: lpoItems, totalCost };
      await axios.post(LPO_URL, payload);
      setLpoItems([{ rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
      setLpoData({ year: new Date().getFullYear(), supplier: "", payment: "", comments: "", fuelCost: 0, perDiem: 0, tollFee: 0, miscellaneous: 0 });
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

  // Totals for current tab
  const currentTabMaterials = materials.filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]);
  const totals = currentTabMaterials.reduce(
    (acc, m) => {
      acc.bags += Number(m.bagsAfterStd || 0);
      acc.weight += Number(m.totalWeight || 0);
      return acc;
    },
    { bags: 0, weight: 0 }
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>Raw Materials & LPO Entry</Typography>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <Tab label={tab} key={i} />
        ))}
      </Tabs>

      {/* Forms Container */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
        {/* Raw Material Form */}
        <Paper elevation={6} sx={{ p: 3, borderRadius: 3, width: "80%" }}>
          <Typography variant="h6" gutterBottom color="primary">Add Raw Material Entry</Typography>
          {step === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleChange} fullWidth size="small" /></Grid>
              <Grid item xs={12} md={4}><TextField label="Supplier Phone" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} fullWidth size="small" /></Grid>
              <Grid item xs={12} md={4}><TextField label="Supplier Quantity (bags)" name="supplierBags" type="number" value={formData.supplierBags} onChange={handleChange} fullWidth size="small" /></Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end"><Button variant="contained" color="primary" onClick={handleNext}>Next →</Button></Grid>
            </Grid>
          )}
          {step === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField label="Extra Kg" name="extraKg" type="number" value={formData.extraKg} onChange={handleChange} fullWidth size="small" /></Grid>
              <Grid item xs={12} md={4}><TextField label="Bags After Std" value={bagsAfterStd} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
              <Grid item xs={12} md={4}><TextField label="Total Weight (kg)" value={totalWeight} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
              <Grid item xs={12} display="flex" justifyContent="space-between">
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
              <Grid item xs={12} display="flex" justifyContent="space-between"><Button variant="outlined" color="secondary" onClick={handlePrev}>← Previous</Button><Button variant="contained" color="success" onClick={handleSaveMaterial}>Save Entry</Button></Grid>
            </Grid>
          )}
        </Paper>

        {/* LPO Form */}
        <Paper elevation={6} sx={{ p: 3, borderRadius: 3, width: "80%" }}>
          <Typography variant="h6" gutterBottom color="secondary">Create LPO</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField label="Year" name="year" type="number" value={lpoData.year} onChange={handleLpoChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supplier" name="supplier" value={lpoData.supplier} onChange={handleLpoChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Payment" name="payment" value={lpoData.payment} onChange={handleLpoChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Comments" name="comments" value={lpoData.comments} onChange={handleLpoChange} fullWidth size="small" /></Grid>

            {lpoItems.map((item, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} md={3}><TextField label="Raw Material" value={item.rawMaterialType} fullWidth size="small" InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={12} md={3}><TextField label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(e) => handleLpoItemChange(index, e)} fullWidth size="small" /></Grid>
                <Grid item xs={12} md={3}><TextField label="Unit Price" name="unitPrice" type="number" value={item.unitPrice} onChange={(e) => handleLpoItemChange(index, e)} fullWidth size="small" /></Grid>
                <Grid item xs={12} md={3} display="flex" alignItems="center" gap={1}><IconButton color="primary" onClick={addLpoItem}><Add /></IconButton><IconButton color="error" onClick={() => removeLpoItem(index)}><Remove /></IconButton></Grid>
              </React.Fragment>
            ))}

            <Grid item xs={12} display="flex" justifyContent="flex-end"><Button variant="contained" color="success" onClick={handleSaveLpo}>Save LPO</Button></Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Table Section */}
      <Box ref={printRef} sx={{ mt: 4 }}>
        <AnimatePresence>
          {currentTabMaterials.map((m) => (
            <motion.div key={m._id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ marginBottom: "0.8rem" }}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={2}><Typography>{new Date(m.date).toLocaleDateString()}</Typography></Grid>
                  <Grid item xs={2}><Typography>{m.rawMaterialType}</Typography></Grid>
                  <Grid item xs={2}><Typography>{m.supplierName}</Typography></Grid>
                  <Grid item xs={1}><Typography>{m.bagsAfterStd}</Typography></Grid>
                  <Grid item xs={1}><Typography>{m.totalWeight}</Typography></Grid>
                  <Grid item xs={2}><Typography>{m.batchNumber}</Typography></Grid>
                  <Grid item xs={2} display="flex" justifyContent="flex-end" gap={1}>
                    <IconButton color="error" size="small" onClick={() => handleDeleteMaterial(m._id)}><Delete /></IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Totals Row */}
        <Paper elevation={3} sx={{ p: 1, mt: 1, bgcolor: "#f5f5f5" }}>
          <Typography fontWeight="bold">Totals: Bags: {totals.bags} | Weight: {totals.weight} kg</Typography>
        </Paper>
      </Box>

      {/* Print & Export Buttons */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="contained" color="primary" startIcon={<Print />} onClick={handlePrint} size="small">Print</Button>
        <Button variant="contained" color="secondary" startIcon={<FileDownload />} onClick={exportToExcel} size="small">Export</Button>
      </Box>
    </Box>
  );
}
