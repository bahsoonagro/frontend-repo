import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/finished-products";

export default function FinishedProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    stockPack: "",
    openingStock: 0,
    stockIn: 0,
    stockOut: 0,
    productionDate: "",
    week: 1,
    month: "",
  });
  const [editingId, setEditingId] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterWeek, setFilterWeek] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => fetchProducts(), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${API_URL}/${editingId}`, formData);
      else await axios.post(API_URL, formData);
      setEditingId(null);
      setFormData({
        productName: "",
        stockPack: "",
        openingStock: 0,
        stockIn: 0,
        stockOut: 0,
        productionDate: "",
        week: 1,
        month: "",
      });
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      productName: product.productName,
      stockPack: product.stockPack,
      openingStock: product.openingStock,
      stockIn: product.stockIn,
      stockOut: product.stockOut,
      productionDate: product.productionDate.slice(0, 10),
      week: product.week,
      month: product.month,
    });
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API_URL}/${id}`); fetchProducts(); } 
    catch (err) { console.error(err); }
  };

  const totalQty = (p) => Number(p.openingStock) + Number(p.stockIn);
  const closingStock = (p) => totalQty(p) - Number(p.stockOut);

  useEffect(() => {
    let temp = [...products];
    if (searchName) temp = temp.filter((p) => p.productName.toLowerCase().includes(searchName.toLowerCase()));
    if (filterMonth) temp = temp.filter((p) => p.month === filterMonth);
    if (filterWeek) temp = temp.filter((p) => p.week === Number(filterWeek));

    if (sortConfig.key) {
      temp.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === "number") return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        aVal = aVal ? aVal.toString().toLowerCase() : "";
        bVal = bVal ? bVal.toString().toLowerCase() : "";
        return sortConfig.direction === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    }
    setFilteredProducts(temp);
  }, [searchName, filterMonth, filterWeek, products, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getClosingStockColor = (cs) => {
    if (cs < 10) return "bg-red-200 text-red-800";
    if (cs <= 30) return "bg-yellow-200 text-yellow-800";
    return "bg-green-200 text-green-800";
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredProducts.map((p, idx) => ({
        "S/N": idx + 1,
        "STOCK ITEM": p.productName,
        "STOCK PACK": p.stockPack,
        "OPENING STOCK": p.openingStock,
        "STOCK IN": p.stockIn,
        "TOTAL QTY": totalQty(p),
        "STOCK OUT": p.stockOut,
        "CLOSING STOCK": closingStock(p)
      }))
    );

    // Apply Excel colors
    filteredProducts.forEach((p, idx) => {
      const cs = closingStock(p);
      const cell = ws[`H${idx + 2}`]; // H column
      if (cell) cell.s = { fill: { fgColor: { rgb: cs < 10 ? "FFCCCC" : cs <= 30 ? "FFFF99" : "CCFFCC" } } };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finished Products");
    XLSX.writeFile(wb, `FinishedProducts_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("BENNIMIX FOOD COMPANY INVENTORY - FINISHED PRODUCTS", 14, 15);
    doc.setFontSize(10);
    doc.text(`MONTH: ${filterMonth || "-"}   WK: ${filterWeek || "-"}   DATE: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["S/N", "STOCK ITEM", "STOCK PACK", "OPENING STOCK", "STOCK IN", "TOTAL QTY", "STOCK OUT", "CLOSING STOCK"];
    const tableRows = filteredProducts.map((p, idx) => {
      const cs = closingStock(p);
      return [
        idx + 1,
        p.productName,
        p.stockPack,
        p.openingStock,
        p.stockIn,
        totalQty(p),
        p.stockOut,
        { content: cs, styles: { fillColor: cs < 10 ? [255, 102, 102] : cs <= 30 ? [255, 255, 153] : [102, 255, 102] } }
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`FinishedProducts_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">BENNIMIX FOOD COMPANY INVENTORY</h2>

      {/* Filters */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
        <input type="text" placeholder="Search by Product" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <input type="text" placeholder="Filter by Month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <input type="number" placeholder="Filter by Week" value={filterWeek} onChange={(e) => setFilterWeek(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" min={1} max={5} />
        <button onClick={() => { setSearchName(""); setFilterMonth(""); setFilterWeek(""); }} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition">Clear Filters</button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl shadow-inner">
        <input name="productName" placeholder="Stock Item" value={formData.productName} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" required />
        <input name="stockPack" placeholder="Stock Pack" value={formData.stockPack} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" required />
        <input type="number" name="openingStock" placeholder="Opening Stock" value={formData.openingStock} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <input type="number" name="stockIn" placeholder="Stock In" value={formData.stockIn} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <input type="number" name="stockOut" placeholder="Stock Out" value={formData.stockOut} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <input type="date" name="productionDate" value={formData.productionDate} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" required />
        <input type="number" name="week" placeholder="Week" value={formData.week} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" min={1} max={5} />
        <input name="month" placeholder="Month" value={formData.month} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-blue-400" />
        <button type="submit" className="col-span-1 md:col-span-4 bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition duration-200">{editingId ? "Update Product" : "➕ Add Product"}</button>
      </form>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-4">
        <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition duration-200">📊 Export Excel</button>
        <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded-xl shadow hover:bg-red-700 transition duration-200">📄 Export PDF</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-blue-100">
            <tr>
              {["S/N","STOCK ITEM","STOCK PACK","OPENING STOCK","STOCK IN","TOTAL QTY","STOCK OUT","CLOSING STOCK","ACTIONS"].map((col,key)=>(
                <th
                  key={key}
                  className="p-3 border cursor-pointer select-none"
                  onClick={() => col !== "ACTIONS" && requestSort(
                    col.replace(/\s+/g,'').toLowerCase()
                  )}
                  title={col !== "ACTIONS" ? `Sort by ${col}` : ""}
                >
                  {col} {sortConfig.key === col.replace(/\s+/g,'').toLowerCase() ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">No finished products found.</td>
              </tr>
            )}
            {filteredProducts.map((p, idx) => (
              <tr key={p._id} className="hover:bg-gray-50 transition duration-150 cursor-pointer" title="Click edit or delete">
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border">{p.productName}</td>
                <td className="p-2 border">{p.stockPack}</td>
                <td className="p-2 border text-right">{p.openingStock}</td>
                <td className="p-2 border text-right">{p.stockIn}</td>
                <td className="p-2 border text-right font-semibold">{totalQty(p)}</td>
                <td className="p-2 border text-right">{p.stockOut}</td>
                <td className={`p-2 border text-right font-semibold ${getClosingStockColor(closingStock(p))}`} title={`Closing Stock: ${closingStock(p)}`}>{closingStock(p)}</td>
                <td className="p-2 border flex gap-2 justify-center">
                  <button onClick={() => handleEdit(p)} className="bg-yellow-400 px-2 py-1 rounded shadow hover:bg-yellow-500" title="Edit Product">✏️</button>
                  <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white px-2 py-1 rounded shadow hover:bg-red-600" title="Delete Product">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
