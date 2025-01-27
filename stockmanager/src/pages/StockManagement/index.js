import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  DialogContentText
} from '@mui/material';
import { IoWarning, IoCheckmark } from "react-icons/io5";

const StockManagement = () => {
  const { setProgress, setAlertBox, user } = useContext(MyContext);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchStockData = async () => {
    setProgress(20);
    try {
      if (!user?.location) {
        throw new Error('User location not found');
      }

      console.log('Fetching data for location:', user.location);
      const data = await fetchDataFromApi(`/api/stock/status?location=${encodeURIComponent(user.location)}`);
      console.log('Received products:', data);
      
      if (Array.isArray(data)) {
        setProducts(data);
        if (data.length === 0) {
          setAlertBox({
            open: true,
            error: true,
            msg: "No products found for your location"
          });
        }
      } else {
        console.error('Received non-array data:', data);
        setProducts([]);
        setAlertBox({
          open: true,
          error: true,
          msg: "Invalid data format received from server"
        });
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setProducts([]);
      setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Failed to fetch stock data"
      });
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const fetchSuppliers = async () => {
    try {
      if (!user?.location) {
        throw new Error('User location not found');
      }

      const response = await fetchDataFromApi(`/api/stock/suppliers-by-location/${user.location}`);
      
      if (Array.isArray(response)) {
        setSuppliers(response);
      } else {
        console.error('Invalid suppliers data format:', response);
        setSuppliers([]);
        setAlertBox({
          open: true,
          error: true,
          msg: "Failed to load suppliers data"
        });
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to fetch suppliers"
      });
    }
  };

  useEffect(() => {
    if (user && user.location) {
      fetchStockData();
      fetchSuppliers();
    } else {
      setAlertBox({
        open: true,
        error: true,
        msg: "User location not found. Please contact administrator."
      });
      setLoading(false);
    }
  }, [user]);

  const handleAutoOrder = async (productId) => {
    try {
      await fetchDataFromApi(`/api/stock/auto-order/${productId}`, {
        method: 'POST'
      });
      setAlertBox({
        open: true,
        error: false,
        msg: "Auto-order request sent successfully"
      });
      fetchStockData();
    } catch (error) {
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to send auto-order request"
      });
    }
  };

  const handleManualOrder = (product) => {
    setSelectedProduct(product);
    setOrderDialogOpen(true);
  };

  const handleOrderSubmit = async () => {
    try {
      if (!selectedProduct || !selectedSupplier || !orderQuantity) {
        setAlertBox({
          open: true,
          error: true,
          msg: "Please fill all required fields"
        });
        return;
      }

      // Log the raw selected values
      console.log('Selected Product:', selectedProduct);
      console.log('Selected Supplier:', selectedSupplier);
      console.log('User:', user);

      // Only include the fields that match the StockOrder model
      const orderData = {
        productId: selectedProduct._id || selectedProduct.id,
        supplierId: selectedSupplier._id,
        quantity: parseInt(orderQuantity),
        location: user.location,
        status: 'pending'
      };

      // Log the final order data being sent
      console.log('Submitting order with data:', JSON.stringify(orderData, null, 2));

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/stock/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create order');
      }

      setSelectedSupplier(null);
      setOrderQuantity('');
      setOrderDialogOpen(false);
      
      setAlertBox({
        open: true,
        error: false,
        msg: "Order submitted successfully"
      });

      await fetchStockData();

    } catch (error) {
      console.error('Error submitting order:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Failed to submit order"
      });
    }
  };

  const handleSupplierSelect = (event) => {
    const supplier = event.target.value;
    console.log('Selected supplier:', supplier);
    setSelectedSupplier(supplier);
  };

  const getStockStatus = (stock, threshold) => {
    if (stock <= threshold * 0.25) {
      return { color: 'error', label: 'Critical' };
    } else if (stock <= threshold * 0.5) {
      return { color: 'warning', label: 'Low' };
    }
    return { color: 'success', label: 'Good' };
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Stock Management</h4>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchStockData}
          className="btn-blue"
        >
          Refresh Data
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Demand Level</TableCell>
                <TableCell>Auto-Order Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.currentStock, product.threshold);
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.currentStock}</TableCell>
                    <TableCell>
                      <Chip 
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.demandLevel}
                        color={product.demandLevel === 'High' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {product.autoOrderEnabled ? (
                        <Chip 
                          icon={<IoCheckmark />}
                          label="Enabled"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip 
                          icon={<IoWarning />}
                          label="Disabled"
                          color="default"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        className="btn-blue mr-2"
                        onClick={() => handleAutoOrder(product.id)}
                        disabled={product.autoOrderEnabled}
                      >
                        Enable Auto-Order
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleManualOrder(product)}
                        disabled={product.currentStock > product.threshold * 0.5}
                      >
                        Order Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)}>
        <DialogTitle>Create Manual Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select a supplier and enter the order quantity.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Supplier</InputLabel>
            <Select
              value={selectedSupplier || ''}
              onChange={handleSupplierSelect}
              label="Supplier"
            >
              {Array.isArray(suppliers) && suppliers.map((supplier) => (
                <MenuItem 
                  key={supplier._id} 
                  value={supplier}
                >
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleOrderSubmit} variant="contained">
            Submit Order
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StockManagement; 