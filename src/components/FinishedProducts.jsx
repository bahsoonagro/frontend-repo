// src/components/FinishedProducts.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Grid, TextField, Select, MenuItem,
  InputLabel, FormControl, Paper, Typography, IconButton, Tabs, Tab, Tooltip
} from "@mui/material";
import { Delete, Print, FileDownload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FINISHED_PRODUCTS_TABS = [
  { label: "Bennimix", products: ["Bennimix 400g", "Bennimix 50g"] },
  { label: "Pikinmix", products: ["Pikinmix 500g", "Pikinmix 1kg", "Pikinmix 1.5Kg", "Pikinmix 2kg", "Pikinmix 4kg", "Pikinmix 5kg"] },
  { label: "Supermix", products: ["Supermix 50g"] }
];

export default function FinishedProducts() {
  const [formData, setFormData] = useState({
    productName: "",
    batchNumber: "",
    productionDate: "",
    quantityKg: "",
    unit: "",
    remarks: "",
  });

  const [products, setProducts] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const printRef = useRef();

  useEffect(() => {
    fetch("https://backend-repo-ydwt.onrender.com/api/finished-products")
      .then((res) => res.json())
      .then((data) =>
        setProducts(
          data.map((p) => ({
            ...p,
            productionDate: p.productionDate ? new Date(p.productionDate) : new Date(),
          }))
        )
      )
      .catch((err) => console.error("Fetch error:", err));
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
      quantityKg: Number(formData.quantityKg),
      productionDate: new Date(formData.productionDate)
    };

    try {
      const res = await fetch("https://backend-repo-ydwt.onrender.com/api/finished-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData)
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
      await fetch(`https://backend-repo-ydwt.onrender.com/api/finished-products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    FINISHED_PRODUCTS_TABS[currentTab].products.includes(p.productName)
  );

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredProducts.map((p, i) => ({
        "S/N": i + 1,
        "Product": p.productName,
        "Batch Number": p.batchNumber,
        "Production Date": new Date(p.productionDate).toLocaleDateString(),
        "Quantity (Kg)": p.quantityKg,
        "Unit": p.unit,
        "Remarks": p.remarks
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FinishedProducts");
    XLSX.writeFile(wb, "FinishedProducts.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Finished Products", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [["S/N","Product","Batch No.","Production Date","Qty (Kg)","Unit","Remarks"]],
      body: filteredProducts.map((p, i) => [
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
    WinPrint.document.write("<html><head><title>Print</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:5px;text-align:center;}th{background-color:#1976d2;color:#fff;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>Finished Products</Typography>

      {/* Form */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={2}><TextField label="Batch No." size="small" name="batchNumber" value={formData.batchNumber} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Production Date" type="date" size="small" name="productionDate" value={formData.productionDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Qty (Kg)" type="number" size="small" name="quantityKg" value={formData.quantityKg} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={1}><TextField label="Unit" size="small" name="unit" value={formData.unit} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Remarks" size="small" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12}><Button variant="contained" color="success" onClick={handleSave}>Save</Button></Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
        {FINISHED_PRODUCTS_TABS.map((tab, i) => <Tab key={i} label={tab.label} />)}
      </Tabs>

      {/* Actions */}
      <Box mb={2} display="flex" gap={2}>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportExcel}>Export Excel</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportPDF}>Export PDF</Button>
      </Box>

      {/* Table */}
      <Paper ref={printRef} elevation={3} sx={{ borderRadius: 3, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            <tr>
              <th>S/N</th>
              <th>Product</th>
              <th>Batch No.</th>
              <th>Production Date</th>
              <th>Qty (Kg)</th>
              <th>Unit</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((prod, i) => (
              <tr key={prod._id}>
                <td>{i + 1}</td>
                <td>{prod.productName}</td>
                <td>{prod.batchNumber}</td>
                <td>{new Date(prod.productionDate).toLocaleDateString()}</td>
                <td>{prod.quantityKg}</td>
                <td>{prod.unit}</td>
                <td>{prod.remarks}</td>
                <td>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(prod._id)}><Delete /></IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </Paper>
    </Box>
  );
}
