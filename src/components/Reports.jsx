// src/components/StockReports.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Alert,
} from "@mui/material";
import { Print, FileDownload } from "@mui/icons-material";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const StockReports = ({ apiUrl }) => {
  const [tab, setTab] = useState(0);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tableRef = useRef();

  useEffect(() => {
    fetchAll();
  }, [apiUrl, tab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await axios.get(`${apiUrl}/api/documents`);
        setDocuments(res.data);
      } else if (tab === 1) {
        const res = await axios.get(`${apiUrl}/api/raw-materials`);
        setRawMaterials(res.data);
      } else if (tab === 2) {
        const res = await axios.get(`${apiUrl}/api/finished-products`);
        setFinishedProducts(res.data);
      } else if (tab === 3) {
        const res = await axios.get(`${apiUrl}/api/customer-deliveries`);
        setCustomers(res.data);
      }
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    setError("");
  };

  const handlePrint = () => {
    const printContent = tableRef.current.outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Report</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #1976d2; color: white; }
      </style>
    </head><body>${printContent}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const exportExcel = (data, name) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const exportPDF = (columns, data, name) => {
    const doc = new jsPDF();
    doc.autoTable({ head: [columns], body: data });
    doc.save(`${name}.pdf`);
  };

  const renderTable = () => {
    if (tab === 0) {
      const columns = ["Type", "Ref No", "Date", "Customer", "Actions"];
      return (
        <table style={{ width: "100%", borderCollapse: "collapse" }} ref={tableRef}>
          <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
            <tr>{columns.map((c, i) => <th key={i} style={thStyle}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr><td colSpan={5} style={tdStyleCenter}>No documents</td></tr>
            ) : documents.map((d, i) => (
              <tr key={d._id} style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                <td style={tdStyle}>{d.type}</td>
                <td style={tdStyle}>{d.refNo}</td>
                <td style={tdStyle}>{new Date(d.date).toLocaleString()}</td>
                <td style={tdStyle}>{d.customer || "-"}</td>
                <td style={tdStyle}>
                  <Button variant="outlined" size="small" href={`${apiUrl}/api/documents/download/${d._id}`} target="_blank">Download</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (tab === 1) {
      const columns = ["Material", "Batch", "Qty (Bags)", "Weight (Kg)"];
      return (
        <table style={{ width: "100%", borderCollapse: "collapse" }} ref={tableRef}>
          <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
            <tr>{columns.map((c, i) => <th key={i} style={thStyle}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rawMaterials.length === 0 ? (
              <tr><td colSpan={4} style={tdStyleCenter}>No raw materials</td></tr>
            ) : rawMaterials.map((r, i) => (
              <tr key={r._id} style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                <td style={tdStyle}>{r.name}</td>
                <td style={tdStyle}>{r.batch}</td>
                <td style={tdStyle}>{r.quantityBags}</td>
                <td style={tdStyle}>{r.weightKg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (tab === 2) {
      const columns = ["Product", "Batch", "Qty", "Packaging Date"];
      return (
        <table style={{ width: "100%", borderCollapse: "collapse" }} ref={tableRef}>
          <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
            <tr>{columns.map((c, i) => <th key={i} style={thStyle}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {finishedProducts.length === 0 ? (
              <tr><td colSpan={4} style={tdStyleCenter}>No finished products</td></tr>
            ) : finishedProducts.map((f, i) => (
              <tr key={f._id} style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                <td style={tdStyle}>{f.name}</td>
                <td style={tdStyle}>{f.batch}</td>
                <td style={tdStyle}>{f.quantity}</td>
                <td style={tdStyle}>{new Date(f.packagingDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (tab === 3) {
      const columns = ["Customer", "Ref No", "Date", "Delivered Items"];
      return (
        <table style={{ width: "100%", borderCollapse: "collapse" }} ref={tableRef}>
          <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
            <tr>{columns.map((c, i) => <th key={i} style={thStyle}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={4} style={tdStyleCenter}>No deliveries</td></tr>
            ) : customers.map((c, i) => (
              <tr key={c._id} style={{ backgroundColor: i % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.refNo}</td>
                <td style={tdStyle}>{new Date(c.date).toLocaleString()}</td>
                <td style={tdStyle}>{c.items.map(it => `${it.name} (${it.qty})`).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">📄 Stock & Documents Hub</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Documents" />
        <Tab label="Raw Materials" />
        <Tab label="Finished Products" />
        <Tab label="Customer Deliveries" />
      </Tabs>

      {/* Print & Export */}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={() => {
          if (tab === 0) exportExcel(documents, "Documents");
          else if (tab === 1) exportExcel(rawMaterials, "RawMaterials");
          else if (tab === 2) exportExcel(finishedProducts, "FinishedProducts");
          else if (tab === 3) exportExcel(customers, "CustomerDeliveries");
        }}>Export Excel</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={() => {
          if (tab === 0) exportPDF(["Type","Ref","Date","Customer","Actions"], documents.map(d=>[d.type,d.refNo,new Date(d.date).toLocaleString(),d.customer||"-","Download"]), "Documents");
          else if (tab === 1) exportPDF(["Material","Batch","Qty","Weight"], rawMaterials.map(r=>[r.name,r.batch,r.quantityBags,r.weightKg]), "RawMaterials");
          else if (tab === 2) exportPDF(["Product","Batch","Qty","Packaging"], finishedProducts.map(f=>[f.name,f.batch,f.quantity,f.packagingDate]), "FinishedProducts");
          else if (tab === 3) exportPDF(["Customer","Ref","Date","Items"], customers.map(c=>[c.name,c.refNo,new Date(c.date).toLocaleString(),c.items.map(it=>`${it.name}(${it.qty})`).join(", ")]), "CustomerDeliveries");
        }}>Export PDF</Button>
      </Box>

      {/* Table */}
      <Paper elevation={3}>
        <Box sx={{ overflowX: "auto" }}>
          {loading ? <Typography sx={{ p: 2 }}>Loading...</Typography> : renderTable()}
        </Box>
      </Paper>
    </Box>
  );
};

// Styles
const thStyle = { padding: "8px", border: "1px solid #333", textAlign: "left" };
const tdStyle = { padding: "8px", border: "1px solid #ccc" };
const tdStyleCenter = { padding: "8px", border: "1px solid #ccc", textAlign: "center", color: "#777" };

export default StockReports;
