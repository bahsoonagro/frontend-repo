import React, { useState, useEffect } from "react";
import axios from "axios";

const FinishedProducts = () => {
  const [formData, setFormData] = useState({
    product: "",
    batch: "",
    quantity: "",
    unit: "",
    date: ""
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const backendUrl = "https://backend-repo-ydwt.onrender.com"; // Replace with your backend URL

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${backendUrl}/api/finished-products`);
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load finished products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);

    // Basic validation example
    if (
      !formData.product.trim() ||
      !formData.batch.trim() ||
      !formData.quantity ||
      !formData.unit.trim() ||
      !formData.date
    ) {
      setSubmitError("Please fill in all fields.");
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/finished-products`, formData);
      setProducts([...products, res.data]);
      setFormData({ product: "", batch: "", quantity: "", unit: "", date: "" });
    } catch (err) {
      setSubmitError("Failed to save finished product. Try again.");
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🏷️ Finished Products</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          name="product"
          placeholder="Product Name"
          value={formData.product}
          onChange={handleChange}
          className="p-2 border rounded"
          required
          disabled={submitLoading}
        />
        <input
          type="text"
          name="batch"
          placeholder="Batch Number"
          value={formData.batch}
          onChange={handleChange}
          className="p-2 border rounded"
          required
          disabled={submitLoading}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="p-2 border rounded"
          required
          disabled={submitLoading}
          min="0"
        />
        <input
          type="text"
          name="unit"
          placeholder="Unit (e.g. kg, cartons)"
          value={formData.unit}
          onChange={handleChange}
          className="p-2 border rounded"
          required
          disabled={submitLoading}
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded"
          required
          disabled={submitLoading}
        />
        <button
          type="submit"
          className={`col-span-1 md:col-span-5 py-2 rounded text-white ${
            submitLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={submitLoading}
        >
          {submitLoading ? "Saving..." : "➕ Add Product"}
        </button>
      </form>

      {submitError && <p className="text-red-600 mb-4">{submitError}</p>}

      {loading ? (
        <p>Loading finished products...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p>No finished products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Batch</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Unit</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id || prod.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{prod.productName || prod.product}</td>
                  <td className="p-2 border">{prod.batchNumber || prod.batch}</td>
                  <td className="p-2 border">{prod.quantity || prod.qty}</td>
                  <td className="p-2 border">{prod.unit}</td>
                  <td className="p-2 border">
                    {prod.date
                      ? new Date(prod.date).toISOString().split("T")[0]
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinishedProducts;
