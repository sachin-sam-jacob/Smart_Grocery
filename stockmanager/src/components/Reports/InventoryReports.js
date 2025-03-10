import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
    Button, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, CircularProgress, Paper
} from '@mui/material';
import './Reports.css';
import { postData } from '../../utils/api';

const InventoryReports = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await postData('/api/reports/inventory', {
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
                    Inventory Reports
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
                            <Typography variant="h6">Total Products</Typography>
                            <Typography variant="h4">{reportData.summary.totalProducts}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Low Stock Items</Typography>
                            <Typography variant="h4">{reportData.summary.lowStock}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Out of Stock</Typography>
                            <Typography variant="h4">{reportData.summary.outOfStock}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Total Inventory Value</Typography>
                            <Typography variant="h4">{formatCurrency(reportData.summary.totalValue)}</Typography>
                        </div>
                    </div>

                    <div className="chart-container">
                        <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(reportData.summary.categoryBreakdown || {}).map(([category, data]) => ({
                                                name: category,
                                                value: data.count
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {Object.entries(reportData.summary.categoryBreakdown || {}).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Category</TableCell>
                                                <TableCell align="right">Count</TableCell>
                                                <TableCell align="right">Value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Object.entries(reportData.summary.categoryBreakdown || {}).map(([category, data]) => (
                                                <TableRow key={category}>
                                                    <TableCell>{category}</TableCell>
                                                    <TableCell align="right">{data.count}</TableCell>
                                                    <TableCell align="right">{formatCurrency(data.value)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    </div>

                    <div className="table-container">
                        <Typography variant="h6" gutterBottom>Low Stock Items</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell align="right">Current Stock</TableCell>
                                        <TableCell align="right">Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(reportData.products || [])
                                        .filter(p => p.stock <= 10)
                                        .map(product => (
                                            <TableRow key={product.id}>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell align="right">{product.stock}</TableCell>
                                                <TableCell align="right">{formatCurrency(product.value)}</TableCell>
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

export default InventoryReports; 