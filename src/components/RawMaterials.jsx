import React, { useState, useEffect } from "react";
import axios from "axios";

const materialTypes = ["Sesame Seeds", "Pigeon Peas", "Sorghum", "Sugar", "Rice"];

export default function RawMaterials({ apiUrl }) {
  const API_URL = `${apiUrl}/api/raw-materials`;

  const [rawMaterials, setRawMaterials] = useState([]);
  const [formData, setFormData] = useState({
    type: materialTypes[0],
    dateEntry: "",
    storekeeper: "",
    supervisor: "",
    location: "",
    weight: "",
    damaged: "No",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  const fetchRawMaterials = async () => {
    try {
      const res = await axios.get(API_URL);
      setRawMaterials(res.data);
    } catch (err) {
      console.error("Error fetching raw materials:", err);
      setMessage("Cannot connect to backend. Check server.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
        setMessage("Updated successfully!");
      } else {
        await axios.post(API_URL, formData);
        setMessage("Added successfully!");
      }
      setFormData({
        type: materialTypes[0],
        dateEntry: "",
        storekeeper: "",
        supervisor: "",
        location: "",
        weight: "",
        damaged: "No",
      });
      fetchRawMaterials();
    } catch (err) {
      console.error(err);
      setMessage("Error saving raw material");
    }
  };

  const handleEdit = (rm) => {
    setEditingId(rm._id);
    setFormData({
      type: rm.type,
      dateEntry: rm.dateEntry || "",
      storekeeper: rm.storekeeper || "",
      supervisor: rm.supervisor || "",
      location: rm.location || "",
      weight: rm.weight,
      damaged: rm.damaged || "No",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage("Deleted successfully!");
      fetchRawMaterials();
    } catch (err) {
      console.error(err);
      setMessage("Error deleting raw material");
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

  const adjustStock = async (type, delta) => {
    const weight = Math.abs(delta);
    const newEntry = {
      type,
      dateEntry: new Date().toISOString().split("T")[0],
      storekeeper: "System",
      supervisor: "System",
      location: "N/A",
      weight,
      damaged: delta < 0 ? "Yes" : "No",
    };
    try {
      await axios.post(API_URL, newEntry);
      fetchRawMaterials();
    } catch (err) {
      console.error(err);
      setMessage("Error adjusting stock");
    }
  };

  // Aggregate totals by type
  const aggregatedMaterials = materialTypes.map((type) => {
    const items = rawMaterials.filter((rm) => rm.type === type);
    const totalWeight = items.reduce((sum, i) => sum + Number(i.weight), 0);
    const damagedWeight = items
      .filter((i) => i.damaged === "Yes")
      .reduce((sum, i) => sum + Number(i.weight), 0);
    const lastEntry = items.length
      ? new Date(Math.max(...items.map((i) => new Date(i.dateEntry).getTime()))).toLocaleDateString()
      : "-";
    return { type, totalWeight, damagedWeight, remaining: totalWeight - damagedWeight, lastEntry, items };
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Raw Materials</h2>

      {message && <p style={{ color: "green" }}>{message}</p>}

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "30px" }}
      >
        <select name="type" value={formData.type} onChange={handleChange}>
          {materialTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input type="date" name="dateEntry" value={formData.dateEntry} onChange={handleChange} required />
        <input type="text" name="storekeeper" placeholder="Storekeeper" value={formData.storekeeper} onChange={handleChange} required />
        <input type="text" name="supervisor" placeholder="Supervisor" value={formData.supervisor} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <input type="number" name="weight" placeholder="Weight (Kg)" value={formData.weight} onChange={handleChange} required />
        <select name="damaged" value={formData.damaged} onChange={handleChange}>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        <button type="submit" style={{ backgroundColor: "#28a745", color: "#fff", padding: "5px 10px" }}>
          {editingId ? "Update" : "Add"}
        </button>
        <button type="button" onClick={handlePrint} style={{ backgroundColor: "#007bff", color: "#fff", padding: "5px 10px" }}>
          Print
        </button>
      </form>

      {/* Cards */}
      <div id="raw-materials-cards" style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {aggregatedMaterials.map((mat) => (
          <div
            key={mat.type}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "260px",
              backgroundColor: "#f9f9f9",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{mat.type}</h3>
            <p><strong>Total:</strong> {mat.totalWeight} Kg</p>
            <p><strong>Damaged:</strong> {mat.damagedWeight} Kg</p>
            <p><strong>Remaining:</strong> {mat.remaining} Kg</p>
            <p><strong>Last Entry:</strong> {mat.lastEntry}</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <button
                onClick={() => adjustStock(mat.type, 1)}
                style={{ backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", padding: "5px 10px" }}
                title="Add 1 Kg"
              >
                +1 Kg
              </button>
              <button
                onClick={() => adjustStock(mat.type, -1)}
                style={{ backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", padding: "5px 10px" }}
                title="Remove 1 Kg"
              >
                -1 Kg
              </button>
            </div>

            {/* Individual entries */}
            <div style={{ marginTop: "10px" }}>
              {mat.items.map((entry) => (
                <div key={entry._id} style={{ borderTop: "1px dashed #aaa", paddingTop: "5px", marginTop: "5px" }}>
                  <p style={{ fontSize: "12px" }}>
                    {entry.dateEntry} | {entry.storekeeper} | {entry.weight} Kg {entry.damaged === "Yes" ? "(Damaged)" : ""}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                      onClick={() => handleEdit(entry)}
                      style={{ backgroundColor: "#ffc107", color: "#000", border: "none", borderRadius: "5px", padding: "3px 6px", fontSize: "12px" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      style={{ backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", padding: "3px 6px", fontSize: "12px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
