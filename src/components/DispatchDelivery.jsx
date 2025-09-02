import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconButton, Tooltip } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DispatchDelivery = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    item: "", quantity: "", date: "", customer: "", driver: "", vehicle: "",
    tollGateFees: 0, fuelCost: 0, driverPerDiem: 0, helperPerDiem: 0, totalCost: 0, remarks: ""
  });

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchDeliveries(); }, [apiUrl]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/dispatch-delivery`);
      setDeliveries(res.data);
    } catch { setError("Failed to load deliveries."); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["quantity","tollGateFees","fuelCost","driverPerDiem","helperPerDiem"];
    const newValue = numericFields.includes(name) ? Number(value) : value;

    const updatedForm = { ...formData, [name]: newValue };
    updatedForm.totalCost = 
      Number(updatedForm.tollGateFees) +
      Number(updatedForm.fuelCost) +
      Number(updatedForm.driverPerDiem) +
      Number(updatedForm.helperPerDiem);

    setFormData(updatedForm);
    setError(""); setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["item","quantity","date","customer","driver","vehicle"];
    for (const f of requiredFields) { if (!formData[f]) { setError(`Please fill in ${f}`); return; } }

    setLoading(true); setError(""); setSuccessMsg("");
    try {
      let res;
      if (editingId) {
        res = await axios.put(`${apiUrl}/api/dispatch-delivery/${editingId}`, formData);
        setDeliveries(prev => prev.map(d => d._id === editingId ? res.data : d));
        setSuccessMsg("Dispatch updated successfully!");
      } else {
        res = await axios.post(`${apiUrl}/api/dispatch-delivery`, formData);
        setDeliveries(prev => [res.data, ...prev]);
        setSuccessMsg("Dispatch recorded successfully!");
      }

      setFormData({
        item: "", quantity: "", date: "", customer: "", driver: "", vehicle: "",
        tollGateFees: 0, fuelCost: 0, driverPerDiem: 0, helperPerDiem: 0, totalCost: 0, remarks: ""
      });
      setEditingId(null);
    } catch { setError("Failed to save dispatch."); }
    finally { setLoading(false); }
  };

  const handleEdit = (d) => { setFormData(d); setEditingId(d._id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (id) => { if(!window.confirm("Are you sure?")) return; await axios.delete(`${apiUrl}/api/dispatch-delivery/${id}`); setDeliveries(prev => prev.filter(d => d._id!==id)); setSuccessMsg("Deleted successfully!"); };

  // ------------------ Export functions ------------------
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(deliveries.map(d => ({
      Item: d.item,
      Quantity: d.quantity,
      Date: new Date(d.date).toLocaleDateString(),
      Customer: d.customer,
      Driver: d.driver,
      Vehicle: d.vehicle,
      Toll: d.tollGateFees,
      Fuel: d.fuelCost,
      DriverPD: d.driverPerDiem,
      HelperPD: d.helperPerDiem,
      TotalCost: d.totalCost,
      Remarks: d.remarks
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dispatches");
    XLSX.writeFile(wb, "Dispatch_Delivery.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Dispatch & Delivery Records", 14, 16);
    doc.autoTable({
      startY: 20,
      head: [["Item","Qty","Date","Customer","Driver","Vehicle","Toll","Fuel","Driver PD","Helper PD","Total","Remarks"]],
      body: deliveries.map(d => [
        d.item, d.quantity, new Date(d.date).toLocaleDateString(), d.customer, d.driver, d.vehicle,
        d.tollGateFees, d.fuelCost, d.driverPerDiem, d.helperPerDiem, d.totalCost, d.remarks
      ])
    });
    doc.save("Dispatch_Delivery.pdf");
  };

  const handlePrint = () => {
    const tableContent = document.getElementById("dispatch-table").outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Dispatch & Delivery</title>
      <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid black;padding:6px;text-align:left}th{background-color:#f0f0f0}</style>
    </head><body>${tableContent}</body></html>`);
    win.document.close(); win.print();
  };
  // --------------------------------------------------------

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🚚 Dispatch & Delivery</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        {[
          {name:"item",placeholder:"Item"},
          {name:"quantity",placeholder:"Quantity",type:"number"},
          {name:"date",placeholder:"Date",type:"date"},
          {name:"customer",placeholder:"Customer"},
          {name:"driver",placeholder:"Driver"},
          {name:"vehicle",placeholder:"Vehicle"},
          {name:"tollGateFees",placeholder:"Toll Gate Fees",type:"number"},
          {name:"fuelCost",placeholder:"Fuel Cost",type:"number"},
          {name:"driverPerDiem",placeholder:"Driver Per Diem",type:"number"},
          {name:"helperPerDiem",placeholder:"Helper Per Diem",type:"number"},
          {name:"remarks",placeholder:"Remarks",type:"text",cols:6}
        ].map(f => (
          <input key={f.name} type={f.type || "text"} name={f.name} placeholder={f.placeholder}
            value={formData[f.name]} onChange={handleChange}
            className={`p-2 border rounded ${f.cols?"col-span-1 md:col-span-6":""}`} />
        ))}
        <button type="submit" disabled={loading} className="col-span-1 md:col-span-6 bg-green-700 text-white py-2 rounded">
          {loading ? "Saving..." : editingId ? "✏️ Update Dispatch" : "➕ Record Dispatch"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      <div className="flex gap-2 mb-3">
        <button onClick={handlePrint} className="bg-gray-600 text-white py-1 px-3 rounded">🖨 Print Table</button>
        <button onClick={exportExcel} className="bg-blue-600 text-white py-1 px-3 rounded">📊 Export Excel</button>
        <button onClick={exportPDF} className="bg-purple-600 text-white py-1 px-3 rounded">📄 Export PDF</button>
      </div>

      <div className="overflow-x-auto border rounded" id="dispatch-table">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Item","Qty","Date","Customer","Driver","Vehicle","Toll","Fuel","Driver PD","Helper PD","Total Cost","Remarks","Action"].map(h => <th key={h} className="p-2 border">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {deliveries.length===0 ? (
              <tr><td colSpan="13" className="p-4 text-center text-gray-500">No dispatch records.</td></tr>
            ) : deliveries.map((d,i) => (
              <tr key={d._id} style={{backgroundColor:i%2===0?"#f9f9f9":"#fff"}}>
                <td className="p-2 border">{d.item}</td>
                <td className="p-2 border">{d.quantity}</td>
                <td className="p-2 border">{new Date(d.date).toLocaleDateString()}</td>
                <td className="p-2 border">{d.customer}</td>
                <td className="p-2 border">{d.driver}</td>
                <td className="p-2 border">{d.vehicle}</td>
                <td className="p-2 border">{d.tollGateFees}</td>
                <td className="p-2 border">{d.fuelCost}</td>
                <td className="p-2 border">{d.driverPerDiem}</td>
                <td className="p-2 border">{d.helperPerDiem}</td>
                <td className="p-2 border">
                  <Tooltip title={`Toll: ${d.tollGateFees}, Fuel: ${d.fuelCost}, Driver PD: ${d.driverPerDiem}, Helper PD: ${d.helperPerDiem}`}>
                    <span>{d.totalCost}</span>
                  </Tooltip>
                </td>
                <td className="p-2 border">{d.remarks || "-"}</td>
                <td className="p-2 border space-x-2">
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={()=>handleEdit(d)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={()=>handleDelete(d._id)}><Delete fontSize="small" /></IconButton></Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchDelivery;
