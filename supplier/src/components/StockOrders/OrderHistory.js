import React, { useState, useEffect, useContext } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const user = JSON.parse(localStorage.getItem('user'));
    const context = useContext(MyContext);

    useEffect(() => {
        fetchDeliveredOrders();
    }, []);

    const fetchDeliveredOrders = async () => {
        try {
            const data = await fetchDataFromApi(`/api/stock/supplier-delivered-orders/${user.userId}`);
            
            if (data.error) {
                throw new Error(data.error || 'Failed to fetch order history');
            }
            
            setOrders(data);
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const containerStyles = {
        padding: '24px',
        backgroundColor: document.body.classList.contains('dark') ? '#071739' : '#f5f5f5',
        minHeight: '100vh'
    };

    const headerStyles = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: document.body.classList.contains('dark') ? '#112143' : '#fff',
        padding: '20px',
        marginTop: '80px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const tableContainerStyles = {
        backgroundColor: document.body.classList.contains('dark') ? '#112143' : '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden'
    };

    const tableHeaderCellStyles = {
        backgroundColor: document.body.classList.contains('dark') ? '#1b2b4d' : '#f8f9fa',
        fontWeight: 600,
        color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.9)' : '#2c3e50',
        padding: '16px'
    };

    const tableCellStyles = {
        padding: '16px',
        color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.8)' : '#2c3e50'
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
                    color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.9)' : '#2c3e50',
                    flex: 1
                }}>
                    Order History
                </Typography>
                <Chip 
                    label={`Total Delivered Orders: ${orders.length}`} 
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
                            <TableCell sx={tableHeaderCellStyles}>Total Amount</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Location</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Delivery Date</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Payment Status</TableCell>
                            <TableCell sx={tableHeaderCellStyles}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow 
                                key={order._id}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: document.body.classList.contains('dark') ? '#1b2b4d' : '#f8f9fa'
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
                                    <Typography sx={{ 
                                        fontWeight: 600,
                                        color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.9)' : 'inherit'
                                    }}>
                                        {order.quantity} units
                                    </Typography>
                                </TableCell>
                                <TableCell sx={tableCellStyles}>₹{order.totalAmount?.toFixed(2)}</TableCell>
                                <TableCell sx={tableCellStyles}>{order.location}</TableCell>
                                <TableCell sx={tableCellStyles}>
                                    {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell sx={tableCellStyles}>
                                    <Chip 
                                        label={order.paymentStatus || 'pending'}
                                        color={order.paymentStatus === 'completed' ? 'success' : 'warning'}
                                        sx={{
                                            fontWeight: 600,
                                            borderRadius: '16px',
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={tableCellStyles}>
                                    <Box sx={{
                                        backgroundColor: '#4caf5015',
                                        color: '#4caf50',
                                        fontWeight: 600,
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        border: '1px solid #4caf5030'
                                    }}>
                                        Delivered
                                    </Box>
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
                    backgroundColor: document.body.classList.contains('dark') ? '#112143' : '#fff',
                    borderRadius: '10px',
                    marginTop: '24px'
                }}>
                    <LocalShippingIcon sx={{ fontSize: 48, color: '#9e9e9e', marginBottom: 2 }} />
                    <Typography variant="h6" sx={{ 
                        color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.9)' : '#2c3e50',
                        marginBottom: 1 
                    }}>
                        No Delivered Orders
                    </Typography>
                    <Typography variant="body1" sx={{ 
                        color: document.body.classList.contains('dark') ? 'rgba(255,255,255,0.7)' : '#7f8c8d'
                    }}>
                        There are no delivered orders in your history.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default OrderHistory; 