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
    Button
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { postData, fetchDataFromApi } from '../../utils/api';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const StockOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const user = JSON.parse(localStorage.getItem('user'));
    const [progress, setProgress] = useState(0);
    const [alertBox, setAlertBox] = useState({ open: false, error: false, msg: '' });
    const [showInvoice, setShowInvoice] = useState(false);
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
            
            // Fetch supplier prices for each product
            const ordersWithPrices = await Promise.all(response.map(async (order) => {
                try {
                    const supplierResponse = await fetchDataFromApi(
                        `/api/supplier-products/by-name/${encodeURIComponent(order.productId.name)}`
                    );
                    
                    const supplierPrice = supplierResponse?.price || order.productId.price;
                    
                    return {
                        ...order,
                        supplierPrice: supplierPrice,
                        totalAmount: supplierPrice * order.quantity
                    };
                } catch (error) {
                    console.error('Error fetching supplier price:', error);
                    const defaultPrice = order.productId.price || 0;
                    return {
                        ...order,
                        supplierPrice: defaultPrice,
                        totalAmount: defaultPrice * order.quantity
                    };
                }
            }));
            
            setOrders(ordersWithPrices);
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
                order._id === orderId ? response.data : order
            ));
            
            enqueueSnackbar('Order status updated successfully', { variant: 'success' });
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

            const response = await postData(
                `/api/stock/order/deliver/${orderId}`,
                {
                    productId: orderToUpdate.productId._id,
                    quantity: orderToUpdate.quantity,
                    location: orderToUpdate.location,
                    supplierPrice: orderToUpdate.supplierPrice,
                    totalAmount: orderToUpdate.totalAmount
                }
            );

            if (response.error) {
                throw new Error(response.error);
            }

            setSelectedOrder(orderToUpdate);
            setShowInvoice(true);
            setPaymentStatus('pending');
            await fetchOrders();

        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setProgress(100);
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

    const InvoicePDF = ({ order }) => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>INVOICE</Text>
                    <Text>Order ID: {order._id}</Text>
                    <Text>Date: {new Date().toLocaleDateString()}</Text>
                </View>
                <View style={styles.orderDetails}>
                    <Text>Product: {order.productId.name}</Text>
                    <Text>Quantity: {order.quantity}</Text>
                    <Text>Price per unit: ₹{order.supplierPrice}</Text>
                    <Text>Total Amount: ₹{order.totalAmount}</Text>
                    <Text>Location: {order.location}</Text>
                </View>
            </Page>
        </Document>
    );

    const styles = StyleSheet.create({
        page: { padding: 30 },
        header: { marginBottom: 30 },
        title: { fontSize: 24, marginBottom: 20 },
        orderDetails: { marginBottom: 30 }
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress sx={{ color: '#0858f7' }} />
            </Box>
        );
    }

    return (
        <>
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
                                <TableCell sx={tableHeaderCellStyles}>Price/Unit</TableCell>
                                <TableCell sx={tableHeaderCellStyles}>Total Amount</TableCell>
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
                                    <TableCell sx={tableCellStyles}>
                                        <Typography sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                            ₹{order.supplierPrice?.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={tableCellStyles}>
                                        <Typography sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                            ₹{order.totalAmount?.toFixed(2)}
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
                                            >
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="approved">Approved</MenuItem>
                                                <MenuItem value="delivered">Delivered</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length > 0 && (
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell colSpan={4} sx={{ ...tableCellStyles, fontWeight: 600 }}>
                                        Total Amount
                                    </TableCell>
                                    <TableCell sx={tableCellStyles}>
                                        <Typography sx={{ 
                                            fontWeight: 700,
                                            color: '#2e7d32',
                                            fontSize: '1.1rem'
                                        }}>
                                            ₹{orders.reduce((total, order) => total + (order.totalAmount || 0), 0).toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell colSpan={3} />
                                </TableRow>
                            )}
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
            
            <Dialog open={showInvoice} onClose={() => setShowInvoice(false)}>
                <DialogTitle>Order Invoice</DialogTitle>
                <DialogContent>
                    {selectedOrder && (
                        <PDFDownloadLink
                            document={<InvoicePDF order={selectedOrder} />}
                            fileName={`invoice-${selectedOrder._id}.pdf`}
                        >
                            {({ loading }) => (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Generating Invoice...' : 'Download Invoice'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StockOrders;