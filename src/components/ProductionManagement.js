// src/components/ProductionManagement.js
import React, { useState } from "react";
import ProductionManagement from "../components/ProductionManagement";

export default function ProductionManagement() {
  // Scoped state to avoid conflicts
  const [prodBatch, setProdBatch] = useState({
    id: "BATCH001",
    date: new Date().toISOString().split("T")[0],
    client: "Demo Client",
    product: "PikinMix",
    plannedTons: 1,
  });

  const [prodIngredients, setProdIngredients] = useState([
    { name: "Sorghum", base: 750, extra: 100, gross: 850 },
    { name: "Sesame", base: 50, extra: 0, gross: 50 },
    { name: "Sugar", base: 50, extra: 0, gross: 50 },
    { name: "Pigeon Peas", base: 150, extra: 50, gross: 200 },
  ]);

  const [prodDepartments, setProdDepartments] = useState([
    { name: "Store", input: 1150, output: 1140 },
    { name: "Cleaning", input: 1140, output: 1120 },
    { name: "Scorching", input: 1120, output: 1100 },
    { name: "Milling", input: 1100, output: 1020 },
    { name: "Packaging", input: 1020, output: 1000 },
    { name: "Finished Store", input: 1000, output: 1000 },
  ]);

  // Calculations
  const finalOutput = prodDepartments[prodDepartments.length - 1].output;
  const plannedKg = prodBatch.plannedTons * 1000;
  const yieldPercent = ((finalOutput / plannedKg) * 100).toFixed(2);

  return (
    <div className="p-6 space-y-6 bg-gray-50 rounded-xl shadow">
      {/* Batch Info */}
      <div className="bg-blue-100 p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">Batch Setup</h2>
        <p>
          ID: {prodBatch.id} | Product: {prodBatch.product} | Planned:{" "}
          {prodBatch.plannedTons} MT | Client: {prodBatch.client}
        </p>
      </div>

      {/* Raw Materials */}
      <div className="bg-green-100 p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">Raw Material Allocation</h2>
        <table className="table-auto w-full border mt-2">
          <thead>
            <tr className="bg-green-300">
              <th>Ingredient</th>
              <th>Base (kg)</th>
              <th>Extra (kg)</th>
              <th>Gross Input (kg)</th>
            </tr>
          </thead>
          <tbody>
            {prodIngredients.map((ing, i) => (
              <tr key={i} className="border">
                <td>{ing.name}</td>
                <td>{ing.base}</td>
                <td>{ing.extra}</td>
                <td>{ing.gross}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Department Flow */}
      <div className="bg-yellow-100 p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">Department Tracking</h2>
        <table className="table-auto w-full border mt-2">
          <thead>
            <tr className="bg-yellow-300">
              <th>Department</th>
              <th>Input (kg)</th>
              <th>Output (kg)</th>
              <th>Loss (kg)</th>
            </tr>
          </thead>
          <tbody>
            {prodDepartments.map((dept, i) => (
              <tr key={i} className="border">
                <td>{dept.name}</td>
                <td>{dept.input}</td>
                <td>{dept.output}</td>
                <td>{dept.input - dept.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final Yield */}
      <div className="bg-purple-100 p-4 rounded-xl shadow text-center">
        <h2 className="text-xl font-bold">Final Output & Yield</h2>
        <p>Finished Product: {finalOutput} kg</p>
        <p>Planned: {plannedKg} kg</p>
        <p>Yield: {yieldPercent}%</p>
      </div>
    </div>
  );
}
