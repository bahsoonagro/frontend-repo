import React, { useState } from 'react';

const API_URL = 'https://backend-repo-ydwt.onrender.com';  // Your deployed backend URL

export default function AddRawMaterial() {
  const [formData, setFormData] = useState({
    rawMaterialType: '',
    date: '',
    storeKeeper: '',
    supervisor: '',
    location: '',
    weightKg: '',
    damaged: 'No',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      const data = await response.json();
      setMessage(`Raw Material saved: ${data._id}`);
      setFormData({
        rawMaterialType: '',
        date: '',
        storeKeeper: '',
        supervisor: '',
        location: '',
        weightKg: '',
        damaged: 'No',
      });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Add Raw Material</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Raw Material Type:
          <input
            type="text"
            name="rawMaterialType"
            value={formData.rawMaterialType}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Date:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Store Keeper:
          <input
            type="text"
            name="storeKeeper"
            value={formData.storeKeeper}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Supervisor:
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Weight (Kg):
          <input
            type="number"
            name="weightKg"
            value={formData.weightKg}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Damaged?
          <select name="damaged" value={formData.damaged} onChange={handleChange}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </label><br />

        <button type="submit">Save Raw Material</button>
      </form>
    </div>
  );
}
