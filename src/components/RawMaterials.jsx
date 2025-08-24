// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";

const API_URL = "https://backend-repo-ydwt.onrender.com";
const RAW_MATERIALS = ["Sugar", "Rice", "Sorghum", "Pigeon Peas", "Sesame Seeds", "Other"];

export default function RawMaterials() {
  const [activeTab, setActiveTab] = useState("single");

  const emptyMaterial = { rawMaterialType: "", date: "", storeKeeper: "", supervisor: "", location: "", weightKg: "", damaged: "No" };
  const [formData, setFormData] = useState(emptyMaterial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [bulkJson, setBulkJson] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkError, setBulkError] = useState("");

  const [crops, setCrops] = useState([]);
  const [lpos, setLpos] = useState([]);

  const emptyLPO = { material: "", year: new Date().getFullYear(), quantity: "", unitPrice: "", payment: "Pending", supplier: "", comments: "", fuelCost: 0, perDiem: 0, tollFee: 0, miscellaneous: 0 };
  const [lpoForm, setLpoForm] = useState(emptyLPO);
  const [lpoError, setLpoError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const cropData = await (await fetch(`${API_URL}/raw-materials`)).json();
        setCrops(Array.isArray(cropData) ? cropData : []);

        const lpoData = await (await fetch(`${API_URL}/raw-materials/lpo`)).json();
        setLpos(Array.isArray(lpoData) ? lpoData : []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }
    fetchData();
  }, []);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleLpoChange = e => setLpoForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSingleSubmit(e) {
    e.preventDefault();
    setMessage(""); setError("");

    if (!formData.rawMaterialType || !formData.date || !formData.storeKeeper || !formData.supervisor || !formData.location || !formData.weightKg) {
      setError("Please fill in all fields correctly.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/raw-materials`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessage(`✅ Saved: ${data.rawMaterialType} (${data.weightKg} Kg)`);
      setFormData(emptyMaterial);
      setCrops(prev => [...prev, data]);
    } catch (err) { setError(err.message); }
  }

  async function handleBulkSubmit(e) {
    e.preventDefault();
    setBulkMessage(""); setBulkError("");
    let records;
    try { records = JSON.parse(bulkJson); if (!Array.isArray(records) || records.length === 0) { setBulkError("Please provide a valid non-empty JSON array."); return; } } 
    catch { setBulkError("Invalid JSON format."); return; }

    try {
      const res = await fetch(`${API_URL}/raw-materials/bulk-upload`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(records) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBulkMessage(data.message || "Bulk upload successful"); setBulkJson("");
      if (data.addedMaterials) setCrops(prev => [...prev, ...data.addedMaterials]);
    } catch (err) { setBulkError(err.message); }
  }

  async function handleAddLPO(e) {
    e.preventDefault(); setLpoError("");

    const payload = {
      year: lpoForm.year,
      supplier: lpoForm.supplier,
      payment: lpoForm.payment,
      comments: lpoForm.comments,
      items: [{ name: lpoForm.material, quantity: Number(lpoForm.quantity), unitPrice: Number(lpoForm.unitPrice) }],
      fuelCost: Number(lpoForm.fuelCost) || 0,
      perDiem: Number(lpoForm.perDiem) || 0,
      tollFee: Number(lpoForm.tollFee) || 0,
      miscellaneous: Number(lpoForm.miscellaneous) || 0
    };

    try {
      const res = await fetch(`${API_URL}/raw-materials/lpo`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLpos(prev => [...prev, data]);
      setLpoForm(emptyLPO);
    } catch (err) { setLpoError(err.message); }
  }

  function printLPO() {
    const html = `
      <h2>LPO Report</h2><p>Date: ${new Date().toLocaleDateString()}</p>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead><tr><th>Material</th><th>Year</th><th>Quantity</th><th>Unit Price</th><th>Payment</th><th>Supplier</th><th>Comments</th></tr></thead>
      <tbody>${lpos.map(l => `<tr><td>${l.items[0]?.name}</td><td>${l.year}</td><td>${l.items[0]?.quantity}</td><td>${l.items[0]?.unitPrice}</td><td>${l.payment}</td><td>${l.supplier}</td><td>${l.comments}</td></tr>`).join('')}</tbody></table>
    `;
    const win = window.open("", "", "width=800,height=600"); win.document.write(html); win.document.close(); win.print();
  }

  // ... rest of your tab UI remains the same, no changes to raw material and bulk upload sections
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      {/* Tabs + forms (unchanged) */}
    </div>
  );
}
