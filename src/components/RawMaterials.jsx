import React, { useState } from "react";

const RAW_MATERIALS = ["Sesame Seeds", "Sorghum", "Pigeon Peas", "Suagr", "Rice"];

export default function RawMaterialsStage1() {
  const [step, setStep] = useState(1);
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

  const bagsAfterStd = Math.floor(formData.supplierBags || 0);
  const totalWeight = (bagsAfterStd * 50) + Number(formData.extraKg || 0);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSave = () => {
    const newEntry = {
      ...formData,
      id: Date.now(),
      bagsAfterStd,
      totalWeight,
      expanded: false, // for expandable table row
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
    setStep(1);
  };

  const handleDelete = (id) => setMaterials(materials.filter(m => m.id !== id));

  const handleEdit = (id, field, value) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const toggleExpand = (id) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));
  };

  const exportCSV = () => {
    const csv = [
      ["Date","Material","Supplier","Supplier Phone","Supplier Bags","Bags After Std","Extra Kg","Total Weight","Storekeeper","Supervisor","Location","Batch"],
      ...materials.map(m => [
        m.date,m.rawMaterialType,m.supplierName,m.supplierPhone,m.supplierBags,m.bagsAfterStd,m.extraKg,m.totalWeight,m.storeKeeper,m.supervisor,m.location,m.batchNumber
      ])
    ].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raw_materials.csv";
    a.click();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Raw Material Entry - Stage 1</h2>

      {/* Multi-Step Form */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-6">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} placeholder="Supplier Name" className="p-2 border rounded" required/>
            <input type="text" name="supplierPhone" value={formData.supplierPhone} onChange={handleChange} placeholder="Supplier Phone" className="p-2 border rounded" required/>
            <select name="rawMaterialType" value={formData.rawMaterialType} onChange={handleChange} className="p-2 border rounded" required>
              <option value="">Select Material</option>
              {RAW_MATERIALS.map((m,i)=><option key={i} value={m}>{m}</option>)}
            </select>
            <input type="number" name="supplierBags" value={formData.supplierBags} onChange={handleChange} placeholder="Supplier Quantity (bags)" className="p-2 border rounded" required/>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" name="extraKg" value={formData.extraKg} onChange={handleChange} placeholder="Extra Kg" className="p-2 border rounded"/>
            <input type="text" value={bagsAfterStd} readOnly className="p-2 border rounded bg-gray-100" placeholder="Bags After Standardization"/>
            <input type="text" value={totalWeight} readOnly className="p-2 border rounded bg-gray-100" placeholder="Total Weight"/>
            <div className="col-span-1 md:col-span-2 flex justify-between gap-2">
              <button type="button" onClick={handlePrev} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">← Previous</button>
              <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} placeholder="Store Keeper" className="p-2 border rounded"/>
            <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="Supervisor" className="p-2 border rounded"/>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="p-2 border rounded"/>
            <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} placeholder="Batch Number" className="p-2 border rounded"/>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded"/>
            <div className="col-span-1 md:col-span-2 flex justify-between gap-2">
              <button type="button" onClick={handlePrev} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">← Previous</button>
              <button type="button" onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save Entry</button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Table */}
      {materials.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-2">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Material</th>
                <th className="border px-2 py-1">Supplier</th>
                <th className="border px-2 py-1">Bags After Std</th>
                <th className="border px-2 py-1">Total Weight</th>
                <th className="border px-2 py-1">Batch</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <React.Fragment key={m.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={()=>toggleExpand(m.id)}>
                    <td className="border px-2 py-1">{m.date}</td>
                    <td className="border px-2 py-1">{m.rawMaterialType}</td>
                    <td className="border px-2 py-1">{m.supplierName}</td>
                    <td className="border px-2 py-1">{m.bagsAfterStd}</td>
                    <td className="border px-2 py-1">{m.totalWeight}</td>
                    <td className="border px-2 py-1">{m.batchNumber}</td>
                    <td className="border px-2 py-1 flex gap-1">
                      <button className="text-red-600" onClick={()=>handleDelete(m.id)}>Delete</button>
                    </td>
                  </tr>
                  {m.expanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="p-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <p><strong>Supplier Phone:</strong> {m.supplierPhone}</p>
                          <p><strong>Extra Kg:</strong> {m.extraKg}</p>
                          <p><strong>Storekeeper:</strong> {m.storeKeeper}</p>
                          <p><strong>Supervisor:</strong> {m.supervisor}</p>
                          <p><strong>Location:</strong> {m.location}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
