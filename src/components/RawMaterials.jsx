import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusIcon, UploadIcon, TrashIcon, PencilIcon } from "@heroicons/react/outline";

// Shimmer loader
const Shimmer = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
    <div className="h-80 bg-gray-200 rounded"></div>
  </div>
);

const RawMaterials = ({ apiUrl }) => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/raw-materials`);
        setRawMaterials(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load raw materials.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  if (loading) return <Shimmer />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">📦 Raw Materials</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all">
            <PlusIcon className="w-5 h-5" /> Add Material
          </button>
          <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-all">
            <UploadIcon className="w-5 h-5" /> Bulk Upload
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rawMaterials.map((rm) => (
              <tr key={rm._id} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 text-gray-800">{rm.rawMaterialType}</td>
                <td className="px-6 py-4 text-gray-800">{rm.supplierName}</td>
                <td className="px-6 py-4 text-gray-800">{rm.bagsAfterStd}</td>
                <td className="px-6 py-4 text-gray-800">{rm.location}</td>
                <td className="px-6 py-4 text-gray-800">{new Date(rm.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  <button className="text-blue-500 hover:text-blue-700 transition-all">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button className="text-red-500 hover:text-red-700 transition-all">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {rawMaterials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No raw materials available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawMaterials;
