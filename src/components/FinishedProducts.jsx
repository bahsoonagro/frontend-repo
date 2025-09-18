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
import { Delete, Print, FileDownload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

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

// Backend API
const API_URL = "https://backend-repo-ydwt.onrender.com/api/finished-products";

export default function FinishedProducts() {
  const [formData, setFormData] = useState({
    productName: "",
    openingStock: "",
    stockIn: 0,
    stockOut: 0,
    storeKeeper: "",
    remarks: "",
  });

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const printRef = useRef();

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.productName || formData.openingStock === "") return;

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      fetchProducts();
      setFormData({
        productName: "",
        openingStock: "",
        stockIn: 0,
        stockOut: 0,
        storeKeeper: "",
        remarks: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product._id);
  };

  const calculateClosing = (product) =>
    Number(product.openingStock || 0) + Number(product.stockIn || 0) - Number(product.stockOut || 0);

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

  // Excel export
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      products.map((p, i) => ({
        "S/N": i + 1,
        "Stock Item": p.productName,
        "Opening Stock": p.openingStock,
        "Stock In": p.stockIn,
        "Total Qty": Number(p.openingStock) + Number(p.stockIn),
        "Stock Out": p.stockOut,
        "Closing Stock": calculateClosing(p),
        "Store Keeper": p.storeKeeper,
        "Remarks": p.remarks,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finished Products");
    XLSX.writeFile(wb, "FinishedProducts.xlsx");
  };

  // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Bennimix Food Company - Finished Products Inventory", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [["S/N","Stock Item","Opening Stock","Stock In","Total Qty","Stock Out","Closing Stock","Store Keeper","Remarks"]],
      body: products.map((p, i) => [
        i + 1,
        p.productName,
        p.openingStock,
        p.stockIn,
        Number(p.openingStock) + Number(p.stockIn),
        p.stockOut,
        calculateClosing(p),
        p.storeKeeper,
        p.remarks
      ]),
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    });
    doc.save("FinishedProducts.pdf");
  };

  // Print clean table
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Finished Product Inventory</title>");
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
          <Grid item xs={6} sm={2}>
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
              name="remarks"
              label="Remarks"
              size="small"
              value={formData.remarks}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button variant="contained" color="success" onClick={handleSave}>
              {editingId ? "Update Product" : "Save Product"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table + Print + Export */}
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

      <Box ref={printRef}>
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
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, i) => (
                <tr
                  key={prod._id}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff",
                  }}
                >
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{prod.productName}</td>
                  <td style={tdStyle}>{prod.openingStock}</td>
                  <td style={tdStyle}>{prod.stockIn}</td>
                  <td style={tdStyle}>{Number(prod.openingStock) + Number(prod.stockIn)}</td>
                  <td style={tdStyle}>{prod.stockOut}</td>
                  <td style={tdStyle}>{calculateClosing(prod)}</td>
                  <td style={tdStyle}>{prod.storeKeeper}</td>
                  <td style={tdStyle}>{prod.remarks}</td>
                  <td style={tdStyle}>
                    <Tooltip title="Edit">
                      <IconButton color="primary" size="small" onClick={() => handleEdit(prod)}>
                        ✏️
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" size="small" onClick={() => handleDelete(prod._id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "10px" }}>
                    No finished products found.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
              <tr>
                <td style={tdStyle} colSpan={2}>Totals</td>
                <td style={tdStyle}>{totals.openingStock}</td>
                <td style={tdStyle}>{totals.stockIn}</td>
                <td style={tdStyle}>{totals.openingStock + totals.stockIn}</td>
                <td style={tdStyle}>{totals.stockOut}</td>
                <td style={tdStyle}>{totals.closing}</td>
                <td style={tdStyle}></td>
                <td style={tdStyle}></td>
                <td style={tdStyle}></td>
              </tr>
            </tfoot>
          </table>
        </Paper>
      </Box>
    </Box>
  );
}

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
