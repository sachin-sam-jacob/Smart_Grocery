import React, { useState, useEffect, useContext } from 'react';
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
import { MyContext } from '../../contexts/MyContext';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});

const SupplierOrders = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useContext(MyContext);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetchDataFromApi(`/api/stock/supplier-orders/${user.id}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleOrderStatus = async (orderId, status) => {
        try {
            await fetchDataFromApi(`/api/stock/update-order/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            
            alert('Order status updated successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status');
        }
    };

    return (
        <div className="supplier-orders">
            <h2>Stock Orders</h2>
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order._id} className="order-card">
                        <h3>Order #{order._id}</h3>
                        <p>Product: {order.product.name}</p>
                        <p>Quantity: {order.quantity}</p>
                        <p>Status: {order.status}</p>
                        <p>Auto-Ordered: {order.autoOrdered ? 'Yes' : 'No'}</p>
                        
                        {order.status === 'pending' && (
                            <div className="action-buttons">
                                <button onClick={() => handleOrderStatus(order._id, 'approved')}>
                                    Approve
                                </button>
                                <button onClick={() => handleOrderStatus(order._id, 'rejected')}>
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Orders = () => {

    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [products, setproducts] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [singleOrder, setSingleOrder] = useState();
    const [stockmanagerLocation, setStockmanagerLocation] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch stockmanager location from token
        const token = localStorage.getItem('user');
        if (token) {
            const userData = JSON.parse(token);
            setStockmanagerLocation(userData.location);
            fetchOrders(userData.location);
        }
    }, []);

    const fetchOrders = (district) => {
        fetchDataFromApi(`/api/order?district=${district}`).then((res) => {
            setOrders(res);
        }).catch(error => {
            console.error("Error fetching orders:", error);
        });
    };

    const showProducts = (id) => {
        fetchDataFromApi(`/api/order/${id}`).then((res) => {
            setIsOpenModal(true);
            setproducts(res.products);
        })
    }


    const orderStatus = (orderStatus, id) => {
        fetchDataFromApi(`/api/order/${id}`).then((res) => {

            const order = {
                name: res.name,
                phoneNumber: res.phoneNumber,
                address: res.address,
                pincode: res.pincode,
                amount: parseInt(res.amount),
                paymentId: res.paymentId,
                email: res.email,
                userid: res.userId,
                products: res.products,
                status: orderStatus
            }


            editData(`/api/order/${id}`, order).then((res) => {
                fetchDataFromApi(`/api/order`).then((res) => {
                    setOrders(res);
                    window.scrollTo({
                        top: 200,
                        behavior: 'smooth',
                    })
                })
            })

            setSingleOrder(res.products);
        })
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

                                    <th>Paymant Id</th>
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
                                        <tr key={index}>
                                            <td><span className='text-blue fonmt-weight-bold'>{order?.paymentId}</span></td>
                                            <td><span className='text-blue fonmt-weight-bold cursor' onClick={() => showProducts(order?._id)}>Click here to view</span>
                                            </td>
                                            <td>{order?.name}</td>
                                            <td>{order?.phoneNumber}</td>
                                            <td>{order?.address}</td>
                                            <td>{order?.pincode}</td>
                                            <td>{order?.amount}</td>
                                            <td>{order?.email}</td>
                                            <td>{order?.userid}</td>
                                            <td>
                                                {order?.status === "pending" ?
                                                    <span className='badge badge-danger cursor' onClick={() => orderStatus("confirm", order?._id)}>{order?.status}</span> :
                                                    <span className='badge badge-success cursor' onClick={() => orderStatus("pending", order?._id)}>{order?.status}</span>
                                                }
                                            </td>
                                            <td>{order?.date}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="text-center">No orders found for this district</td>
                                    </tr>
                                )}
                            </tbody>

                        </table>


                    
                    </div>


                </div>



            </div>


            <Dialog open={isOpenModal} className="productModal" >
                <Button className='close_' onClick={() => setIsOpenModal(false)}><MdClose /></Button>
                <h4 class="mb-1 font-weight-bold pr-5 mb-4">Products</h4>

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
                            {
                                products?.length !== 0 && products?.map((item, index) => {
                                    return (
                                        <tr>
                                            <td>{item?.productId}</td>
                                            <td style={{ whiteSpace: "inherit" }}><span>
                                                {item?.productTitle?.substr(0, 30) + '...'}
                                            </span></td>
                                            <td>
                                                <div className='img'>
                                                    <img src={item?.image} />
                                                </div>
                                            </td>
                                            <td>{item?.quantity}</td>
                                            <td>{item?.price}</td>
                                            <td>{item?.subTotal}</td>
                                        </tr>
                                    )
                                })
                            }

                        </tbody>
                    </table>
                </div>
            </Dialog>


        </>

    )
}

export default Orders;
