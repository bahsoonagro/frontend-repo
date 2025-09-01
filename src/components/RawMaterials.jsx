import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { ExpandMore, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = "https://your-backend-url.com/api/raw-materials";

const RAW_MATERIALS = ["Sesame Seeds", "Sorghum", "Maize", "Groundnut", "Rice", "Wheat"];

export default function RawMaterialsStage1() {
  const [step, setStep] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    rawMaterialType: "",
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

  // Fetch data from backend
  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setMaterials(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const bagsAfterStd = Math.floor(formData.supplierBags || 0);
  const totalWeight = bagsAfterStd * 50 + Number(formData.extraKg || 0);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSave = () => {
    const newEntry = { ...formData, bagsAfterStd, totalWeight };
    axios
      .post(API_URL, newEntry)
      .then((res) => {
        setMaterials([...materials, res.data]);
        setFormData({
          rawMaterialType: "",
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>
        Raw Material Entry
      </Typography>

      {/* Multi-Step Form */}
      <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        {step === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Supplier Name"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                fullWidth
                placeholder="Enter supplier name"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Supplier Phone"
                name="supplierPhone"
                value={formData.supplierPhone}
                onChange={handleChange}
                fullWidth
                placeholder="Enter supplier phone"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Raw Material</InputLabel>
                <Select
                  name="rawMaterialType"
                  value={formData.rawMaterialType}
                  onChange={handleChange}
                  label="Raw Material"
                >
                  {RAW_MATERIALS.map((m, i) => (
                    <MenuItem key={i} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Supplier Quantity (bags)"
                name="supplierBags"
                type="number"
                value={formData.supplierBags}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next →
              </Button>
            </Grid>
          </Grid>
        )}

        {step === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Extra Kg"
                name="extraKg"
                type="number"
                value={formData.extraKg}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Bags After Standardization"
                value={bagsAfterStd}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Total Weight (kg)"
                value={totalWeight}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={2}>
              <Button variant="outlined" color="secondary" onClick={handlePrev}>
                ← Previous
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next →
              </Button>
            </Grid>
          </Grid>
        )}

        {step === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Store Keeper"
                name="storeKeeper"
                value={formData.storeKeeper}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Supervisor"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Batch Number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Date of Entry"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" gap={2}>
              <Button variant="outlined" color="secondary" onClick={handlePrev}>
                ← Previous
              </Button>
              <Button variant="contained" color="success" onClick={handleSave}>
                Save Entry
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Summary Table */}
      {materials.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Raw Material Summary
          </Typography>
          {materials.map((m) => (
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
                    <Typography>{m.rawMaterialType}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{m.supplierName}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography>{m.bagsAfterStd}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography>{m.totalWeight}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>{m.batchNumber}</Typography>
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
                      </Box>
                    </Collapse>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          ))}
        </Paper>
      )}
    </Box>
  );
}
