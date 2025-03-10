import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Button, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, CircularProgress, Paper
} from '@mui/material';
import { postData } from '../../utils/api';
import './Reports.css';

const SupplierReports = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await postData('/api/reports/supplier', {
                location: user?.location || ''
            });

            if (response?.success) {
                setReportData(response.data);
            } else {
                setError(response?.message || 'Failed to generate report');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to generate report');
        }
        setLoading(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(value);
    };

    return (
        <>
            <div className="report-header">
                <Typography variant="h5" className="report-title">
                    Supplier Reports
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={generateReport}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Generate Report'}
                </Button>
            </div>

            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}

            {reportData && (
                <>
                    <div className="report-stats">
                        <div className="stat-card">
                            <Typography variant="h6">Total Suppliers</Typography>
                            <Typography variant="h4">{reportData.summary.totalSuppliers}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Active Suppliers</Typography>
                            <Typography variant="h4">{reportData.summary.activeSuppliers}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Total Orders</Typography>
                            <Typography variant="h4">{reportData.summary.totalOrders}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Total Value</Typography>
                            <Typography variant="h4">{formatCurrency(reportData.summary.totalValue)}</Typography>
                        </div>
                    </div>

                    <div className="chart-container">
                        <Typography variant="h6" gutterBottom>Supplier Performance</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={reportData.performance || []}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                                <Bar dataKey="value" fill="#82ca9d" name="Value" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="table-container">
                        <Typography variant="h6" gutterBottom>Top Suppliers</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Supplier Name</TableCell>
                                        <TableCell align="right">Total Orders</TableCell>
                                        <TableCell align="right">Total Value</TableCell>
                                        <TableCell align="right">On-Time Delivery</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(reportData.topSuppliers || []).map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell>{supplier.name}</TableCell>
                                            <TableCell align="right">{supplier.totalOrders}</TableCell>
                                            <TableCell align="right">{formatCurrency(supplier.totalValue)}</TableCell>
                                            <TableCell align="right">{supplier.onTimeDelivery}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </>
            )}
        </>
    );
};

export default SupplierReports; 