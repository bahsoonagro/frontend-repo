// RawMaterials.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const MATERIAL_TABS = ["Sorghum", "Pigeon Peas", "Sesame Seeds", "Rice", "Sugar"];

const RawMaterials = () => {
  const [activeTab, setActiveTab] = useState("Sorghum");
  const [rawMaterials, setRawMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    storeKeeper: "",
    supervisor: "",
    location: "",
    batchNumber: "",
    openingBalance: "",
    newStock: "",
    totalStock: "",
    stockOut: "",
    balance: "",
    remarks: "",
    requisitionNumber: "",
    productName: "Sorghum",
  });
  const [step, setStep] = useState(1);

  // Load records by tab
  useEffect(() => {
    fetchRawMaterials();
  }, [activeTab]);

  const fetchRawMaterials = async () => {
    try {
      const res = await axios.get("/api/rawmaterials");
      setRawMaterials(res.data.filter((item) => item.productName === activeTab));
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value, productName: activeTab };

    if (name === "openingBalance" || name === "newStock") {
      const opening = parseFloat(
        name === "openingBalance" ? value : updated.openingBalance
      ) || 0;
      const newS = parseFloat(
        name === "newStock" ? value : updated.newStock
      ) || 0;
      updated.totalStock = opening + newS;
      updated.balance = updated.totalStock - (parseFloat(updated.stockOut) || 0);
    }

    if (name === "stockOut") {
      const total = parseFloat(updated.totalStock) || 0;
      const out = parseFloat(value) || 0;
      updated.balance = total - out;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.storeKeeper || !formData.supervisor) {
      alert("Please complete all required fields");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`/api/rawmaterials/${editingId}`, formData);
      } else {
        await axios.post("/api/rawmaterials", formData);
      }
      fetchRawMaterials();
      resetForm();
    } catch (error) {
      console.error("Save error:", error.response?.data || error);
      alert("Failed to save record");
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      storeKeeper: "",
      supervisor: "",
      location: "",
      batchNumber: "",
      openingBalance: "",
      newStock: "",
      totalStock: "",
      stockOut: "",
      balance: "",
      remarks: "",
      requisitionNumber: "",
      productName: activeTab,
    });
    setEditingId(null);
    setStep(1);
  };

  const handleEdit = (mat) => {
    setFormData({
      date: mat.date ? mat.date.split("T")[0] : "",
      storeKeeper: mat.storeKeeper || "",
      supervisor: mat.supervisor || "",
      location: mat.location || "",
      batchNumber: mat.batchNumber || "",
      openingBalance: mat.openingBalance || "",
      newStock: mat.newStock || "",
      totalStock: mat.totalStock || "",
      stockOut: mat.stockOut || "",
      balance: mat.balance || "",
      remarks: mat.remarks || "",
      requisitionNumber: mat.requisitionNumber || "",
      productName: activeTab,
    });
    setEditingId(mat._id);
    setStep(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`/api/rawmaterials/${id}`);
      fetchRawMaterials();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete record");
    }
  };

  // --- Totals calculation ---
  const totals = rawMaterials.reduce(
    (acc, mat) => {
      acc.openingBalance += Number(mat.openingBalance) || 0;
      acc.newStock += Number(mat.newStock) || 0;
      acc.totalStock += Number(mat.totalStock) || 0;
      acc.stockOut += Number(mat.stockOut) || 0;
      acc.balance += Number(mat.balance) || 0;
      return acc;
    },
    { openingBalance: 0, newStock: 0, totalStock: 0, stockOut: 0, balance: 0 }
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Raw Materials Management</h2>

      {/* Tabs */}
      <div className="flex space-x-3 mb-6">
        {MATERIAL_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              resetForm();
            }}
            className={`px-5 py-2 rounded-full font-semibold shadow-md transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Multi-step Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 mb-6 border"
      >
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Step 1: General Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="border rounded-lg p-2" required />
              <input type="text" name="storeKeeper" placeholder="Store Keeper" value={formData.storeKeeper} onChange={handleChange} className="border rounded-lg p-2" required />
              <input type="text" name="supervisor" placeholder="Supervisor" value={formData.supervisor} onChange={handleChange} className="border rounded-lg p-2" required />
              <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="border rounded-lg p-2" />
              <input type="text" name="batchNumber" placeholder="Batch Number" value={formData.batchNumber} onChange={handleChange} className="border rounded-lg p-2" />
            </div>
            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setStep(2)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow">
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Step 2: Stock Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="openingBalance" placeholder="Opening Balance" value={formData.openingBalance} onChange={handleChange} className="border rounded-lg p-2" />
              <input type="number" name="newStock" placeholder="New Stock" value={formData.newStock} onChange={handleChange} className="border rounded-lg p-2" />
              <input type="number" name="totalStock" placeholder="Total Stock" value={formData.totalStock} readOnly className="border rounded-lg p-2 bg-gray-100" />
              <input type="number" name="stockOut" placeholder="Stock Out" value={formData.stockOut} onChange={handleChange} className="border rounded-lg p-2" />
              <input type="number" name="balance" placeholder="Balance" value={formData.balance} readOnly className="border rounded-lg p-2 bg-gray-100" />
              <input type="text" name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} className="border rounded-lg p-2" />
              <input type="text" name="requisitionNumber" placeholder="Requisition Number" value={formData.requisitionNumber} onChange={handleChange} className="border rounded-lg p-2" />
            </div>

            <div className="flex justify-between mt-4">
              <button type="button" onClick={() => setStep(1)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow">
                Back
              </button>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Table */}
      <h3 className="text-lg font-semibold mb-3">{activeTab} Records</h3>
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border-collapse rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              {[
                "Date",
                "Opening Balance",
                "New Stock",
                "Total Stock",
                "Stock Out",
                "Balance",
                "Remarks",
                "Requisition Number",
                "Store Keeper",
                "Supervisor",
                "Batch Number",
                "Location",
                "Actions",
              ].map((col) => (
                <th key={col} className="border px-3 py-2 font-semibold uppercase text-sm">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rawMaterials.map((mat, idx) => (
              <tr key={mat._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border px-3 py-2">{new Date(mat.date).toLocaleDateString()}</td>
                <td className="border px-3 py-2">{mat.openingBalance}</td>
                <td className="border px-3 py-2">{mat.newStock}</td>
                <td className="border px-3 py-2">{mat.totalStock}</td>
                <td className="border px-3 py-2">{mat.stockOut}</td>
                <td className="border px-3 py-2">{mat.balance}</td>
                <td className="border px-3 py-2">{mat.remarks}</td>
                <td className="border px-3 py-2">{mat.requisitionNumber}</td>
                <td className="border px-3 py-2">{mat.storeKeeper}</td>
                <td className="border px-3 py-2">{mat.supervisor}</td>
                <td className="border px-3 py-2">{mat.batchNumber}</td>
                <td className="border px-3 py-2">{mat.location}</td>
                <td className="border px-3 py-2 space-x-2">
                  <button onClick={() => handleEdit(mat)} className="bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(mat._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">Delete</button>
                </td>
              </tr>
            ))}

            {/* Totals row */}
            {rawMaterials.length > 0 && (
              <tr className="bg-blue-100 font-semibold">
                <td className="border px-3 py-2 text-right">Totals:</td>
                <td className="border px-3 py-2">{totals.openingBalance}</td>
                <td className="border px-3 py-2">{totals.newStock}</td>
                <td className="border px-3 py-2">{totals.totalStock}</td>
                <td className="border px-3 py-2">{totals.stockOut}</td>
                <td className="border px-3 py-2">{totals.balance}</td>
                <td className="border px-3 py-2" colSpan="7"></td>
              </tr>
            )}

            {rawMaterials.length === 0 && (
              <tr>
                <td colSpan="13" className="text-center py-4 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawMaterials;
