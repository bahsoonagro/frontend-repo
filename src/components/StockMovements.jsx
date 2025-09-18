// src/components/StockManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const API_URL = "/api/stock-movements"; // backend route

export default function StockManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "IN",
    requisitionNo: "",
    rawMaterial: "",
    batchNumber: "",
    quantityBags: "",
    weightRemovedKg: "",
    weightReceivedKg: "",
    storeman: "",
    cleaningReceiver: "",
    notes: "",
  });
  const [editId, setEditId] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setRows(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save (create/update)
  const handleSave = async () => {
    try {
      if (editId) {
        const res = await axios.put(`${API_URL}/${editId}`, form);
        setRows((prev) =>
          prev.map((row) => (row._id === editId ? res.data : row))
        );
      } else {
        const res = await axios.post(API_URL, form);
        setRows((prev) => [...prev, res.data]);
      }
      setOpen(false);
      setForm({
        type: "IN",
        requisitionNo: "",
        rawMaterial: "",
        batchNumber: "",
        quantityBags: "",
        weightRemovedKg: "",
        weightReceivedKg: "",
        storeman: "",
        cleaningReceiver: "",
        notes: "",
      });
      setEditId(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Delete row
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRows((prev) => prev.filter((row) => row._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Open edit
  const handleEdit = (row) => {
    setForm(row);
    setEditId(row._id);
    setOpen(true);
  };

  // Table columns
  const columns = [
    { field: "type", headerName: "Type", width: 100 },
    { field: "requisitionNo", headerName: "Requisition No", width: 150 },
    { field: "rawMaterial", headerName: "Raw Material", width: 150 },
    { field: "batchNumber", headerName: "Batch No", width: 120 },
    { field: "quantityBags", headerName: "Bags", width: 100 },
    { field: "weightRemovedKg", headerName: "Removed (Kg)", width: 130 },
    { field: "weightReceivedKg", headerName: "Received (Kg)", width: 130 },
    { field: "storeman", headerName: "Storeman", width: 120 },
    { field: "cleaningReceiver", headerName: "Receiver", width: 120 },
    { field: "notes", headerName: "Notes", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleEdit(params.row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Stock Movement Management</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => setOpen(true)}
        >
          Add Stock Movement
        </Button>
      </Paper>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id}
        autoHeight
        loading={loading}
        disableSelectionOnClick
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
      />

      {/* Dialog Form */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {editId ? "Edit Stock Movement" : "Add Stock Movement"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <MenuItem value="IN">IN</MenuItem>
                <MenuItem value="OUT">OUT</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Requisition No"
                fullWidth
                name="requisitionNo"
                value={form.requisitionNo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Raw Material"
                fullWidth
                name="rawMaterial"
                value={form.rawMaterial}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Batch Number"
                fullWidth
                name="batchNumber"
                value={form.batchNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Quantity (Bags)"
                fullWidth
                name="quantityBags"
                value={form.quantityBags}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Weight Removed (Kg)"
                fullWidth
                name="weightRemovedKg"
                value={form.weightRemovedKg}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Weight Received (Kg)"
                fullWidth
                name="weightReceivedKg"
                value={form.weightReceivedKg}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Storeman"
                fullWidth
                name="storeman"
                value={form.storeman}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Receiver"
                fullWidth
                name="cleaningReceiver"
                value={form.cleaningReceiver}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
