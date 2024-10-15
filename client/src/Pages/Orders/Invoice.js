import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import Button from '@mui/material/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Invoice = () => {
    const { id } = useParams(); // Get the order ID from the URL
    const [order, setOrder] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        fetchDataFromApi(`/api/orders/${id}`).then((res) => {
            setOrder(res);
        });
    }, [id]);

    const downloadInvoice = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Invoice", 14, 22);
        doc.setFontSize(12);
        doc.text(`Order ID: ${order?._id}`, 14, 30);
        doc.text(`Name: ${order?.name}`, 14, 36);
        doc.text(`Email: ${order?.email}`, 14, 42);
        doc.text(`Phone: ${order?.phoneNumber}`, 14, 48);
        doc.text(`Address: ${order?.address}`, 14, 54);
        doc.text(`Pincode: ${order?.pincode}`, 14, 60);
        doc.text(`Total Amount: ${order?.amount}`, 14, 66);
        doc.text(`Order Status: ${order?.status}`, 14, 72);
        doc.text(`Date: ${new Date(order?.date).toLocaleString()}`, 14, 78);

        // Add a table for products
        const tableColumn = ["Product ID", "Product Title", "Quantity", "Price", "SubTotal"];
        const tableRows = order?.products.map(item => [
            item.productId,
            item.productTitle,
            item.quantity,
            item.price,
            item.subTotal
        ]);

        doc.autoTable(tableColumn, tableRows, { startY: 85 });
        doc.save(`Invoice_${order?._id}.pdf`);
    };

    if (!order) return <div>Loading...</div>;

    return (
        <div style={styles.invoiceContainer}>
            <h1 style={styles.title}>Smart Grocery</h1>
            <h2 style={styles.invoiceTitle}>Invoice</h2>
            <p style={styles.thankYou}>Thank you for shopping with us!</p>
            <div style={styles.details}>
                <p><strong>Order ID:</strong> {order?._id}</p>
                <p><strong>Name:</strong> {order?.name}</p>
                <p><strong>Email:</strong> {order?.email}</p>
                <p><strong>Phone:</strong> {order?.phoneNumber}</p>
                <p><strong>Address:</strong> {order?.address}</p>
                <p><strong>Pincode:</strong> {order?.pincode}</p>
                <p><strong>Total Amount:</strong> {order?.amount}</p>
                <p><strong>Order Status:</strong> {order?.status}</p>
                <p><strong>Date:</strong> {new Date(order?.date).toLocaleString()}</p>
            </div>
            <h3 style={styles.productTitle}>Products</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>Product ID</th>
                        <th>Product Title</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>SubTotal</th>
                    </tr>
                </thead>
                <tbody>
                    {order.products.map((item, index) => (
                        <tr key={index}>
                            <td>{item.productId}</td>
                            <td>{item.productTitle}</td>
                            <td>{item.quantity}</td>
                            <td>{item.price}</td>
                            <td>{item.subTotal}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={styles.buttonContainer}>
                <Button variant="contained" color="primary" onClick={downloadInvoice}>
                    Download Invoice
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate('/orders')} style={styles.backButton}>
                    Back to Orders
                </Button>
            </div>
        </div>
    );
};
const styles = {
    invoiceContainer: {
        padding: '30px',
        maxWidth: '900px',
        margin: '40px auto',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        fontFamily: 'Roboto, sans-serif',
        color: '#444',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '28px',
        color: '#222',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    invoiceTitle: {
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: '22px',
        color: '#555',
        fontWeight: '600',
    },
    thankYou: {
        textAlign: 'center',
        fontSize: '16px',
        marginBottom: '25px',
        color: '#888',
        fontStyle: 'italic',
    },
    details: {
        marginBottom: '25px',
        lineHeight: '1.8',
    },
    productTitle: {
        marginTop: '30px',
        marginBottom: '15px',
        fontSize: '20px',
        color: '#333',
        fontWeight: '600',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '30px',
    },
    tableHead: {
        backgroundColor: '#f9f9f9',
        fontSize: '16px',
        fontWeight: '500',
    },
    tableHeadCell: {
        padding: '12px 15px',
        borderBottom: '1px solid #ddd',
        textAlign: 'left',
        color: '#555',
    },
    tableBodyCell: {
        padding: '12px 15px',
        borderBottom: '1px solid #eee',
        textAlign: 'left',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '30px',
    },
    backButton: {
        backgroundColor: '#f0f0f0',
        color: '#555',
        textTransform: 'none',
    },
    downloadButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        textTransform: 'none',
    },
};


export default Invoice;