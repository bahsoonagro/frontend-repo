import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://backend-repo-ydwt.onrender.com/api/stock-movements";

const StockMovements = () => {
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

  // Fetch all movements
  const fetchMovements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_BASE);
      setMovements(res.data);
    } catch (err) {
      setError("Failed to fetch stock movements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    const required = ["requisitionNo", "dateTime", "rawMaterial", "batchNumber", "quantityBags", "weightRemovedKg", "weightReceivedKg", "storeman", "cleaningReceiver"];
    for (let field of required) {
      if (!formData[field]) {
        setError(`Please fill in ${field}.`);
        return;
      }
    }

    setLoading(true);
    setError(""); setSuccessMsg("");

    const payload = {
      ...formData,
      quantityBags: Number(formData.quantityBags),
      weightRemovedKg: Number(formData.weightRemovedKg),
      weightReceivedKg: Number(formData.weightReceivedKg),
    };

    try {
      let res;
      if (editingId) {
        res = await axios.put(`${API_BASE}/${editingId}`, payload);
        setMovements(prev => prev.map(m => m._id === editingId ? res.data : m));
        setSuccessMsg("Stock movement updated successfully!");
      } else {
        res = await axios.post(API_BASE, payload);
        setMovements(prev => [res.data, ...prev]);
        setSuccessMsg("Stock movement added successfully!");
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
      setError(err.response?.data?.message || "Failed to save stock movement.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    setFormData({
      requisitionNo: m.requisitionNo,
      dateTime: m.dateTime,
      rawMaterial: m.rawMaterial,
      batchNumber: m.batchNumber,
      quantityBags: m.quantityBags,
      weightRemovedKg: m.weightRemovedKg,
      weightReceivedKg: m.weightReceivedKg,
      storeman: m.storeman,
      cleaningReceiver: m.cleaningReceiver,
      remarks: m.remarks,
    });
    setEditingId(m._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this movement?")) return;

  try {
    await axios.delete(`${API_BASE}/stock-movements/${id}`);
    setMovements(prev => prev.filter(m => m._id !== id));
    setSuccessMsg("Stock movement deleted successfully!");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to delete movement.");
  }
};


  const handlePrint = () => {
    const content = document.getElementById("stock-table").outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Stock Movements</title></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const formatNum = (v) => (v != null ? Number(v).toFixed(2) : "0.00");

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔁 Stock Movements</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="text" name="requisitionNo" value={formData.requisitionNo} onChange={handleChange} placeholder="Requisition No" className="p-2 border rounded" required />
        <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="rawMaterial" value={formData.rawMaterial} onChange={handleChange} placeholder="Raw Material" className="p-2 border rounded" required />
        <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch Number" className="p-2 border rounded" required />
        <input type="number" name="quantityBags" value={formData.quantityBags} onChange={handleChange} placeholder="Quantity (Bags)" min="1" className="p-2 border rounded" required />
        <input type="number" name="weightRemovedKg" value={formData.weightRemovedKg} onChange={handleChange} placeholder="Weight Removed (Kg)" min="0" step="0.01" className="p-2 border rounded" required />
        <input type="number" name="weightReceivedKg" value={formData.weightReceivedKg} onChange={handleChange} placeholder="Weight Received (Kg)" min="0" step="0.01" className="p-2 border rounded" required />
        <input type="text" name="storeman" value={formData.storeman} onChange={handleChange} placeholder="Storeman Name" className="p-2 border rounded" required />
        <input type="text" name="cleaningReceiver" value={formData.cleaningReceiver} onChange={handleChange} placeholder="Cleaning Receiver" className="p-2 border rounded" required />
        <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Remarks (optional)" className="p-2 border rounded col-span-1 md:col-span-3" />
        <button type="submit" className="col-span-1 md:col-span-3 bg-blue-600 text-white py-2 rounded disabled:opacity-60" disabled={loading}>
          {loading ? "Saving..." : editingId ? "✏️ Update Movement" : "➕ Record Movement"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      <button onClick={handlePrint} className="mb-4 bg-gray-600 text-white py-1 px-3 rounded">🖨 Print Movements</button>

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
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan="11" className="p-4 text-center text-gray-500">No stock movements found.</td></tr>
            ) : (
              movements.map(m => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{m.requisitionNo}</td>
                  <td className="p-2 border">{new Date(m.dateTime).toLocaleString()}</td>
                  <td className="p-2 border">{m.rawMaterial}</td>
                  <td className="p-2 border">{m.batchNumber}</td>
                  <td className="p-2 border">{m.quantityBags}</td>
                  <td className="p-2 border">{formatNum(m.weightRemovedKg)}</td>
                  <td className="p-2 border">{formatNum(m.weightReceivedKg)}</td>
                  <td className="p-2 border">{m.storeman}</td>
                  <td className="p-2 border">{m.cleaningReceiver}</td>
                  <td className="p-2 border">{m.remarks || "-"}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => handleEdit(m)} className="bg-yellow-400 text-white py-1 px-2 rounded">Edit</button>
                    <button onClick={() => handleDelete(m._id)} className="bg-red-600 text-white py-1 px-2 rounded">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovements;
