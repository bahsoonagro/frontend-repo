import React, { useState, useEffect } from "react";
import axios from "axios";

const materialTypes = ["Sesame Seeds", "Pigeon Peas", "Sorghum", "Sugar", "Rice"];

const RawMaterials = ({ apiUrl }) => {
  const API_URL = `${apiUrl}/api/raw-materials`;

  const [rawMaterials, setRawMaterials] = useState([]);
  const [formData, setFormData] = useState({
    type: materialTypes[0],
    weight: "",
    supplier: "",
    dateEntry: "",
    damaged: "No",
    storekeeper: "",
    location: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  const fetchRawMaterials = async () => {
    try {
      const response = await axios.get(API_URL);
      setRawMaterials(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching raw materials:", err);
      setError("Cannot connect to backend. Check server or URL.");
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({
        type: materialTypes[0],
        weight: "",
        supplier: "",
        dateEntry: "",
        damaged: "No",
        storekeeper: "",
        location: "",
      });
      fetchRawMaterials();
    } catch (err) {
      console.error("Error saving raw material:", err);
      setError("Failed to save raw material. Check backend.");
    }
  };

  const handleEdit = (rm) => {
    setEditingId(rm._id);
    setFormData({
      type: rm.type,
      weight: rm.weight,
      supplier: rm.supplier,
      dateEntry: rm.dateEntry || "",
      damaged: rm.damaged || "No",
      storekeeper: rm.storekeeper || "",
      location: rm.location || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchRawMaterials();
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("raw-materials-cards").innerHTML;
    const newWindow = window.open("", "", "width=900,height=600");
    newWindow.document.write("<html><head><title>Raw Materials</title></head><body>");
    newWindow.document.write(printContent);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.print();
  };

  // Aggregate materials by type
  const aggregatedMaterials = materialTypes.map((type) => {
    const items = rawMaterials.filter((rm) => rm.type === type);
    const totalWeight = items.reduce((sum, i) => sum + Number(i.weight), 0);
    const damagedWeight = items
      .filter((i) => i.damaged === "Yes")
      .reduce((sum, i) => sum + Number(i.weight), 0);
    const lastEntry = items.length > 0
      ? new Date(Math.max(...items.map((i) => new Date(i.dateEntry).getTime()))).toLocaleDateString()
      : "-";
    return { type, totalWeight, damagedWeight, remaining: totalWeight - damagedWeight, lastEntry };
  });

  // Quick + / - adjustment
  const adjustStock = async (type, delta) => {
    const weight = Math.abs(delta); // we store as positive
    const damaged = "No";
    const dateEntry = new Date().toISOString().split("T")[0];
    const newEntry = {
      type,
      weight,
      supplier: "Quick Adjustment",
      dateEntry,
      damaged,
      storekeeper: "System",
      location: "N/A",
    };
    if (delta > 0) {
      // Add stock
      await axios.post(API_URL, newEntry);
    } else if (delta < 0) {
      // Remove stock: add a damaged entry representing subtraction
      newEntry.weight = weight;
      newEntry.damaged = "Yes"; // mark as damaged to subtract
      await axios.post(API_URL, newEntry);
    }
    fetchRawMaterials();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Raw Materials</h2>

      {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

      {/* Form */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          {materialTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          placeholder="Weight (Kg)"
          type="number"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "120px" }}
        />
        <input
          placeholder="Supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          type="date"
          placeholder="Date of Entry"
          value={formData.dateEntry}
          onChange={(e) => setFormData({ ...formData, dateEntry: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <select
          value={formData.damaged}
          onChange={(e) => setFormData({ ...formData, damaged: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        <input
          placeholder="Storekeeper"
          value={formData.storekeeper}
          onChange={(e) => setFormData({ ...formData, storekeeper: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSave}
          style={{
            padding: "8px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#28a745",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {editingId ? "Update" : "Add"}
        </button>
        <button
          onClick={handlePrint}
          style={{
            padding: "8px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Print
        </button>
      </div>

      {/* Cards */}
      <div
        id="raw-materials-cards"
        style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}
      >
        {aggregatedMaterials.map((mat) => (
          <div
            key={mat.type}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "220px",
              backgroundColor: "#f9f9f9",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "4px 4px 12px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.1)";
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#333" }}>{mat.type}</h3>
            <p><strong>Total Stock:</strong> {mat.totalWeight} Kg</p>
            <p><strong>Damaged:</strong> {mat.damagedWeight} Kg</p>
            <p><strong>Remaining:</strong> {mat.remaining} Kg</p>
            <p><strong>Last Entry:</strong> {mat.lastEntry}</p>
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => adjustStock(mat.type, +1)}
                style={{ padding: "5px 10px", borderRadius: "5px", backgroundColor: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}
                title="Add 1 Kg"
              >
                +1 Kg
              </button>
              <button
                onClick={() => adjustStock(mat.type, -1)}
                style={{ padding: "5px 10px", borderRadius: "5px", backgroundColor: "#dc3545", color: "#fff", border: "none", cursor: "pointer" }}
                title="Remove 1 Kg"
              >
                -1 Kg
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RawMaterials;
