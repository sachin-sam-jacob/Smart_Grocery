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
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '24px',
        color: '#333'
    },
    invoiceTitle: {
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '20px',
        color: '#555'
    },
    thankYou: {
        textAlign: 'center',
        fontSize: '16px',
        marginBottom: '20px',
        color: '#777'
    },
    details: {
        marginBottom: '20px'
    },
    productTitle: {
        marginTop: '20px',
        marginBottom: '10px',
        fontSize: '18px',
        color: '#333'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px'
    },
    backButton: {
        marginLeft: '10px'
    }
};

export default Invoice;