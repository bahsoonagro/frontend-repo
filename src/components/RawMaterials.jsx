import React, { useState, useEffect } from "react";
import { Paper, Typography, Button, Box } from "@mui/material";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";
const RAW_MATERIALS_TABS = ["Sorghum", "Pigeon Peas", "Sesame Seeds", "Rice", "Sugar"];

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

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

  const filteredMaterials = materials.filter(
    (m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]
  );

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Raw Materials
      </Typography>

      {/* Tabs */}
      <Box mb={2}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <Button
            key={i}
            variant={currentTab === i ? "contained" : "outlined"}
            onClick={() => setCurrentTab(i)}
            sx={{ mr: 1 }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      <Paper elevation={3} style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            <tr>
              <th style={{ border: "1px solid #000", padding: "6px" }}>S/N</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Date</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Opening Qty</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>New Stock</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Stock Out</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Total Stock</th>
              <th style={{ border: "1px solid #000", padding: "6px" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((m, i) => (
              <tr key={m._id}>
                <td style={{ border: "1px solid #000", padding: "6px" }}>{i + 1}</td>
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
