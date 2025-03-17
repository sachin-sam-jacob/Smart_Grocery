import { useEffect, useState } from "react";
import { MdShoppingBag, MdTrendingUp, MdInventory } from "react-icons/md";
import { IoMdCart } from "react-icons/io";
import { Box, Grid, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import DashboardBox from "./components/dashboardBox";
import { fetchDataFromApi } from "../../utils/api";
import { Chart } from "react-google-charts";

const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        monthlyRevenue: 0,
        isLoading: true,
        error: null
    });

    const [chartData, setChartData] = useState([
        ['Month', 'Sales', 'Orders'],
        ['Jan', 0, 0],
        ['Feb', 0, 0],
        ['Mar', 0, 0],
        ['Apr', 0, 0],
        ['May', 0, 0],
        ['Jun', 0, 0]
    ]);

    const dashboardBoxes = [
        {
            title: "Total Products",
            count: metrics.totalProducts,
            icon: <MdInventory size={24} />,
            color: ["#2196f3", "#21cbf3"],
            grow: metrics.totalProducts > 0,
            prefix: ""
        },
        {
            title: "Pending Orders",
            count: metrics.pendingOrders,
            icon: <IoMdCart size={24} />,
            color: ["#ff9800", "#ffc107"],
            grow: false,
            prefix: ""
        },
        {
            title: "Low Stock Items",
            count: metrics.lowStockItems,
            icon: <MdShoppingBag size={24} />,
            color: ["#f44336", "#ff5252"],
            grow: false,
            prefix: ""
        },
        {
            title: "Monthly Revenue",
            count: metrics.monthlyRevenue,
            icon: <MdTrendingUp size={24} />,
            color: ["#4caf50", "#8bc34a"],
            grow: metrics.monthlyRevenue > 0,
            prefix: "₹"
        }
    ];

    useEffect(() => {
        fetchDashboardData();
        // Set up auto-refresh every 5 minutes
        const interval = setInterval(fetchDashboardData, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setMetrics(prev => ({ ...prev, isLoading: true, error: null }));
            const response = await fetchDataFromApi('/api/supplier/dashboard');
            
            if (response.success && response.data) {
                const { totalProducts, pendingOrders, lowStockItems, monthlyRevenue, salesData } = response.data;
                
                setMetrics({
                    totalProducts: totalProducts || 0,
                    pendingOrders: pendingOrders || 0,
                    lowStockItems: lowStockItems || 0,
                    monthlyRevenue: monthlyRevenue || 0,
                    isLoading: false,
                    error: null
                });

                // Update chart data if available
                if (Array.isArray(salesData) && salesData.length > 0) {
                    setChartData([
                        ['Month', 'Sales', 'Orders'],
                        ...salesData
                    ]);
                }
            } else {
                throw new Error('Invalid data received from server');
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setMetrics(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Error fetching dashboard data'
            }));
        }
    };

    return (
        <Box sx={{
            padding: '30px',
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#071739' : '#f8fafc',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, mt: 8 }}>
                <Typography variant="h4" sx={{
                    fontWeight: 700,
                    color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1a237e',
                    mb: 1,
                    fontSize: '28px'
                }}>
                    Supplier Dashboard
                </Typography>
                <Typography variant="subtitle1" sx={{
                    color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#546e7a',
                    fontSize: '16px'
                }}>
                    Welcome back! Here's your business overview
                </Typography>
            </Box>

            {/* Error Alert */}
            {metrics.error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {metrics.error}
                </Alert>
            )}

            {/* Metrics Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {dashboardBoxes.map((box, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <DashboardBox {...box} isLoading={metrics.isLoading} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{
                        p: 3,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? '#112143' : '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        height: '100%'
                    }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 600,
                            mb: 3,
                            color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1a237e'
                        }}>
                            Sales Overview
                        </Typography>
                        {metrics.isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Chart
                                width={'100%'}
                                height={'400px'}
                                chartType="LineChart"
                                loader={<CircularProgress />}
                                data={chartData}
                                options={{
                                    curveType: 'function',
                                    legend: { position: 'bottom' },
                                    backgroundColor: 'transparent',
                                    chartArea: { width: '80%', height: '70%' },
                                    colors: ['#2196f3', '#ff9800'],
                                    vAxis: {
                                        textStyle: { color: '#546e7a' },
                                        format: '₹#,###'
                                    },
                                    hAxis: {
                                        textStyle: { color: '#546e7a' }
                                    }
                                }}
                            />
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        p: 3,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? '#112143' : '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        height: '100%'
                    }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 600,
                            mb: 3,
                            color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#1a237e'
                        }}>
                            Quick Stats
                        </Typography>
                        <Box sx={{ color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#546e7a' }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                • {((metrics.lowStockItems / metrics.totalProducts) * 100).toFixed(1)}% of products are low in stock
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                • Average order value: ₹{metrics.monthlyRevenue > 0 && metrics.pendingOrders > 0 ? 
                                    (metrics.monthlyRevenue / metrics.pendingOrders).toFixed(2) : 0}
                            </Typography>
                            <Typography variant="body1">
                                • Monthly revenue trend: {metrics.monthlyRevenue > 0 ? 'Positive ↑' : 'Negative ↓'}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
