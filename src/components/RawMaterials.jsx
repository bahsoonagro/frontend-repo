import React, { useState } from "react";

const RAW_MATERIALS = ["Sesame Seeds", "Sorghum", "Maize", "Groundnut", "Rice", "Wheat"];

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [mode, setMode] = useState("single"); // single or batch

  const [formData, setFormData] = useState({
    rawMaterialType: "",
    bags: "",
    extraKg: "",
    supplierName: "",
    supplierPhone: "",
    storeKeeper: "",
    supervisor: "",
    location: "",
    date: "",
    batchNumber: "",
  });

  const [batchData, setBatchData] = useState([
    { rawMaterialType: "", bags: "", extraKg: "", batchNumber: "", location: "" },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBatchChange = (index, e) => {
    const { name, value } = e.target;
    const newBatch = [...batchData];
    newBatch[index][name] = value;
    setBatchData(newBatch);
  };

  const addBatchRow = () => {
    setBatchData([...batchData, { rawMaterialType: "", bags: "", extraKg: "", batchNumber: "", location: "" }]);
  };

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    const weight = Number(formData.bags) * 50 + Number(formData.extraKg || 0);
    const newMaterial = { ...formData, id: Date.now(), weight };
    setMaterials([...materials, newMaterial]);
    resetForm();
  };

  const handleBatchSubmit = (e) => {
    e.preventDefault();
    const batchEntries = batchData.map(item => ({
      ...item,
      supplierName: formData.supplierName,
      supplierPhone: formData.supplierPhone,
      storeKeeper: formData.storeKeeper,
      supervisor: formData.supervisor,
      date: formData.date,
      weight: Number(item.bags) * 50 + Number(item.extraKg || 0),
      id: Date.now() + Math.random(),
    }));
    setMaterials([...materials, ...batchEntries]);
    setBatchData([{ rawMaterialType: "", bags: "", extraKg: "", batchNumber: "", location: "" }]);
  };

  const resetForm = () => {
    setFormData({
      rawMaterialType: "",
      bags: "",
      extraKg: "",
      supplierName: "",
      supplierPhone: "",
      storeKeeper: "",
      supervisor: "",
      location: "",
      date: "",
      batchNumber: "",
    });
  };

  const handleDelete = (id) => {
    setMaterials(materials.filter(item => item.id !== id));
  };

  const handleEdit = (id, field, value) => {
    setMaterials(materials.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const exportCSV = () => {
    const csv = [
      ["Date","Type","Bags","Extra Kg","Weight","Supplier","Phone","Storekeeper","Supervisor","Location","Batch"],
      ...materials.map(m => [m.date, m.rawMaterialType, m.bags, m.extraKg, m.weight, m.supplierName, m.supplierPhone, m.storeKeeper, m.supervisor, m.location, m.batchNumber])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raw_materials.csv";
    a.click();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Raw Material Entry</h2>

      {/* Mode Selection */}
      <div className="flex gap-4 mb-4">
        <button onClick={() => setMode("single")} className={`px-4 py-2 rounded ${mode === "single" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Single Entry</button>
        <button onClick={() => setMode("batch")} className={`px-4 py-2 rounded ${mode === "batch" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Batch Entry</button>
      </div>

      {/* Supplier Info */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} placeholder="Supplier Name" className="p-2 border rounded" required/>
        <input type="text" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} placeholder="Supplier Phone" className="p-2 border rounded" required/>
        <input type="text" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} placeholder="Store Keeper" className="p-2 border rounded"/>
        <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="Supervisor" className="p-2 border rounded"/>
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded"/>
      </div>

      {/* Single Entry Form */}
      {mode === "single" && (
        <form onSubmit={handleSingleSubmit} className="bg-white shadow-md rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="rawMaterialType" value={formData.rawMaterialType} onChange={handleChange} className="p-2 border rounded" required>
            <option value="">Select Material</option>
            {RAW_MATERIALS.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </select>
          <input type="number" name="bags" value={formData.bags} onChange={handleChange} placeholder="No. of Bags (50kg)" className="p-2 border rounded" required/>
          <input type="number" name="extraKg" value={formData.extraKg} onChange={handleChange} placeholder="Extra Kg" className="p-2 border rounded"/>
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="p-2 border rounded"/>
          <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch Number" className="p-2 border rounded"/>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 col-span-1 md:col-span-3">Save Entry</button>
        </form>
      )}

      {/* Batch Entry Form */}
      {mode === "batch" && (
        <form onSubmit={handleBatchSubmit} className="bg-white shadow-md rounded-xl p-4 mb-6 space-y-2">
          {batchData.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <select name="rawMaterialType" value={row.rawMaterialType} onChange={(e)=>handleBatchChange(idx,e)} className="p-2 border rounded" required>
                <option value="">Material</option>
                {RAW_MATERIALS.map((m,i)=><option key={i} value={m}>{m}</option>)}
              </select>
              <input type="number" name="bags" value={row.bags} onChange={(e)=>handleBatchChange(idx,e)} placeholder="Bags" className="p-2 border rounded" required/>
              <input type="number" name="extraKg" value={row.extraKg} onChange={(e)=>handleBatchChange(idx,e)} placeholder="Extra Kg" className="p-2 border rounded"/>
              <input type="text" name="batchNumber" value={row.batchNumber} onChange={(e)=>handleBatchChange(idx,e)} placeholder="Batch Number" className="p-2 border rounded"/>
              <input type="text" name="location" value={row.location} onChange={(e)=>handleBatchChange(idx,e)} placeholder="Location" className="p-2 border rounded"/>
            </div>
          ))}
          <button type="button" onClick={addBatchRow} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">+ Add Row</button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2">Save Batch</button>
        </form>
      )}

      {/* Data Table */}
      {materials.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md p-2">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Bags</th>
                <th className="border px-2 py-1">Extra Kg</th>
                <th className="border px-2 py-1">Weight</th>
                <th className="border px-2 py-1">Supplier</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Storekeeper</th>
                <th className="border px-2 py-1">Supervisor</th>
                <th className="border px-2 py-1">Location</th>
                <th className="border px-2 py-1">Batch</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m=>(
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1"><input className="w-full" value={m.date} onChange={e=>handleEdit(m.id,'date',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.rawMaterialType} onChange={e=>handleEdit(m.id,'rawMaterialType',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" type="number" value={m.bags} onChange={e=>handleEdit(m.id,'bags',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" type="number" value={m.extraKg} onChange={e=>handleEdit(m.id,'extraKg',e.target.value)}/></td>
                  <td className="border px-2 py-1">{Number(m.bags)*50 + Number(m.extraKg || 0)}</td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.supplierName} onChange={e=>handleEdit(m.id,'supplierName',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.supplierPhone} onChange={e=>handleEdit(m.id,'supplierPhone',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.storeKeeper} onChange={e=>handleEdit(m.id,'storeKeeper',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.supervisor} onChange={e=>handleEdit(m.id,'supervisor',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.location} onChange={e=>handleEdit(m.id,'location',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.batchNumber} onChange={e=>handleEdit(m.id,'batchNumber',e.target.value)}/></td>
                  <td className="border px-2 py-1 flex gap-1">
                    <button className="text-red-600" onClick={()=>handleDelete(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Export & Print */}
          <div className="mt-2 flex gap-2">
            <button onClick={exportCSV} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Export CSV</button>
            <button onClick={()=>window.print()} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">Print</button>
          </div>
        </div>
      )}
    </div>
  );
}
