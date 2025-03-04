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
    Chip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { postData, fetchDataFromApi } from '../../utils/api';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const StockOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const user = JSON.parse(localStorage.getItem('user'));
    const [progress, setProgress] = useState(0);
    const [alertBox, setAlertBox] = useState({ open: false, error: false, msg: '' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('pending');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetchDataFromApi(`/api/stock/supplier-orders/${user.userId}`);
            
            if (response.error) {
                throw new Error(response.error);
            }
            
            const ordersWithPrices = await Promise.all(response.map(async (order) => {
                if (!order) return null;
                
                try {
                    const supplierResponse = await fetchDataFromApi(
                        `/api/supplier-products/supplier/${user.userId}/product/${encodeURIComponent(order.productId.name)}`
                    );
                    
                    if (supplierResponse.error) {
                        throw new Error(supplierResponse.error);
                    }

                    const supplierPrice = supplierResponse.price;
                    const calculatedTotal = Number((supplierPrice * order.quantity).toFixed(2));
                    
                    return {
                        ...order,
                        orderDate: order.orderDate || new Date().toISOString(),
                        supplierPrice: supplierPrice,
                        totalAmount: calculatedTotal
                    };
                } catch (error) {
                    console.error('Error fetching supplier price:', error);
                    return null;
                }
            }));
            
            setOrders(ordersWithPrices.filter(order => order !== null));
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            if (newStatus === 'delivered') {
                await handleDeliveryUpdate(orderId);
                return;
            }

            const response = await postData(
                `/api/stock/update-order-status/${orderId}`,
                { status: newStatus }
            );

            if (response.error) {
                throw new Error(response.error || 'Failed to update order status');
            }

            setOrders(orders.map(order => 
                order._id === orderId ? { ...order, ...response.data } : order
            ));
            
            enqueueSnackbar('Order status updated successfully', { variant: 'success' });
            
            await fetchOrders();
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const handleDeliveryUpdate = async (orderId) => {
        try {
            setProgress(30);
            const orderToUpdate = orders.find(order => order._id === orderId);
            
            if (!orderToUpdate) {
                throw new Error('Order not found');
            }
            console.log("orderToUpdate.productId.name",orderToUpdate.productId.name);
            const supplierResponse = await fetchDataFromApi(
                `/api/supplier-products/by-name/${encodeURIComponent(orderToUpdate.productId.name)}`
            );

            if (supplierResponse.error) {
                throw new Error(supplierResponse.error);
            }

            const supplierProduct = supplierResponse.data;

            const updatedStockResponse = await postData(
                `/api/supplier-products/updateStock`,
                {
                    productId: supplierProduct._id,
                    quantity: orderToUpdate.quantity
                }
            );

            if (updatedStockResponse.error) {
                throw new Error(updatedStockResponse.error);
            }

            const response = await postData(
                `/api/stock/order/deliver/${orderId}`,
                {
                    productId: orderToUpdate.productId._id,
                    quantity: orderToUpdate.quantity,
                    location: orderToUpdate.location,
                    supplierPrice: supplierProduct.price,
                    totalAmount: orderToUpdate.totalAmount
                }
            );

            if (response.error) {
                throw new Error(response.error);
            }

            setSelectedOrder(orderToUpdate);
            setPaymentStatus('pending');
            await fetchOrders();

        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setProgress(100);
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
        <Box sx={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '24px',
                backgroundColor: '#fff',
                padding: '20px',
                marginTop: '80px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <LocalShippingIcon sx={{ fontSize: 32, color: '#0858f7', marginRight: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', flex: 1 }}>
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
            
            <TableContainer component={Paper} sx={{ 
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price/Unit</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => order && (
                            <TableRow key={order._id}>
                                <TableCell>
                                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>{order.productId?.name || '-'}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>₹{order.supplierPrice?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>₹{order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>{order.location || '-'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={order.status || 'pending'}
                                        color={
                                            order.status === 'pending' ? 'warning' :
                                            order.status === 'approved' ? 'info' :
                                            'success'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small">
                                        <Select
                                            value={order.status || 'pending'}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            disabled={order.status === 'delivered'}
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
        </Box>
    );
};

export default StockOrders;