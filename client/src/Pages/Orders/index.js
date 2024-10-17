import React, { useEffect, useState } from 'react';
import { fetchDataFromApi } from '../../utils/api';
import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const navigate = useNavigate();
    const [reviewStatus, setReviewStatus] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signIn");
        }

        const user = JSON.parse(localStorage.getItem("user"));
        fetchDataFromApi(`/api/orders?userid=${user?.userId}`).then((res) => {
            setOrders(res);
            // Check review status for each order
            res.forEach(order => {
                checkReviewStatus(order.products[0].productId, user.userId);
            });
        });
    }, [navigate]);

    const checkReviewStatus = async (productId, userId) => {
        try {
            const reviews = await fetchDataFromApi(`/api/productReviews?productId=${productId}&customerId=${userId}`);
            setReviewStatus(prev => ({
                ...prev,
                [productId]: reviews.length > 0
            }));
        } catch (error) {
            console.error('Error checking review status:', error);
        }
    };

    const showProducts = (productId) => {
        navigate(`/product/${productId}`); // Navigate to the product details page
    };

    const viewInvoice = (id) => {
        navigate(`/orders/invoice/${id}`);
    };

    const cancelOrder = (id) => {
        navigate(`/cancel-order/${id}`);
    };

    const trackOrder = (id) => {
        console.log('Track order:', id);
    };

    const addOrEditReview = (productId) => {
        navigate(`/add-review/${productId}`);
    };

    return (
        <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Your Orders</h2>

                {orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    orders.map((order, index) => (
                        <Box key={index} sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start', // Align items to the start
                            border: '1px solid #ddd',
                            padding: '20px',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            marginBottom: '20px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '70%' }}>
                                <img
                                    src={order?.products[0]?.image}
                                    alt={order?.products[0]?.productTitle}
                                    style={{ width: '100px', height: '100px', objectFit: 'contain', border: '1px solid #ddd', marginRight: '20px' }} // Image on the left
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0' }}>{order?.products[0]?.productTitle}</p> {/* Product name */}
                                    <p style={{ margin: '5px 0' }}><strong>Order Placed:</strong> {new Date(order?.date).toLocaleDateString()}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Total:</strong> ₹{order?.amount}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Ship to:</strong> {order?.name}</p>
                                    <p style={{ margin: '5px 0' }}>
                                        <strong>Status:</strong> {
                                            order?.status === "pending" ? 
                                                <span style={{ color: 'orange' }}>Pending</span> : 
                                            order?.status === "cancelled" ?
                                                <span style={{ color: 'red' }}>Cancelled</span> :
                                                <span style={{ color: 'green' }}>Delivered</span>
                                        }
                                    </p>
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: '#ff9900', color: '#fff', marginTop: '10px' }}
                                        onClick={() => showProducts(order?.products[0]?.productId)}
                                    >
                                        View Product
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#007bff', color: '#fff', marginBottom: '10px' }}
                                    onClick={() => viewInvoice(order?._id)}
                                >
                                    View Invoice
                                </Button>
                                {order?.status === "pending" && (
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: '#d9534f', color: '#fff', marginBottom: '10px' }}
                                        onClick={() => cancelOrder(order?._id)}
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                                {order?.status !== "cancelled" && (
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: '#5bc0de', color: '#fff', marginBottom: '10px' }}
                                        onClick={() => trackOrder(order?._id)}
                                    >
                                        Track Order
                                    </Button>
                                )}
                                {order?.status === "confirm" && (
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: '#28a745', color: '#fff' }}
                                        onClick={() => addOrEditReview(order?.products[0]?.productId)}
                                    >
                                        {reviewStatus[order?.products[0]?.productId] ? 'Edit Review' : 'Write a Review'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            <Dialog open={isOpenModal} className="productModal">
                <Button onClick={() => setIsOpenModal(false)} sx={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <MdClose />
                </Button>
                <h4 style={{ textAlign: 'center', margin: '20px 0' }}>Products</h4>

                <Box sx={{ width: '100%', padding: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Product Id</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Product Title</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Image</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Quantity</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>Price</th>
                                <th style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>SubTotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{item?.productId}</td>
                                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{item?.productTitle}</td>
                                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
                                        <img
                                            src={item?.image}
                                            alt={item?.productTitle}
                                            style={{ width: '50px', height: '50px', objectFit: 'contain', border: '1px solid #ddd' }}
                                        />
                                    </td>
                                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{item?.quantity}</td>
                                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{item?.price}</td>
                                    <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{item?.subTotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Dialog>
        </Box>
    );
};

export default Orders;
