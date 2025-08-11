import React, { useState, useEffect } from "react";
import axios from "axios";

const FinishedProducts = ({ apiUrl }) => {
  const [formData, setFormData] = useState({
    product: "",
    batch: "",
    quantity: "",
    unit: "",
    date: "",
    remarks: ""
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch finished products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${apiUrl}/api/finished-products`);
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load finished products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.product || !formData.batch || !formData.quantity || !formData.unit || !formData.date) {
      setError("Please fill in all required fields.");
      return;
    }

    // Prepare data to match backend schema
    const newProductData = {
      productName: formData.product,
      batchNumber: formData.batch,
      quantityKg: Number(formData.quantity),
      unit: formData.unit,
      productionDate: formData.date,
      remarks: formData.remarks || ""
    };

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${apiUrl}/api/finished-products`, newProductData);
      setProducts((prev) => [...prev, response.data]);
      setSuccessMsg("Product added successfully!");
      setFormData({
        product: "",
        batch: "",
        quantity: "",
        unit: "",
        date: "",
        remarks: ""
      });
    } catch (err) {
      setError("Failed to save finished product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🏷️ Finished Products</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <input
          type="text"
          name="product"
          placeholder="Product Name"
          value={formData.product}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="batch"
          placeholder="Batch Number"
          value={formData.batch}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="p-2 border rounded"
          min="0"
          required
        />
        <input
          type="text"
          name="unit"
          placeholder="Unit (e.g. kg, cartons)"
          value={formData.unit}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="remarks"
          placeholder="Remarks (optional)"
          value={formData.remarks}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="col-span-1 md:col-span-6 bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : "➕ Add Product"}
        </button>
      </form>

      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {successMsg && <div className="mb-4 text-green-600 font-semibold">{successMsg}</div>}

      {loading && products.length === 0 ? (
        <div>Loading products...</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Batch</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Unit</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{prod.productName}</td>
                  <td className="p-2 border">{prod.batchNumber}</td>
                  <td className="p-2 border">{prod.quantityKg}</td>
                  <td className="p-2 border">{prod.unit}</td>
                  <td className="p-2 border">{new Date(prod.productionDate).toLocaleDateString()}</td>
                  <td className="p-2 border">{prod.remarks || "-"}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No finished products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinishedProducts;
