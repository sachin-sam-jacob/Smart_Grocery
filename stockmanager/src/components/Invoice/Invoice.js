import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Invoice = ({ order, onClose }) => {
    const user = JSON.parse(localStorage.getItem('user')); // Get logged in user details

    const handleDownload = async () => {
        const invoice = document.getElementById('invoice');
        const canvas = await html2canvas(invoice);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${order.invoiceNumber}.pdf`);
    };

    return (
        <Box sx={{ p: 3, maxWidth: '800px', margin: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{ mr: 2 }}
                >
                    Download PDF
                </Button>
                <Button variant="outlined" onClick={onClose}>
                    Close
                </Button>
            </Box>

            <Paper id="invoice" sx={{ p: 4, backgroundColor: '#fff' }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                            Smart Grocery
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            123 Business Street
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            {user?.location || 'All Locations'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Phone: (123) 456-7890
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ color: '#333', mb: 1 }}>
                            INVOICE
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Invoice #: {order.invoiceNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Date: {new Date(order.paymentDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Payment ID: {order.paymentId}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Order ID: {order._id}
                        </Typography>
                    </Box>
                </Box>

                {/* Bill To Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Box>
                        <Typography variant="h6" sx={{ color: '#333', mb: 2 }}>
                            Bill From:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                            {order.supplierId?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Supplier ID: 
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            {order.supplierId?._id} 
                        </Typography>
                        {/* <Typography variant="body2" sx={{ color: '#666' }}>
                            Email: {order.supplierId?.email}
                        </Typography> */}
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ color: '#333', mb: 2 }}>
                            Bill To:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', fontWeight: 'bold' }}>
                            {user?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Stock Manager ID: {user?.userId}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Email: {user?.email}
                        </Typography>
                    </Box>
                </Box>

                {/* Order Details Table */}
                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Product ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                {/* <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell> */}
                                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{order.productId?.name}</TableCell>
                                <TableCell>{order.productId?._id}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                {/* <TableCell>₹{order.unitPrice?.toFixed(2)}</TableCell> */}
                                <TableCell>₹{order.totalAmount?.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Total Section */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Box sx={{ width: '250px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" sx={{ color: '#666' }}>Subtotal:</Typography>
                            <Typography variant="body1" sx={{ color: '#333' }}>
                                ₹{order.totalAmount?.toFixed(2)}
                            </Typography>
                        </Box>
                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" sx={{ color: '#666' }}>GST (18%):</Typography>
                            <Typography variant="body1" sx={{ color: '#333' }}>
                                ₹{(order.totalAmount * 0.18)?.toFixed(2)}
                            </Typography>
                        </Box> */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #eee', pt: 1 }}>
                            <Typography variant="h6" sx={{ color: '#333' }}>Total:</Typography>
                            <Typography variant="h6" sx={{ color: '#1976d2' }}>
                                ₹{(order.totalAmount)?.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
                    <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', mb: 1 }}>
                        Payment Method: Razorpay
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                        Thank you for your business!
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Invoice; 