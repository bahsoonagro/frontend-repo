import React, { useEffect, useState } from 'react';

export default function TestBackend() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [pingResponse, setPingResponse] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Test GET /api/ping on load
  useEffect(() => {
    fetch(`${API_URL}/api/ping`)
      .then(res => res.text())
      .then(text => {
        console.log('Ping response:', text);
        setPingResponse(text);
      })
      .catch(err => {
        console.error('Error pinging backend:', err);
        setPingResponse('Error pinging backend');
      });
  }, [API_URL]);

  // Function to test POST /save
  const saveSampleStock = async () => {
    const sampleData = {
      item: 'Test Item',
      quantity: 50,
      category: 'test category',
      unit: 'kg',
      supplier: 'Test Supplier',
    };

    try {
      const res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleData),
      });

      if (res.ok) {
        const json = await res.json();
        setSaveStatus(`Saved: ${json.message}`);
      } else {
        setSaveStatus(`Save failed: ${res.status}`);
      }
    } catch (error) {
      setSaveStatus(`Save error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Backend Ping Test</h2>
      <p>Response: {pingResponse}</p>

      <h2>Save Sample Stock Item</h2>
      <button onClick={saveSampleStock}>Save Sample</button>
      <p>{saveStatus}</p>
    </div>
  );
}
