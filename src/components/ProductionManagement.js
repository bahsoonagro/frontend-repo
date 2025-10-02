import React, { useState } from "react";

export default function ProductionManagement() {
  // Batch Info
  const [batch, setBatch] = useState({
    id: "BATCH001",
    date: new Date().toISOString().split("T")[0],
    client: "Demo Client",
    product: "PikinMix",
    plannedTons: 1,
  });

  // Ingredients
  const [ingredients, setIngredients] = useState([
    { name: "Sorghum", base: 750, extra: 100, gross: 850 },
    { name: "Sesame", base: 50, extra: 0, gross: 50 },
    { name: "Sugar", base: 50, extra: 0, gross: 50 },
    { name: "Pigeon Peas", base: 150, extra: 50, gross: 200 },
  ]);

  // Departments
  const [departments, setDepartments] = useState([
    { name: "Store", input: 1150, output: 1140 },
    { name: "Cleaning", input: 1140, output: 1120 },
    { name: "Scorching", input: 1120, output: 1100 },
    { name: "Milling", input: 1100, output: 1020 },
    { name: "Packaging", input: 1020, output: 1000 },
    { name: "Finished Store", input: 1000, output: 1000 },
  ]);

  // Calculations
  const finalOutput = departments[departments.length - 1].output;
  const plannedKg = batch.plannedTons * 1000;
  const yieldPercent = ((finalOutput / plannedKg) * 100).toFixed(2);

  return (
    <div className="p-6 space-y-6">
      {/* Batch Info */}
      <div className="bg-blue-100 p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">Batch Setup</h2>
        <p>ID: {batch.id} | Product: {batch.product} | Planned: {batch.plannedTons} MT | Client: {batch.client}</p>
      </div>

      {/* Raw Materials */}
      <div className="bg-green-100 p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold">Raw Material Allocation</h2>
        <table className="table-auto w-full border mt-2">
          <thead>
            <tr className="bg-green-300">
              <th>Ingredient</th><th>Base (kg)</th><th>Extra (kg)</th><th>Gross Input (kg)</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, i) => (
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
              <th>Department</th><th>Input (kg)</th><th>Output (kg)</th><th>Loss (kg)</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, i) => (
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
