// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";

const API_URL = "https://backend-repo-ydwt.onrender.com/api"; // fixed /api

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
        // Fetch crops/raw materials
        const cropRes = await fetch(`${API_URL}/raw-materials`);
        const cropText = await cropRes.text();
        let cropData;
        try {
          cropData = JSON.parse(cropText);
        } catch {
          console.error("Expected JSON for raw materials, got:", cropText);
          cropData = [];
        }
        setCrops(Array.isArray(cropData) ? cropData : []);

        // Fetch LPOs
        const lpoRes = await fetch(`${API_URL}/raw-materials/lpo`);
        const lpoText = await lpoRes.text();
        let lpoData;
        try {
          lpoData = JSON.parse(lpoText);
        } catch {
          console.error("Expected JSON for LPOs, got:", lpoText);
          lpoData = [];
        }
        setLpos(Array.isArray(lpoData) ? lpoData : []);

      } catch (err) {
        console.error("Fetch failed:", err);
        setCrops([]);
        setLpos([]);
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

  // --- LPO Section ---
{activeTab === "lpo" && (
  <div>
    <h3 className="font-bold mb-2">Add LPO</h3>
    {lpoError && <p className="text-red-600">{lpoError}</p>}

    <form onSubmit={handleAddLPO} className="space-y-2 mb-4">
      <input
        type="text"
        name="material"
        value={lpoForm.material}
        onChange={handleLpoChange}
        placeholder="Material"
        className="border p-2 w-full"
        required
      />
      <input
        type="number"
        name="year"
        value={lpoForm.year}
        onChange={handleLpoChange}
        placeholder="Year"
        className="border p-2 w-full"
        required
      />
      <input
        type="number"
        name="quantity"
        value={lpoForm.quantity}
        onChange={handleLpoChange}
        placeholder="Quantity"
        className="border p-2 w-full"
        required
      />
      <input
        type="number"
        name="unitPrice"
        value={lpoForm.unitPrice}
        onChange={handleLpoChange}
        placeholder="Unit Price"
        className="border p-2 w-full"
        required
      />
      <input
        type="text"
        name="supplier"
        value={lpoForm.supplier}
        onChange={handleLpoChange}
        placeholder="Supplier"
        className="border p-2 w-full"
        required
      />
      <input
        type="text"
        name="comments"
        value={lpoForm.comments}
        onChange={handleLpoChange}
        placeholder="Comments"
        className="border p-2 w-full"
      />
      <select
        name="payment"
        value={lpoForm.payment}
        onChange={handleLpoChange}
        className="border p-2 w-full"
      >
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
      </select>

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Add LPO
      </button>
    </form>

    {/* --- Print LPO Table --- */}
    <button onClick={printLPO} className="mb-2 bg-gray-600 text-white px-3 py-1 rounded">
      🖨 Print LPO Table
    </button>

    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Material</th>
          <th className="border p-2">Year</th>
          <th className="border p-2">Quantity</th>
          <th className="border p-2">Unit Price</th>
          <th className="border p-2">Item Total</th>
          <th className="border p-2">Payment</th>
          <th className="border p-2">Supplier</th>
          <th className="border p-2">Comments</th>
          <th className="border p-2">Grand Total</th>
        </tr>
      </thead>
      <tbody>
        {lpos.map((l) => (
          <tr key={l._id}>
            <td className="border p-2">{l.items[0]?.name || ""}</td>
            <td className="border p-2">{l.year}</td>
            <td className="border p-2">{l.items[0]?.quantity || ""}</td>
            <td className="border p-2">{l.items[0]?.unitPrice || ""}</td>
            <td className="border p-2">{l.items[0]?.total || ""}</td>
            <td className="border p-2">{l.payment}</td>
            <td className="border p-2">{l.supplier}</td>
            <td className="border p-2">{l.comments}</td>
            <td className="border p-2">{l.total || ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)} ;
