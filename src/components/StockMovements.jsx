import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BAG_WEIGHT_DEFAULT = 50;

const MOVEMENT_TYPES = ["Receipt", "Transfer", "Usage", "Adjustment"];

const StockMovements = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    requisitionNo: "",
    dateTime: "",
    rawMaterial: "",
    batchNumber: "",
    movementType: MOVEMENT_TYPES[0],
    quantityBags: "",
    weightRemovedKg: "",
    weightReceivedKg: "",
    storeman: "",
    cleaningReceiver: "",
    remarks: "",
  });

  const [bagWeight, setBagWeight] = useState(BAG_WEIGHT_DEFAULT);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  const tableRef = useRef(null);

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

  const num = (v) => Number(v || 0);
  const varianceOf = (m) => num(m.weightRemovedKg) - num(m.weightReceivedKg);

  const filteredMovements = movements.filter((m) => {
    const matchesText =
      m.requisitionNo.toLowerCase().includes(searchText.toLowerCase()) ||
      m.rawMaterial.toLowerCase().includes(searchText.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchText.toLowerCase());

    const matchesDate =
      (!dateFilter.start || new Date(m.dateTime) >= new Date(dateFilter.start)) &&
      (!dateFilter.end || new Date(m.dateTime) <= new Date(dateFilter.end));

    return matchesText && matchesDate;
  });

  const totals = filteredMovements.reduce(
    (acc, m) => {
      acc.bags += num(m.quantityBags);
      acc.removed += num(m.weightRemovedKg);
      acc.received += num(m.weightReceivedKg);
      acc.variance += varianceOf(m);
      return acc;
    },
    { bags: 0, removed: 0, received: 0, variance: 0 }
  );

  const formatNum = (val, dp = 2) =>
    val != null && val !== "" ? Number(val).toFixed(dp) : (0).toFixed(dp);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = { ...formData, [name]: value };

    if (name === "quantityBags") {
      const q = Number(value || 0);
      next.weightRemovedKg = q * Number(bagWeight || 0);
    }

    setFormData(next);
    setError("");
    setSuccessMsg("");
  };

  const handleBagWeightChange = (e) => {
    const bw = Number(e.target.value || 0);
    setBagWeight(bw);
    if (formData.quantityBags) {
      setFormData((prev) => ({
        ...prev,
        weightRemovedKg: Number(prev.quantityBags || 0) * bw,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "requisitionNo",
      "dateTime",
      "rawMaterial",
      "batchNumber",
      "quantityBags",
      "weightRemovedKg",
      "weightReceivedKg",
      "storeman",
      "cleaningReceiver",
      "movementType",
    ];

    for (const field of required) {
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
        updateInventory: true,
      };

      let newRow;
      if (editingId) {
        const res = await axios.put(`${apiUrl}/api/stock-movements/${editingId}`, payload);
        newRow = res.data;
        setMovements((prev) => prev.map((m) => (m._id === editingId ? newRow : m)));
        setSuccessMsg("Stock movement updated successfully!");
      } else {
        const res = await axios.post(`${apiUrl}/api/stock-movements`, payload);
        newRow = res.data?.movement || res.data;
        setMovements((prev) => [newRow, ...prev]);
        setSuccessMsg("Stock movement recorded successfully!");
      }

      setFormData({
        requisitionNo: "",
        dateTime: "",
        rawMaterial: "",
        batchNumber: "",
        movementType: MOVEMENT_TYPES[0],
        quantityBags: "",
        weightRemovedKg: "",
        weightReceivedKg: "",
        storeman: "",
        cleaningReceiver: "",
        remarks: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save stock movement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    setFormData({
      requisitionNo: m.requisitionNo || "",
      dateTime: m.dateTime ? m.dateTime.substring(0, 16) : "",
      rawMaterial: m.rawMaterial || "",
      batchNumber: m.batchNumber || "",
      movementType: m.movementType || MOVEMENT_TYPES[0],
      quantityBags: m.quantityBags ?? "",
      weightRemovedKg: m.weightRemovedKg ?? "",
      weightReceivedKg: m.weightReceivedKg ?? "",
      storeman: m.storeman || "",
      cleaningReceiver: m.cleaningReceiver || "",
      remarks: m.remarks || m.notes || "",
    });
    setEditingId(m._id);
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

  // Exports
  const exportExcel = () => {
    const rows = filteredMovements.map((m, i) => ({
      "S/N": i + 1,
      "Req. No": m.requisitionNo,
      "Date/Time": m.dateTime ? new Date(m.dateTime).toLocaleString() : "",
      "Raw Material": m.rawMaterial,
      "Batch": m.batchNumber,
      "Movement Type": m.movementType,
      "Qty (Bags)": m.quantityBags,
      "Removed (Kg)": num(m.weightRemovedKg),
      "Received (Kg)": num(m.weightReceivedKg),
      "Variance (Kg)": varianceOf(m),
      "Storeman": m.storeman,
      "Cleaning Receiver": m.cleaningReceiver,
      "Remarks": m.remarks || m.notes || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Movements");
    XLSX.writeFile(wb, "StockMovements.xlsx");
  };

  const exportCSV = () => {
    const rows = filteredMovements.map((m, i) => [
      i + 1,
      m.requisitionNo,
      m.dateTime ? new Date(m.dateTime).toLocaleString() : "",
      m.rawMaterial,
      m.batchNumber,
      m.movementType,
      m.quantityBags,
      num(m.weightRemovedKg),
      num(m.weightReceivedKg),
      varianceOf(m),
      m.storeman,
      m.cleaningReceiver,
      m.remarks || m.notes || "",
    ]);

    let csv = "S/N,Req. No,Date/Time,Raw Material,Batch,Movement Type,Qty (Bags),Removed (Kg),Received (Kg),Variance (Kg),Storeman,Cleaning Receiver,Remarks\n";
    rows.forEach((r) => { csv += r.join(",") + "\n"; });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "StockMovements.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Bennimix Food Company", 14, 12);
    doc.text("Stock Movements Report", 14, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}  |  Bag Weight: ${bagWeight}kg`, 14, 28);

    const body = filteredMovements.map((m, i) => {
      const v = varianceOf(m);
      return [
        i + 1,
        m.requisitionNo,
        m.dateTime ? new Date(m.dateTime).toLocaleString() : "",
        m.rawMaterial,
        m.batchNumber,
        m.movementType,
        m.quantityBags,
        num(m.weightRemovedKg).toFixed(2),
        num(m.weightReceivedKg).toFixed(2),
        v.toFixed(2),
        m.storeman,
        m.cleaningReceiver,
        m.remarks || m.notes || "",
      ];
    });

    doc.autoTable({
      startY: 34,
      head: [["S/N","Req. No","Date/Time","Raw Material","Batch","Type","Qty","Removed","Received","Variance","Storeman","Receiver","Remarks"]],
      body,
      styles: { fontSize: 8, halign: "center" },
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 9) {
          const val = parseFloat(data.cell.raw);
          if (!isNaN(val)) {
            data.cell.styles.fillColor = val > 0 ? [255,224,224] : [232,255,232];
          }
        }
      },
    });

    const endY = doc.lastAutoTable.finalY || 34;
    doc.text("Storeman: ____________________", 14, endY + 12);
    doc.text("Cleaning Receiver: ____________", 120, endY + 12);
    doc.save("StockMovements.pdf");
  };

  const handlePrintTable = () => {
    const html = tableRef.current?.outerHTML || "";
    const w = window.open("", "_blank", "width=1000,height=700");
    w.document.write(`
      <html><head><title>Stock Movements</title>
      <style>
        body { font-family: Arial; }
        h2 { text-align: center; margin: 6px 0 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #000; padding: 4px; text-align: center; }
        th { background: #1976d2; color: #fff; }
        tr:nth-child(even){background:#f5f5f5;}
        .var-pos {background:#ffe0e0;font-weight:bold;}
        .var-zero{background:#e8ffe8;font-weight:bold;}
      </style></head><body>
      <h2>BENNIMIX FOOD COMPANY – Stock Movements</h2>
      ${html}</body></html>
    `);
    w.document.close(); w.focus(); w.print();
  };

  const handlePrintSlip = (m) => {
    const w = window.open("", "_blank", "width=600,height=700");
    w.document.write(`
      <html><head><title>Stock Movement Slip</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top:10px;}
        td { padding: 4px; }
        .highlight { font-weight: bold; }
      </style></head><body>
        <h2>Stock Movement Slip</h2>
        <table>
          <tr><td>Requisition No:</td><td class="highlight">${m.requisitionNo}</td></tr>
          <tr><td>Date/Time:</td><td class="highlight">${m.dateTime ? new Date(m.dateTime).toLocaleString() : ""}</td></tr>
          <tr><td>Raw Material:</td><td class="highlight">${m.rawMaterial}</td></tr>
          <tr><td>Batch Number:</td><td class="highlight">${m.batchNumber}</td></tr>
          <tr><td>Movement Type:</td><td class="highlight">${m.movementType}</td></tr>
          <tr><td>Qty (Bags):</td><td class="highlight">${m.quantityBags}</td></tr>
          <tr><td>Removed (Kg):</td><td class="highlight">${num(m.weightRemovedKg)}</td></tr>
          <tr><td>Received (Kg):</td><td class="highlight">${num(m.weightReceivedKg)}</td></tr>
          <tr><td>Variance (Kg):</td><td class="highlight">${varianceOf(m)}</td></tr>
          <tr><td>Storeman:</td><td class="highlight">${m.storeman}</td></tr>
          <tr><td>Cleaning Receiver:</td><td class="highlight">${m.cleaningReceiver}</td></tr>
          <tr><td>Remarks:</td><td class="highlight">${m.remarks || m.notes || "-"}</td></tr>
        </table>
      </body></html>
    `);
    w.document.close(); w.focus(); w.print();
  };

  const currentVariance = num(formData.weightRemovedKg) - num(formData.weightReceivedKg);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <h2 className="text-2xl font-bold text-blue-700">🔁 Stock Movements</h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportExcel} className="px-3 py-2 bg-green-600 text-white rounded">Export Excel</button>
          <button onClick={exportCSV} className="px-3 py-2 bg-orange-600 text-white rounded">Export CSV</button>
          <button onClick={exportPDF} className="px-3 py-2 bg-red-600 text-white rounded">Export PDF</button>
          <button onClick={handlePrintTable} className="px-3 py-2 bg-blue-600 text-white rounded">Print Table</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs text-gray-600">Search</label>
          <input type="text" placeholder="Req No / Material / Batch" value={searchText} onChange={e => setSearchText(e.target.value)} className="p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Start Date</label>
          <input type="date" value={dateFilter.start} onChange={e=>setDateFilter(f=>({...f,start:e.target.value}))} className="p-2 border rounded"/>
        </div>
        <div>
          <label className="block text-xs text-gray-600">End Date</label>
          <input type="date" value={dateFilter.end} onChange={e=>setDateFilter(f=>({...f,end:e.target.value}))} className="p-2 border rounded"/>
        </div>
        <div>
          <label className="block text-xs text-gray-600">Bag Weight (kg)</label>
          <input type="number" min="0" step="0.1" value={bagWeight} onChange={handleBagWeightChange} className="p-2 border rounded w-28"/>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <input name="requisitionNo" placeholder="Requisition No" value={formData.requisitionNo} onChange={handleChange} className="p-2 border rounded" required/>
        <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} className="p-2 border rounded" required/>
        <input name="rawMaterial" placeholder="Raw Material" value={formData.rawMaterial} onChange={handleChange} className="p-2 border rounded" required/>
        <input name="batchNumber" placeholder="Batch Number" value={formData.batchNumber} onChange={handleChange} className="p-2 border rounded" required/>
        <select name="movementType" value={formData.movementType} onChange={handleChange} className="p-2 border rounded">
          {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="number" name="quantityBags" placeholder="Quantity (Bags)" min="0" value={formData.quantityBags} onChange={handleChange} className="p-2 border rounded" required/>
        <input type="number" name="weightRemovedKg" placeholder={`Weight Removed (Kg)`} min="0" step="0.01" value={formData.weightRemovedKg} onChange={handleChange} className="p-2 border rounded" required/>
        <input type="number" name="weightReceivedKg" placeholder="Weight Received (Kg)" min="0" step="0.01" value={formData.weightReceivedKg} onChange={handleChange} className="p-2 border rounded" required/>
        <input name="storeman" placeholder="Storeman Name" value={formData.storeman} onChange={handleChange} className="p-2 border rounded" required/>
        <input name="cleaningReceiver" placeholder="Cleaning Receiver" value={formData.cleaningReceiver} onChange={handleChange} className="p-2 border rounded" required/>
        <input name="remarks" placeholder="Remarks (optional)" value={formData.remarks} onChange={handleChange} className="p-2 border rounded md:col-span-3"/>
        <div className="md:col-span-4 flex items-center gap-3">
          <span className={`px-3 py-1 rounded text-sm ${currentVariance>0?"bg-red-100 text-red-700":"bg-green-100 text-green-700"}`}>Variance (Kg): {formatNum(currentVariance)}</span>
          <button type="submit" className="ml-auto bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-60" disabled={loading}>{loading ? "Saving..." : editingId ? "✏️ Update Movement" : "➕ Record Movement"}</button>
        </div>
      </form>

      {error && <div className="mb-3 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-3 text-green-600 font-semibold">{successMsg}</div>}

      {/* Table */}
      <div className="overflow-x-auto border rounded" ref={tableRef}>
        <table className="w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-2 border">S/N</th>
              <th className="p-2 border">Req. No</th>
              <th className="p-2 border">Date/Time</th>
              <th className="p-2 border">Raw Material</th>
              <th className="p-2 border">Batch</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Qty (Bags)</th>
              <th className="p-2 border">Removed (Kg)</th>
              <th className="p-2 border">Received (Kg)</th>
              <th className="p-2 border">Variance (Kg)</th>
              <th className="p-2 border">Storeman</th>
              <th className="p-2 border">Cleaning Receiver</th>
              <th className="p-2 border">Remarks</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.length===0 ? (
              <tr><td colSpan="14" className="p-4 text-center text-gray-500">No stock movements found.</td></tr>
            ) : filteredMovements.map((m, idx)=>{
              const v = varianceOf(m);
              const varClass = v>0?"bg-red-100 text-red-700 font-semibold":"bg-green-100 text-green-700 font-semibold";
              return (
                <tr key={m._id} className={idx%2===0?"bg-gray-50":"bg-white"}>
                  <td className="p-2 border text-center">{idx+1}</td>
                  <td className="p-2 border">{m.requisitionNo}</td>
                  <td className="p-2 border">{m.dateTime?new Date(m.dateTime).toLocaleString():""}</td>
                  <td className="p-2 border">{m.rawMaterial}</td>
                  <td className="p-2 border">{m.batchNumber}</td>
                  <td className="p-2 border">{m.movementType}</td>
                  <td className="p-2 border text-right">{formatNum(m.quantityBags,0)}</td>
                  <td className="p-2 border text-right">{formatNum(m.weightRemovedKg)}</td>
                  <td className="p-2 border text-right">{formatNum(m.weightReceivedKg)}</td>
                  <td className={`p-2 border text-right ${varClass}`}>{formatNum(v)}</td>
                  <td className="p-2 border">{m.storeman}</td>
                  <td className="p-2 border">{m.cleaningReceiver}</td>
                  <td className="p-2 border">{m.remarks||m.notes||"-"}</td>
                  <td className="p-2 border flex flex-col gap-1">
                    <button onClick={()=>handleEdit(m)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                    <button onClick={()=>handleDelete(m._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                    <button onClick={()=>handlePrintSlip(m)} className="bg-blue-600 text-white px-2 py-1 rounded">Print Slip</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-semibold">
              <td className="p-2 border text-right" colSpan={6}>Totals</td>
              <td className="p-2 border text-right">{formatNum(totals.bags,0)}</td>
              <td className="p-2 border text-right">{formatNum(totals.removed)}</td>
              <td className="p-2 border text-right">{formatNum(totals.received)}</td>
              <td className="p-2 border text-right">{formatNum(totals.variance)}</td>
              <td className="p-2 border" colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default StockMovements;
