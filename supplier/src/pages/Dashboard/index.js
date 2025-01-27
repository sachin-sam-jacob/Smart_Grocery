import { useEffect, useState } from "react";
import { MdShoppingBag, MdTrendingUp } from "react-icons/md";
import { IoMdCart } from "react-icons/io";
import { IoIosTimer } from "react-icons/io";
import { Box, Grid, Typography, Paper } from '@mui/material';
import DashboardBox from "./components/dashboardBox";
import { fetchDataFromApi } from "../../utils/api";
import { Chart } from "react-google-charts";

const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        monthlyRevenue: 0
    });

    const dashboardBoxes = [
        {
            title: "Total Products",
            count: metrics.totalProducts,
            icon: <MdShoppingBag size={24} color="white" />,
            color: ["#1da256", "#48d483"],
            grow: true
        },
        {
            title: "Pending Orders",
            count: metrics.pendingOrders,
            icon: <IoMdCart size={24} color="white" />,
            color: ["#c012e2", "#eb64fe"]
        },
        {
            title: "Low Stock Items",
            count: metrics.lowStockItems,
            icon: <IoIosTimer size={24} color="white" />,
            color: ["#2c78e5", "#60aff5"]
        },
        {
            title: "Monthly Revenue",
            count: `₹${metrics.monthlyRevenue}`,
            icon: <MdTrendingUp size={24} color="white" />,
            color: ["#f39c12", "#ffcd4d"],
            grow: true
        }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await fetchDataFromApi('/api/supplier/dashboard');
            setMetrics({
                totalProducts: data.totalProducts || 0,
                pendingOrders: data.pendingOrders || 0,
                lowStockItems: data.lowStockItems || 0,
                monthlyRevenue: data.monthlyRevenue || 0
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    return (
        <Box sx={{
            padding: '30px',
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#071739' : '#f4f6f8',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, mt: 8 }}>
                <Typography variant="h4" sx={{
                    fontWeight: 700,
                    color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#2c3e50',
                    mb: 1
                }}>
                    Supplier Dashboard
                </Typography>
                <Typography variant="subtitle1" sx={{
                    color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#7f8c8d'
                }}>
                    Welcome back! Here's your business overview
                </Typography>
            </Box>

            {/* Metrics Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {dashboardBoxes.map((box, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <DashboardBox {...box} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts Section */}
            <Paper sx={{
                p: 3,
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#112143' : '#fff',
                borderRadius: '16px'
            }}>
                <Typography variant="h6" sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#2c3e50'
                }}>
                    Sales Overview
                </Typography>
                <Chart
                    width={'100%'}
                    height={'400px'}
                    chartType="LineChart"
                    loader={<div>Loading Chart...</div>}
                    data={[
                        ['Month', 'Sales'],
                        ['Jan', 1000],
                        ['Feb', 1170],
                        ['Mar', 660],
                        ['Apr', 1030]
                    ]}
                    options={{
                        curveType: 'function',
                        legend: { position: 'bottom' },
                        backgroundColor: 'transparent',
                        chartArea: { width: '80%', height: '70%' },
                        colors: ['#0858f7'],
                        vAxis: {
                            textStyle: { color: '#7f8c8d' }
                        },
                        hAxis: {
                            textStyle: { color: '#7f8c8d' }
                        }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default Dashboard;
