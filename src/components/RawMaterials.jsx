// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";

const API_URL = "https://backend-repo-ydwt.onrender.com/api";
const RAW_MATERIALS = ["Sugar", "Rice", "Sorghum", "Pigeon Peas", "Sesame Seeds", "Other"];

export default function RawMaterials() {
  const [activeTab, setActiveTab] = useState("single");

  // --- Single Raw Material ---
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

  // --- Crops & LPOs ---
  const [crops, setCrops] = useState([]);
  const [lpos, setLpos] = useState([]);

  // --- LPO Form ---
  const emptyLPO = {
    material: "",
    quantity: "",
    unitPrice: "",
    year: new Date().getFullYear(),
    payment: "Pending",
    supplier: "",
    comments: "",
    fuelCost: 0,
    perDiem: 0,
    tollFee: 0,
    miscellaneous: 0,
  };
  const [lpoForm, setLpoForm] = useState(emptyLPO);
  const [lpoError, setLpoError] = useState("");
  const [lpoMessage, setLpoMessage] = useState("");

  // --- Search / Filter ---
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Fetch crops & LPOs ---
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
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleBulkChange = (e) => setBulkJson(e.target.value);
  const handleLpoChange = (e) => setLpoForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // --- Single Submission ---
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");

    if (!formData.rawMaterialType || !formData.date || !formData.storeKeeper || !formData.supervisor || !formData.location || !formData.weightKg) {
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
  };

  // --- Bulk Upload Submission ---
  const handleBulkSubmit = async (e) => {
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
  };

  // --- Add LPO ---
  const handleAddLPO = async (e) => {
    e.preventDefault();
    setLpoError(""); setLpoMessage("");

    const { material, quantity, unitPrice, year, payment, supplier, comments, fuelCost, perDiem, tollFee, miscellaneous } = lpoForm;

    if (!material || !quantity || !unitPrice || !supplier) {
      setLpoError("Please fill in all required fields for LPO.");
      return;
    }

    const payload = {
      year,
      supplier,
      payment,
      comments,
      items: [{ name: material, quantity: Number(quantity), unitPrice: Number(unitPrice) }],
      fuelCost: Number(fuelCost),
      perDiem: Number(perDiem),
      tollFee: Number(tollFee),
      miscellaneous: Number(miscellaneous)
    };

    try {
      const res = await fetch(`${API_URL}/raw-materials/lpo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLpos(prev => [...prev, data]);
      setLpoForm(emptyLPO);
      setLpoMessage("✅ LPO added successfully!");
    } catch (err) {
      console.error("LPO submit error:", err);
      setLpoError(err.message);
    }
  };

  // --- Filtered & Paginated Crops ---
  const filteredCrops = (crops || [])
    .filter(c => 
      (!filterType || c.rawMaterialType === filterType) &&
      (!search || c.rawMaterialType.toLowerCase().includes(search.toLowerCase()))
    );
  const totalPages = Math.ceil(filteredCrops.length / itemsPerPage);
  const currentCrops = filteredCrops.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

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
            onChange={handleBulkChange}
            placeholder='Paste JSON array here...'
            className="border p-2 w-full font-mono"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Bulk Upload</button>
        </form>
      )}

      {/* --- Crops Table --- */}
      {activeTab === "crops" && (
        <div>
          <div className="flex space-x-4 mb-4">
            <input type="text" placeholder="Search Material..." value={search} onChange={(e)=>setSearch(e.target.value)} className="border p-2 w-1/3" />
            <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="border p-2 w-1/3">
              <option value="">All Types</option>
              {RAW_MATERIALS.map(rm => <option key={rm} value={rm}>{rm}</option>)}
            </select>
          </div>

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
              {(currentCrops || []).map(c => (
                <tr key={c._id || c.date + c.rawMaterialType}>
                  <td className="border p-2">{c.rawMaterialType}</td>
                  <td className="border p-2">{c.date}</td>
                  <td className="border p-2">{c.weightKg}</td>
                  <td className="border p-2">{c.damaged}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center space-x-2 mt-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i+1} onClick={()=>setCurrentPage(i+1)}
                className={`px-2 py-1 border rounded ${currentPage===i+1?'bg-blue-600 text-white':'bg-white text-black'}`}>{i+1}</button>
            ))}
          </div>
        </div>
      )}

      {/* --- LPO Table --- */}
      {activeTab === "lpo" && (
        <div>
          <form onSubmit={handleAddLPO} className="space-y-4 mb-4">
            {lpoMessage && <p className="text-green-600">{lpoMessage}</p>}
            {lpoError && <p className="text-red-600">{lpoError}</p>}

            <input type="text" name="material" value={lpoForm.material} onChange={handleLpoChange} placeholder="Material Name" className="border p-2 w-full" />
            <input type="number" name="quantity" value={lpoForm.quantity} onChange={handleLpoChange} placeholder="Quantity" className="border p-2 w-full" />
            <input type="number" name="unitPrice" value={lpoForm.unitPrice} onChange={handleLpoChange} placeholder="Unit Price" className="border p-2 w-full" />
            <input type="text" name="supplier" value={lpoForm.supplier} onChange={handleLpoChange} placeholder="Supplier" className="border p-2 w-full" />
            <textarea name="comments" value={lpoForm.comments} onChange={handleLpoChange} placeholder="Comments" className="border p-2 w-full" />
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Add LPO</button>
          </form>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Material</th>
                <th className="border p-2">Year</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Unit Price</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Payment</th>
                <th className="border p-2">Supplier</th>
                <th className="border p-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {(lpos || []).map(l => (
                <tr key={l._id}>
                  <td className="border p-2">{l.items?.[0]?.name || ""}</td>
                  <td className="border p-2">{l.year}</td>
                  <td className="border p-2">{l.items?.[0]?.quantity || ""}</td>
                  <td className="border p-2">{l.items?.[0]?.unitPrice || ""}</td>
                  <td className="border p-2">{l.items?.[0]?.total || ""}</td>
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
