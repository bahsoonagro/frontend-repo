// src/components/FinishedProducts.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Grid, TextField, Select, MenuItem,
  InputLabel, FormControl, Paper, Typography, IconButton, Tabs, Tab, Tooltip
} from "@mui/material";
import { Delete, Print, FileDownload } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/finished-products";

const FINISHED_PRODUCTS_TABS = [
  {
    label: "Bennimix",
    products: ["Bennimix 400g", "Bennimix 50g"]
  },
  {
    label: "Pikinmix",
    products: ["Pikinmix 500g", "Pikinmix 1kg", "Pikinmix 1.5kg", "Pikinmix 2kg", "Pikinmix 4kg", "Pikinmix 5kg"]
  },
  {
    label: "Supermix",
    products: ["Supermix 50g"]
  }
];

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function FinishedProducts() {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    productName: "",
    batchNumber: "",
    productionDate: "",
    quantityKg: "",
    unit: "",
    remarks: "",
  });
  const [products, setProducts] = useState([]);
  const printRef = useRef();

  // Fetch all finished products from backend
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.productName || !formData.batchNumber || !formData.productionDate || !formData.quantityKg || !formData.unit) {
      alert("All required fields must be filled!");
      return;
    }

    const cleanedData = {
      ...formData,
      quantityKg: Number(formData.quantityKg) || 0,
      productionDate: new Date(formData.productionDate),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setProducts([...products, data]);

      setFormData({
        productName: "",
        batchNumber: "",
        productionDate: "",
        quantityKg: "",
        unit: "",
        remarks: "",
      });
    } catch (err) {
      console.error("Save error:", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const exportExcel = () => {
    const filtered = products.filter(p => FINISHED_PRODUCTS_TABS[currentTab].products.includes(p.productName));
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((p, i) => ({
        "S/N": i + 1,
        "Product": p.productName,
        "Batch Number": p.batchNumber,
        "Production Date": new Date(p.productionDate).toLocaleDateString(),
        "Quantity (Kg)": p.quantityKg,
        "Unit": p.unit,
        "Remarks": p.remarks,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finished Products");
    XLSX.writeFile(wb, "FinishedProducts.xlsx");
  };

  const exportPDF = () => {
    const filtered = products.filter(p => FINISHED_PRODUCTS_TABS[currentTab].products.includes(p.productName));
    const doc = new jsPDF();
    doc.text(`${FINISHED_PRODUCTS_TABS[currentTab].label} - Finished Products`, 14, 15);
    doc.autoTable({
      startY: 20,
      head: [["S/N","Product","Batch Number","Production Date","Quantity (Kg)","Unit","Remarks"]],
      body: filtered.map((p, i) => [
        i + 1,
        p.productName,
        p.batchNumber,
        new Date(p.productionDate).toLocaleDateString(),
        p.quantityKg,
        p.unit,
        p.remarks
      ]),
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    });
    doc.save("FinishedProducts.pdf");
  };

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

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} sx={{ mb: 3 }}>
        {FINISHED_PRODUCTS_TABS.map((tab, i) => <Tab key={i} label={tab.label} />)}
      </Tabs>

      {/* Input Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Product</InputLabel>
              <Select
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                label="Product"
              >
                {FINISHED_PRODUCTS_TABS[currentTab].products.map((p, i) => (
                  <MenuItem key={i} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField name="batchNumber" label="Batch Number" size="small"
              value={formData.batchNumber} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField name="productionDate" label="Production Date" type="date" size="small"
              value={formData.productionDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField name="quantityKg" label="Quantity (Kg)" type="number" size="small"
              value={formData.quantityKg} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField name="unit" label="Unit" size="small"
              value={formData.unit} onChange={handleChange} fullWidth />
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
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
          Print Table
        </Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportExcel}>
          Export Excel
        </Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportPDF}>
          Export PDF
        </Button>
      </Box>

      {/* Table */}
      <Box ref={printRef}>
        <Paper elevation={3} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>S/N</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Batch No.</th>
                <th style={thStyle}>Production Date</th>
                <th style={thStyle}>Quantity (Kg)</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.map((prod, i) => (
                  <motion.tr key={prod._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>{prod.productName}</td>
                    <td style={tdStyle}>{prod.batchNumber}</td>
                    <td style={tdStyle}>{new Date(prod.productionDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>{prod.quantityKg}</td>
                    <td style={tdStyle}>{prod.unit}</td>
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
                    <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                      No finished products found.
                    </td>
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
