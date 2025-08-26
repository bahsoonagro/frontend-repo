import React, { useState, useEffect } from "react";
import axios from "axios";

const StockMovements = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    requisitionNo: "",
    dateTime: "",
    rawMaterial: "",
    batchNumber: "",
    quantityBags: "",
    weightRemovedKg: "",
    weightReceivedKg: "",
    storeman: "",
    cleaningReceiver: "",
    remarks: "",
  });

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMovements();
  }, [apiUrl]);

  const fetchMovements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${apiUrl}/api/stock-movements`);
      setMovements(res.data);
    } catch (err) {
      setError("Failed to load stock movements.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "requisitionNo",
      "dateTime",
      "rawMaterial",
      "batchNumber",
      "quantityBags",
      "weightRemovedKg",
      "weightReceivedKg",
      "storeman",
      "cleaningReceiver",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field}.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        ...formData,
        quantityBags: Number(formData.quantityBags),
        weightRemovedKg: Number(formData.weightRemovedKg),
        weightReceivedKg: Number(formData.weightReceivedKg),
      };

      let res;
      if (editingId) {
        // Update existing movement
        res = await axios.put(`${apiUrl}/api/stock-movements/${editingId}`, payload);
        setMovements((prev) =>
          prev.map((m) => (m._id === editingId ? res.data : m))
        );
        setSuccessMsg("Stock movement updated successfully!");
      } else {
        // Create new movement
        res = await axios.post(`${apiUrl}/api/stock-movements`, payload);
        setMovements((prev) => [res.data, ...prev]);
        setSuccessMsg("Stock movement recorded successfully!");
      }

      setFormData({
        requisitionNo: "",
        dateTime: "",
        rawMaterial: "",
        batchNumber: "",
        quantityBags: "",
        weightRemovedKg: "",
        weightReceivedKg: "",
        storeman: "",
        cleaningReceiver: "",
        remarks: "",
      });
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save stock movement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movement) => {
    setFormData({
      requisitionNo: movement.requisitionNo,
      dateTime: movement.dateTime,
      rawMaterial: movement.rawMaterial,
      batchNumber: movement.batchNumber,
      quantityBags: movement.quantityBags,
      weightRemovedKg: movement.weightRemovedKg,
      weightReceivedKg: movement.weightReceivedKg,
      storeman: movement.storeman,
      cleaningReceiver: movement.cleaningReceiver,
      remarks: movement.remarks,
    });
    setEditingId(movement._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movement?")) return;
    try {
      await axios.delete(`${apiUrl}/api/stock-movements/${id}`);
      setMovements((prev) => prev.filter((m) => m._id !== id));
      setSuccessMsg("Stock movement deleted successfully!");
    } catch (err) {
      setError("Failed to delete movement.");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("stock-table").outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Stock Movements</title></head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
  };

  const formatNum = (val) => (val != null ? Number(val).toFixed(2) : "0.00");

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔁 Stock Movements</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" name="requisitionNo" placeholder="Requisition No" value={formData.requisitionNo} onChange={handleChange} className="p-2 border rounded" required />
        <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="rawMaterial" placeholder="Raw Material" value={formData.rawMaterial} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="batchNumber" placeholder="Batch Number" value={formData.batchNumber} onChange={handleChange} className="p-2 border rounded" required />
        <input type="number" name="quantityBags" placeholder="Quantity (Bags)" value={formData.quantityBags} onChange={handleChange} min="1" className="p-2 border rounded" required />
        <input type="number" name="weightRemovedKg" placeholder="Weight Removed (Kg)" value={formData.weightRemovedKg} onChange={handleChange} min="0" step="0.01" className="p-2 border rounded" required />
        <input type="number" name="weightReceivedKg" placeholder="Weight Received (Kg)" value={formData.weightReceivedKg} onChange={handleChange} min="0" step="0.01" className="p-2 border rounded" required />
        <input type="text" name="storeman" placeholder="Storeman Name" value={formData.storeman} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="cleaningReceiver" placeholder="Cleaning Receiver" value={formData.cleaningReceiver} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="remarks" placeholder="Remarks (optional)" value={formData.remarks} onChange={handleChange} className="p-2 border rounded col-span-1 md:col-span-3" />
        <button type="submit" className="col-span-1 md:col-span-3 bg-blue-600 text-white py-2 rounded disabled:opacity-60" disabled={loading}>
          {loading ? "Saving..." : editingId ? "✏️ Update Movement" : "➕ Record Movement"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      <button onClick={handlePrint} className="mb-4 bg-gray-600 text-white py-1 px-3 rounded">🖨 Print Movements</button>

      {loading && movements.length === 0 ? (
        <div>Loading stock movements...</div>
      ) : (
        <div className="overflow-x-auto border rounded" id="stock-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Req. No</th>
                <th className="p-2 border">Date/Time</th>
                <th className="p-2 border">Raw Material</th>
                <th className="p-2 border">Batch</th>
                <th className="p-2 border">Qty (Bags)</th>
                <th className="p-2 border">Weight Removed (Kg)</th>
                <th className="p-2 border">Weight Received (Kg)</th>
                <th className="p-2 border">Storeman</th>
                <th className="p-2 border">Cleaning Receiver</th>
                <th className="p-2 border">Remarks</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead
