// src/components/RawMaterials.jsx
import React, { useState } from "react";

const RAW_MATERIALS_TABS = ["Sorghum", "Pigeon Peas"];

export default function RawMaterials() {
  const [currentTab, setCurrentTab] = useState(0);

  // Minimal demo data
  const materials = [
    {
      _id: "1",
      rawMaterialType: "Sorghum",
      date: "2025-10-04",
      openingQty: 100,
      newStock: 50,
      stockOut: 20,
      totalStock: 150,
      balance: 130,
      requisitionNumber: "REQ001",
      remarks: "Test",
      location: "Store A",
      batchNumber: "BATCH001",
      storeKeeper: "Ahmed",
      supervisor: "Mariam",
    },
    {
      _id: "2",
      rawMaterialType: "Pigeon Peas",
      date: "2025-10-04",
      openingQty: 200,
      newStock: 80,
      stockOut: 30,
      totalStock: 280,
      balance: 250,
      requisitionNumber: "REQ002",
      remarks: "Test2",
      location: "Store B",
      batchNumber: "BATCH002",
      storeKeeper: "Ali",
      supervisor: "Fatmata",
    },
  ];

  const filtered = materials.filter(
    (m) => m.rawMaterialType === RAW_MATERIALS_TABS[currentTab]
  );

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        {RAW_MATERIALS_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setCurrentTab(i)}
            style={{
              marginRight: 5,
              fontWeight: currentTab === i ? "bold" : "normal",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>S/N</th>
            <th>Date</th>
            <th>Opening Qty</th>
            <th>New Stock</th>
            <th>Total Stock</th>
            <th>Stock Out</th>
            <th>Balance</th>
            <th>Remarks</th>
            <th>Location</th>
            <th>Batch</th>
            <th>Store Keeper</th>
            <th>Supervisor</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m, i) => (
            <tr key={m._id}>
              <td>{i + 1}</td>
              <td>{m.date}</td>
              <td>{m.openingQty}</td>
              <td>{m.newStock}</td>
              <td>{m.totalStock}</td>
              <td>{m.stockOut}</td>
              <td>{m.balance}</td>
              <td>{m.remarks}</td>
              <td>{m.location}</td>
              <td>{m.batchNumber}</td>
              <td>{m.storeKeeper}</td>
              <td>{m.supervisor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
