import React, { useState, useEffect, useRef } from "react";
import api from "../api"; // use centralized axios instance
import {
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const tollGroups = [
  { group: "Group 1: Kekeh (Tricycles)", price: 3 },
  { group: "Group 2: Taxis and Sedans", price: 5 },
  { group: "Group 3: SUVs, Pickup Jeeps, Mini Buses", price: 10 },
  { group: "Group 4: Coaches, Light Vans, Small Trucks", price: 40 },
  { group: "Group 5: Fuel Tankers (2 Axles)", price: 250 },
  { group: "Group 6: Heavy-Duty Vehicles (10–12 Tyres)", price: 400 },
  { group: "Group 7: Heavy Trucks, Trailers, Semi-Trailers, Flat Beds, Fuel Tankers (3–4 Axles)", price: 600 },
];

const itemsList = [
  "Bennimix 50g",
  "Bennimix 400g",
  "Pikinmix 500g",
  "Pikinmix 1kg",
  "Pikinmix 2kg",
  "Supermix 50g",
  "Pikinmix 4kg",
  "Pikinmix 5kg",
];

const thStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };
const tdStyle = { padding: "6px", border: "1px solid #000", textAlign: "center" };

export default function DispatchDeliveryFactory({ personnelList }) {
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    date: "",
    customer: "",
    driver: "",
    vehicle: "",
    tollGroup: "",
    fuelCost: 0,
    perDiem: 0,
    personnel: [],
    totalCost: 0,
    remarks: "",
  });

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const printRef = useRef();

  // 🔹 Load from backend or fallback to localStorage
  const fetchDispatches = async () => {
    try {
      const res = await api.get("/dispatch-delivery");
      setDispatches(Array.isArray(res.data) ? res.data : []);
      localStorage.setItem("dispatches", JSON.stringify(res.data)); // cache
    } catch (err) {
      console.error("Backend unavailable, loading from cache.");
      const cached = JSON.parse(localStorage.getItem("dispatches") || "[]");
      setDispatches(cached);
      setError("⚠️ Working offline — data loaded from cache.");
    }
  };

  useEffect(() => {
    fetchDispatches();
    // Retry sync when internet comes back
    window.addEventListener("online", syncOfflineData);
    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonnelChange = (e) => {
    setFormData((prev) => ({ ...prev, personnel: e.target.value }));
  };

  // 🔹 Auto-calc total
  useEffect(() => {
    const tollFee = tollGroups.find((g) => g.group === formData.tollGroup)?.price || 0;
    const fuelCost = parseFloat(formData.fuelCost) || 0;
    const perDiem = (parseFloat(formData.perDiem) || 0) * (formData.personnel.length || 1);
    setFormData((prev) => ({ ...prev, totalCost: tollFee + fuelCost + perDiem }));
  }, [formData.tollGroup, formData.fuelCost, formData.perDiem, formData.personnel]);

  // 🔹 Save dispatch (online or offline)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["item", "quantity", "date", "customer", "driver", "vehicle"];
    for (const f of required) {
      if (!formData[f]) {
        setError(`Please fill in ${f}`);
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        fuelCost: Number(formData.fuelCost),
        perDiem: Number(formData.perDiem),
        totalCost: Number(formData.totalCost),
      };

      let res;
      try {
        res = await api.post("/dispatch-delivery", payload);
        setDispatches((prev) => [res.data, ...prev]);
        localStorage.setItem("dispatches", JSON.stringify([res.data, ...dispatches]));
        setSuccessMsg("✅ Dispatch recorded successfully!");
      } catch (err) {
        console.warn("Backend unavailable, saving offline.");
        const offline = JSON.parse(localStorage.getItem("offlineDispatches") || "[]");
        offline.push(payload);
        localStorage.setItem("offlineDispatches", JSON.stringify(offline));
        setDispatches((prev) => [payload, ...prev]);
        setSuccessMsg("📦 Saved offline — will sync later.");
      }

      resetForm();
      setError("");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Sync offline dispatches once online
  const syncOfflineData = async () => {
    const offline = JSON.parse(localStorage.getItem("offlineDispatches") || "[]");
    if (!offline.length) return;

    try {
      for (const d of offline) {
        await api.post("/dispatch-delivery", d);
      }
      localStorage.removeItem("offlineDispatches");
      fetchDispatches(); // refresh
      alert("✅ Offline dispatches synced to backend.");
    } catch (err) {
      console.error("Failed to sync offline data.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dispatch?")) return;
    try {
      await api.delete(`/dispatch-delivery/${id}`);
      setDispatches(dispatches.filter((d) => d._id !== id));
      localStorage.setItem("dispatches", JSON.stringify(dispatches.filter((d) => d._id !== id)));
    } catch (err) {
      console.error(err);
      setError("Failed to delete dispatch (backend offline?).");
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Dispatch Deliveries</title>");
    WinPrint.document.write("<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:6px;text-align:center;}th{background-color:#1976d2;color:#fff;} tr:hover{background-color:#e3f2fd;}</style>");
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  const resetForm = () => {
    setFormData({
      item: "",
      quantity: "",
      date: "",
      customer: "",
      driver: "",
      vehicle: "",
      tollGroup: "",
      fuelCost: 0,
      perDiem: 0,
      personnel: [],
      totalCost: 0,
      remarks: "",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#1976d2" }}>🚚 Dispatch & Delivery</Typography>

      <Paper elevation={6} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* form inputs (unchanged, same as yours) */}
            {/* ... keep all the inputs you already had ... */}
          </Grid>
        </form>

        {error && <Box sx={{ mt: 2, color: "red", fontWeight: "bold" }}>{error}</Box>}
        {successMsg && <Box sx={{ mt: 2, color: "green", fontWeight: "bold" }}>{successMsg}</Box>}
      </Paper>

      {/* Table Section */}
      <Box ref={printRef} sx={{ mt: 3 }}>
        <Box display="flex" justifyContent="flex-end" gap={2} mb={1}>
          <Button variant="outlined" onClick={handlePrint}>🖨️ Print Table</Button>
        </Box>

        {/* Table logic unchanged */}
        {/* ... keep your table section ... */}
      </Box>
    </Box>
  );
}

DispatchDeliveryFactory.defaultProps = {
  personnelList: [],
};
