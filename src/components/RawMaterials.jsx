import React, { useState } from "react";

const RAW_MATERIALS = ["Sesame Seeds", "Sorghum",  "Rice", "Pigeon Peas" "Sugar"];

export default function RawMaterialsStage1() {
  const [materials, setMaterials] = useState([]);

  const [formData, setFormData] = useState({
    rawMaterialType: "",
    supplierName: "",
    supplierPhone: "",
    supplierBags: "",
    extraKg: "",
    storeKeeper: "",
    supervisor: "",
    location: "",
    date: "",
    batchNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate Bags After Standardization & Total Weight
  const bagsAfterStd = Math.floor(formData.supplierBags || 0);
  const totalWeight = (bagsAfterStd * 50) + Number(formData.extraKg || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      ...formData,
      id: Date.now(),
      bagsAfterStd,
      totalWeight,
    };
    setMaterials([...materials, newEntry]);
    setFormData({
      rawMaterialType: "",
      supplierName: "",
      supplierPhone: "",
      supplierBags: "",
      extraKg: "",
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
      ["Date","Material","Supplier","Phone","Supplier Bags","Bags After Std","Extra Kg","Total Weight","Storekeeper","Supervisor","Location","Batch"],
      ...materials.map(m => [m.date,m.rawMaterialType,m.supplierName,m.supplierPhone,m.supplierBags,m.bagsAfterStd,m.extraKg,m.totalWeight,m.storeKeeper,m.supervisor,m.location,m.batchNumber])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raw_materials_stage1.csv";
    a.click();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Raw Material Entry - Stage 1</h2>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select name="rawMaterialType" value={formData.rawMaterialType} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Select Material</option>
          {RAW_MATERIALS.map((m,i)=><option key={i} value={m}>{m}</option>)}
        </select>
        <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} placeholder="Supplier Name" className="p-2 border rounded" required/>
        <input type="text" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} placeholder="Supplier Phone" className="p-2 border rounded" required/>
        <input type="number" name="supplierBags" value={formData.supplierBags} onChange={handleChange} placeholder="Supplier Bags" className="p-2 border rounded" required/>
        <input type="number" name="extraKg" value={formData.extraKg} onChange={handleChange} placeholder="Extra Kg" className="p-2 border rounded"/>
        <input type="text" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} placeholder="Store Keeper" className="p-2 border rounded"/>
        <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="Supervisor" className="p-2 border rounded"/>
        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="p-2 border rounded"/>
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded"/>
        <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch Number" className="p-2 border rounded"/>
        <div className="col-span-1 md:col-span-3">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save Entry</button>
        </div>
      </form>

      {/* Table */}
      {materials.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md p-2">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Material</th>
                <th className="border px-2 py-1">Supplier</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Supplier Bags</th>
                <th className="border px-2 py-1">Bags After Std</th>
                <th className="border px-2 py-1">Extra Kg</th>
                <th className="border px-2 py-1">Total Weight</th>
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
                  <td className="border px-2 py-1"><input className="w-full" value={m.supplierName} onChange={e=>handleEdit(m.id,'supplierName',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.supplierPhone} onChange={e=>handleEdit(m.id,'supplierPhone',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" type="number" value={m.supplierBags} onChange={e=>handleEdit(m.id,'supplierBags',e.target.value)}/></td>
                  <td className="border px-2 py-1">{m.bagsAfterStd}</td>
                  <td className="border px-2 py-1"><input className="w-full" type="number" value={m.extraKg} onChange={e=>handleEdit(m.id,'extraKg',e.target.value)}/></td>
                  <td className="border px-2 py-1">{m.totalWeight}</td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.storeKeeper} onChange={e=>handleEdit(m.id,'storeKeeper',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.supervisor} onChange={e=>handleEdit(m.id,'supervisor',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.location} onChange={e=>handleEdit(m.id,'location',e.target.value)}/></td>
                  <td className="border px-2 py-1"><input className="w-full" value={m.batchNumber} onChange={e=>handleEdit(m.id,'batchNumber',e.target.value)}/></td>
                  <td className="border px-2 py-1"><button className="text-red-600" onClick={()=>handleDelete(m.id)}>Delete</button></td>
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
