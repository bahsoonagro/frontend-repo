import React, { useEffect, useState } from 'react';

export default function StockList() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch stock items
  useEffect(() => {
    fetch('https://backend-repo-ydwt.onrender.com/data')

      .then(res => res.json())
      .then(data => {
        setStocks(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <p>Loading stock items...</p>;

  return (
    <div>
      <h2>Stock Items</h2>
      <ul>
        {stocks.map(item => (
          <li key={item._id}>
            <strong>{item.name}</strong> - Qty: {item.quantity} - ${item.unitPrice.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

