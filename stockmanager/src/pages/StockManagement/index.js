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
  const [autoOrderDialogOpen, setAutoOrderDialogOpen] = useState(false);
  const [autoOrderQuantity, setAutoOrderQuantity] = useState('');
  const [autoOrderThreshold, setAutoOrderThreshold] = useState('');
  const [selectedAutoOrderProduct, setSelectedAutoOrderProduct] = useState(null);

  const getUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const fetchStockData = async () => {
    setProgress(20);
    try {
      const currentUser = getUserData();
      if (!currentUser?.location) {
        throw new Error('User location not found');
      }

      console.log('Fetching data for location:', currentUser.location);
      const data = await fetchDataFromApi(`/api/stock/status?location=${encodeURIComponent(currentUser.location)}`);
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
      const currentUser = getUserData();
      if (!currentUser?.location) {
        throw new Error('User location not found');
      }

      const response = await fetchDataFromApi(`/api/stock/suppliers-by-location/${currentUser.location}`);
      
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
    const initializeData = async () => {
      const currentUser = getUserData();
      if (currentUser?.location) {
        await fetchStockData();
        await fetchSuppliers();
      } else {
        setTimeout(async () => {
          const retryUser = getUserData();
          if (retryUser?.location) {
            await fetchStockData();
            await fetchSuppliers();
          } else {
            setAlertBox({
              open: true,
              error: true,
              msg: "User location not found. Please try logging in again."
            });
            setLoading(false);
          }
        }, 1000);
      }
    };

    initializeData();
  }, []);

  const handleAutoOrder = (product) => {
    console.log('Selected product for auto-order:', product);
    setSelectedAutoOrderProduct(product);
    setSelectedSupplier(null);
    setAutoOrderQuantity('');
    setAutoOrderThreshold('');
    setAutoOrderDialogOpen(true);
  };

  const handleAutoOrderSubmit = async () => {
    try {
      if (!selectedAutoOrderProduct || !selectedSupplier || !autoOrderQuantity || !autoOrderThreshold) {
        setAlertBox({
          open: true,
          error: true,
          msg: "Please fill all required fields"
        });
        return;
      }

      console.log('Selected Product:', selectedAutoOrderProduct);

      const currentUser = getUserData();
      const configData = {
        supplierId: selectedSupplier._id,
        threshold: parseInt(autoOrderThreshold),
        autoOrderQuantity: parseInt(autoOrderQuantity),
        location: currentUser.location
      };

      setProgress(30);

      const productId = selectedAutoOrderProduct._id || selectedAutoOrderProduct.id;

      if (!productId) {
        throw new Error('Product ID is missing');
      }

      const response = await postData(
        `/api/stock/auto-order/configure/${productId}`,
        configData
      );

      setProgress(70);

      if (response.error) {
        throw new Error(response.error || response.message);
      }

      setProducts(prevProducts => prevProducts.map(product => {
        if (product._id === productId || product.id === productId) {
          return {
            ...product,
            autoOrderEnabled: true,
            threshold: parseInt(autoOrderThreshold),
            autoOrderQuantity: parseInt(autoOrderQuantity),
            currentStock: response.data?.currentStock || product.currentStock
          };
        }
        return product;
      }));

      setAutoOrderDialogOpen(false);
      setSelectedSupplier(null);
      setAutoOrderQuantity('');
      setAutoOrderThreshold('');
      setSelectedAutoOrderProduct(null);

      setAlertBox({
        open: true,
        error: false,
        msg: "Auto-order configured successfully"
      });

      await fetchStockData();

    } catch (error) {
      console.error('Error configuring auto-order:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Failed to configure auto-order"
      });
    } finally {
      setProgress(100);
    }
  };

  const handleDisableAutoOrder = async (product) => {
    try {
      setProgress(30);
      const currentUser = getUserData();
      
      const response = await postData(
        `/api/stock/auto-order/disable/${product._id || product.id}`,
        { location: currentUser.location }
      );

      setProgress(70);

      if (response.error) {
        throw new Error(response.error || response.message);
      }

      setProducts(prevProducts => prevProducts.map(p => {
        if (p._id === product._id || p.id === product.id) {
          return {
            ...p,
            autoOrderEnabled: false
          };
        }
        return p;
      }));

      setAlertBox({
        open: true,
        error: false,
        msg: "Auto-order disabled successfully"
      });

      await fetchStockData();

    } catch (error) {
      console.error('Error disabling auto-order:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Failed to disable auto-order"
      });
    } finally {
      setProgress(100);
    }
  };

  const handleManualOrder = (product) => {
    setSelectedProduct(product);
    setSelectedSupplier(null);
    setOrderQuantity('');
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

      setProgress(30);
      console.log("selectedSupplier:", selectedSupplier);
      console.log("selectedProduct:", selectedProduct);

      // Fetch supplier price using product name
      const supplierPriceResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/supplier-products/supplier/${selectedSupplier._id}/product/${encodeURIComponent(selectedProduct.name)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const supplierPriceData = await supplierPriceResponse.json();
      
      if (!supplierPriceResponse.ok) {
        throw new Error(supplierPriceData.error || 'Failed to fetch supplier price');
      }

      // Calculate total amount using the fetched supplier price
      const totalAmount = Number((supplierPriceData.price * parseInt(orderQuantity)).toFixed(2));

      const orderData = {
        productId: selectedProduct._id || selectedProduct.id,
        supplierId: selectedSupplier._id,
        quantity: parseInt(orderQuantity),
        location: user.location,
        status: 'pending',
        totalAmount: totalAmount
      };

      console.log('Submitting order with data:', JSON.stringify(orderData, null, 2));

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/stock/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      setProgress(70);

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create order');
      }

      setProgress(90);

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
    } finally {
      setProgress(100);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const currentUser = getUserData();
      
      // Only suppliers can mark as delivered
      if (newStatus === 'delivered' && !currentUser.isSupplier) {
        setAlertBox({
          open: true,
          error: true,
          msg: "Only suppliers can mark orders as delivered"
        });
        return;
      }

      const response = await postData(`/api/stock/update-order-status/${orderId}`, {
        status: newStatus,
        location: currentUser.location
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh data after status update
      await fetchStockData();
      
      setAlertBox({
        open: true,
        error: false,
        msg: `Order ${newStatus} successfully`
      });

    } catch (error) {
      console.error('Error updating order status:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Failed to update order status"
      });
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      const currentUser = getUserData();
      if (!currentUser.isStockManager) {
        setAlertBox({
          open: true,
          error: true,
          msg: "Only stock managers can download invoices"
        });
        return;
      }

      // Generate and download invoice logic here
      const response = await postData(`/api/stock/generate-invoice/${order._id}`);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error('Error downloading invoice:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Failed to download invoice"
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

  const renderAutoOrderStatus = (product) => (
    <Chip 
      icon={product.autoOrderEnabled ? <IoCheckmark /> : <IoWarning />}
      label={product.autoOrderEnabled ? "Enabled" : "Disabled"}
      color={product.autoOrderEnabled ? "success" : "default"}
      size="small"
    />
  );

  const renderAutoOrderButton = (product) => (
    <>
      {product.autoOrderEnabled ? (
        <Button
          variant="outlined"
          color="error"
          size="small"
          className="mr-2"
          onClick={() => handleDisableAutoOrder(product)}
        >
          Disable Auto-Order
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="small"
          className="btn-blue mr-2"
          onClick={() => handleAutoOrder(product)}
        >
          Enable Auto-Order
        </Button>
      )}
    </>
  );

  const renderActionButtons = (order) => {
    const currentUser = getUserData();
    
    if (currentUser.isSupplier) {
      // Supplier view
      return order.status === 'approved' ? (
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleStatusUpdate(order._id, 'delivered')}
        >
          Mark as Delivered
        </Button>
      ) : null;
    } else if (currentUser.isStockManager) {
      // Stock Manager view
      if (order.status === 'pending') {
        return (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleStatusUpdate(order._id, 'approved')}
          >
            Approve Order
          </Button>
        );
      } else if (order.status === 'delivered') {
        return (
          <>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => handlePayment(order)}
              style={{ marginRight: '8px' }}
            >
              Process Payment
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => handleDownloadInvoice(order)}
            >
              Download Invoice
            </Button>
          </>
        );
      }
    }
    return null;
  };

  const handlePayment = async (order) => {
    try {
      const currentUser = getUserData();
      if (!currentUser.isStockManager) {
        setAlertBox({
          open: true,
          error: true,
          msg: "Only stock managers can process payments"
        });
        return;
      }

      // Navigate to payment page with order details
      window.location.href = `/stock-payments?orderId=${order._id}`;

    } catch (error) {
      console.error('Error processing payment:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: error.message || "Failed to process payment"
      });
    }
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
                      {renderAutoOrderStatus(product)}
                    </TableCell>
                    <TableCell>
                      {renderAutoOrderButton(product)}
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleManualOrder(product)}
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
      <Dialog 
        open={autoOrderDialogOpen} 
        onClose={() => setAutoOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configure Auto-Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Configure automatic ordering for {selectedAutoOrderProduct?.name}. 
            Orders will be placed automatically when stock falls below the threshold.
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Supplier</InputLabel>
            <Select
              value={selectedSupplier || ''}
              onChange={handleSupplierSelect}
              label="Select Supplier"
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier._id} value={supplier}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Stock Threshold"
            type="number"
            value={autoOrderThreshold}
            onChange={(e) => setAutoOrderThreshold(e.target.value)}
            helperText="Order will be placed when stock falls below this number"
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 1 } }}
          />

          <TextField
            fullWidth
            label="Auto-Order Quantity"
            type="number"
            value={autoOrderQuantity}
            onChange={(e) => setAutoOrderQuantity(e.target.value)}
            helperText="Amount to order automatically"
            InputProps={{ inputProps: { min: 1 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoOrderDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAutoOrderSubmit} 
            variant="contained"
            color="primary"
          >
            Enable Auto-Order
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StockManagement; 