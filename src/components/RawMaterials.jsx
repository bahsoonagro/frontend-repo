import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const BACKEND_URL = 'http://localhost:5000'; // change to your backend URL

const RawMaterials = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    material: '',
    month: '',
    openingBalance: '',
    newStockIn: '',
    totalStockIn: '',
    totalStockOut: '',
    totalStockBalance: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // POST single record to backend
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save record');
      const savedRecord = await res.json();
      setRecords(prev => [...prev, savedRecord]);
      setFormData({
        material: '',
        month: '',
        openingBalance: '',
        newStockIn: '',
        totalStockIn: '',
        totalStockOut: '',
        totalStockBalance: '',
      });
      alert('Record saved successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Excel file upload and POST bulk records to backend
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Map to array of record objects, skipping header row
      const bulkRecords = jsonData.slice(1).map(row => ({
        material: row[0] || '',
        month: row[1] || '',
        openingBalance: row[2] || '',
        newStockIn: row[3] || '',
        totalStockIn: row[4] || '',
        totalStockOut: row[5] || '',
        totalStockBalance: row[6] || '',
      }));

      try {
        const res = await fetch(`${BACKEND_URL}/api/raw-materials/bulk-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bulkRecords),
        });
        if (!res.ok) throw new Error('Failed to upload bulk records');
        alert('Bulk records uploaded successfully');
        setRecords(prev => [...prev, ...bulkRecords]);
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2>Raw Materials Stock Management</h2>

      {/* Manual Input Form */}
      <form onSubmit={handleFormSubmit}>
        <input name="material" value={formData.material} onChange={handleInputChange} placeholder="Material" required />
        <input name="month" value={formData.month} onChange={handleInputChange} placeholder="Month" required />
        <input name="openingBalance" type="number" value={formData.openingBalance} onChange={handleInputChange} placeholder="Opening Balance" required />
        <input name="newStockIn" type="number" value={formData.newStockIn} onChange={handleInputChange} placeholder="New Stock In" required />
        <input name="totalStockIn" type="number" value={formData.totalStockIn} onChange={handleInputChange} placeholder="Total Stock In" required />
        <input name="totalStockOut" type="number" value={formData.totalStockOut} onChange={handleInputChange} placeholder="Total Stock Out" required />
        <input name="totalStockBalance" type="number" value={formData.totalStockBalance} onChange={handleInputChange} placeholder="Total Stock Balance" required />
        <button type="submit">Add Record</button>
      </form>

      {/* Bulk Upload */}
      <div>
        <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'blue' }}>Import Excel File</label>
        <input id="file-upload" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>

      {/* Records Table */}
      <table border="1" cellPadding="5" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>Material</th>
            <th>Month</th>
            <th>Opening Balance</th>
            <th>New Stock In</th>
            <th>Total Stock In</th>
            <th>Total Stock Out</th>
            <th>Total Stock Balance</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan="7">No records yet.</td></tr>
          ) : (
            records.map((r, i) => (
              <tr key={i}>
                <td>{r.material}</td>
                <td>{r.month}</td>
                <td>{r.openingBalance}</td>
                <td>{r.newStockIn}</td>
                <td>{r.totalStockIn}</td>
                <td>{r.totalStockOut}</td>
                <td>{r.totalStockBalance}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RawMaterials;

