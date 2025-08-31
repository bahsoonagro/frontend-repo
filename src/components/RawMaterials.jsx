// src/components/RawMaterials.jsx
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { FaChevronDown, FaChevronUp, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { Tab } from "@headlessui/react";

const API_URL = "https://backend-repo-ydwt.onrender.com/api";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RawMaterials() {
  // --- Tabs ---
  const [activeTab, setActiveTab] = useState(0);

  // --- Raw Materials State ---
  const [rawMaterials, setRawMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [accordionOpen, setAccordionOpen] = useState({}); // {groupKey: boolean}
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // --- Single Raw Material Form ---
  const emptyMaterial = {
    rawMaterialType: "",
    date: "",
    storeKeeper: "",
    supervisor: "",
    location: "",
    weightKg: "",
    damaged: "No",
    supplier: "",
  };
  const [formData, setFormData] = useState(emptyMaterial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- Bulk Upload ---
  const [file, setFile] = useState(null);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkError, setBulkError] = useState("");

  // --- Fetch raw materials ---
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/raw-materials`);
        const data = await res.json();
        setRawMaterials(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }
    fetchData();
  }, []);

  // --- Input Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Single Material Submit ---
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    if (!formData.rawMaterialType || !formData.date || !formData.storeKeeper || !formData.supervisor || !formData.location || !formData.weightKg || !formData.supplier) {
      setError("Please fill all fields.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/raw-materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRawMaterials(prev => [...prev, data]);
      setMessage(`Saved: ${data.rawMaterialType} (${data.weightKg}kg)`);
      setFormData(emptyMaterial);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Bulk Upload Handlers ---
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleBulkUpload = () => {
    setBulkMessage(""); setBulkError("");
    if (!file) {
      setBulkError("Please select a CSV or Excel file.");
      return;
    }

    const reader = new FileReader();
    const ext = file.name.split(".").pop().toLowerCase();

    reader.onload = async (e) => {
      let records = [];
      try {
        if (ext === "csv") {
          const text = e.target.result;
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
          records = parsed.data;
        } else if (ext === "xlsx") {
          const workbook = XLSX.read(e.target.result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
          setBulkError("Unsupported file type.");
          return;
        }

        if (records.length === 0) {
          setBulkError("No records found.");
          return;
        }

        // POST to backend
        const res = await fetch(`${API_URL}/raw-materials/bulk-upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(records)
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setRawMaterials(prev => [...prev, ...(data.addedMaterials || [])]);
        setBulkMessage("Bulk upload successful!");
        setFile(null);
      } catch (err) {
        console.error(err);
        setBulkError(err.message);
      }
    };

    if (ext === "csv") reader.readAsText(file);
    else reader.readAsBinaryString(file);
  };

  // --- Accordion + Grouping ---
  const groupBy = (field) => {
    return rawMaterials
      .filter(r => r[field])
      .reduce((groups, item) => {
        const key = item[field];
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
      }, {});
  };

  // --- Sorting & Filtering ---
  const filteredData = rawMaterials
    .filter(r => !searchTerm || r.rawMaterialType.toLowerCase().includes(searchTerm.toLowerCase()) || (r.supplier?.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      let aVal = a[sortField]; let bVal = b[sortField];
      if (sortField === "weightKg") { aVal = parseFloat(aVal); bVal = parseFloat(bVal); }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // --- Pagination ---
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-4 border-b pb-2 mb-4">
          <Tab className={({ selected }) => classNames("px-3 py-2 rounded", selected ? "bg-blue-600 text-white" : "text-blue-600")}>Add Material</Tab>
          <Tab className={({ selected }) => classNames("px-3 py-2 rounded", selected ? "bg-green-600 text-white" : "text-green-600")}>Bulk Upload</Tab>
          <Tab className={({ selected }) => classNames("px-3 py-2 rounded", selected ? "bg-purple-600 text-white" : "text-purple-600")}>Materials</Tab>
        </Tab.List>

        <Tab.Panels>
          {/* --- Single Material --- */}
          <Tab.Panel>
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
            <form onSubmit={handleSingleSubmit} className="space-y-3">
              <input type="text" name="rawMaterialType" value={formData.rawMaterialType} onChange={handleChange} placeholder="Material Type" className="border p-2 w-full" required />
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="border p-2 w-full" required />
              <input type="text" name="storeKeeper" value={formData.storeKeeper} onChange={handleChange} placeholder="Store Keeper" className="border p-2 w-full" required />
              <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="Supervisor" className="border p-2 w-full" required />
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="border p-2 w-full" required />
              <input type="number" name="weightKg" value={formData.weightKg} onChange={handleChange} placeholder="Weight (Kg)" className="border p-2 w-full" required />
              <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} placeholder="Supplier" className="border p-2 w-full" required />
              <select name="damaged" value={formData.damaged} onChange={handleChange} className="border p-2 w-full">
                <option value="No">Not Damaged</option>
                <option value="Yes">Damaged</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Material</button>
            </form>
          </Tab.Panel>

          {/* --- Bulk Upload --- */}
          <Tab.Panel>
            {bulkMessage && <p className="text-green-600">{bulkMessage}</p>}
            {bulkError && <p className="text-red-600">{bulkError}</p>}
            <input type="file" onChange={handleFileChange} accept=".csv,.xlsx" className="border p-2 w-full mb-3"/>
            <button onClick={handleBulkUpload} className="bg-green-600 text-white px-4 py-2 rounded">Upload</button>
          </Tab.Panel>

          {/* --- Materials Table with Accordion --- */}
          <Tab.Panel>
            <div className="mb-3 flex items-center justify-between">
              <input type="text" placeholder="Search by material or supplier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border p-2 w-1/3"/>
              <select value={sortField} onChange={e => setSortField(e.target.value)} className="border p-2">
                <option value="date">Date</option>
                <option value="rawMaterialType">Type</option>
                <option value="weightKg">Weight</option>
                <option value="supplier">Supplier</option>
              </select>
              <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="border px-2 py-1 ml-2">
                {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
              </button>
            </div>

            {["rawMaterialType","supplier","date"].map(groupField => {
              const groups = groupBy(groupField);
              return (
                <div key={groupField} className="mb-4">
                  <h3 className="text-lg font-bold mb-2">{groupField.toUpperCase()}</h3>
                  {Object.entries(groups).map(([key, items]) => (
                    <div key={key} className="border rounded mb-2">
                      <button
                        onClick={() => setAccordionOpen(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="w-full flex justify-between p-2 bg-gray-100 font-semibold"
                      >
                        <span>{key} ({items.length})</span>
                        {accordionOpen[key] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      {accordionOpen[key] && (
                        <table className="w-full border text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="border p-2">Date</th>
                              <th className="border p-2">Type</th>
                              <th className="border p-2">Weight (Kg)</th>
                              <th className="border p-2">Supplier</th>
                              <th className="border p-2">Damaged</th>
                              <th className="border p-2">Store Keeper</th>
                              <th className="border p-2">Supervisor</th>
                              <th className="border p-2">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage).map((item,i) => (
                              <tr key={i}>
                                <td className="border p-2">{item.date}</td>
                                <td className="border p-2">{item.rawMaterialType}</td>
                                <td className="border p-2">{item.weightKg}</td>
                                <td className="border p-2">{item.supplier}</td>
                                <td className="border p-2">{item.damaged}</td>
                                <td className="border p-2">{item.storeKeeper}</td>
                                <td className="border p-2">{item.supervisor}</td>
                                <td className="border p-2">{item.location}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Pagination */}
            <div className="flex justify-center space-x-2 mt-3">
              <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} className="border px-2 py-1">Prev</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} className="border px-2 py-1">Next</button>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
