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
import { Delete, Print, FileDownload } from "@mui/icons-material";
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
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
  const [lpoItems, setLpoItems] = useState([{ rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
  const printRef = useRef();

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

  const handleLpoChange = (e) => {
    const { name, value } = e.target;
    setLpoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLpoItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...lpoItems];
    updatedItems[index][name] = value;
    setLpoItems(updatedItems);
  };

  const addLpoItem = () => setLpoItems([...lpoItems, { rawMaterialType: RAW_MATERIALS_TABS[0], quantity: "", unitPrice: "" }]);
  const removeLpoItem = (index) => setLpoItems(lpoItems.filter((_, i) => i !== index));

  const handleSaveMaterial = async () => {
    try {
      const bagsAfterStd = Math.floor(formData.supplierBags || 0);
      const totalWeight = bagsAfterStd * 50 + Number(formData.extraKg || 0);
      const newEntry = { ...formData, bagsAfterStd, totalWeight };
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
      });
    } catch (err) {
      console.error(err);
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

  const totals = materials
    .filter((m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab])
    .reduce(
      (acc, m) => {
        acc.bags += Number(m.bagsAfterStd || 0);
        acc.weight += Number(m.totalWeight || 0);
        return acc;
      },
      { bags: 0, weight: 0 }
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>
        Raw Materials & LPO Entry
      </Typography>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <Tab label={tab} key={i} />
        ))}
      </Tabs>

      {/* Forms stretched full width */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Raw Material Form */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Raw Material Entry</Typography>
            <Grid container spacing={1}>
              {["supplierName","supplierPhone","supplierBags","extraKg","storeKeeper","supervisor","location","batchNumber","date"].map((field, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <TextField
                    fullWidth
                    size="small"
                    label={field === "supplierBags" ? "Supplier Bags" : field === "extraKg" ? "Extra Kg" : field === "batchNumber" ? "Batch Number" : field === "date" ? "Date" : field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    name={field}
                    value={formData[field]}
                    type={field.includes("Bags") || field.includes("Kg") || field.includes("year") ? "number" : field === "date" ? "date" : "text"}
                    InputLabelProps={field === "date" ? { shrink: true } : {}}
                    onChange={handleChange}
                  />
                </Grid>
              ))}
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="success" onClick={handleSaveMaterial}>Save</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* LPO Form */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Create LPO</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} md={4}><TextField fullWidth size="small" label="Year" name="year" type="number" value={lpoData.year} onChange={handleLpoChange} /></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField fullWidth size="small" label="Supplier" name="supplier" value={lpoData.supplier} onChange={handleLpoChange} /></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField fullWidth size="small" label="Payment" name="payment" value={lpoData.payment} onChange={handleLpoChange} /></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField fullWidth size="small" label="Comments" name="comments" value={lpoData.comments} onChange={handleLpoChange} /></Grid>

              {lpoItems.map((item, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Material" value={item.rawMaterialType} InputProps={{ readOnly: true }} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(e) => handleLpoItemChange(index, e)} /></Grid>
                  <Grid item xs={12} sm={4} display="flex" alignItems="center" gap={1}>
                    <TextField fullWidth size="small" label="Unit Price" name="unitPrice" type="number" value={item.unitPrice} onChange={(e) => handleLpoItemChange(index, e)} />
                    <Button variant="outlined" onClick={() => removeLpoItem(index)} size="small">Remove</Button>
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={addLpoItem} size="small">Add Item</Button>
                <Button variant="contained" color="success" onClick={() => alert("Save LPO function")}>Save LPO</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Table */}
      <Box ref={printRef} sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Material</th>
              <th style={thStyle}>Supplier</th>
              <th style={thStyle}>Bags</th>
              <th style={thStyle}>Weight (kg)</th>
              <th style={thStyle}>Batch</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Store Keeper</th>
              <th style={thStyle}>Supervisor</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.filter(m => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]).map((m) => (
              <tr key={m._id} style={trStyle}>
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
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Row */}
        <Paper elevation={3} sx={{ p: 1, mt: 1, bgcolor: "#e0e0e0" }}>
          <Typography fontWeight="bold">Totals: Bags: {totals.bags} | Weight: {totals.weight} kg</Typography>
        </Paper>
      </Box>

      {/* Print & Export Buttons */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="contained" startIcon={<Print />} onClick={handlePrint}>Print</Button>
        <Button variant="contained" color="secondary" startIcon={<FileDownload />} onClick={exportToExcel}>Export</Button>
      </Box>
    </Box>
  );
}

const thStyle = { padding: "8px", border: "1px solid #ddd" };
const tdStyle = { padding: "6px", border: "1px solid #ddd", textAlign: "center" };
const trStyle = { backgroundColor: "#f5f5f5", transition: "0.3s", cursor: "pointer" };

