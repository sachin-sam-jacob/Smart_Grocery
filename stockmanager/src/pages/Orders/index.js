import React, { useState, useEffect } from 'react';
import { editData, fetchDataFromApi } from '../../utils/api';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
        backgroundColor: emphasize(theme.palette.grey[100], 0.06),
    },
    '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.grey[100], 0.12),
    },
}));

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stockmanagerLocation, setStockmanagerLocation] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const token = localStorage.getItem('user');
        if (token) {
            const userData = JSON.parse(token);
            setStockmanagerLocation(userData.location);
            fetchOrders(userData.location);
        }
    }, []);

    const fetchOrders = async (district) => {
        try {
            setLoading(true);
            console.log('Fetching orders for district:', district);
            const response = await fetchDataFromApi(`/api/order?district=${encodeURIComponent(district)}`);
            console.log('Orders response:', response);
            
            if (response.success && Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('Invalid response format:', response);
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const showProducts = async (id) => {
        try {
            const response = await fetchDataFromApi(`/api/order/${id}`);
            if (response && response.products) {
                setProducts(response.products);
                setIsOpenModal(true);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const orderStatus = async (orderStatus, id) => {
        try {
            const orderResponse = await fetchDataFromApi(`/api/order/${id}`);
            if (!orderResponse) return;

            const order = {
                name: orderResponse.name,
                phoneNumber: orderResponse.phoneNumber,
                address: orderResponse.address,
                pincode: orderResponse.pincode,
                amount: parseInt(orderResponse.amount),
                paymentId: orderResponse.paymentId,
                email: orderResponse.email,
                userid: orderResponse.userid,
                products: orderResponse.products,
                status: orderStatus
            };

            await editData(`/api/order/${id}`, order);
            await fetchOrders(stockmanagerLocation);
            
            window.scrollTo({
                top: 200,
                behavior: 'smooth',
            });
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                    <h5 className="mb-0">Orders List for {stockmanagerLocation}</h5>
                    <div className="ml-auto d-flex align-items-center">
                        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                            <StyledBreadcrumb
                                component="a"
                                href="#"
                                label="Dashboard"
                                icon={<HomeIcon fontSize="small" />}
                            />
                            <StyledBreadcrumb
                                label="Orders"
                                deleteIcon={<ExpandMoreIcon />}
                            />
                        </Breadcrumbs>
                    </div>
                </div>

                <div className="card shadow border-0 p-3 mt-4">
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered table-striped v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Payment Id</th>
                                    <th>Products</th>
                                    <th>Name</th>
                                    <th>Phone Number</th>
                                    <th>Address</th>
                                    <th>Pincode</th>
                                    <th>Total Amount</th>
                                    <th>Email</th>
                                    <th>User Id</th>
                                    <th>Order Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order, index) => (
                                        <tr key={order._id || index}>
                                            <td><span className='text-blue font-weight-bold'>{order?.paymentId}</span></td>
                                            <td>
                                                <span 
                                                    className='text-blue font-weight-bold cursor' 
                                                    onClick={() => showProducts(order?._id)}
                                                >
                                                    Click here to view
                                                </span>
                                            </td>
                                            <td>{order?.name}</td>
                                            <td>{order?.phoneNumber}</td>
                                            <td>{order?.address}</td>
                                            <td>{order?.pincode}</td>
                                            <td>{order?.amount}</td>
                                            <td>{order?.email}</td>
                                            <td>{order?.userid}</td>
                                            <td>
                                                <span 
                                                    className={`badge badge-${order?.status === "pending" ? "danger" : "success"} cursor`}
                                                    onClick={() => orderStatus(order?.status === "pending" ? "confirm" : "pending", order?._id)}
                                                >
                                                    {order?.status}
                                                </span>
                                            </td>
                                            <td>{new Date(order?.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="text-center">
                                            {error || "No orders found for this district"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={isOpenModal} className="productModal">
                <Button className='close_' onClick={() => setIsOpenModal(false)}><MdClose /></Button>
                <h4 className="mb-1 font-weight-bold pr-5 mb-4">Products</h4>
                <div className='table-responsive orderTable'>
                    <table className='table table-striped table-bordered'>
                        <thead className='thead-dark'>
                            <tr>
                                <th>Product Id</th>
                                <th>Product Title</th>
                                <th>Image</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>SubTotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.length > 0 && products.map((item, index) => (
                                <tr key={item.productId || index}>
                                    <td>{item?.productId}</td>
                                    <td style={{ whiteSpace: "inherit" }}>
                                        <span>{item?.productTitle?.substr(0, 30) + '...'}</span>
                                    </td>
                                    <td>
                                        <div className='img'>
                                            <img src={item?.image} alt={item?.productTitle} />
                                        </div>
                                    </td>
                                    <td>{item?.quantity}</td>
                                    <td>{item?.price}</td>
                                    <td>{item?.subTotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Dialog>
        </>
    );
};

export default Orders;