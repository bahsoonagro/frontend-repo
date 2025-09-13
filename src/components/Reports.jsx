// src/pages/Reporting.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { Print, FileDownload } from "@mui/icons-material";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Reporting = ({ apiUrl }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tableRef = useRef();

  const tabConfig = [
    { label: "Raw Materials", endpoint: "/api/raw-materials" },
    { label: "Finished Products", endpoint: "/api/finished-products" },
    { label: "Stock Movements", endpoint: "/api/stock-movements" },
    { label: "LPOs & Requisitions", endpoint: "/api/raw-materials/lpo" },
    { label: "Customer Deliveries", endpoint: "/api/dispatch-delivery" },
  ];

  useEffect(() => {
    fetchTabData(tabConfig[activeTab].endpoint);
  }, [activeTab]);

  const fetchTabData = async (endpoint) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${apiUrl}${endpoint}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch data.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
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

  const exportExcel = () => {
    if (!data || data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tabConfig[activeTab].label);
    XLSX.writeFile(wb, `${tabConfig[activeTab].label}.xlsx`);
  };

  const exportPDF = () => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const rows = data.map((item) => columns.map((col) => item[col] || "-"));
    doc.autoTable({ head: [columns], body: rows });
    doc.save(`${tabConfig[activeTab].label}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">📊 Reporting</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {tabConfig.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>

      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>Print</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportExcel}>Export Excel</Button>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={exportPDF}>Export PDF</Button>
      </Box>

      <Paper ref={tableRef} elevation={3}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
              <tr>
                {data.length > 0 ? Object.keys(data[0]).map((key) => (
                  <th key={key} style={{ padding: 8, border: "1px solid #333" }}>{key}</th>
                )) : <th style={{ padding: 8, border: "1px solid #333" }}>No Data</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} style={{ padding: 8, textAlign: "center" }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} style={{ padding: 8, textAlign: "center" }}>No records</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                    {Object.keys(row).map((col) => (
                      <td key={col} style={{ padding: 8, border: "1px solid #ccc" }}>
                        {typeof row[col] === "object" && row[col] !== null ? JSON.stringify(row[col]) : row[col]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default Reporting;
