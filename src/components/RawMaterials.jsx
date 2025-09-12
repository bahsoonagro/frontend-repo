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
  Tooltip,
} from "@mui/material";
import { Delete, Print, Add, Remove } from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const LPO_URL = "https://backend-repo-ydwt.onrender.com/api/lpos";
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

  const [lpoItems, setLpoItems] = useState([{ rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
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

  const [lpoList, setLpoList] = useState([]); // store saved LPOs for table links

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(API_URL);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
      alert("Failed to save raw material.");
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // LPO Handlers
  const handleLpoItemChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...lpoItems];
    updated[index][name] = value;
    setLpoItems(updated);
  };

  const addLpoItem = () => setLpoItems([...lpoItems, { rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
  const removeLpoItem = (index) => setLpoItems(lpoItems.filter((_, i) => i !== index));

  const handleLpoChange = (e) => {
    const { name, value } = e.target;
    setLpoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveLpo = async () => {
    try {
      const payload = { ...lpoData, items: lpoItems };
      const res = await axios.post(LPO_URL, payload, { responseType: "blob" });

      const fileName = `LPO-${new Date().getTime()}.pdf`;
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Add LPO entry for table link
      setLpoList((prev) => [...prev, { ...payload, fileName }]);

      // Reset LPO form
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

    } catch (err) {
      console.error(err);
      alert("Failed to save LPO.");
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Materials Report</title></head><body>");
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
      LPO: lpoList.find((l) => l.items.some((i) => i.rawMaterialType === m.rawMaterialType))?.fileName || "-",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "RawMaterials");
    XLSX.writeFile(wb, "RawMaterials.xlsx");
  };

  // Calculate totals for footer
  const totals = materials
    .filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab])
    .reduce(
      (acc, m) => {
        acc.bags += m.bagsAfterStd || 0;
        acc.weight += m.totalWeight || 0;
        return acc;
      },
      { bags: 0, weight: 0 }
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>
        Raw Materials & LPO Entry
      </Typography>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <Tab label={tab} key={i} />
        ))}
      </Tabs>

      {/* Raw Material Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: 2, width: "100%" }}>
        <Typography variant="h6" color="green">Raw Material Entry</Typography>
        {step === 1 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}><TextField label="Supplier Name" name="supplierName" value={formData.supplierName} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supplier Phone" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supplier Quantity (bags)" name="supplierBags" type="number" value={formData.supplierBags} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3} display="flex" justifyContent="flex-end"><Button variant="contained" onClick={handleNext} sx={btnStyle}>Next →</Button></Grid>
          </Grid>
        )}
        {step === 2 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}><TextField label="Extra Kg" name="extraKg" type="number" value={formData.extraKg} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Store Keeper" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Supervisor" name="supervisor" value={formData.supervisor} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3} display="flex" justifyContent="space-between">
              <Button variant="contained" onClick={handlePrev} sx={btnStyle}>← Prev</Button>
              <Button variant="contained" onClick={handleNext} sx={btnStyle}>Next →</Button>
            </Grid>
          </Grid>
        )}
        {step === 3 && (
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}><TextField label="Location" name="location" value={formData.location} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Batch Number" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={handlePrev} sx={btnStyle}>← Prev</Button>
              <Button variant="contained" onClick={handleSaveMaterial} sx={btnStyle}>Save</Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* LPO Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 3, borderRadius: 2, width: "100%" }}>
        <Typography variant="h6" color="green">LPO Entry</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} md={3}><TextField label="Supplier" name="supplier" value={lpoData.supplier} onChange={handleLpoChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Payment" name="payment" value={lpoData.payment} onChange={handleLpoChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Fuel Cost" name="fuelCost" type="number" value={lpoData.fuelCost} onChange={handleLpoChange} fullWidth size="small" /></Grid>
          <Grid item xs={12} md={3}><TextField label="Per Diem" name="perDiem" type="number" value={lpoData.perDiem} onChange={handleLpoChange} fullWidth size="small" /></Grid>
        </Grid>
        {lpoItems.map((item, idx) => (
          <Grid container spacing={1} key={idx} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}><TextField label="Material" name="rawMaterialType" value={item.rawMaterialType} onChange={(e) => handleLpoItemChange(idx, e)} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(e) => handleLpoItemChange(idx, e)} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3}><TextField label="Unit Price" name="unitPrice" type="number" value={item.unitPrice} onChange={(e) => handleLpoItemChange(idx, e)} fullWidth size="small" /></Grid>
            <Grid item xs={12} md={3} display="flex" justifyContent="space-between">
              <Button variant="contained" onClick={() => removeLpoItem(idx)} sx={btnStyle}>Remove</Button>
              {idx === lpoItems.length - 1 && <Button variant="contained" onClick={addLpoItem} sx={btnStyle}>Add</Button>}
            </Grid>
          </Grid>
        ))}
        <Button variant="contained" onClick={handleSaveLpo} sx={{ ...btnStyle, mt: 2 }}>Save LPO</Button>
      </Paper>

      {/* Table */}
      <Paper ref={printRef} elevation={6} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" color="green" sx={{ mb: 2 }}>Materials List</Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#4caf50", color: "white" }}>
              <tr>
                <th>Date</th>
                <th>Material</th>
                <th>Supplier</th>
                <th>Bags After Std</th>
                <th>Total Weight</th>
                <th>Batch</th>
                <th>Location</th>
                <th>StoreKeeper</th>
                <th>Supervisor</th>
                <th>LPO</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <motion.tr
                  key={m._id}
                  whileHover={{ scale: 1.01 }}
                  style={{ transition: "background-color 0.3s", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e3f2fd"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td>{new Date(m.date).toLocaleDateString()}</td>
                  <td>{m.rawMaterialType}</td>
                  <td>{m.supplierName}</td>
                  <td>{m.bagsAfterStd}</td>
                  <td>{m.totalWeight}</td>
                  <td>{m.batchNumber}</td>
                  <td>{m.location}</td>
                  <td>{m.storeKeeper}</td>
                  <td>{m.supervisor}</td>
                  <td>
                    {lpoList.find((l) => l.items.some((i) => i.rawMaterialType === m.rawMaterialType))?.fileName || "-"}
                  </td>
                  <td>
                    <Tooltip title="Delete"><IconButton onClick={() => handleDeleteMaterial(m._id)} color="error"><Delete /></IconButton></Tooltip>
                  </td>
                </motion.tr>
              ))}
              <tr style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                <td colSpan={3}>Totals</td>
                <td>{totals.bags}</td>
                <td>{totals.weight}</td>
                <td colSpan={6}></td>
              </tr>
            </tbody>
          </table>
        </Box>
      </Paper>

      {/* Actions */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handlePrint} sx={btnStyle}>Print</Button>
        <Button variant="contained" onClick={exportToExcel} sx={btnStyle}>Export Excel</Button>
      </Box>
    </Box>
  );
}

// Button styles
const btnStyle = {
  backgroundColor: "#4caf50",
  color: "white",
  "&:hover": { background: "linear-gradient(45deg, #2e7d32, #4caf50)" },
};
