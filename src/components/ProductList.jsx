// src/components/stock/ProductList.jsx
import React from 'react';

const ProductList = () => {
  const products = [
    { id: 1, name: 'Rice Bag', quantity: 120 },
    { id: 2, name: 'Groundnut Oil Bottle', quantity: 60 },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-2">Product List</h3>
      <ul className="space-y-1">
        {products.map(product => (
          <li key={product.id} className="flex justify-between">
            <span>{product.name}</span>
            <span className="text-gray-500">Qty: {product.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;

