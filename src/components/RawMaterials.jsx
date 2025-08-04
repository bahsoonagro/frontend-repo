import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const RawMaterials = () => {
  const [records, setRecords] = useState([]);

  const [formData, setFormData] = useState({
    material: '',
    month: '',
    openingBalance: '',
    newStockIn: '',
    totalStockIn: '',
    totalStockOut: '',
    totalStockBalance: '',
  });

  const printRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.material ||
      !formData.month ||
      formData.openingBalance === '' ||
      formData.newStockIn === '' ||
      formData.totalStockIn === '' ||
      formData.totalStockOut === '' ||
      formData.totalStockBalance === ''
    ) {
      alert('Please fill in all fields');
      return;
    }

    setRecords(prev => [...prev, formData]);
    setFormData({
      material: '',
      month: '',
      openingBalance: '',
      newStockIn: '',
      totalStockIn: '',
      totalStockOut: '',
      totalStockBalance: '',
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      const processedRecords = jsonData.slice(1).map(row => ({
        material: row[0] || '',
        month: row[1] || '',
        openingBalance: row[2] !== undefined ? row[2] : '',
        newStockIn: row[3] !== undefined ? row[3] : '',
        totalStockIn: row[4] !== undefined ? row[4] : '',
        totalStockOut: row[5] !== undefined ? row[5] : '',
        totalStockBalance: row[6] !== undefined ? row[6] : '',
      }));

      setRecords(prev => [...prev, ...processedRecords]);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    if (records.length === 0) {
      alert('No records to export');
      return;
    }

    const worksheetData = [
      [
        'Material',
        'Month',
        'Opening Balance',
        'New Stock In',
        'Total Stock In',
        'Total Stock Out',
        'Total Stock Balance',
      ],
      ...records.map(r => [
        r.material,
        r.month,
        r.openingBalance,
        r.newStockIn,
        r.totalStockIn,
        r.totalStockOut,
        r.totalStockBalance,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RawMaterials');

    XLSX.writeFile(workbook, 'RawMaterials.xlsx');
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800">Raw Materials Stock Management</h2>

      {/* Manual Input Form */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-lg shadow-md">
        <input
          name="material"
          value={formData.material}
          onChange={handleInputChange}
          placeholder="Material"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="month"
          value={formData.month}
          onChange={handleInputChange}
          placeholder="Month"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="openingBalance"
          value={formData.openingBalance}
          onChange={handleInputChange}
          placeholder="Opening Balance"
          type="number"
          step="any"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="newStockIn"
          value={formData.newStockIn}
          onChange={handleInputChange}
          placeholder="New Stock In"
          type="number"
          step="any"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="totalStockIn"
          value={formData.totalStockIn}
          onChange={handleInputChange}
          placeholder="Total Stock In"
          type="number"
          step="any"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="totalStockOut"
          value={formData.totalStockOut}
          onChange={handleInputChange}
          placeholder="Total Stock Out"
          type="number"
          step="any"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="totalStockBalance"
          value={formData.totalStockBalance}
          onChange={handleInputChange}
          placeholder="Total Stock Balance"
          type="number"
          step="any"
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-md p-3 flex items-center justify-center space-x-2 shadow-md"
        >
          <span className="text-lg">➕</span> <span>Add Record</span>
        </button>
      </form>

      {/* Import & Export Controls */}
      <div className="flex flex-wrap gap-4 mb-10 justify-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-md flex items-center space-x-2 shadow-md"
          title="Import Excel File"
        >
          <span>📥</span>
          <span>Import Excel</span>
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-md flex items-center space-x-2 shadow-md"
          title="Export to Excel"
        >
          <span>📤</span>
          <span>Export Excel</span>
        </button>

        <button
          onClick={handlePrint}
          className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-3 rounded-md flex items-center space-x-2 shadow-md"
          title="Print Table"
        >
          <span>🖨️</span>
          <span>Print Table</span>
        </button>
      </div>

      {/* Records Table */}
      <div ref={printRef} className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <tr>
              {['Material', 'Month', 'Opening Balance', 'New Stock In', 'Total Stock In', 'Total Stock Out', 'Total Stock Balance'].map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 px-4 py-3 text-left tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500 italic">
                  No records yet.
                </td>
              </tr>
            ) : (
              records.map((rec, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  title={`Record #${i + 1}`}
                  >
                  <td className="border border-gray-300 px-4 py-2">{rec.material}</td>
                  <td className="border border-gray-300 px-4 py-2">{rec.month}</td>
                  <td className="border border-gray-300 px-4 py-2">{rec.openingBalance}</td>
                  <td className="border border-gray-300 px-4 py-2">{rec.newStockIn}</td>
                  <td className="border border-gray-300 px-4 py-2">{rec.totalStockIn}</td>
                  <td className="border border-gray-300 px-4 py-2">{rec.totalStockOut}</td>
                  <td className="border border-gray-300 px-4 py-2">{rec.totalStockBalance}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawMaterials;
