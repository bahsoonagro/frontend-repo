import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  Typography,
  Alert,
} from "@mui/material";
import { FileDownload, Print } from "@mui/icons-material";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Table styles
const thStyle = { padding: "8px", border: "1px solid #333", textAlign: "left" };
const tdStyle = { padding: "8px", border: "1px solid #ccc" };
const tdStyleCenter = { padding: "8px", border: "1px solid #ccc", textAlign: "center", color: "#777" };

const Reporting = ({ apiUrl }) => {
  const [tabValue, setTabValue] = useState(0);
  const [lpos, setLPOs] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [finishedProducts, setFinishedProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const tableRef = useRef();

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lpoRes, rmRes, fpRes, smRes] = await Promise.all([
        axios.get(`${apiUrl}/raw-material/lpo`),
        axios.get(`${apiUrl}/raw-material`),
        axios.get(`${apiUrl}/finished-products`),
        axios.get(`${apiUrl}/stock-movements`),
      ]);
      setLPOs(lpoRes.data);
      setRawMaterials(rmRes.data);
      setFinishedProducts(fpRes.data);
      setStockMovements(smRes.data);
    } catch (err) {
      setError("Failed to fetch reporting data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  // Export Excel
  const exportExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Export PDF
  const exportPDF = (head, body, filename) => {
    const doc = new jsPDF();
    doc.autoTable({ head: [head], body });
    doc.save(`${filename}.pdf`);
  };

  // Print table
  const printTable = () => {
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        📄 Reporting
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
        <Tab label="LPOs" />
        <Tab label="Raw Materials" />
        <Tab label="Finished Products" />
        <Tab label="Stock Movements" />
      </Tabs>

      {/* LPOs */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>LPOs</Typography>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportExcel(lpos.map(l => ({
              LPONo: l._id, Year: l.year, Supplier: l.supplier,
              Items: l.items.map(i => `${i.name}(${i.quantity})`).join(", "),
              Payment: l.payment, Comments: l.comments
            })), "LPOs")}>Export Excel</Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportPDF(
              ["LPONo","Year","Supplier","Items","Payment","Comments"],
              lpos.map(l => [l._id, l.year, l.supplier, l.items.map(i => `${i.name}(${i.quantity})`).join(", "), l.payment, l.comments || "-"]),
              "LPOs"
            )}>Export PDF</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={printTable}>Print</Button>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <table ref={tableRef} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
                <tr>
                  <th style={thStyle}>LPO No</th>
                  <th style={thStyle}>Year</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Items</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {lpos.length === 0 ? (
                  <tr><td colSpan={6} style={tdStyleCenter}>No LPOs</td></tr>
                ) : lpos.map(l => (
                  <tr key={l._id} style={{ backgroundColor: "#f5f5f5" }}>
                    <td style={tdStyle}>{l._id}</td>
                    <td style={tdStyle}>{l.year}</td>
                    <td style={tdStyle}>{l.supplier}</td>
                    <td style={tdStyle}>{l.items.map(i => `${i.name}(${i.quantity})`).join(", ")}</td>
                    <td style={tdStyle}>{l.payment}</td>
                    <td style={tdStyle}>{l.comments || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Raw Materials */}
      {tabValue === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Raw Materials</Typography>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportExcel(rawMaterials.map(r => ({
              Type: r.rawMaterialType,
              Supplier: r.supplierName,
              QuantityBags: r.supplierBags,
              ExtraKg: r.extraKg,
              TotalWeight: r.totalWeight,
              StoreKeeper: r.storeKeeper,
              BatchNumber: r.batchNumber,
              Date: new Date(r.date).toLocaleDateString()
            })), "RawMaterials")}>Export Excel</Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportPDF(
              ["Type","Supplier","Bags","Extra Kg","Total Weight","StoreKeeper","Batch","Date"],
              rawMaterials.map(r => [r.rawMaterialType, r.supplierName, r.supplierBags, r.extraKg, r.totalWeight, r.storeKeeper, r.batchNumber, new Date(r.date).toLocaleDateString()]),
              "RawMaterials"
            )}>Export PDF</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={printTable}>Print</Button>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <table ref={tableRef} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
                <tr>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Bags</th>
                  <th style={thStyle}>Extra Kg</th>
                  <th style={thStyle}>Total Weight</th>
                  <th style={thStyle}>Store Keeper</th>
                  <th style={thStyle}>Batch</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {rawMaterials.length === 0 ? (
                  <tr><td colSpan={8} style={tdStyleCenter}>No Raw Materials</td></tr>
                ) : rawMaterials.map(r => (
                  <tr key={r._id} style={{ backgroundColor: "#f5f5f5" }}>
                    <td style={tdStyle}>{r.rawMaterialType}</td>
                    <td style={tdStyle}>{r.supplierName}</td>
                    <td style={tdStyle}>{r.supplierBags}</td>
                    <td style={tdStyle}>{r.extraKg}</td>
                    <td style={tdStyle}>{r.totalWeight}</td>
                    <td style={tdStyle}>{r.storeKeeper}</td>
                    <td style={tdStyle}>{r.batchNumber}</td>
                    <td style={tdStyle}>{new Date(r.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Finished Products */}
      {tabValue === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Finished Products</Typography>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportExcel(finishedProducts.map(f => ({
              Name: f.name,
              Quantity: f.quantity,
              Batch: f.batchNumber,
              Date: new Date(f.date).toLocaleDateString()
            })), "FinishedProducts")}>Export Excel</Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportPDF(
              ["Name","Quantity","Batch","Date"],
              finishedProducts.map(f => [f.name, f.quantity, f.batchNumber, new Date(f.date).toLocaleDateString()]),
              "FinishedProducts"
            )}>Export PDF</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={printTable}>Print</Button>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <table ref={tableRef} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Batch</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {finishedProducts.length === 0 ? (
                  <tr><td colSpan={4} style={tdStyleCenter}>No Finished Products</td></tr>
                ) : finishedProducts.map(f => (
                  <tr key={f._id} style={{ backgroundColor: "#f5f5f5" }}>
                    <td style={tdStyle}>{f.name}</td>
                    <td style={tdStyle}>{f.quantity}</td>
                    <td style={tdStyle}>{f.batchNumber}</td>
                    <td style={tdStyle}>{new Date(f.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Stock Movements */}
      {tabValue === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Stock Movements</Typography>
          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportExcel(stockMovements.map(m => ({
              RequisitionNo: m.requisitionNo,
              Date: new Date(m.dateTime).toLocaleString(),
              RawMaterial: m.rawMaterial,
              Batch: m.batchNumber,
              QtyBags: m.quantityBags,
              WeightRemoved: m.weightRemovedKg,
              WeightReceived: m.weightReceivedKg,
              Storeman: m.storeman,
              CleaningReceiver: m.cleaningReceiver,
              Remarks: m.remarks
            })), "StockMovements")}>Export Excel</Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportPDF(
              ["ReqNo","Date/Time","Raw Material","Batch","Qty","Weight Removed","Weight Received","Storeman","Receiver","Remarks"],
              stockMovements.map(m => [
                m.requisitionNo,
                new Date(m.dateTime).toLocaleString(),
                m.rawMaterial,
                m.batchNumber,
                m.quantityBags,
                m.weightRemovedKg,
                m.weightReceivedKg,
                m.storeman,
                m.cleaningReceiver,
                m.remarks || "-"
              ]),
              "StockMovements"
            )}>Export PDF</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={printTable}>Print</Button>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <table ref={tableRef} style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
                <tr>
                  <th style={thStyle}>Req. No</th>
                  <th style={thStyle}>Date/Time</th>
                  <th style={thStyle}>Raw Material</th>
                  <th style={thStyle}>Batch</th>
                  <th style={thStyle}>Qty (Bags)</th>
                  <th style={thStyle}>Weight Removed</th>
                  <th style={thStyle}>Weight Received</th>
                  <th style={thStyle}>Storeman</th>
                  <th style={thStyle}>Receiver</th>
                  <th style={thStyle}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.length === 0 ? (
                  <tr><td colSpan={10} style={tdStyleCenter}>No Stock Movements</td></tr>
                ) : stockMovements.map(m => (
                  <tr key={m._id} style={{ backgroundColor: "#f5f5f5" }}>
                    <td style={tdStyle}>{m.requisitionNo}</td>
                    <td style={tdStyle}>{new Date(m.dateTime).toLocaleString()}</td>
                    <td style={tdStyle}>{m.rawMaterial}</td>
                    <td style={tdStyle}>{m.batchNumber}</td>
                    <td style={tdStyle}>{m.quantityBags}</td>
                    <td style={tdStyle}>{m.weightRemovedKg}</td>
                    <td style={tdStyle}>{m.weightReceivedKg}</td>
                    <td style={tdStyle}>{m.storeman}</td>
                    <td style={tdStyle}>{m.cleaningReceiver}</td>
                    <td style={tdStyle}>{m.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

    </Box>
  );
};

export default Reporting;
