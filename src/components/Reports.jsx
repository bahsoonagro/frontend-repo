// src/components/stock/Reports.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Reports = ({ apiUrl }) => {
  const [summary, setSummary] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // call: `${apiUrl}/api/reports/stock-summary`
  useEffect(() => {
    if (!apiUrl) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${apiUrl}/api/reports/stock-summary`);
        setSummary(res.data.summary);
        setRecentMovements(res.data.recentMovements);
      } catch (err) {
        console.error(err);
        setError("Unable to load report data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  if (!apiUrl) return <div className="p-4">No API URL provided.</div>;

  return (
    <div className="bg-white p-4 rounded shadow max-w-7xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Stock Reports</h3>

      {loading ? (
        <div>Loading report…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold">
                ${Number(summary.totalStockValue || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Total Item Types</p>
              <p className="text-2xl font-bold">{summary.totalItemsCount}</p>
            </div>
            <div className="p-4 bg-red-50 rounded">
              <p className="text-sm text-gray-600">Total Out (30d)</p>
              <p className="text-2xl font-bold">{summary.totalOut30}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded">
              <p className="text-sm text-gray-600">Total In (30d)</p>
              <p className="text-2xl font-bold">{summary.totalIn30}</p>
            </div>
          </div>

          {/* Top items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-2">Top by Quantity</h4>
              <ol className="list-decimal pl-5">
                {summary.topByQty.length === 0 ? (
                  <li className="text-gray-500">No data</li>
                ) : (
                  summary.topByQty.map((t) => (
                    <li key={t._id || t.name}>
                      {t.name} — {t.quantity}
                    </li>
                  ))
                )}
              </ol>
            </div>

            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-2">Top by Value</h4>
              <ol className="list-decimal pl-5">
                {summary.topByValue.length === 0 ? (
                  <li className="text-gray-500">No data</li>
                ) : (
                  summary.topByValue.map((t, idx) => (
                    <li key={t._id || idx}>
                      {t.name} — ${Number(t.value || 0).toLocaleString()}
                    </li>
                  ))
                )}
              </ol>
            </div>
          </div>

          {/* Low stock */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Low Stock Alerts ({summary.lowStockCount})</h4>
            {summary.lowStockCount === 0 ? (
              <p className="text-gray-500">All items are above reorder level.</p>
            ) : (
              <div className="overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Reorder Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.lowStockItems.map((it) => (
                      <tr key={it._id} className="hover:bg-gray-50">
                        <td className="p-2 border">{it.name}</td>
                        <td className="p-2 border">{it.quantity}</td>
                        <td className="p-2 border">{it.reorderLevel ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent movements */}
          <div>
            <h4 className="font-semibold mb-2">Recent Stock Movements</h4>
            <div className="overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Item</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Quantity</th>
                    <th className="p-2 border">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        No recent movements
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((m) => (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="p-2 border">{new Date(m.date).toLocaleString()}</td>
                        <td className="p-2 border">{m.itemName}</td>
                        <td className={`p-2 border ${m.type === "IN" ? "text-green-600" : m.type === "OUT" ? "text-red-600" : ""}`}>
                          {m.type}
                        </td>
                        <td className="p-2 border">{m.quantity}</td>
                        <td className="p-2 border">{m.notes || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
