import React from "react";

export default function RawMaterials() {
  const materials = [
    { id: 1, name: "Sorghum", quantity: 100, unit: "bags" },
    { id: 2, name: "Maize", quantity: 200, unit: "bags" },
    { id: 3, name: "Soya Bean", quantity: 150, unit: "bags" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Raw Materials Inventory</h2>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>ID</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
