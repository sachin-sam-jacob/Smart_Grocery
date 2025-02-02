import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { fetchDataFromApi, postData } from '../../utils/api';

const Payment = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchOrders = async () => {
        try {
            const response = await fetchDataFromApi('/api/stock/orders');
            if (response.success) {
                setOrders(response.data.filter(order => order.status === 'delivered'));
            }
        } catch (error) {
            enqueueSnackbar('Error fetching orders', { variant: 'error' });
        }
    };

    const initializeRazorpay = (order) => {
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            amount: order.totalAmount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            name: 'Smart Grocery',
            description: `Payment for Order ${order._id}`,
            order_id: order.razorpayOrderId,
            handler: async (response) => {
                try {
                    const paymentData = {
                        orderId: order._id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        amount: order.totalAmount
                    };

                    const result = await postData(`/api/stock/orders/${order._id}/verify-payment`, paymentData);
                    
                    if (result.success) {
                        enqueueSnackbar('Payment successful', { variant: 'success' });
                        fetchOrders();
                    } else {
                        throw new Error(result.error || 'Payment verification failed');
                    }
                } catch (error) {
                    enqueueSnackbar(error.message, { variant: 'error' });
                }
            },
            prefill: {
                name: order.supplierId.name,
                email: order.supplierId.email
            },
            theme: {
                color: '#3f51b5'
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handlePayment = async (order) => {
        try {
            setLoading(true);
            const response = await postData(`/api/stock/orders/${order._id}/create-payment`, {
                amount: order.totalAmount
            });
            
            if (response.success) {
                initializeRazorpay({
                    ...order,
                    razorpayOrderId: response.orderId
                });
            }
        } catch (error) {
            enqueueSnackbar('Error initiating payment', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <Box p={3}>
            <Typography variant="h5" mb={3}>Payment Management</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Supplier</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Payment Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{order._id}</TableCell>
                                <TableCell>{order.supplierId.name}</TableCell>
                                <TableCell>{order.productId.name}</TableCell>
                                <TableCell>₹{order.totalAmount?.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={order.paymentStatus} 
                                        color={order.paymentStatus === 'completed' ? 'success' : 'warning'} 
                                    />
                                </TableCell>
                                <TableCell>
                                    {order.status === 'delivered' && order.paymentStatus === 'pending' && (
                                        <Button
                                            variant="contained"
                                            onClick={() => handlePayment(order)}
                                            disabled={loading}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'Pay Now'}
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Payment; 