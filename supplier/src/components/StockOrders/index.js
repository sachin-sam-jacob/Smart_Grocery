import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControl,
    Select,
    MenuItem,
    Typography,
    Box,
    CircularProgress,
    Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const StockOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/stock/supplier-orders/${user.userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch orders');
            }
            
            setOrders(data);
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/stock/update-order-status/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update order status');
            }

            setOrders(orders.map(order => 
                order._id === orderId ? data : order
            ));
            
            enqueueSnackbar('Order status updated successfully', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#ff9800';
            case 'approved':
                return '#2196f3';
            case 'delivered':
                return '#4caf50';
            default:
                return '#757575';
        }
    };

    const containerStyles = {
        padding: '24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
    };

    const headerStyles = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: '#fff',
        padding: '20px',
        marginTop: '80px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const tableContainerStyles = {
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden'
    };

    const tableHeaderCellStyles = {
        backgroundColor: '#f8f9fa',
        fontWeight: 600,
        color: '#2c3e50',
        padding: '16px'
    };

    const tableCellStyles = {
        padding: '16px',
        color: '#2c3e50'
    };

    const statusChipStyles = (status) => ({
        backgroundColor: `${getStatusColor(status)}15`,
        color: getStatusColor(status),
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: '16px',
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${getStatusColor(status)}30`
    });

    const selectStyles = {
        minWidth: 120,
        '& .MuiSelect-select': {
            padding: '8px 12px',
            borderRadius: '8px'
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress sx={{ color: '#0858f7' }} />
            </Box>
        );
    }

    return (
        <Box sx={containerStyles}>
            <Box sx={headerStyles}>
                <LocalShippingIcon sx={{ fontSize: 32, color: '#0858f7', marginRight: 2 }} />
                <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: '#2c3e50',
                    flex: 1
                }}>
                    Stock Orders
                </Typography>
                <Chip 
                    label={`Total Orders: ${orders.length}`} 
                    sx={{
                        backgroundColor: '#0858f715',
                        color: '#0858f7',
                        fontWeight: 600,
                        padding: '4px 8px'
                    }}
                />
            </Box>
            
            <TableContainer component={Paper} sx={tableContainerStyles}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={tableHeaderCellStyles}>Order Date</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Product</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Quantity</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Location</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Status</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow 
                                key={order._id}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: '#f8f9fa'
                                    }
                                }}
                            >
                                <TableCell sx={tableCellStyles}>
                                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell sx={tableCellStyles}>{order.productId.name}</TableCell>
                                <TableCell sx={tableCellStyles}>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        {order.quantity} units
                                    </Typography>
                                </TableCell>
                                <TableCell sx={tableCellStyles}>{order.location}</TableCell>
                                <TableCell sx={tableCellStyles}>
                                    <Box sx={statusChipStyles(order.status)}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Box>
                                </TableCell>
                                <TableCell sx={tableCellStyles}>
                                    <FormControl size="small" sx={selectStyles}>
                                        <Select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            disabled={order.status === 'delivered'}
                                            sx={{
                                                '&.Mui-disabled': {
                                                    backgroundColor: '#f5f5f5'
                                                }
                                            }}
                                        >
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="approved">Approved</MenuItem>
                                            <MenuItem value="delivered">Delivered</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {orders.length === 0 && (
                <Box sx={{
                    textAlign: 'center',
                    padding: '48px',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    marginTop: '24px'
                }}>
                    <LocalShippingIcon sx={{ fontSize: 48, color: '#9e9e9e', marginBottom: 2 }} />
                    <Typography variant="h6" sx={{ color: '#2c3e50', marginBottom: 1 }}>
                        No Orders Found
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                        There are no stock orders to display at the moment.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default StockOrders;