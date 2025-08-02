import React, { useState } from 'react';

import DispatchDelivery from './DispatchDelivery';
import StockMovements from './StockMovements';
import Reports from './Reports';
// Add other components...

const TABS = {
  Dispatch: <DispatchDelivery />,
  'Stock Movements': <StockMovements />,
  Reports: <Reports />,
};

const StockManagement = () => {
  const [activeTab, setActiveTab] = useState('Dispatch');

  return (
    <div>
      <div className="flex space-x-4 border-b mb-4">
        {Object.keys(TABS).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>{TABS[activeTab]}</div>
    </div>
  );
};

export default StockManagement;

