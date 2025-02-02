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

    const handlePayment = async (order) => {
        try {
            setLoading(true);
            const response = await postData(`/api/stock/orders/${order._id}/create-payment`, {
                amount: order.totalAmount
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to create payment order');
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: Math.round(order.totalAmount * 100),
                currency: 'INR',
                name: 'Smart Grocery',
                description: `Payment for Order ${order._id}`,
                order_id: response.orderId,
                handler: async function (razorpayResponse) {
                    try {
                        console.log('Payment successful, verifying...', razorpayResponse);
                        
                        const verificationData = {
                            orderId: razorpayResponse.razorpay_order_id,
                            paymentId: razorpayResponse.razorpay_payment_id,
                            signature: razorpayResponse.razorpay_signature
                        };

                        console.log('Sending verification request:', verificationData);

                        const result = await postData(
                            `/api/stock/orders/${order._id}/verify-payment`,
                            verificationData
                        );
                        
                        if (result.success) {
                            enqueueSnackbar('Payment successful', { variant: 'success' });
                            await fetchOrders(); // Refresh the orders list
                        } else {
                            throw new Error(result.error || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        enqueueSnackbar(error.message || 'Payment verification failed', { variant: 'error' });
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: order.supplierId?.name || '',
                    email: order.supplierId?.email || ''
                },
                theme: {
                    color: '#3f51b5'
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                enqueueSnackbar('Payment failed: ' + response.error.description, { variant: 'error' });
                setLoading(false);
            });
            
            rzp.open();
        } catch (error) {
            console.error('Payment initiation error:', error);
            enqueueSnackbar(error.message || 'Error initiating payment', { variant: 'error' });
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