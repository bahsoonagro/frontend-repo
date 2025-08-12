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

  const [requisitionFile, setRequisitionFile] = useState(null);
  const [deliveryNoteFile, setDeliveryNoteFile] = useState(null);

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch stock movements on mount
  useEffect(() => {
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
    fetchMovements();
  }, [apiUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
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
      // For file uploads, normally you'd handle multipart/form-data and store files somewhere (S3, cloud, etc)
      // For simplicity, we’ll just skip file uploads here or you can implement separate endpoints.

      // Submit data without files for now
      const payload = {
        ...formData,
        quantityBags: Number(formData.quantityBags),
        weightRemovedKg: Number(formData.weightRemovedKg),
        weightReceivedKg: Number(formData.weightReceivedKg),
      };

      const res = await axios.post(`${apiUrl}/api/stock-movements`, payload);

      setMovements((prev) => [res.data, ...prev]);
      setSuccessMsg("Stock movement recorded successfully!");
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
      setRequisitionFile(null);
      setDeliveryNoteFile(null);
    } catch (err) {
      setError("Failed to save stock movement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔁 Stock Movements</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="requisitionNo"
          placeholder="Requisition No"
          value={formData.requisitionNo}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="rawMaterial"
          placeholder="Raw Material"
          value={formData.rawMaterial}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="batchNumber"
          placeholder="Batch Number"
          value={formData.batchNumber}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="quantityBags"
          placeholder="Quantity (Bags)"
          value={formData.quantityBags}
          onChange={handleChange}
          min="1"
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="weightRemovedKg"
          placeholder="Weight Removed (Kg)"
          value={formData.weightRemovedKg}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="weightReceivedKg"
          placeholder="Weight Received (Kg)"
          value={formData.weightReceivedKg}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="storeman"
          placeholder="Storeman Name"
          value={formData.storeman}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="cleaningReceiver"
          placeholder="Cleaning Receiver"
          value={formData.cleaningReceiver}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="remarks"
          placeholder="Remarks (optional)"
          value={formData.remarks}
          onChange={handleChange}
          className="p-2 border rounded col-span-1 md:col-span-3"
        />
        {/* File inputs for future implementation */}
        {/* <input type="file" onChange={(e) => handleFileChange(e, setRequisitionFile)} /> */}
        {/* <input type="file" onChange={(e) => handleFileChange(e, setDeliveryNoteFile)} /> */}
        <button
          type="submit"
          className="col-span-1 md:col-span-3 bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : "➕ Record Movement"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      {loading && movements.length === 0 ? (
        <div>Loading stock movements...</div>
      ) : (
        <div className="overflow-x-auto border rounded">
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
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-gray-500">
                    No stock movements found.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{m.requisitionNo}</td>
                    <td className="p-2 border">{new Date(m.dateTime).toLocaleString()}</td>
                    <td className="p-2 border">{m.rawMaterial}</td>
                    <td className="p-2 border">{m.batchNumber}</td>
                    <td className="p-2 border">{m.quantityBags}</td>
                    <td className="p-2 border">{m.weightRemovedKg.toFixed(2)}</td>
                    <td className="p-2 border">{m.weightReceivedKg.toFixed(2)}</td>
                    <td className="p-2 border">{m.storeman}</td>
                    <td className="p-2 border">{m.cleaningReceiver}</td>
                    <td className="p-2 border">{m.remarks || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockMovements;
