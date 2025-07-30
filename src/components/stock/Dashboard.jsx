import React from 'react';
import ProductList from './ProductList';
import StockIn from './StockIn';
import StockOut from './StockOut';
import VendorList from './VendorList';
import Reports from './Reports'; // Optional, only if implemented

const Dashboard = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Stock Dashboard</h2>
      <ProductList />
      <StockIn />
      <StockOut />
      <VendorList />
      {/* <Reports /> */}
    </div>
  );
};

export default Dashboard;

