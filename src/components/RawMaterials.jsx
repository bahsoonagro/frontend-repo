import React, { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(API_URL);
        setMaterials(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };
    fetchMaterials();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={2}>
        Raw Materials Table
      </Typography>
      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            <tr>
              <th style={{ border: "1px solid #000", padding: "6px" }}>S/N</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Type</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Date</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Opening Qty</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>New Stock</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Total Stock</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Stock Out</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {materials.length > 0 ? (
              materials.map((m, i) => (
                <tr key={m._id} style={{ textAlign: "center" }}>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{i + 1}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{m.rawMaterialType}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{new Date(m.date).toLocaleDateString()}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{m.openingQty}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{m.newStock}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{m.totalStock}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{m.stockOut}</td>
                  <td style={{ border: "1px solid #000", padding: "6px" }}>{m.balance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ border: "1px solid #000", padding: "6px" }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Paper>
    </Box>
  );
}
