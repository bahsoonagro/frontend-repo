// src/components/RawMaterials.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete, Print, FileDownload } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// 🌍 Backend Endpoints
const RAW_API = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const STOCK_API = "https://backend-repo-ydwt.onrender.com/api/stock-movements";

// 🎨 Table Styling
const thStyle = {
  padding: "6px",
  border: "1px solid #000",
  textAlign: "center",
};
const tdStyle = {
  padding: "6px",
  border: "1px solid #000",
  textAlign: "center",
};

export default function RawMaterials() {
  const [formData, setFormData] = useState({
    materialName: "",
    batchNumber: "",
    dateReceived: "",
    quantity: "",
    unit: "",
    supplier: "",
    remarks: "",
  });

  const [materials, setMaterials] = useState([]);
  const printRef = useRef();

  // 📥 Fetch Raw Materials
  const fetchMaterials = async () => {
    try {
      const res = await fetch(RAW_API);
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // 📝 Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Save Raw Material AND Create Stock Movement
  const handleSave = async () => {
    if (
      !formData.materialName ||
      !formData.batchNumber ||
      !formData.dateReceived ||
      !formData.quantity ||
      !formData.unit
    ) {
      alert("All required fields must be filled!");
      return;
    }

    const cleanedData = {
      ...formData,
      quantity: Number(formData.quantity) || 0,
      dateReceived: new Date(formData.dateReceived),
    };

    try {
      // 1️⃣ Save Raw Material
      const res = await fetch(RAW_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });
      if (!res.ok) throw new Error(await res.text());
      const newMaterial = await res.json();

      setMaterials([...materials, newMaterial]);

      // 2️⃣ Also Create Stock Movement (type = IN)
      await fetch(STOCK_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchNumber: newMaterial.batchNumber,
          itemName: newMaterial.materialName,
          movementDate: newMaterial.dateReceived,
          movementType: "IN",
          quantity: newMaterial.quantity,
          unit: newMaterial.unit,
          remarks: `Received from ${newMaterial.supplier}`,
        }),
      });

      // 3️⃣ Reset Form
      setFormData({
        materialName: "",
        batchNumber: "",
        dateReceived: "",
        quantity: "",
        unit: "",
        supplier: "",
        remarks: "",
      });
    } catch (err) {
      console.error("Save error:", err.message);
    }
  };

  // ❌ Delete Raw Material
  const handleDelete = async (id) => {
    try {
      await fetch(`${RAW_API}/${id}`, { method: "DELETE" });
      setMaterials(materials.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  // 📊 Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      materials.map((m) => ({
        "Batch Number": m.batchNumber,
        "Material": m.materialName,
        "Date Received": new Date(m.dateReceived).toLocaleDateString(),
        Quantity: m.quantity,
        Unit: m.unit,
        Supplier: m.supplier,
        Remarks: m.remarks,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raw Materials");
    XLSX.writeFile(wb, "RawMaterials.xlsx");
  };

  // 📑 Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Raw Materials", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [
        [
          "Batch No.",
          "Material",
          "Date Received",
          "Quantity",
          "Unit",
          "Supplier",
          "Remarks",
        ],
      ],
      body: materials.map((m) => [
        m.batchNumber,
        m.materialName,
        new Date(m.dateReceived).toLocaleDateString(),
        m.quantity,
        m.unit,
        m.supplier,
        m.remarks,
      ]),
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    });
    doc.save("RawMaterials.pdf");
  };

  // 🖨️ Print
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Raw Materials</title>");
    WinPrint.document.write(
      "<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:5px;text-align:center;}th{background-color:#1976d2;color:#fff;}</style>"
    );
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 3, color: "#1976d2" }}
      >
        Raw Materials
      </Typography>

      {/* Input Form */}
      <Paper elevation={6} sx={{ p: 2, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <TextField
              name="materialName"
              label="Material"
              size="small"
              value={formData.materialName}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              name="batchNumber"
              label="Batch Number"
              size="small"
              value={formData.batchNumber}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              name="dateReceived"
              label="Date Received"
              type="date"
              size="small"
              value={formData.dateReceived}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              size="small"
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              name="unit"
              label="Unit"
              size="small"
              value={formData.unit}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              name="supplier"
              label="Supplier"
              size="small"
              value={formData.supplier}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="remarks"
              label="Remarks"
              size="small"
              value={formData.remarks}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
            >
              Save Raw Material
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Print + Export */}
      <Box mb={2} display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
        >
          Print Table
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={exportExcel}
        >
          Export Excel
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={exportPDF}
        >
          Export PDF
        </Button>
      </Box>

      {/* Table */}
      <Box ref={printRef}>
        <Paper
          elevation={3}
          sx={{ borderRadius: 3, overflowX: "auto" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              <tr>
                <th style={thStyle}>Batch No.</th>
                <th style={thStyle}>Material</th>
                <th style={thStyle}>Date Received</th>
                <th style={thStyle}>Quantity</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>Supplier</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {materials.map((mat) => (
                  <motion.tr
                    key={mat._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td style={tdStyle}>{mat.batchNumber}</td>
                    <td style={tdStyle}>{mat.materialName}</td>
                    <td style={tdStyle}>
                      {new Date(mat.dateReceived).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>{mat.quantity}</td>
                    <td style={tdStyle}>{mat.unit}</td>
                    <td style={tdStyle}>{mat.supplier}</td>
                    <td style={tdStyle}>{mat.remarks}</td>
                    <td style={tdStyle}>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(mat._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </motion.tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "10px" }}
                    >
                      No raw materials found.
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
