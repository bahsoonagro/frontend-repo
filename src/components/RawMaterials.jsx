// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";

export default function RawMaterialsTest() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(API_URL);
        console.log("API response:", res.data); // <-- check structure here
        setMaterials(res.data); 
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    fetchMaterials();
  }, []);

  if (!materials.length) return <p>No data found.</p>;

  return (
    <div>
      <h2>Raw Materials Table Test</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>S/N</th>
            <th>ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Opening Qty</th>
            <th>New Stock</th>
            <th>Total Stock</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m, i) => (
            <tr key={m._id || i}>
              <td>{i + 1}</td>
              <td>{m._id || "N/A"}</td>
              <td>{m.rawMaterialType || "N/A"}</td>
              <td>{new Date(m.date).toLocaleDateString()}</td>
              <td>{m.openingQty}</td>
              <td>{m.newStock}</td>
              <td>{m.totalStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
