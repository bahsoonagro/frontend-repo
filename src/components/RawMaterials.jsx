import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Grid, TextField, Paper, Typography, IconButton } from "@mui/material";
import { Delete, Edit, Print, Inventory } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const RAW_MATERIALS_TABS = ["Sorghum", "Pigeon Peas", "Sesame Seeds", "Rice", "Sugar"];

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function RawMaterials() {
  const [currentTab, setCurrentTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    openingQty: "",
    newStock: "",
    stockOut: "",
    totalStock: 0,
    balance: 0,
    requisitionNumber: "",
    remarks: "",
    location: "",
    batchNumber: "",
    storeKeeper: "",
    supervisor: "",
  });
  const [editId, setEditId] = useState(null);
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
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (["openingQty", "newStock", "stockOut"].includes(name)) {
        const opening = Number(updated.openingQty || 0);
        const newS = Number(updated.newStock || 0);
        const out = Number(updated.stockOut || 0);
        updated.totalStock = opening + newS;
        updated.balance = updated.totalStock - out;
      }
      return updated;
    });
  };

  const handleSaveMaterial = async () => {
    try {
      const payload = {
        rawMaterialType: RAW_MATERIALS_TABS[currentTab],
        ...formData,
        openingQty: Number(formData.openingQty || 0),
        newStock: Number(formData.newStock || 0),
        stockOut: Number(formData.stockOut || 0),
        totalStock: Number(formData.totalStock || 0),
        balance: Number(formData.balance || 0),
      };

      let res;
      if (editId) {
        res = await axios.put(`${API_URL}/${editId}`, payload);
        setMaterials((prev) => prev.map((m) => (m._id === editId ? res.data : m)));
        setEditId(null);
      } else {
        res = await axios.post(API_URL, payload);
        setMaterials((prev) => [...prev, res.data]);
      }

      setFormData({
        date: new Date().toISOString().substring(0, 10),
        openingQty: "",
        newStock: "",
        stockOut: "",
        totalStock: 0,
        balance: 0,
        requisitionNumber: "",
        remarks: "",
        location: "",
        batchNumber: "",
        storeKeeper: "",
        supervisor: "",
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error saving material. Check required fields.");
    }
  };

  const handleEdit = (m) => {
    setFormData({
      date: new Date(m.date).toISOString().substring(0, 10),
      openingQty: m.openingQty,
      newStock: m.newStock,
      stockOut: m.stockOut,
      totalStock: m.totalStock,
      balance: m.balance,
      requisitionNumber: m.requisitionNumber,
      remarks: m.remarks,
      location: m.location,
      batchNumber: m.batchNumber,
      storeKeeper: m.storeKeeper,
      supervisor: m.supervisor,
    });
    setEditId(m._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Filter materials by tab
  const filteredMaterials = materials.filter(
    (m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]
  );

  // fallback in case filtering fails
  const displayMaterials = filteredMaterials.length > 0 ? filteredMaterials : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <Button
            key={i}
            variant={currentTab === i ? "contained" : "outlined"}
            onClick={() => setCurrentTab(i)}
            sx={{ mr: 1 }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {/* Simple Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <TextField
              label="Opening Qty"
              name="openingQty"
              type="number"
              value={formData.openingQty}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="New Stock"
              name="newStock"
              type="number"
              value={formData.newStock}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Stock Out"
              name="stockOut"
              type="number"
              value={formData.stockOut}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Total Stock"
              value={formData.totalStock}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Balance"
              value={formData.balance}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSaveMaterial}>
              {editId ? "Update" : "Save"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            <tr>
              <th style={thStyle}>S/N</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Opening Qty</th>
              <th style={thStyle}>New Stock</th>
              <th style={thStyle}>Total Stock</th>
              <th style={thStyle}>Stock Out</th>
              <th style={thStyle}>Balance</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {displayMaterials.map((m, i) => (
                <motion.tr
                  key={m._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{new Date(m.date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{m.openingQty}</td>
                  <td style={tdStyle}>{m.newStock}</td>
                  <td style={tdStyle}>{m.totalStock}</td>
                  <td style={tdStyle}>{m.stockOut}</td>
                  <td style={tdStyle}>{m.balance}</td>
                  <td style={tdStyle}>
                    <IconButton size="small" onClick={() => handleEdit(m)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(m._id)}>
                      <Delete />
                    </IconButton>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </Paper>
    </Box>
  );
}
