import React, { useState, useEffect } from "react";
import axios from "axios";

const StockMovements = ({ apiUrl }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    supplier: "",
    collectionType: "Supplier Delivery", // "Company Collection"
    rawMaterial: "",
    quantityBags: "",
    weightKg: "",
    productionBatch: "",
    productionType: "",
    storeman: "",
    cleaningReceiver: "",
    remarks: "",
    movementType: "Stock In", // Stock In or Stock Out
  });

  // Fetch stock movements
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

  useEffect(() => {
    fetchMovements();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        ...formData,
        quantityBags: Number(formData.quantityBags),
        weightKg: Number(formData.weightKg),
      };

      let res;
      if (editingId) {
        // Update existing record
        res = await axios.put(`${apiUrl}/api/stockmovements/${editingId}`, payload);
        setMovements((prev) =>
          prev.map((m) => (m._id === editingId ? res.data : m))
        );
        setSuccessMsg("Stock movement updated successfully!");
        setEditingId(null);
      } else {
        // Create new record
        res = await axios.post(`${apiUrl}/api/stockmovements`, payload);
        setMovements((prev) => [res.data, ...prev]);
        setSuccessMsg("Stock movement recorded successfully!");
      }

      setFormData({
        date: "",
        supplier: "",
        collectionType: "Supplier Delivery",
        rawMaterial: "",
        quantityBags: "",
        weightKg: "",
        productionBatch: "",
        productionType: "",
        storeman: "",
        cleaningReceiver: "",
        remarks: "",
        movementType: "Stock In",
      });
    } catch (err) {
      setError("Failed to save stock movement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movement) => {
    setEditingId(movement._id);
    setFormData({
      date: movement.date.split("T")[0],
      supplier: movement.supplier,
      collectionType: movement.collectionType,
      rawMaterial: movement.rawMaterial,
      quantityBags: movement.quantityBags,
      weightKg: movement.weightKg,
      productionBatch: movement.productionBatch,
      productionType: movement.productionType,
      storeman: movement.storeman,
      cleaningReceiver: movement.cleaningReceiver,
      remarks: movement.remarks,
      movementType: movement.movementType,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${apiUrl}/api/stockmovements/${id}`);
      setMovements((prev) => prev.filter((m) => m._id !== id));
      setSuccessMsg("Stock movement deleted successfully!");
    } catch {
      setError("Failed to delete stock movement.");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("stock-movement-table").outerHTML;
    const newWin = window.open("");
    newWin.document.write(`<html><body>${printContent}</body></html>`);
    newWin.print();
    newWin.close();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔁 Stock Movements</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="supplier" placeholder="Supplier Name" value={formData.supplier} onChange={handleChange} className="p-2 border rounded" required />
        <select name="collectionType" value={formData.collectionType} onChange={handleChange} className="p-2 border rounded">
          <option>Supplier Delivery</option>
          <option>Company Collection</option>
        </select>
        <select name="movementType" value={formData.movementType} onChange={handleChange} className="p-2 border rounded">
          <option>Stock In</option>
          <option>Stock Out</option>
        </select>
        <input type="text" name="rawMaterial" placeholder="Raw Material" value={formData.rawMaterial} onChange={handleChange} className="p-2 border rounded" required />
        <input type="number" name="quantityBags" placeholder="Quantity (Bags)" value={formData.quantityBags} onChange={handleChange} min="1" className="p-2 border rounded" required />
        <input type="number" name="weightKg" placeholder="Weight (Kg)" value={formData.weightKg} onChange={handleChange} min="0" step="0.01" className="p-2 border rounded" required />
        <input type="text" name="productionBatch" placeholder="Production Batch" value={formData.productionBatch} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="productionType" placeholder="Production Type" value={formData.productionType} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="storeman" placeholder="Storeman" value={formData.storeman} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="cleaningReceiver" placeholder="Cleaning Receiver" value={formData.cleaningReceiver} onChange={handleChange} className="p-2 border rounded" />
        <input type="text" name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} className="p-2 border rounded col-span-1 md:col-span-3" />

        <button type="submit" className="col-span-1 md:col-span-3 bg-blue-600 text-white py-2 rounded disabled:opacity-60" disabled={loading}>
          {loading ? "Saving..." : editingId ? "Update Movement" : "Record Movement"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      {/* Print button */}
      <button onClick={handlePrint} className="mb-4 bg-gray-700 text-white px-4 py-2 rounded">
        🖨 Print Stock Movements
      </button>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-left text-sm" id="stock-movement-table">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Supplier</th>
              <th className="p-2 border">Collection Type</th>
              <th className="p-2 border">Movement Type</th>
              <th className="p-2 border">Raw Material</th>
              <th className="p-2 border">Qty (Bags)</th>
              <th className="p-2 border">Weight (Kg)</th>
              <th className="p-2 border">Production Batch</th>
              <th className="p-2 border">Production Type</th>
              <th className="p-2 border">Storeman</th>
              <th className="p-2 border">Cleaning Receiver</th>
              <th className="p-2 border">Remarks</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan="13" className="p-4 text-center text-gray-500">
                  No stock movements found.
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{new Date(m.date).toLocaleDateString()}</td>
                  <td className="p-2 border">{m.supplier}</td>
                  <td className="p-2 border">{m.collectionType}</td>
                  <td className="p-2 border">{m.movementType}</td>
                  <td className="p-2 border">{m.rawMaterial}</td>
                  <td className="p-2 border">{m.quantityBags}</td>
                  <td className="p-2 border">{m.weightKg.toFixed(2)}</td>
                  <td className="p-2 border">{m.productionBatch || "-"}</td>
                  <td className="p-2 border">{m.productionType || "-"}</td>
                  <td className="p-2 border">{m.storeman || "-"}</td>
                  <td className="p-2 border">{m.cleaningReceiver || "-"}</td>
                  <td className="p-2 border">{m.remarks || "-"}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => handleEdit(m)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(m._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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

