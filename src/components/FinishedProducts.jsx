import React, { useState, useRef } from "react";
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
import { Delete, Print, Info } from "@mui/icons-material";

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

const INITIAL_STOCK = [
  { productName: "Bennimix 50g", openingStock: 100, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
  { productName: "Bennimix 400g", openingStock: 200, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
  { productName: "Pikinmix 2kg", openingStock: 1089, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
  { productName: "Pikinmix 1kg", openingStock: 1965, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
  { productName: "Supermix 50g", openingStock: 14, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
  { productName: "Pikinmix 4kg", openingStock: 20, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
  { productName: "Pikinmix 5kg", openingStock: 2, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
  { productName: "Pikinmix 500g", openingStock: 25, stockIn: 0, stockOut: 0, storeKeeper: "", deptHead: "" },
];

export default function FinishedProducts() {
  const [formData, setFormData] = useState({
    productName: "",
    openingStock: "",
    stockIn: 0,
    stockOut: 0,
    storeKeeper: "",
    deptHead: "",
  });

  const [products, setProducts] = useState(INITIAL_STOCK);
  const [editingIndex, setEditingIndex] = useState(null);
  const printRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.productName || formData.openingStock === "") return;

    if (editingIndex !== null) {
      const updated = [...products];
      updated[editingIndex] = { ...formData };
      setProducts(updated);
      setEditingIndex(null);
    } else {
      setProducts([...products, formData]);
    }

    setFormData({
      productName: "",
      openingStock: "",
      stockIn: 0,
      stockOut: 0,
      storeKeeper: "",
      deptHead: "",
    });
  };

  const handleDelete = (index) => {
    setProducts(products.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setFormData(products[index]);
    setEditingIndex(index);
  };

  const calculateClosing = (product) =>
    Number(product.openingStock || 0) + Number(product.stockIn || 0) - Number(product.stockOut || 0);

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

  const totals = products.reduce(
    (acc, p) => {
      acc.openingStock += Number(p.openingStock || 0);
      acc.stockIn += Number(p.stockIn || 0);
      acc.stockOut += Number(p.stockOut || 0);
      acc.closing += calculateClosing(p);
      return acc;
    },
    { openingStock: 0, stockIn: 0, stockOut: 0, closing: 0 }
  );

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
          <Grid item xs={6} sm={3}>
            <TextField
              name="storeKeeper"
              label="Store Keeper"
              size="small"
              value={formData.storeKeeper}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              name="deptHead"
              label="Packaging Dept Head"
              size="small"
              value={formData.deptHead}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button variant="contained" color="success" onClick={handleSave}>
              {editingIndex !== null ? "Update Product" : "Save Product"}
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
                <th style={thStyle}>Opening Stock</th>
                <th style={thStyle}>Stock In</th>
                <th style={thStyle}>Total Qty</th>
                <th style={thStyle}>Stock Out</th>
                <th style={thStyle}>Closing Stock</th>
                <th style={thStyle}>Store Keeper</th>
                <th style={thStyle}>Dept Head</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, i) => (
                <tr
                  key={i}
                  style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff", cursor: "pointer" }}
                >
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>
                    <Tooltip
                      title={`Opening: ${prod.openingStock}, In: ${prod.stockIn}, Out: ${prod.stockOut}, Closing: ${calculateClosing(
                        prod
                      )}`}
                      arrow
                    >
                      <span>{prod.productName} <Info sx={{ fontSize: 16 }} /></span>
                    </Tooltip>
                  </td>
                  <td style={tdStyle}>{prod.openingStock}</td>
                  <td style={tdStyle}>{prod.stockIn}</td>
                  <td style={tdStyle}>{Number(prod.openingStock) + Number(prod.stockIn)}</td>
                  <td style={tdStyle}>{prod.stockOut}</td>
                  <td style={tdStyle}>{calculateClosing(prod)}</td>
                  <td style={tdStyle}>{prod.storeKeeper}</td>
                  <td style={tdStyle}>{prod.deptHead}</td>
                  <td style={tdStyle}>
                    <Tooltip title="Edit">
                      <IconButton color="primary" size="small" onClick={() => handleEdit(i)}>
                        ✏️
                      </IconButton>
                    </Tooltip>
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
                  <td colSpan="10" style={{ textAlign: "center", padding: "10px" }}>
                    No products in stock.
                  </td>
                </tr>
              )}
              <tr style={{ backgroundColor: "#1976d2", color: "#fff", fontWeight: "bold" }}>
                <td style={tdStyle} colSpan={2}>TOTAL</td>
                <td style={tdStyle}>{totals.openingStock}</td>
                <td style={tdStyle}>{totals.stockIn}</td>
                <td style={tdStyle}>{totals.openingStock + totals.stockIn}</td>
                <td style={tdStyle}>{totals.stockOut}</td>
                <td style={tdStyle}>{totals.closing}</td>
                <td style={tdStyle}></td>
                <td style={tdStyle}></td>
                <td style={tdStyle}></td>
              </tr>
            </tbody>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}

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
