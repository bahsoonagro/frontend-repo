// src/components/RawMaterialManagement.jsx
import React, { useEffect, useState, useRef } from "react";
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
  Paper,
  Checkbox,
  ListItemText,
  OutlinedInput,
  IconButton,
  Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";

const crops = ["Sorghum", "Pigeon Peas", "Other"]; // use your exact list if different
const API_MATERIAL = "/api/raw-materials";
const API_LPO = "/api/lpo";

const btnSx = {
  background: "linear-gradient(90deg,#4caf50 0%,#2e7d32 100%)",
  color: "#fff",
  fontWeight: 600,
  "&:hover": { background: "linear-gradient(90deg,#66bb6a 0%,#2e7d32 100%)" },
  "&:active": { background: "linear-gradient(180deg,#1b5e20,#2e7d32)" },
};

export default function RawMaterialManagement({ apiUrl = "" }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const printRef = useRef();

  // compact raw material form state
  const [form, setForm] = useState({
    rawMaterialType: crops[0],
    supplierName: "",
    supplierPhone: "",
    supplierBags: 0,
    totalWeight: 0,
    bagsAfterStd: 0,
    extraKg: 0,
    storeKeeper: "",
    supervisor: "",
    location: "",
    batchNumber: "",
    date: "",
    damaged: "No",
    lpoNumber: "",
  });

  // LPO form state: select multiple batchNumbers to include
  const [lpo, setLpo] = useState({
    supplier: "",
    year: new Date().getFullYear(),
    payment: "",
    comments: "",
    items: [], // array of rawMaterial _id
  });

  useEffect(() => {
    if (!apiUrl) return; // require base apiUrl from props
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const fetchMaterials = async () => {
    try {
      setLoadingFetch(true);
      const res = await axios.get(`${apiUrl}${API_MATERIAL}`);
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load raw materials.");
    } finally {
      setLoadingFetch(false);
    }
  };

  // form handlers
  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // recalc standardized bags and leftover whenever totalWeight or supplierBags change
  useEffect(() => {
    const totalKg = Number(form.totalWeight) || 0;
    const bags = Math.floor(totalKg / 50);
    const leftover = Math.round(totalKg % 50);
    setForm((p) => ({ ...p, bagsAfterStd: bags, extraKg: leftover }));
  }, [form.totalWeight, form.supplierBags]); // keep supplierBags in deps if you want that to matter

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    // minimal validation
    const required = ["rawMaterialType", "supplierName", "supplierPhone", "supplierBags", "totalWeight", "storeKeeper", "supervisor", "location", "batchNumber", "date"];
    for (const key of required) {
      if (form[key] === "" || form[key] === null || form[key] === undefined) {
        setError(`Please fill ${key}`);
        return;
      }
    }

    try {
      const payload = {
        ...form,
        supplierBags: Number(form.supplierBags),
        totalWeight: Number(form.totalWeight),
        bagsAfterStd: Number(form.bagsAfterStd),
        extraKg: Number(form.extraKg),
      };
      const res = await axios.post(`${apiUrl}${API_MATERIAL}`, payload);
      // prepend new item
      setMaterials((p) => [res.data, ...p]);
      setSuccessMsg("Saved raw material.");
      // compactly reset most fields but keep crop same
      setForm((prev) => ({
        ...prev,
        supplierName: "",
        supplierPhone: "",
        supplierBags: 0,
        totalWeight: 0,
        bagsAfterStd: 0,
        extraKg: 0,
        storeKeeper: "",
        supervisor: "",
        location: "",
        batchNumber: "",
        date: "",
        damaged: "No",
        lpoNumber: "",
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to save raw material.");
    }
  };

  // LPO handlers
  const onLpoChange = (e) => {
    const { name, value } = e.target;
    setLpo((p) => ({ ...p, [name]: value }));
  };

  const onLpoItemsChange = (selectedIds) => {
    setLpo((p) => ({ ...p, items: selectedIds }));
  };

  // Save LPO: POST to /api/lpo (expects a PDF blob returned), then download and attach filename to selected materials
  const handleSaveLpo = async () => {
    if (!lpo.items || lpo.items.length === 0) {
      setError("Select at least one batch (item) for the LPO.");
      return;
    }
    setError("");
    try {
      const payload = { ...lpo };
      const res = await axios.post(`${apiUrl}${API_LPO}`, payload, { responseType: "blob" });

      // create filename and trigger download
      const ts = Date.now();
      const fileName = `LPO-${ts}.pdf`;
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // OPTIONAL: Update backend items to have lpoNumber (we PATCH each selected material)
      await Promise.all(
        lpo.items.map(async (id) => {
          try {
            await axios.patch(`${apiUrl}${API_MATERIAL}/${id}`, { lpoNumber: fileName });
            // update local copy
            setMaterials((prev) => prev.map((m) => (m._id === id ? { ...m, lpoNumber: fileName } : m)));
          } catch (e) {
            console.warn("Failed to attach LPO to material id", id, e);
          }
        })
      );

      // show print prompt: open in new window for quick print
      const w = window.open(url, "_blank");
      if (w) {
        // Allow the file to load then call print (best-effort)
        w.focus();
      }

      // reset LPO form (keep year)
      setLpo({ supplier: "", year: new Date().getFullYear(), payment: "", comments: "", items: [] });
      setSuccessMsg("LPO saved and downloaded.");
    } catch (err) {
      console.error(err);
      setError("Failed to save LPO.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`${apiUrl}${API_MATERIAL}/${id}`);
      setMaterials((p) => p.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete.");
    }
  };

  const handlePrintTable = () => {
    const tableHtml = printRef.current?.innerHTML;
    if (!tableHtml) return;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Raw Materials</title>
      <style>
        table{width:100%;border-collapse:collapse;font-family:Arial}
        th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}
        th{background:#1976d2;color:#fff}
        tr:nth-child(even){background:#f5f5f5}
        tr:hover{background:#e8f8ff}
      </style></head><body>${tableHtml}</body></html>`);
    w.document.close();
    w.print();
  };

  const handleExportCSV = () => {
    // export currently visible tab rows as CSV
    const visible = materials.filter((m) => m.rawMaterialType === crops[currentTab]);
    const headers = ["Supplier","Phone","Bags Supplied","Total Weight","Standardized Bags","Remaining Kg","Store Keeper","Supervisor","Location","Batch","Date","Damaged","LPO"];
    const rows = visible.map((r) => [
      r.supplierName || "",
      r.supplierPhone || "",
      r.supplierBags ?? 0,
      r.totalWeight ?? 0,
      r.bagsAfterStd ?? 0,
      r.extraKg ?? 0,
      r.storeKeeper || "",
      r.supervisor || "",
      r.location || "",
      r.batchNumber || "",
      r.date ? new Date(r.date).toLocaleDateString() : "",
      r.damaged || "",
      r.lpoNumber || ""
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raw-materials-${crops[currentTab]}.csv`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // derived lists for LPO selection: show batchNumbers for current tab
  const batchesForCurrentTab = materials.filter((m) => m.rawMaterialType === crops[currentTab]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#1976d2" }}>🌾 Raw Material Management</Typography>

      {/* compact forms container */}
      <Box component={Paper} elevation={3} sx={{ p: 2, mb: 3, maxWidth: 1100, mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Raw Material Entry</Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Crop Type</InputLabel>
            <Select name="rawMaterialType" value={form.rawMaterialType} label="Crop Type" onChange={onFormChange}>
              {crops.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField size="small" name="supplierName" label="Supplier Name" value={form.supplierName} onChange={onFormChange} fullWidth />
          <TextField size="small" name="supplierPhone" label="Supplier Phone" value={form.supplierPhone} onChange={onFormChange} fullWidth />

          <TextField size="small" name="supplierBags" label="Supplier Bags" type="number" value={form.supplierBags} onChange={onFormChange} fullWidth />
          <TextField size="small" name="totalWeight" label="Total Weight (Kg)" type="number" value={form.totalWeight} onChange={onFormChange} fullWidth />
          <TextField size="small" name="bagsAfterStd" label="Standardized Bags" value={form.bagsAfterStd} InputProps={{ readOnly: true }} fullWidth />

          <TextField size="small" name="extraKg" label="Remaining Kg" value={form.extraKg} InputProps={{ readOnly: true }} fullWidth />
          <TextField size="small" name="storeKeeper" label="Store Keeper" value={form.storeKeeper} onChange={onFormChange} fullWidth />
          <TextField size="small" name="supervisor" label="Supervisor" value={form.supervisor} onChange={onFormChange} fullWidth />

          <TextField size="small" name="location" label="Location" value={form.location} onChange={onFormChange} fullWidth />
          <TextField size="small" name="batchNumber" label="Batch Number" value={form.batchNumber} onChange={onFormChange} fullWidth />
          <TextField size="small" name="date" label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={onFormChange} fullWidth />

          <FormControl size="small">
            <InputLabel>Damaged</InputLabel>
            <Select name="damaged" value={form.damaged} label="Damaged" onChange={onFormChange} fullWidth>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
            </Select>
          </FormControl>

          <TextField size="small" name="lpoNumber" label="LPO Number (opt.)" value={form.lpoNumber} onChange={onFormChange} fullWidth />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button type="submit" sx={{ ...btnSx }}>💾 Save</Button>
            <Button sx={btnSx} onClick={() => { setForm((p) => ({ ...p, totalWeight: 0, supplierBags: 0, bagsAfterStd: 0, extraKg: 0 })); }}>Reset</Button>
          </Box>
        </Box>
      </Box>

      {/* LPO compact form */}
      <Box component={Paper} elevation={3} sx={{ p: 2, mb: 3, maxWidth: 1100, mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Create LPO (select batches)</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
          <TextField size="small" label="Supplier" name="supplier" value={lpo.supplier} onChange={onLpoChange} fullWidth />
          <TextField size="small" label="Year" name="year" type="number" value={lpo.year} onChange={onLpoChange} fullWidth />
          <TextField size="small" label="Payment" name="payment" value={lpo.payment} onChange={onLpoChange} fullWidth />
          <TextField size="small" label="Comments" name="comments" value={lpo.comments} onChange={onLpoChange} fullWidth />

          <FormControl fullWidth size="small" sx={{ gridColumn: "span 4" }}>
            <InputLabel>Select batches (current tab)</InputLabel>
            <Select
              multiple
              value={lpo.items}
              onChange={(e) => onLpoItemsChange(e.target.value)}
              input={<OutlinedInput label="Select batches (current tab)" />}
              renderValue={(selected) => (selected.length ? selected.map((id) => {
                const m = materials.find((x) => x._id === id);
                return m ? `${m.batchNumber} (${m.supplierName})` : id;
              }).join(", ") : "—")}
            >
              {batchesForCurrentTab.map((m) => (
                <MenuItem key={m._id} value={m._id}>
                  <Checkbox checked={lpo.items.indexOf(m._id) > -1} />
                  <ListItemText primary={`${m.batchNumber} — ${m.supplierName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ gridColumn: "span 4", display: "flex", gap: 1 }}>
            <Button sx={{ ...btnSx }} onClick={handleSaveLpo} startIcon={<DownloadIcon />}>Save & Download LPO</Button>
            <Button sx={{ ...btnSx }} onClick={() => setLpo({ supplier: "", year: new Date().getFullYear(), payment: "", comments: "", items: [] })}>Reset LPO</Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
        {crops.map((c, idx) => <Tab key={c} label={c} />)}
      </Tabs>

      {/* Tables — one per tab */}
      <Box ref={printRef}>
        <Box sx={{ overflowX: "auto", mb: 2 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Supplier","Phone","Bags Supplied","Total Weight","Standardized Bags","Remaining Kg",
                  "Store Keeper","Supervisor","Location","Batch","Date","Damaged","LPO","Actions"
                ].map((h) => (
                  <th key={h} style={{ padding: 10, border: "1px solid #e0e0e0", background: "#1976d2", color: "#fff", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.filter((m) => m.rawMaterialType === crops[currentTab]).map((r, i) => (
                <tr
                  key={r._id || i}
                  style={{
                    background: i % 2 === 0 ? "#f5f5f5" : "#fff",
                    transition: "background-color 0.18s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8f8ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#f5f5f5" : "#fff")}
                >
                  <td style={td}>{r.supplierName}</td>
                  <td style={td}>{r.supplierPhone}</td>
                  <td style={td}>{r.supplierBags}</td>
                  <td style={td}>{r.totalWeight}</td>
                  <td style={td}>{r.bagsAfterStd}</td>
                  <td style={td}>{r.extraKg}</td>
                  <td style={td}>{r.storeKeeper}</td>
                  <td style={td}>{r.supervisor}</td>
                  <td style={td}>{r.location}</td>
                  <td style={td}>{r.batchNumber}</td>
                  <td style={td}>{r.date ? new Date(r.date).toLocaleDateString() : ""}</td>
                  <td style={td}>{r.damaged}</td>
                  <td style={td}>
                    {r.lpoNumber ? (
                      <a href={`${apiUrl}/lpo/${r.lpoNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2e7d32", textDecoration: "underline" }}>
                        {r.lpoNumber}
                      </a>
                    ) : "-"}
                  </td>
                  <td style={td}>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(r._id)}><DeleteIcon /></IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
              {/* totals row for this tab */}
              <tr style={{ fontWeight: 700, background: "#f1f1f1" }}>
                <td style={td} colSpan={2}>Totals</td>
                <td style={td}>
                  {materials.filter((m) => m.rawMaterialType === crops[currentTab]).reduce((s, x) => s + (Number(x.supplierBags) || 0), 0)}
                </td>
                <td style={td}>
                  {materials.filter((m) => m.rawMaterialType === crops[currentTab]).reduce((s, x) => s + (Number(x.totalWeight) || 0), 0)}
                </td>
                <td style={td}>
                  {materials.filter((m) => m.rawMaterialType === crops[currentTab]).reduce((s, x) => s + (Number(x.bagsAfterStd) || 0), 0)}
                </td>
                <td style={td}>
                  {materials.filter((m) => m.rawMaterialType === crops[currentTab]).reduce((s, x) => s + (Number(x.extraKg) || 0), 0)}
                </td>
                <td style={td} colSpan={7}></td>
              </tr>
            </tbody>
          </table>
        </Box>
      </Box>

      {/* actions under table */}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button sx={btnSx} startIcon={<PrintIcon />} onClick={handlePrintTable}>Print</Button>
        <Button sx={btnSx} startIcon={<DownloadIcon />} onClick={handleExportCSV}>Export CSV</Button>
      </Box>

      {/* messages */}
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {successMsg && <Typography color="success.main" sx={{ mt: 2 }}>{successMsg}</Typography>}
    </Box>
  );
}

const td = { padding: 10, border: "1px solid #e0e0e0" };
