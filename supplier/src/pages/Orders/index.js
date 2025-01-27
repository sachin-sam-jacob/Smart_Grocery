import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip
} from '@mui/material';

const SupplierOrders = () => {
  const { setProgress, setAlertBox, user } = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setProgress(20);
    try {
      const response = await fetchDataFromApi(`/api/stock/supplier-orders/${user.id}`);
      setOrders(response);
      setProgress(100);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to fetch orders"
      });
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await fetchDataFromApi(`/api/stock/update-order-status`, {
        method: 'PUT',
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      });
      
      setAlertBox({
        open: true,
        error: false,
        msg: "Order status updated successfully"
      });
      
      fetchOrders(); // Refresh orders list
    } catch (error) {
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to update order status"
      });
    }
  };

  return (
    <div>
      <h2>Stock Orders</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.product.name}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.location}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={order.status === 'pending' ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {order.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(order.id, 'approved')}
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(order.id, 'rejected')}
                        variant="contained"
                        color="error"
                        size="small"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SupplierOrders;
