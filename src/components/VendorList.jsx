// src/components/stock/VendorList.jsx
import React from 'react';

const VendorList = () => {
  const vendors = [
    { id: 1, name: 'Agro Distributors Ltd.', contact: '078123456' },
    { id: 2, name: 'Freetown Wholesale', contact: '076789012' },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-2">Vendors</h3>
      <ul className="space-y-1">
        {vendors.map(vendor => (
          <li key={vendor.id} className="flex justify-between">
            <span>{vendor.name}</span>
            <span className="text-gray-500">{vendor.contact}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendorList;

