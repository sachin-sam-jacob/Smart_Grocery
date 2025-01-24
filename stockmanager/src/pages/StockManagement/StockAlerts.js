import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import { IoWarning, IoTrendingUp, IoNotifications } from "react-icons/io5";

const StockAlerts = () => {
  const { setProgress, setAlertBox } = useContext(MyContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setProgress(20);
    try {
      const data = await fetchDataFromApi('/api/stock/alerts');
      setAlerts(data);
      setProgress(100);
    } catch (error) {
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to fetch alerts"
      });
    }
    setLoading(false);
  };

  const handleAlertAction = async (alertId, action) => {
    try {
      await fetchDataFromApi(`/api/stock/alerts/${alertId}/${action}`, {
        method: 'POST'
      });
      setAlertBox({
        open: true,
        error: false,
        msg: "Alert action processed successfully"
      });
      fetchAlerts();
    } catch (error) {
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to process alert action"
      });
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <IoWarning color="#ff9800" />;
      case 'high_demand':
        return <IoTrendingUp color="#4caf50" />;
      default:
        return <IoNotifications color="#2196f3" />;
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Stock Alerts</h4>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchAlerts}
          className="btn-blue"
        >
          Refresh Alerts
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <CircularProgress />
        </div>
      ) : (
        <Paper className="p-3">
          <List>
            {alerts.length === 0 ? (
              <Typography variant="body1" className="text-center p-4">
                No active alerts
              </Typography>
            ) : (
              alerts.map((alert) => (
                <ListItem
                  key={alert.id}
                  className="mb-3"
                  sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1
                  }}
                >
                  <ListItemIcon>
                    {getAlertIcon(alert.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={alert.description}
                  />
                  <div>
                    {alert.type === 'low_stock' && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          className="mr-2"
                          onClick={() => handleAlertAction(alert.id, 'order')}
                        >
                          Order Stock
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleAlertAction(alert.id, 'dismiss')}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                    {alert.type === 'high_demand' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleAlertAction(alert.id, 'enable_auto')}
                      >
                        Enable Auto-Order
                      </Button>
                    )}
                  </div>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default StockAlerts; 