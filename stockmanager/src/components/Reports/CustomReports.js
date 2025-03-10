import React, { useState } from 'react';
import {
    Button, Typography, Grid, FormControl, InputLabel,
    Select, MenuItem, TextField, CircularProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import './Reports.css';
import { postData } from '../../utils/api';

const CustomReports = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const [reportType, setReportType] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const generateReport = async () => {
        if (!reportType) {
            setError('Please select a report type');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await postData('/api/reports/custom', {
                reportType,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
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
                    Custom Reports
                </Typography>
            </div>

            <div className="filter-section">
                <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        label="Report Type"
                    >
                        <MenuItem value="product-performance">Product Performance</MenuItem>
                        <MenuItem value="category-analysis">Category Analysis</MenuItem>
                        <MenuItem value="supplier-performance">Supplier Performance</MenuItem>
                        <MenuItem value="inventory-turnover">Inventory Turnover</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    type="date"
                    label="Start Date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    type="date"
                    label="End Date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={generateReport}
                    disabled={loading || !reportType || !dateRange.startDate || !dateRange.endDate}
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
                <div className="table-container">
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {(reportData.headers || []).map((header, index) => (
                                        <TableCell key={index} align={index === 0 ? "left" : "right"}>
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(reportData.rows || []).map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <TableCell 
                                                key={cellIndex} 
                                                align={cellIndex === 0 ? "left" : "right"}
                                            >
                                                {typeof cell === 'number' && cellIndex !== 0
                                                    ? formatCurrency(cell)
                                                    : cell}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </>
    );
};

export default CustomReports; 