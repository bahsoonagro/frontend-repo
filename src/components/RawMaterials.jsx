import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-Materials";

const RawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    weight: "",
    supplier: "",
    dateEntry: "",
    damaged: "No",
    storekeeper: "",
    location: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch all raw materials
  useEffect(() => {
    fetchRawMaterials();
  }, []);

  const fetchRawMaterials = async () => {
    try {
      const response = await axios.get(API_URL);
      setRawMaterials(response.data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  // Add or Update raw material
  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
      } else {
        const response = await axios.post(API_URL, formData);
        setRawMaterials([...rawMaterials, response.data]);
      }
      setFormData({
        type: "",
        weight: "",
        supplier: "",
        dateEntry: "",
        damaged: "No",
        storekeeper: "",
        location: "",
      });
      fetchRawMaterials();
    } catch (error) {
      console.error("Error saving raw material:", error);
    }
  };

  // Edit raw material
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

  // Delete raw material
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await axios.delete(`${API_URL}/${id}`);
      setRawMaterials(rawMaterials.filter((rm) => rm._id !== id));
    }
  };

  // Print raw materials
  const handlePrint = () => {
    const printContent = document.getElementById("raw-materials-cards").innerHTML;
    const newWindow = window.open("", "", "width=900,height=600");
    newWindow.document.write("<html><head><title>Raw Materials</title></head><body>");
    newWindow.document.write(printContent);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Raw Materials</h2>

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
        <input
          placeholder="Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          placeholder="Weight (Kg)"
          type="number"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", width: "120px" }}
          title="Enter weight in kilograms"
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
          title="Is the material damaged?"
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
        {rawMaterials.map((rm) => (
          <div
            key={rm._id}
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
            <p title="Material Type"><strong>Type:</strong> {rm.type}</p>
            <p title="Weight in Kg"><strong>Weight:</strong> {rm.weight} Kg</p>
            <p title="Supplier Name"><strong>Supplier:</strong> {rm.supplier}</p>
            <p title="Date of Entry"><strong>Date:</strong> {rm.dateEntry}</p>
            <p title="Damaged Status"><strong>Damaged:</strong> {rm.damaged}</p>
            <p title="Storekeeper Name"><strong>Storekeeper:</strong> {rm.storekeeper}</p>
            <p title="Storage Location"><strong>Location:</strong> {rm.location}</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <button
                onClick={() => handleEdit(rm)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#ffc107",
                  color: "#000",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(rm._id)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RawMaterials;
