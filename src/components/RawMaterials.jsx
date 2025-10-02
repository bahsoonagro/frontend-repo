import React, { useState } from "react";

const RAW_MATERIALS_TABS = ["sorghum", "beans", "benni", "sugar"];

export default function RawMaterials() {
  const [currentTab, setCurrentTab] = useState("sorghum");
  const [materials, setMaterials] = useState([]);

  const handleAddMaterial = () => {
    const newMaterial = {
      rawMaterialType: currentTab,
      supplier: "",
      invoiceNo: "",
      date: "",
      bags: 0,
      bagWeight: 0,
      totalWeight: 0,
      // removed finishedProductKg, actualLoss, lossPercentage
      vehicleNo: "",
      driverName: "",
      remarks: "",
    };
    setMaterials([...materials, newMaterial]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;

    // auto-calc totalWeight when bags/bagWeight change
    if (field === "bags" || field === "bagWeight") {
      updated[index].totalWeight =
        (Number(updated[index].bags) || 0) *
        (Number(updated[index].bagWeight) || 0);
    }

    setMaterials(updated);
  };

  const calculateTotals = (filtered) => {
    return {
      totalBags: filtered.reduce((acc, m) => acc + Number(m.bags || 0), 0),
      totalWeight: filtered.reduce((acc, m) => acc + Number(m.totalWeight || 0), 0),
    };
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Raw Materials</h2>

      {/* Tabs */}
      <div style={{ marginBottom: "1rem" }}>
        {RAW_MATERIALS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            style={{
              fontWeight: currentTab === tab ? "bold" : "normal",
              marginRight: "10px",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button onClick={handleAddMaterial}>Add {currentTab}</button>

      {/* Table */}
      <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th style={thStyle}>Supplier</th>
            <th style={thStyle}>Invoice No</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Bags</th>
            <th style={thStyle}>Bag Weight</th>
            <th style={thStyle}>Total Weight</th>
            <th style={thStyle}>Vehicle No</th>
            <th style={thStyle}>Driver Name</th>
            <th style={thStyle}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {materials
            .filter((m) => m.rawMaterialType === currentTab)
            .map((m, index) => (
              <tr key={index}>
                <td style={tdStyle}>
                  <input
                    value={m.supplier}
                    onChange={(e) => handleChange(index, "supplier", e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    value={m.invoiceNo}
                    onChange={(e) => handleChange(index, "invoiceNo", e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="date"
                    value={m.date}
                    onChange={(e) => handleChange(index, "date", e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={m.bags}
                    onChange={(e) => handleChange(index, "bags", e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={m.bagWeight}
                    onChange={(e) => handleChange(index, "bagWeight", e.target.value)}
                  />
                </td>
                <td style={tdStyle}>{m.totalWeight}</td>
                <td style={tdStyle}>
                  <input
                    value={m.vehicleNo}
                    onChange={(e) => handleChange(index, "vehicleNo", e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    value={m.driverName}
                    onChange={(e) => handleChange(index, "driverName", e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    value={m.remarks}
                    onChange={(e) => handleChange(index, "remarks", e.target.value)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
          <tr>
            <td style={tdStyle} colSpan={3}>Totals</td>
            {(() => {
              const filtered = materials.filter((m) => m.rawMaterialType === currentTab);
              const totals = calculateTotals(filtered);

              return (
                <>
                  <td style={tdStyle}>{totals.totalBags}</td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}>{totals.totalWeight}</td>
                  <td style={tdStyle} colSpan={3}></td>
                </>
              );
            })()}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};
