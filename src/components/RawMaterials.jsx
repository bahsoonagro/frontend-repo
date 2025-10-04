// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";
import { Paper, Typography } from "@mui/material";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(API_URL);
        console.log("Fetched materials:", res.data); // log to verify
        setMaterials(res.data);
      } catch (err) {
        console.error("Error fetching materials:", err.response?.data || err.message);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Raw Materials
      </Typography>
      <Paper elevation={3} style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            <tr>
              <th style={{ border: "1px solid #000", padding: "6px" }}>S/N</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Type</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Date</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Opening Qty</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>New Stock</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Stock Out</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Total Stock</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <tr key={m._id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{i + 1}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{m.rawMaterialType}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>
                  {new Date(m.date).toLocaleDateString()}
                </td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{m.openingQty}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{m.newStock}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{m.stockOut}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{m.totalStock}</td>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{m.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </div>
  );
}
