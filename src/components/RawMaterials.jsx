// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/raw-materials";

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "", type: "", date: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search / Sort / Pagination
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Accordion open state
  const [openType, setOpenType] = useState(null);

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      setErrorMsg("Failed to fetch materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Handle input change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Validate
  const validate = () => {
    if (!form.name.trim() || !form.quantity || !form.unit.trim() || !form.type.trim() || !form.date) {
      setErrorMsg("All fields are required");
      return false;
    }
    if (isNaN(form.quantity) || Number(form.quantity) <= 0) {
      setErrorMsg("Quantity must be a positive number");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API_URL}/${editing._id}` : API_URL;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setSuccessMsg(editing ? "Material updated!" : "Material added!");
      setForm({ name: "", quantity: "", unit: "", type: "", date: "" });
      setEditing(null);
      fetchMaterials();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to save material");
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchMaterials();
      setSuccessMsg("Material deleted!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to delete material");
    }
  };

  // Filter + Sort
  const filtered = materials
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.type.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortField === "name") return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortField === "quantity") return sortOrder === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity;
      return sortOrder === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
    });

  // Group by type
  const grouped = filtered.reduce((acc, m) => {
    acc[m.type] = acc[m.type] || [];
    acc[m.type].push(m);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Raw Materials Dashboard</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded shadow mb-6 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 rounded w-full" />
          <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} className="border p-2 rounded w-full" />
          <input type="text" name="unit" placeholder="Unit" value={form.unit} onChange={handleChange} className="border p-2 rounded w-full" />
          <input type="text" name="type" placeholder="Type" value={form.type} onChange={handleChange} className="border p-2 rounded w-full" />
          <input type="date" name="date" value={form.date} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div className="flex items-center space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editing ? "Update" : "Add"}</button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ name: "", quantity: "", unit: "", type: "", date: "" }); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          )}
        </div>
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        {successMsg && <p className="text-green-600">{successMsg}</p>}
      </form>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <FaSearch className="text-gray-500" />
          <input type="text" placeholder="Search by name or type..." value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 rounded w-full md:w-64" />
        </div>
        <div className="flex gap-2 items-center">
          <label>Sort by:</label>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border p-2 rounded">
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="quantity">Quantity</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border p-2 rounded">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      {/* Accordion */}
      {Object.keys(grouped).map((type) => (
        <div key={type} className="mb-4 border rounded shadow">
          <button onClick={() => setOpenType(openType === type ? null : type)} className="w-full px-4 py-2 bg-blue-100 text-left font-semibold flex justify-between items-center">
            {type} ({grouped[type].length})
            <span>{openType === type ? "▲" : "▼"}</span>
          </button>
          {openType === type && (
            <div className="p-2 overflow-x-auto">
              <table className="min-w-full border-collapse border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Quantity</th>
                    <th className="border p-2">Unit</th>
                    <th className="border p-2">Date Received</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[type].slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((m) => (
                    <tr key={m._id} className="hover:bg-gray-100">
                      <td className="border p-2">{m.name}</td>
                      <td className="border p-2">{m.quantity}</td>
                      <td className="border p-2">{m.unit}</td>
                      <td className="border p-2">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="border p-2 flex gap-2">
                        <button onClick={() => { setEditing(m); setForm({ name: m.name, quantity: m.quantity, unit: m.unit, type: m.type, date: m.date.slice(0,10) }); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                        <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-end mt-2 gap-2">
                {Array.from({length: Math.ceil(grouped[type].length / itemsPerPage)}, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i+1)} className={`px-3 py-1 border rounded ${currentPage===i+1 ? "bg-blue-600 text-white" : "bg-white text-black"}`}>
                    {i+1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {loading && <p className="text-gray-500 mt-2">Loading...</p>}
    </div>
  );
}
