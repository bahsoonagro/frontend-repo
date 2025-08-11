import React, { useState } from 'react';

const API_URL = 'https://backend-repo-ydwt.onrender.com'; // <-- Replace with your actual backend URL

const RAW_MATERIALS = [
  'Sugar',
  'Rice',
  'Sorghum',
  'Pigeon Peas',
  'Sesame Seeds',
  'Other'
];

export default function RawMaterials() {
  const [formData, setFormData] = useState({
    rawMaterialType: '',
    date: '',
    storeKeeper: '',
    supervisor: '',
    location: '',
    weightKg: '',
    damaged: 'No'
  });

  const [bulkJson, setBulkJson] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSingleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (
      !formData.rawMaterialType ||
      !formData.date ||
      !formData.storeKeeper.trim() ||
      !formData.supervisor.trim() ||
      !formData.location.trim() ||
      !formData.weightKg ||
      isNaN(Number(formData.weightKg))
    ) {
      setError('Please fill in all fields correctly.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save raw material');
      }

      const data = await res.json();
      setMessage(`Saved: ${data.rawMaterialType} (${data.weightKg} Kg)`);
      setFormData({
        rawMaterialType: '',
        date: '',
        storeKeeper: '',
        supervisor: '',
        location: '',
        weightKg: '',
        damaged: 'No'
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBulkSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    let records;
    try {
      records = JSON.parse(bulkJson);
      if (!Array.isArray(records) || records.length === 0) {
        setError('Please provide a valid non-empty JSON array.');
        return;
      }
    } catch {
      setError('Invalid JSON format.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/raw-materials/bulk-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to bulk upload');
      }

      const data = await res.json();
      setMessage(data.message || 'Bulk upload successful');
      setBulkJson('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Raw Material (Single)</h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSingleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1 font-semibold">Raw Material Type</label>
          <select
            name="rawMaterialType"
            value={formData.rawMaterialType}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          >
            <option value="">-- Select --</option>
            {RAW_MATERIALS.map(rm => (
              <option key={rm} value={rm}>{rm}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Store Keeper Name</label>
          <input
            type="text"
            name="storeKeeper"
            value={formData.storeKeeper}
            onChange={handleChange}
            required
            placeholder="Enter store keeper name"
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Supervisor Name</label>
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            required
            placeholder="Enter supervisor name"
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Where raw material was sourced"
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Weight (Kg)</label>
          <input
            type="number"
            name="weightKg"
            value={formData.weightKg}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Weight before standardization"
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Damaged?</label>
          <select
            name="damaged"
            value={formData.damaged}
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Raw Material
        </button>
      </form>

      <hr className="my-8" />

      <h2 className="text-xl font-bold mb-4">Bulk Upload Raw Materials (JSON Array)</h2>
      <p className="mb-2 text-gray-600 text-sm">
        Paste an array of raw material objects in JSON format.<br />
      </p>

      <form onSubmit={handleBulkSubmit}>
        <textarea
          rows="8"
          value={bulkJson}
          onChange={e => setBulkJson(e.target.value)}
          placeholder='Paste JSON array here...'
          className="border p-2 w-full mb-4 font-mono"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Bulk Upload
        </button>
      </form>
    </div>
  );
}
