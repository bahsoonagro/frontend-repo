// src/components/FinishedProductsFactory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://backend-repo-ydwt.onrender.com/api/finished-products";

export default function FinishedProductsFactory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    batchNumber: "",
    productionDate: "",
    quantityKg: "",
    unit: "",
    remarks: "",
  });
  const [editingId, setEditingId] = useState(null);

  // fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({
        productName: "",
        batchNumber: "",
        productionDate: "",
        quantityKg: "",
        unit: "",
        remarks: "",
      });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // edit product
  const handleEdit = (product) => {
    setForm({
      productName: product.productName,
      batchNumber: product.batchNumber,
      productionDate: product.productionDate.split("T")[0],
      quantityKg: product.quantityKg,
      unit: product.unit,
      remarks: product.remarks || "",
    });
    setEditingId(product._id);
  };

  // delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // print/export clean table
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableHTML = document.getElementById("finishedProductsTable").outerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Finished Products Report</title>
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Finished Products Report</h2>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow"
      >
        <input
          name="productName"
          placeholder="Product Name"
          value={form.productName}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="batchNumber"
          placeholder="Batch Number"
          value={form.batchNumber}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          name="productionDate"
          value={form.productionDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="quantityKg"
          placeholder="Quantity (Kg)"
          value={form.quantityKg}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="unit"
          placeholder="Unit (e.g. bags, cartons)"
          value={form.unit}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded col-span-2"
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Finished Products List</h2>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Print/Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table
            id="finishedProductsTable"
            className="min-w-full border border-gray-300"
          >
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Product Name</th>
                <th className="border px-4 py-2">Batch No.</th>
                <th className="border px-4 py-2">Production Date</th>
                <th className="border px-4 py-2">Quantity (Kg)</th>
                <th className="border px-4 py-2">Unit</th>
                <th className="border px-4 py-2">Remarks</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{p.productName}</td>
                  <td className="border px-4 py-2">{p.batchNumber}</td>
                  <td className="border px-4 py-2">
                    {new Date(p.productionDate).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">{p.quantityKg}</td>
                  <td className="border px-4 py-2">{p.unit}</td>
                  <td className="border px-4 py-2">{p.remarks}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
