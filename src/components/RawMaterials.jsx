// RawMaterials.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const materials = ["Sorghum", "Pigeon Peas", "Sesame Seeds", "Rice", "Sugar"];

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

  // Load data
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

    // Auto calculations
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

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Raw Materials Management</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        {materials.map((mat) => (
          <button
            key={mat}
            onClick={() => {
              setActiveTab(mat);
              resetForm();
            }}
            className={`px-4 py-2 rounded ${
              activeTab === mat ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {mat}
          </button>
        ))}
      </div>

      {/* Multi-step Form */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-gray-50">
        {step === 1 && (
          <div>
            <h3 className="font-semibold mb-2">Step 1: General Information</h3>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
              required
            />
            <input
              type="text"
              name="storeKeeper"
              placeholder="Store Keeper"
              value={formData.storeKeeper}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
              required
            />
            <input
              type="text"
              name="supervisor"
              placeholder="Supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="batchNumber"
              placeholder="Batch Number"
              value={formData.batchNumber}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-semibold mb-2">Step 2: Stock Details</h3>
            <input
              type="number"
              name="openingBalance"
              placeholder="Opening Balance"
              value={formData.openingBalance}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="number"
              name="newStock"
              placeholder="New Stock"
              value={formData.newStock}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="number"
              name="totalStock"
              placeholder="Total Stock"
              value={formData.totalStock}
              readOnly
              className="border p-2 w-full mb-2 bg-gray-100"
            />
            <input
              type="number"
              name="stockOut"
              placeholder="Stock Out"
              value={formData.stockOut}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="number"
              name="balance"
              placeholder="Balance"
              value={formData.balance}
              readOnly
              className="border p-2 w-full mb-2 bg-gray-100"
            />
            <input
              type="text"
              name="remarks"
              placeholder="Remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="requisitionNumber"
              placeholder="Requisition Number"
              value={formData.requisitionNumber}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Table */}
      <h3 className="font-semibold mt-6 mb-2">{activeTab} Records</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Opening Balance</th>
            <th className="border px-2 py-1">New Stock</th>
            <th className="border px-2 py-1">Total Stock</th>
            <th className="border px-2 py-1">Stock Out</th>
            <th className="border px-2 py-1">Balance</th>
            <th className="border px-2 py-1">Remarks</th>
            <th className="border px-2 py-1">Requisition Number</th>
            <th className="border px-2 py-1">Store Keeper</th>
            <th className="border px-2 py-1">Supervisor</th>
            <th className="border px-2 py-1">Batch Number</th>
            <th className="border px-2 py-1">Location</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rawMaterials.map((mat) => (
            <tr key={mat._id}>
              <td className="border px-2 py-1">
                {new Date(mat.date).toLocaleDateString()}
              </td>
              <td className="border px-2 py-1">{mat.openingBalance}</td>
              <td className="border px-2 py-1">{mat.newStock}</td>
              <td className="border px-2 py-1">{mat.totalStock}</td>
              <td className="border px-2 py-1">{mat.stockOut}</td>
              <td className="border px-2 py-1">{mat.balance}</td>
              <td className="border px-2 py-1">{mat.remarks}</td>
              <td className="border px-2 py-1">{mat.requisitionNumber}</td>
              <td className="border px-2 py-1">{mat.storeKeeper}</td>
              <td className="border px-2 py-1">{mat.supervisor}</td>
              <td className="border px-2 py-1">{mat.batchNumber}</td>
              <td className="border px-2 py-1">{mat.location}</td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  onClick={() => handleEdit(mat)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(mat._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RawMaterials;
