// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";

const API_URL = "https://backend-repo-ydwt.onrender.com";

const RAW_MATERIALS = ["Sugar", "Rice", "Sorghum", "Pigeon Peas", "Sesame Seeds", "Other"];

export default function RawMaterials() {
  const [activeTab, setActiveTab] = useState("single");

  // --- Single Raw Material Form ---
  const emptyMaterial = {
    rawMaterialType: "",
    date: "",
    storeKeeper: "",
    supervisor: "",
    location: "",
    weightKg: "",
    damaged: "No",
  };
  const [formData, setFormData] = useState(emptyMaterial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- Bulk Upload ---
  const [bulkJson, setBulkJson] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkError, setBulkError] = useState("");

  // --- Crops & LPO Data ---
  const [crops, setCrops] = useState([]);
  const [lpos, setLpos] = useState([]);

  // --- LPO Form ---
  const emptyLPO = {
    material: "",
    year: new Date().getFullYear(),
    quantity: "",
    unitPrice: "",
    payment: "Pending",
    supplier: "",
    comments: "",
  };
  const [lpoForm, setLpoForm] = useState(emptyLPO);
  const [lpoError, setLpoError] = useState("");

  // --- Fetch crops & LPOs on mount ---
  useEffect(() => {
    async function fetchData() {
      try {
        const cropRes = await fetch(`${API_URL}/raw-materials`);
        const cropData = await cropRes.json();
        setCrops(Array.isArray(cropData) ? cropData : []);

        const lpoRes = await fetch(`${API_URL}/raw-materials/lpo`);
        const lpoData = await lpoRes.json();
        setLpos(Array.isArray(lpoData) ? lpoData : []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }
    fetchData();
  }, []);

  // --- Input Handlers ---
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  function handleLpoChange(e) {
    const { name, value } = e.target;
    setLpoForm(prev => ({ ...prev, [name]: value }));
  }

  // --- Single Submission ---
  async function handleSingleSubmit(e) {
    e.preventDefault();
    setMessage(""); setError("");

    if (
      !formData.rawMaterialType ||
      !formData.date ||
      !formData.storeKeeper.trim() ||
      !formData.supervisor.trim() ||
      !formData.location.trim() ||
      !formData.weightKg ||
      isNaN(Number(formData.weightKg))
    ) {
      setError("Please fill in all fields correctly.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/raw-materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessage(`✅ Saved: ${data.rawMaterialType} (${data.weightKg} Kg)`);
      setFormData(emptyMaterial);
      setCrops(prev => [...prev, data]);
    } catch (err) {
      console.error("Single submit error:", err);
      setError(err.message);
    }
  }

  // --- Bulk Upload Submission ---
  async function handleBulkSubmit(e) {
    e.preventDefault();
    setBulkMessage(""); setBulkError("");

    let records;
    try {
      records = JSON.parse(bulkJson);
      if (!Array.isArray(records) || records.length === 0) {
        setBulkError("Please provide a valid non-empty JSON array.");
        return;
      }
    } catch {
      setBulkError("Invalid JSON format.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/raw-materials/bulk-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBulkMessage(data.message || "Bulk upload successful");
      setBulkJson("");
      if (data.addedMaterials) setCrops(prev => [...prev, ...data.addedMaterials]);
    } catch (err) {
      console.error("Bulk upload error:", err);
      setBulkError(err.message);
    }
  }

  // --- Add LPO ---
  async function handleAddLPO(e) {
    e.preventDefault();
    setLpoError("");

    try {
      const res = await fetch(`${API_URL}/raw-materials/lpo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lpoForm),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLpos(prev => [...prev, data]);
      setLpoForm(emptyLPO);
    } catch (err) {
      console.error("LPO submit error:", err);
      setLpoError(err.message);
    }
  }

  // --- Print LPO Table ---
  function printLPO() {
    const html = `
      <h2>LPO Report</h2>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Material</th><th>Year</th><th>Quantity</th><th>Unit Price</th>
            <th>Payment</th><th>Supplier</th><th>Comments</th>
          </tr>
        </thead>
        <tbody>
          ${lpos.map(l => `
            <tr>
              <td>${l.material}</td><td>${l.year}</td><td>${l.quantity}</td>
              <td>${l.unitPrice}</td><td>${l.payment}</td><td>${l.supplier}</td>
              <td>${l.comments}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(html);
    win.document.close();
    win.print();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b pb-2">
        <button onClick={() => setActiveTab("single")} className={activeTab === "single" ? "font-bold text-blue-600" : ""}>Add Raw Material</button>
        <button onClick={() => setActiveTab("bulk")} className={activeTab === "bulk" ? "font-bold text-blue-600" : ""}>Bulk Upload</button>
        <button onClick={() => setActiveTab("crops")} className={activeTab === "crops" ? "font-bold text-blue-600" : ""}>Crops</button>
        <button onClick={() => setActiveTab("lpo")} className={activeTab === "lpo" ? "font-bold text-blue-600" : ""}>LPOs</button>
      </div>

      {/* --- Single Raw Material --- */}
      {activeTab === "single" && (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}

          <select name="rawMaterialType" value={formData.rawMaterialType} onChange={handleChange} className="border p-2 w-full">
            <option value="">-- Select Material --</option>
            {RAW_MATERIALS.map(rm => <option key={rm} value={rm}>{rm}</option>)}
          </select>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="border p-2 w-full" />
          <input type="text" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} placeholder="Store Keeper" className="border p-2 w-full" />
          <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="Supervisor" className="border p-2 w-full" />
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="border p-2 w-full" />
          <input type="number" name="weightKg" value={formData.weightKg} onChange={handleChange} placeholder="Weight (Kg)" className="border p-2 w-full" />
          <select name="damaged" value={formData.damaged} onChange={handleChange} className="border p-2 w-full">
            <option value="No">Not Damaged</option>
            <option value="Yes">Damaged</option>
          </select>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Raw Material</button>
        </form>
      )}

      {/* --- Bulk Upload --- */}
      {activeTab === "bulk" && (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {bulkMessage && <p className="text-green-600">{bulkMessage}</p>}
          {bulkError && <p className="text-red-600">{bulkError}</p>}

          <textarea
            rows="8"
            value={bulkJson}
            onChange={e => setBulkJson(e.target.value)}
            placeholder='Paste JSON array here...'
            className="border p-2 w-full font-mono"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Bulk Upload</button>
        </form>
      )}

      {/* --- Crops Table --- */}
      {activeTab === "crops" && (
        <div>
          <h3 className="font-bold mb-2">Crops Data</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Type</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Weight (Kg)</th>
                <th className="border p-2">Damaged</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((c) => (
                <tr key={c._id || c.date + c.rawMaterialType}>
                  <td className="border p-2">{c.rawMaterialType}</td>
                  <td className="border p-2">{c.date}</td>
                  <td className="border p-2">{c.weightKg}</td>
                  <td className="border p-2">{c.damaged}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- LPO Section --- */}
      {activeTab === "lpo" && (
        <div>
          <h3 className="font-bold mb-2">Add LPO</h3>
          {lpoError && <p className="text-red-600">{lpoError}</p>}
          <form onSubmit={handleAddLPO} className="space-y-2 mb-4">
            <input type="text" name="material" value={lpoForm.material} onChange={handleLpoChange} placeholder="Material" className="border p-2 w-full" />
            <input type="number" name="year" value={lpoForm.year} onChange={handleLpoChange} placeholder="Year" className="border p-2 w-full" />
            <input type="number" name="quantity" value={lpoForm.quantity} onChange={handleLpoChange} placeholder="Quantity" className="border p-2 w-full" />
            <input type="number" name="unitPrice" value={lpoForm.unitPrice} onChange={handleLpoChange} placeholder="Unit Price" className="border p-2 w-full" />
            <input type="text" name="supplier" value={lpoForm.supplier} onChange={handleLpoChange} placeholder="Supplier" className="border p-2 w-full" />
            <input type="text" name="comments" value={lpoForm.comments} onChange={handleLpoChange} placeholder="Comments" className="border p-2 w-full" />
            <select name="payment" value={lpoForm.payment} onChange={handleLpoChange} className="border p-2 w-full">
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add LPO</button>
          </form>

          <button onClick={printLPO} className="mb-2 bg-gray-600 text-white px-3 py-1 rounded">🖨 Print LPO Table</button>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Material</th>
                <th className="border p-2">Year</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Unit Price</th>
                <th className="border p-2">Payment</th>
                <th className="border p-2">Supplier</th>
                <th className="border p-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {lpos.map((l) => (
                <tr key={l._id || l.material + l.year}>
                  <td className="border p-2">{l.material}</td>
                  <td className="border p-2">{l.year}</td>
                  <td className="border p-2">{l.quantity}</td>
                  <td className="border p-2">{l.unitPrice}</td>
                  <td className="border p-2">{l.payment}</td>
                  <td className="border p-2">{l.supplier}</td>
                  <td className="border p-2">{l.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

