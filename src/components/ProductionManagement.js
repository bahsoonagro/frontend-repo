// src/components/ProductionManagement.js
import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ProductionManagement() {
  const [prodBatch, setProdBatch] = useState({
    id: "BATCH001",
    date: new Date().toISOString().split("T")[0],
    client: "Demo Client",
    product: "PikinMix",
    plannedTons: 1,
  });

  const [prodIngredients, setProdIngredients] = useState([
    { name: "Sorghum", base: 750, extra: 100 },
    { name: "Sesame", base: 50, extra: 0 },
    { name: "Sugar", base: 50, extra: 0 },
    { name: "Pigeon Peas", base: 150, extra: 50 },
  ]);

  const [prodDepartments, setProdDepartments] = useState([
    { name: "Store", input: 1150, output: 1140 },
    { name: "Cleaning", input: 1140, output: 1120 },
    { name: "Scorching", input: 1120, output: 1100 },
    { name: "Milling", input: 1100, output: 1020 },
    { name: "Packaging", input: 1020, output: 1000 },
    { name: "Finished Store", input: 1000, output: 1000 },
  ]);

  const handleIngredientChange = (index, field, value) => {
    const updated = [...prodIngredients];
    updated[index][field] = Number(value);
    setProdIngredients(updated);
  };

  const handleDepartmentChange = (index, field, value) => {
    const updated = [...prodDepartments];
    updated[index][field] = Number(value);
    if (field === "output" && Number(value) > updated[index].input) {
      updated[index][field] = updated[index].input;
    }
    setProdDepartments(updated);
  };

  const totalRawMaterial = prodIngredients.reduce(
    (sum, ing) => sum + ing.base + ing.extra,
    0
  );

  const finalOutput = prodDepartments[prodDepartments.length - 1].output;
  const plannedKg = prodBatch.plannedTons * 1000;
  const yieldPercent = ((finalOutput / plannedKg) * 100).toFixed(2);

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Production Batch Report", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Batch ID: ${prodBatch.id}`, 14, 30);
    doc.text(`Date: ${prodBatch.date}`, 14, 38);
    doc.text(`Client: ${prodBatch.client}`, 14, 46);
    doc.text(`Product: ${prodBatch.product}`, 14, 54);
    doc.text(`Planned: ${prodBatch.plannedTons} MT`, 14, 62);

    // Ingredients table
    const ingData = prodIngredients.map((ing) => [
      ing.name,
      ing.base,
      ing.extra,
      ing.base + ing.extra,
    ]);
    doc.autoTable({
      startY: 70,
      head: [["Ingredient", "Base (kg)", "Extra (kg)", "Gross (kg)"]],
      body: ingData,
      theme: "grid",
    });

    // Departments table
    const deptData = prodDepartments.map((dept) => [
      dept.name,
      dept.input,
      dept.output,
      dept.input - dept.output,
    ]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Department", "Input (kg)", "Output (kg)", "Loss (kg)"]],
      body: deptData,
      theme: "grid",
    });

    // Summary
    doc.setFontSize(12);
    doc.text(
      `Total Raw Material: ${totalRawMaterial} kg`,
      14,
      doc.lastAutoTable.finalY + 20
    );
    doc.text(
      `Final Output: ${finalOutput} kg | Yield: ${yieldPercent}%`,
      14,
      doc.lastAutoTable.finalY + 28
    );

    doc.save(`${prodBatch.id}_production.pdf`);
  };

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
        <p>Total Raw Material: {totalRawMaterial} kg</p>
        <table className="table-auto w-full border mt-2">
          <thead>
            <tr className="bg-green-300">
              <th>Ingredient</th>
              <th>Base (kg)</th>
              <th>Extra (kg)</th>
              <th>Gross (kg)</th>
            </tr>
          </thead>
          <tbody>
            {prodIngredients.map((ing, i) => (
              <tr key={i} className="border">
                <td>{ing.name}</td>
                <td>
                  <input
                    type="number"
                    value={ing.base}
                    onChange={(e) =>
                      handleIngredientChange(i, "base", e.target.value)
                    }
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={ing.extra}
                    onChange={(e) =>
                      handleIngredientChange(i, "extra", e.target.value)
                    }
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td>{ing.base + ing.extra}</td>
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
                <td>
                  <input
                    type="number"
                    value={dept.input}
                    onChange={(e) =>
                      handleDepartmentChange(i, "input", e.target.value)
                    }
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dept.output}
                    onChange={(e) =>
                      handleDepartmentChange(i, "output", e.target.value)
                    }
                    className="w-full p-1 border rounded"
                  />
                </td>
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

      {/* Export Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={exportToPDF}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Export to PDF
        </button>
      </div>
    </div>
  );
}
