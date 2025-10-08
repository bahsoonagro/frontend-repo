// src/components/FinishedProducts.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Grid, TextField, Select, MenuItem,
  InputLabel, FormControl, Paper, Typography, IconButton, Tabs, Tab, Tooltip, TableSortLabel
} from "@mui/material";
import { Delete, Print, FileDownload } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/finished-products";

const FINISHED_PRODUCTS_TABS = [
  { label: "Bennimix", products: ["Bennimix 400g", "Bennimix 50g"] },
  { label: "Pikinmix", products: ["Pikinmix 500g", "Pikinmix 1kg", "Pikinmix 1.5kg", "Pikinmix 2kg", "Pikinmix 4kg", "Pikinmix 5kg"] },
  { label: "Supermix", products: ["Supermix 50g"] }
];

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function FinishedProducts() {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    productName: "",
    batchNumber: "",
    productionDate: "",
    openingQty: "",
    newStock: "",
    totalStock: "",
    qtyOut: "",
    balance: "",
    remarks: "",
  });
  const [products, setProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const printRef = useRef();

  // Fetch all finished products
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form changes and auto-calculate totalStock & balance
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let updated = { ...prev, [name]: value };

      const opening = parseFloat(updated.openingQty) || 0;
      const newS = parseFloat(updated.newStock) || 0;
      const qtyOut = parseFloat(updated.qtyOut) || 0;

      updated.totalStock = opening + newS;
      updated.balance = updated.totalStock - qtyOut;

      return updated;
    });
  };

  // Save product
  const handleSave = async () => {
    const requiredFields = ["productName", "batchNumber", "productionDate"];
    for (let field of requiredFields) {
      if (!formData[field]) return alert("Please fill all required fields!");
    }

    try {
      const prodDate = new Date(formData.productionDate);
      const month = prodDate.toLocaleString("default", { month: "long" });
      const week = Math.ceil(prodDate.getDate() / 7);

      const payload = {
        productName: formData.productName,
        batchNumber: formData.batchNumber,
        date: formData.productionDate,
        openingQty: parseFloat(formData.openingQty) || 0,
        newStock: parseFloat(formData.newStock) || 0,
        totalStock: parseFloat(formData.totalStock) || 0,
        qtyOut: parseFloat(formData.qtyOut) || 0,
        balance: parseFloat(formData.balance) || 0,
        remarks: formData.remarks,
        month,
        week,
        rows: [
          {
            productName: formData.productName,
            stockRef: formData.batchNumber,
            openingStock: parseFloat(formData.openingQty) || 0,
            stockIn: parseFloat(formData.newStock) || 0,
            stockOut: parseFloat(formData.qtyOut) || 0,
            totalQuantity: parseFloat(formData.totalStock) || 0,
          }
        ]
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setProducts([...products, data]);
      setFormData({
        productName: "", batchNumber: "", productionDate: "",
        openingQty: "", newStock: "", totalStock: "", qtyOut: "", balance: "", remarks: ""
      });
    } catch (err) {
      console.error("Save error:", err.message);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });

    const sorted = [...products].sort((a, b) => {
      if (key === "date") {
        const aTime = new Date(a[key]).getTime();
        const bTime = new Date(b[key]).getTime();
        return direction === "asc" ? aTime - bTime : bTime - aTime;
      }
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setProducts(sorted);
  };

  // Format date DD/MM/YYYY
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Print table
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Finished Products</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:5px;text-align:center;}th{background-color:#1976d2;color:#fff;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  const filteredProducts = products.filter(p => FINISHED_PRODUCTS_TABS[currentTab].products.includes(p.productName));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>
        Finished Products
      </Typography>

      <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} sx={{ mb: 3 }}>
        {FINISHED_PRODUCTS_TABS.map((tab, i) => <Tab key={i} label={tab.label} />)}
      </Tabs>

      {/* Input Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Product</InputLabel>
              <Select name="productName" value={formData.productName} onChange={handleChange} label="Product">
                {FINISHED_PRODUCTS_TABS[currentTab].products.map((p, i) => <MenuItem key={i} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField name="batchNumber" label="Batch Number" size="small" value={formData.batchNumber} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField name="productionDate" label="Date" type="date" size="small"
              value={formData.productionDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField name="openingQty" label="Opening Qty" type="number" size="small"
              value={formData.openingQty} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField name="newStock" label="New Stock" type="number" size="small"
              value={formData.newStock} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField name="totalStock" label="Total Stock" type="number" size="small"
              value={formData.totalStock} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField name="qtyOut" label="Qty Out" type="number" size="small"
              value={formData.qtyOut} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField name="balance" label="Balance" type="number" size="small"
              value={formData.balance} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField name="remarks" label="Remarks" size="small"
              value={formData.remarks} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="success" onClick={handleSave}>
              Save Product
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Print + Export */}
      <Box mb={2} display="flex" gap={2}>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print Table</Button>
        <Button variant="outlined" startIcon={<FileDownload />}>Export Excel</Button>
        <Button variant="outlined" startIcon={<FileDownload />}>Export PDF</Button>
      </Box>

      {/* Table */}
      <Box ref={printRef}>
        <Paper elevation={3} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>
                  <TableSortLabel
                    active={sortConfig.key === "productName"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("productName")}
                    sx={{ color: "#fff" }}
                  >
                    Product Name
                  </TableSortLabel>
                </th>
                <th style={thStyle}>Batch Number</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Opening Qty</th>
                <th style={thStyle}>New Stock</th>
                <th style={thStyle}>Total Stock</th>
                <th style={thStyle}>Qty Out</th>
                <th style={thStyle}>Balance</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.map((prod) => (
                  <motion.tr key={prod._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td style={tdStyle}>{prod.productName}</td>
                    <td style={tdStyle}>{prod.batchNumber}</td>
                    <td style={tdStyle}>{formatDate(prod.date)}</td>
                    <td style={tdStyle}>{prod.openingQty}</td>
                    <td style={tdStyle}>{prod.newStock}</td>
                    <td style={tdStyle}>{prod.totalStock}</td>
                    <td style={tdStyle}>{prod.qtyOut}</td>
                    <td style={tdStyle}>{prod.balance}</td>
                    <td style={tdStyle}>{prod.remarks}</td>
                    <td style={tdStyle}>
                      <Tooltip title="Delete">
                        <IconButton color="error" size="small" onClick={() => handleDelete(prod._id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </motion.tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "10px" }}>No finished products found.</td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}
