import React, { useState, useEffect, useRef } from "react";
import { Box, Button, IconButton, Tooltip, Paper } from "@mui/material";
import { Delete } from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/finished-products";

export default function FinishedProducts() {
  const [products, setProducts] = useState([]);
  const [totals, setTotals] = useState({});
  const printRef = useRef();
  const LOW_STOCK_THRESHOLD = 50;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
      calculateTotals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateClosing = (prod) =>
    Number(prod.openingStock || 0) + Number(prod.stockIn || 0) - Number(prod.stockOut || 0);

  const calculateTotals = (data) => {
    const totalOpening = data.reduce((sum, p) => sum + Number(p.openingStock || 0), 0);
    const totalIn = data.reduce((sum, p) => sum + Number(p.stockIn || 0), 0);
    const totalOut = data.reduce((sum, p) => sum + Number(p.stockOut || 0), 0);
    setTotals({
      openingStock: totalOpening,
      stockIn: totalIn,
      stockOut: totalOut,
      closing: totalOpening + totalIn - totalOut,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updated = products.filter((p) => p._id !== id);
      setProducts(updated);
      calculateTotals(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      products.map((p, i) => ({
        SNo: i + 1,
        Product: p.productName,
        "Opening Stock": p.openingStock,
        "Stock In": p.stockIn,
        "Total Qty": Number(p.openingStock) + Number(p.stockIn),
        "Stock Out": p.stockOut,
        "Closing Stock": calculateClosing(p),
        "Store Keeper": p.storeKeeper,
        Remarks: p.remarks,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finished Products");
    XLSX.writeFile(wb, "FinishedProducts.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Bennimix Food Company Inventory - Finished Products", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [
        ["S/N", "Product", "Opening Stock", "Stock In", "Total Qty", "Stock Out", "Closing Stock", "Store Keeper", "Remarks"],
      ],
      body: products.map((p, i) => {
        const closing = calculateClosing(p);
        return [
          i + 1,
          p.productName,
          p.openingStock,
          p.stockIn,
          Number(p.openingStock) + Number(p.stockIn),
          p.stockOut,
          { content: closing, styles: { fillColor: closing < LOW_STOCK_THRESHOLD ? [255, 204, 204] : [255, 255, 255] } },
          p.storeKeeper,
          p.remarks,
        ];
      }),
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    });
    doc.save("FinishedProducts.pdf");
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=1000,height=700");
    WinPrint.document.write(`
      <html>
        <head>
          <title>Finished Products Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #000; padding: 6px; text-align: center; }
            th { background-color: #1976d2; color: #fff; }
            tr:nth-child(even) { background-color: #f5f5f5; }
            .low-stock { background-color: #ffcccc; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">Bennimix Food Company Inventory - Finished Products</h2>
          ${printContent}
        </body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
  const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary" onClick={exportExcel}>
          Export Excel
        </Button>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Export PDF
        </Button>
        <Button variant="contained" color="success" onClick={handlePrint}>
          Print Table
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }} ref={printRef}>
        <table>
          <thead>
            <tr>
              <th style={thStyle}>S/N</th>
              <th style={thStyle}>Product</th>
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
            {products.map((prod, i) => {
              const closing = calculateClosing(prod);
              const lowStock = closing < LOW_STOCK_THRESHOLD;
              return (
                <tr
                  key={i}
                  style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff" }}
                  className={lowStock ? "low-stock" : ""}
                >
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{prod.productName}</td>
                  <td style={tdStyle}>{prod.openingStock}</td>
                  <td style={tdStyle}>{prod.stockIn}</td>
                  <td style={tdStyle}>{Number(prod.openingStock) + Number(prod.stockIn)}</td>
                  <td style={tdStyle}>{prod.stockOut}</td>
                  <td style={tdStyle}>
                    <Tooltip title={`Opening ${prod.openingStock} + In ${prod.stockIn} − Out ${prod.stockOut}`}>
                      <span>{closing}</span>
                    </Tooltip>
                  </td>
                  <td style={tdStyle}>{prod.storeKeeper}</td>
                  <td style={tdStyle}>{prod.remarks}</td>
                  <td style={tdStyle}>
                    <Tooltip title="Delete">
                      <IconButton color="error" size="small" onClick={() => handleDelete(prod._id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
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
  );
}
