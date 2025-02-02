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
    CircularProgress,
    Modal
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useSnackbar } from 'notistack';
import { fetchDataFromApi, postData } from '../../utils/api';
import Invoice from '../../components/Invoice/Invoice';

const Payment = () => {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState({}); // Track loading state per order
    const [loadingBulkPayment, setLoadingBulkPayment] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openInvoice, setOpenInvoice] = useState(false);

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

    const handleBulkPayment = async () => {
        try {
            setLoadingBulkPayment(true);
            const pendingOrders = orders.filter(order => 
                order.status === 'delivered' && order.paymentStatus === 'pending'
            );

            if (pendingOrders.length === 0) {
                enqueueSnackbar('No pending payments found', { variant: 'warning' });
                return;
            }

            const orderIds = pendingOrders.map(order => order._id);
            const totalAmount = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            const response = await postData('/api/stock/orders/bulk-payment', {
                orderIds
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to create bulk payment order');
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: Math.round(totalAmount * 100),
                currency: 'INR',
                name: 'Smart Grocery',
                description: `Bulk Payment for ${pendingOrders.length} Orders`,
                order_id: response.orderId,
                handler: async function (razorpayResponse) {
                    try {
                        console.log('Bulk payment successful, verifying...', razorpayResponse);
                        
                        const verificationData = {
                            orderId: razorpayResponse.razorpay_order_id,
                            paymentId: razorpayResponse.razorpay_payment_id,
                            signature: razorpayResponse.razorpay_signature,
                            orderIds
                        };

                        console.log('Sending bulk verification request:', verificationData);

                        const result = await postData(
                            '/api/stock/orders/verify-bulk-payment',
                            verificationData
                        );
                        
                        if (result.success) {
                            enqueueSnackbar('Bulk payment successful', { variant: 'success' });
                            await fetchOrders();
                        } else {
                            throw new Error(result.error || 'Bulk payment verification failed');
                        }
                    } catch (error) {
                        console.error('Bulk payment verification error:', error);
                        enqueueSnackbar(error.message || 'Bulk payment verification failed', { variant: 'error' });
                    } finally {
                        setLoadingBulkPayment(false);
                    }
                },
                prefill: {
                    name: 'Smart Grocery Admin',
                    email: 'admin@smartgrocery.com'
                },
                theme: {
                    color: '#3f51b5'
                },
                modal: {
                    ondismiss: function() {
                        setLoadingBulkPayment(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Bulk payment failed:', response.error);
                enqueueSnackbar('Bulk payment failed: ' + response.error.description, { variant: 'error' });
                setLoadingBulkPayment(false);
            });
            
            rzp.open();
        } catch (error) {
            console.error('Bulk payment initiation error:', error);
            enqueueSnackbar(error.message || 'Error initiating bulk payment', { variant: 'error' });
            setLoadingBulkPayment(false);
        }
    };

    const handlePayment = async (order) => {
        try {
            setLoadingOrders(prev => ({ ...prev, [order._id]: true }));
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
                        setLoadingOrders(prev => ({ ...prev, [order._id]: false }));
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
                        setLoadingOrders(prev => ({ ...prev, [order._id]: false }));
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                enqueueSnackbar('Payment failed: ' + response.error.description, { variant: 'error' });
                setLoadingOrders(prev => ({ ...prev, [order._id]: false }));
            });
            
            rzp.open();
        } catch (error) {
            console.error('Payment initiation error:', error);
            enqueueSnackbar(error.message || 'Error initiating payment', { variant: 'error' });
            setLoadingOrders(prev => ({ ...prev, [order._id]: false }));
        }
    };

    const handleViewInvoice = (order) => {
        setSelectedOrder(order);
        setOpenInvoice(true);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const pendingPaymentsCount = orders.filter(
        order => order.status === 'delivered' && order.paymentStatus === 'pending'
    ).length;

    return (
        <Box p={3} sx={{ paddingTop: '100px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Payment Management</Typography>
                {pendingPaymentsCount > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBulkPayment}
                        disabled={loadingBulkPayment}
                        startIcon={loadingBulkPayment ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loadingBulkPayment ? 'Processing...' : `Pay All (${pendingPaymentsCount})`}
                    </Button>
                )}
            </Box>
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
                                    {order.status === 'delivered' && (
                                        order.paymentStatus === 'pending' ? (
                                            <Button
                                                variant="contained"
                                                onClick={() => handlePayment(order)}
                                                disabled={loadingOrders[order._id] || loadingBulkPayment}
                                            >
                                                {loadingOrders[order._id] ? <CircularProgress size={24} /> : 'Pay Now'}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                startIcon={<ReceiptIcon />}
                                                onClick={() => handleViewInvoice(order)}
                                            >
                                                View Invoice
                                            </Button>
                                        )
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={openInvoice}
                onClose={() => setOpenInvoice(false)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'auto'
                }}
            >
                <Box sx={{ outline: 'none' }}>
                    {selectedOrder && (
                        <Invoice 
                            order={selectedOrder} 
                            onClose={() => setOpenInvoice(false)} 
                        />
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default Payment; 