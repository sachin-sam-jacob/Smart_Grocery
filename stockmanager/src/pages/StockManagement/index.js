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
  CircularProgress,
  Chip
} from '@mui/material';
import { IoWarning, IoCheckmark } from "react-icons/io5";

const StockManagement = () => {
  const { setProgress, setAlertBox, user } = useContext(MyContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.location) {
      fetchStockData();
    } else {
      setAlertBox({
        open: true,
        error: true,
        msg: "User location not found. Please contact administrator."
      });
      setLoading(false);
    }
  }, [user]);

  const fetchStockData = async () => {
    setProgress(20);
    try {
      console.log('Fetching data for location:', user.location);
      const data = await fetchDataFromApi(`/api/stock/status?location=${user.location}`);
      console.log('Received products:', data);
      setProducts(data);
      setProgress(100);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to fetch stock data"
      });
    }
    setLoading(false);
  };

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

  const handleManualOrder = async (productId) => {
    try {
      await fetchDataFromApi(`/api/stock/manual-order/${productId}`, {
        method: 'POST'
      });
      setAlertBox({
        open: true,
        error: false,
        msg: "Manual order request sent successfully"
      });
      fetchStockData();
    } catch (error) {
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to send manual order request"
      });
    }
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
                        onClick={() => handleManualOrder(product.id)}
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
    </div>
  );
};

export default StockManagement; 