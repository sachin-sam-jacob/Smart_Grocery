import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import {
    TextField, Button, FormControl, InputLabel, Select, MenuItem,
    Typography, Grid, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Paper
} from '@mui/material';
import './Reports.css';
import { postData } from '../../utils/api';

const SalesReports = () => {
    const [period, setPeriod] = useState('daily');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit'
        });
    };

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await postData('/api/reports/sales', {
                period,
                customStart: period === 'custom' ? customStartDate : null,
                customEnd: period === 'custom' ? customEndDate : null,
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

    const prepareChartData = (dailySales) => {
        return Object.entries(dailySales || {}).map(([date, amount]) => ({
            date: formatDate(date),
            amount
        }));
    };

    return (
        <>
            <div className="report-header">
                <Typography variant="h5" className="report-title">
                    Sales Reports
                </Typography>
            </div>

            <div className="filter-section">
                <FormControl>
                    <InputLabel>Report Period</InputLabel>
                    <Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        label="Report Period"
                    >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                </FormControl>

                {period === 'custom' && (
                    <>
                        <TextField
                            type="date"
                            label="Start Date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="date"
                            label="End Date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    onClick={generateReport}
                    disabled={loading || (period === 'custom' && (!customStartDate || !customEndDate))}
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
                            <Typography variant="h6">Total Orders</Typography>
                            <Typography variant="h4">{reportData.summary.totalOrders}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Total Revenue</Typography>
                            <Typography variant="h4">{formatCurrency(reportData.summary.totalRevenue)}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Total Products Sold</Typography>
                            <Typography variant="h4">{reportData.summary.totalProducts}</Typography>
                        </div>
                        <div className="stat-card">
                            <Typography variant="h6">Average Order Value</Typography>
                            <Typography variant="h4">{formatCurrency(reportData.summary.averageOrderValue)}</Typography>
                        </div>
                    </div>

                    <div className="chart-container">
                        <Typography variant="h6" gutterBottom>Daily Sales Trend</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={prepareChartData(reportData.summary.dailySales)}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="table-container">
                        <Typography variant="h6" gutterBottom>Top Products</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell align="right">Quantity Sold</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(reportData.summary.topProducts || {})
                                        .sort(([, a], [, b]) => b.revenue - a.revenue)
                                        .slice(0, 5)
                                        .map(([id, product]) => (
                                            <TableRow key={id}>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell align="right">{product.quantity}</TableCell>
                                                <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
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

export default SalesReports; 