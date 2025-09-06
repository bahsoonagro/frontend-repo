import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Tabs,
  Tab
} from "@mui/material";
import { ExpandMore, Delete, Print } from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-Materials";

const RAW_MATERIAL_TABS = ["Sorghum", "Sesame Seeds", "Pigeon Peas", "Rice", "Sugar"];

export default function RawMaterialsTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierBags: "",
    extraKg: "",
    storeKeeper: "",
    supervisor: "",
    location: "",
    batchNumber: "",
    date: "",
    unitPrice: ""
  });

  const printRef = useRef();

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setMaterials(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const bagsAfterStd = Math.floor(formData.supplierBags || 0);
  const totalWeight = bagsAfterStd * 50 + Number(formData.extraKg || 0);
  const totalCost = totalWeight * (Number(formData.unitPrice || 0));

  const handleSave = () => {
    const newEntry = {
      ...formData,
      rawMaterialType: RAW_MATERIAL_TABS[activeTab],
      bagsAfterStd,
      totalWeight,
      totalCost
    };
    axios
      .post(API_URL, newEntry)
      .then((res) => {
        setMaterials([...materials, res.data]);
        setFormData({
          supplierName: "",
          supplierPhone: "",
          supplierBags: "",
          extraKg: "",
          storeKeeper: "",
          supervisor: "",
          location: "",
          batchNumber: "",
          date: "",
          unitPrice: ""
        });
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => setMaterials(materials.filter((m) => m._id !== id)))
      .catch((err) => console.error(err));
  };

  const toggleExpand = (id) => {
    setMaterials(
      materials.map((m) => (m._id === id ? { ...m, expanded: !m.expanded } : m))
    );
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

  const tabMaterials = materials.filter(
    (m) => m.rawMaterialType === RAW_MATERIAL_TABS[activeTab]
  );
  const grandTotalCost = tabMaterials.reduce((sum, m) => sum + (m.totalCost || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>
        Raw Material Entry
      </Typography>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {RAW_MATERIAL_TABS.map((tab, index) => (
          <Tab key={index} label={tab} />
        ))}
      </Tabs>

      {/* Entry Form */}
      <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Supplier Phone"
              name="supplierPhone"
              value={formData.supplierPhone}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Supplier Quantity (bags)"
              name="supplierBags"
              type="number"
              value={formData.supplierBags}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Extra Kg"
              name="extraKg"
              type="number"
              value={formData.extraKg}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Unit Price"
              name="unitPrice"
              type="number"
              value={formData.unitPrice}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Bags After Std"
              value={bagsAfterStd}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Total Weight (kg)"
              value={totalWeight}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Total Cost"
              value={totalCost}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="contained" color="success" onClick={handleSave}>
              Save Entry
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Table + Print */}
      {tabMaterials.length > 0 && (
        <Box ref={printRef}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" color="primary">
              {RAW_MATERIAL_TABS[activeTab]} Summary
            </Typography>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
              Print
            </Button>
          </Box>

          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            {tabMaterials.map((m) => (
              <motion.div
                key={m._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ marginBottom: "1rem" }}
              >
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={2}>
                      <Typography>{new Date(m.date).toLocaleDateString()}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>{m.supplierName}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>{m.supplierBags}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography>{m.bagsAfterStd}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Typography>{m.totalWeight}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>{m.totalCost}</Typography>
                    </Grid>
                    <Grid item xs={2} display="flex" justifyContent="flex-end" gap={1}>
                      <IconButton color="error" onClick={() => handleDelete(m._id)}>
                        <Delete />
                      </IconButton>
                      <IconButton onClick={() => toggleExpand(m._id)}>
                        <ExpandMore />
                      </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                      <Collapse in={m.expanded}>
                        <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
                          <Typography>Supplier Phone: {m.supplierPhone}</Typography>
                          <Typography>Extra Kg: {m.extraKg}</Typography>
                          <Typography>Storekeeper: {m.storeKeeper}</Typography>
                          <Typography>Supervisor: {m.supervisor}</Typography>
                          <Typography>Location: {m.location}</Typography>
                          <Typography>Batch Number: {m.batchNumber}</Typography>
                        </Box>
                      </Collapse>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            ))}

            <Box mt={2}>
              <Typography variant="subtitle1">
                Grand Total Cost: {grandTotalCost} 
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
