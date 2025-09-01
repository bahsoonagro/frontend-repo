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
  Tooltip,
} from "@mui/material";
import { Delete, Print, Edit } from "@mui/icons-material";

const FINISHED_PRODUCTS = [
  "Bennimix 400g",
  "Bennimix 50g",
  "Pikinmix 500g",
  "Pikinmix 1kg",
  "Pikinmix 2kg",
  "Pikinmix (generic)",
  "Supermix 50g",
  "Pikinmix 4kg",
  "Pikinmix 5kg",
];

// Preloaded stock
const INITIAL_STOCK = [
  { productName: "Bennimix 50g", stockPack: "50gBMX", openingStock: 100 },
  { productName: "Bennimix 400g", stockPack: "400gBMX", openingStock: 200 },
  { productName: "Pikinmix 2kg", stockPack: "2kg", openingStock: 1089 },
  { productName: "Pikinmix 1kg", stockPack: "1kg(vision)", openingStock: 1965 },
  { productName: "Supermix 50g", stockPack: "50gSMX", openingStock: 14 },
  { productName: "Pikinmix 4kg", stockPack: "4kgPMX", openingStock: 20 },
  { productName: "Pikinmix 5kg", stockPack: "5kgPM", openingStock: 2 },
  { productName: "Pikinmix 500g", stockPack: "500gPMX", openingStock: 25 },
];

export default function FinishedProducts() {
  const [formData, setFormData] = useState({
    productName: "",
    stockPack: "",
    openingStock: "",
    stockIn: 0,
    stockOut: 0,
  });

  const [products, setProducts] = useState(INITIAL_STOCK);
  const printRef = useRef();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add / Update product
  const handleSave = () => {
    if (!formData.productName || !formData.stockPack || !formData.openingStock) return;

    // Check if already exists
    const existingIndex = products.findIndex(
      (p) => p.productName === formData.productName && p.stockPack === formData.stockPack
    );

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...products];
      updated[existingIndex] = { ...updated[existingIndex], ...formData };
      setProducts(updated);
    } else {
      setProducts([...products, formData]);
    }

    setFormData({
      productName: "",
      stockPack: "",
      openingStock: "",
      stockIn: 0,
      stockOut: 0,
    });
  };

  const handleDelete = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Calculate closing stock
  const calculateClosing = (product) => {
    return Number(product.openingStock || 0) + Number(product.stockIn || 0) - Number(product.stockOut || 0);
  };

  // Print table only
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Finished Product Inventory</title></head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#1976d2" }}>
        Finished Products Inventory
      </Typography>

      {/* Input Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Product</InputLabel>
              <Select
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                label="Product"
              >
                {FINISHED_PRODUCTS.map((p, i) => (
                  <MenuItem key={i} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              name="stockPack"
              label="Stock Pack"
              size="small"
              value={formData.stockPack}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              name="openingStock"
              label="Opening Stock"
              type="number"
              size="small"
              value={formData.openingStock}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              name="stockIn"
              label="Stock In"
              type="number"
              size="small"
              value={formData.stockIn}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              name="stockOut"
              label="Stock Out"
              type="number"
              size="small"
              value={formData.stockOut}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button variant="contained" color="success" onClick={handleSave}>
              Save / Update
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table + Print */}
      <Box ref={printRef}>
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
            Print Table
          </Button>
        </Box>
        <Paper elevation={3} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>S/N</th>
                <th style={thStyle}>Stock Item</th>
                <th style={thStyle}>Stock Pack</th>
                <th style={thStyle}>Opening Stock</th>
                <th style={thStyle}>Stock In</th>
                <th style={thStyle}>Total Qty</th>
                <th style={thStyle}>Stock Out</th>
                <th style={thStyle}>Closing Stock</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{prod.productName}</td>
                  <td style={tdStyle}>{prod.stockPack}</td>
                  <td style={tdStyle}>{prod.openingStock}</td>
                  <td style={tdStyle}>{prod.stockIn}</td>
                  <td style={tdStyle}>{Number(prod.openingStock) + Number(prod.stockIn)}</td>
                  <td style={tdStyle}>{prod.stockOut}</td>
                  <td style={tdStyle}>{calculateClosing(prod)}</td>
                  <td style={tdStyle}>
                    <Tooltip title="Delete">
                      <IconButton color="error" size="small" onClick={() => handleDelete(i)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "10px" }}>
                    No products in stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}

// Styles
const thStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "center",
};

const tdStyle = {
  padding: "6px",
  border: "1px solid #ccc",
  textAlign: "center",
};
