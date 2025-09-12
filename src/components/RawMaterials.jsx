// src/components/RawMaterialManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

const crops = ["Sorghum", "Pigeon Peas", "Other"]; // add more crop types as needed

export default function RawMaterialManagement({ apiUrl, storeKeepers, supervisors }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [rawMaterialData, setRawMaterialData] = useState([]);
  const [formData, setFormData] = useState({
    rawMaterialType: "",
    supplierName: "",
    supplierPhone: "",
    supplierBags: 0,
    extraKg: 0,
    bagsAfterStd: 0,
    totalWeight: 0,
    storeKeeper: "",
    supervisor: "",
    location: "",
    batchNumber: "",
    date: "",
    damaged: "No",
    lpoNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch raw material data
  useEffect(() => {
    if (!apiUrl) return;
    fetchRawMaterials();
  }, [apiUrl]);

  const fetchRawMaterials = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/raw-material`);
      setRawMaterialData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load raw materials.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-calculate bagsAfterStd and extraKg
  useEffect(() => {
    const totalKg = parseFloat(formData.totalWeight) || 0;
    const standardizedBags = Math.floor(totalKg / 50);
    const leftoverKg = totalKg % 50;
    setFormData((prev) => ({
      ...prev,
      bagsAfterStd: standardizedBags,
      extraKg: leftoverKg,
    }));
  }, [formData.totalWeight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "rawMaterialType",
      "supplierName",
      "supplierPhone",
      "supplierBags",
      "totalWeight",
      "storeKeeper",
      "supervisor",
      "location",
      "batchNumber",
      "date",
    ];
    for (const f of requiredFields) {
      if (!formData[f]) {
        setError(`Please fill in ${f}`);
        return;
      }
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/api/raw-material`, {
        ...formData,
        supplierBags: Number(formData.supplierBags),
        totalWeight: Number(formData.totalWeight),
        bagsAfterStd: Number(formData.bagsAfterStd),
        extraKg: Number(formData.extraKg),
      });

      setRawMaterialData((prev) => [res.data, ...prev]);
      setSuccessMsg("Raw material recorded successfully!");
      setFormData({
        rawMaterialType: "",
        supplierName: "",
        supplierPhone: "",
        supplierBags: 0,
        extraKg: 0,
        bagsAfterStd: 0,
        totalWeight: 0,
        storeKeeper: "",
        supervisor: "",
        location: "",
        batchNumber: "",
        date: "",
        damaged: "No",
        lpoNumber: "",
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to save raw material.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => {
    setCurrentTab(newValue);
  };

  const handlePrint = () => {
    const table = document.getElementById("raw-material-table")?.outerHTML;
    if (!table) return;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Raw Materials</title>
      <style>
        table { width: 100%; border-collapse: collapse; font-family: Arial; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #3b82f6; color: white; }
        tr:nth-child(even) { background-color: #f8fafc; }
        tr:hover { background-color: #e0f2fe; }
      </style></head><body>${table}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleExport = () => {
    const table = document.getElementById("raw-material-table");
    if (!table) return;
    const rows = Array.from(table.querySelectorAll("tr"));
    const csv = rows
      .map((r) =>
        Array.from(r.querySelectorAll("th, td"))
          .map((c) => `"${c.innerText}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raw-materials.csv";
    a.click();
  };

  return (
    <Box className="p-4 max-w-6xl mx-auto">
      <Typography variant="h5" className="mb-4 text-blue-600 font-bold">
        🌾 Raw Material Management
      </Typography>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <FormControl fullWidth>
          <InputLabel>Crop Type</InputLabel>
          <Select name="rawMaterialType" value={formData.rawMaterialType} onChange={handleChange}>
            {crops.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField name="supplierName" label="Supplier Name" value={formData.supplierName} onChange={handleChange} fullWidth />
        <TextField name="supplierPhone" label="Supplier Phone" value={formData.supplierPhone} onChange={handleChange} fullWidth />
        <TextField name="supplierBags" type="number" label="Supplier Bags" value={formData.supplierBags} onChange={handleChange} fullWidth />
        <TextField name="totalWeight" type="number" label="Total Weight (Kg)" value={formData.totalWeight} onChange={handleChange} fullWidth />
        <TextField name="storeKeeper" label="Store Keeper" value={formData.storeKeeper} onChange={handleChange} fullWidth />
        <TextField name="supervisor" label="Supervisor" value={formData.supervisor} onChange={handleChange} fullWidth />
        <TextField name="location" label="Location" value={formData.location} onChange={handleChange} fullWidth />
        <TextField name="batchNumber" label="Batch Number" value={formData.batchNumber} onChange={handleChange} fullWidth />
        <TextField name="date" type="date" label="Date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Damaged</InputLabel>
          <Select name="damaged" value={formData.damaged} onChange={handleChange}>
            <MenuItem value="No">No</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
          </Select>
        </FormControl>
        <TextField name="bagsAfterStd" label="Standardized Bags" value={formData.bagsAfterStd} InputProps={{ readOnly: true }} fullWidth />
        <TextField name="extraKg" label="Remaining Kg" value={formData.extraKg} InputProps={{ readOnly: true }} fullWidth />
        <TextField name="lpoNumber" label="LPO Number" value={formData.lpoNumber} onChange={handleChange} fullWidth />

        <Button type="submit" variant="contained" className="col-span-1 md:col-span-3 bg-emerald-500 hover:bg-emerald-600">
          {loading ? "Saving..." : "💾 Save Raw Material"}
        </Button>
      </form>

      {error && <Box className="mb-4 text-red-600 font-semibold">{error}</Box>}
      {successMsg && <Box className="mb-4 text-green-600 font-semibold">{successMsg}</Box>}

      <Tabs value={currentTab} onChange={handleTabChange} className="mb-4">
        {crops.map((c, idx) => (
          <Tab key={c} label={c} />
        ))}
      </Tabs>

      {crops.map((crop, idx) => (
        <Box key={crop} hidden={currentTab !== idx}>
          <Box className="overflow-x-auto border rounded">
            <table className="w-full text-left text-sm" id="raw-material-table">
              <thead>
                <tr>
                  {[
                    "Supplier",
                    "Phone",
                    "Bags Supplied",
                    "Total Weight",
                    "Standardized Bags",
                    "Remaining Kg",
                    "Store Keeper",
                    "Supervisor",
                    "Location",
                    "Batch",
                    "Date",
                    "Damaged",
                    "LPO",
                  ].map((h) => (
                    <th key={h} className="p-2 border bg-blue-500 text-white">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawMaterialData
                  .filter((r) => r.rawMaterialType === crop)
                  .map((r, i) => (
                    <tr key={r._id || i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="p-2 border">{r.supplierName}</td>
                      <td className="p-2 border">{r.supplierPhone}</td>
                      <td className="p-2 border">{r.supplierBags}</td>
                      <td className="p-2 border">{r.totalWeight}</td>
                      <td className="p-2 border">{r.bagsAfterStd}</td>
                      <td className="p-2 border">{r.extraKg}</td>
                      <td className="p-2 border">{r.storeKeeper}</td>
                      <td className="p-2 border">{r.supervisor}</td>
                      <td className="p-2 border">{r.location}</td>
                      <td className="p-2 border">{r.batchNumber}</td>
                      <td className="p-2 border">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="p-2 border">{r.damaged}</td>
                      <td className="p-2 border">
                        {r.lpoNumber ? (
                          <a href={`${apiUrl}/lpo/${r.lpoNumber}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                            {r.lpoNumber}
                          </a>
                        ) : "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Box>
        </Box>
      ))}

      <Box className="flex gap-4 mt-4">
        <Button onClick={handlePrint} className="bg-emerald-500 hover:bg-emerald-600 text-white">🖨️ Print</Button>
        <Button onClick={handleExport} className="bg-emerald-500 hover:bg-emerald-600 text-white">📤 Export CSV</Button>
      </Box>
    </Box>
  );
}

// Default props
RawMaterialManagement.defaultProps = {
  apiUrl: "",
  storeKeepers: [],
  supervisors: [],
};
