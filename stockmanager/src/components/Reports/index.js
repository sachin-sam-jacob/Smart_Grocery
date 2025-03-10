import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalesReports from './SalesReports';
import InventoryReports from './InventoryReports';
import SupplierReports from './SupplierReports';
import CustomReports from './CustomReports';
import './Reports.css';

const Reports = () => {
    return (
        <div className="content-wrapper">
            <div className="report-container">
                <Routes>
                    <Route path="/sales" element={<SalesReports />} />
                    <Route path="/inventory" element={<InventoryReports />} />
                    <Route path="/supplier" element={<SupplierReports />} />
                    <Route path="/custom" element={<CustomReports />} />
                </Routes>
            </div>
        </div>
    );
};

export default Reports; 