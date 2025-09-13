import React, { useEffect, useState } from "react";
import axios from "axios";

// Shimmer placeholder for loading
const Shimmer = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
    <div className="h-40 bg-gray-200 rounded"></div>
  </div>
);

const RawMaterials = ({ apiUrl }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/raw-materials`);
        setMaterials(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching raw materials:", err);
        setError("Failed to load raw materials.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [apiUrl]);

  if (loading) return <div className="p-4 space-y-4"><Shimmer /><Shimmer /></div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Raw Materials Store</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.length === 0 && (
          <p className="col-span-full text-gray-500">No raw materials available.</p>
        )}

        {materials.map((m) => (
          <div key={m._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">{m.rawMaterialType}</h3>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Supplier:</span> {m.supplierName}</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Phone:</span> {m.supplierPhone}</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Bags:</span> {m.supplierBags}</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Extra Kg:</span> {m.extraKg}</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Total Weight:</span> {m.totalWeight} kg</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Store Keeper:</span> {m.storeKeeper}</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Supervisor:</span> {m.supervisor}</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Batch #:</span> {m.batchNumber}</p>
            <p className={`text-sm font-medium mt-2 ${m.damaged === "Yes" ? "text-red-600" : "text-green-600"}`}>
              {m.damaged === "Yes" ? "⚠ Damaged" : "✅ Good Condition"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RawMaterials;
