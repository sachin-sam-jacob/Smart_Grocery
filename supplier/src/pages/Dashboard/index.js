import { useContext, useEffect, useState } from "react";
import { MdShoppingBag, MdTrendingUp } from "react-icons/md";
import { IoMdCart } from "react-icons/io";
import { IoIosTimer } from "react-icons/io";
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

    const styles = {
        mainContainer: {
            padding: '30px',
            backgroundColor: '#f4f6f8',
        },
        headerSection: {
            marginBottom: '30px'
        },
        title: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px'
        },
        subtitle: {
            fontSize: '16px',
            color: '#7f8c8d',
            marginBottom: '25px'
        },
        metricsContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '25px',
            marginBottom: '40px'
        },
        chartsSection: {
            display: 'flex',
            gap: '25px',
            marginTop: '30px'
        },
        chartCard: {
            flex: '1',
            backgroundColor: '#fff',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        chartTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '20px'
        }
    };

    const dashboardBoxes = [
        {
            title: "Total Products",
            count: metrics.totalProducts,
            icon: <MdShoppingBag />,
            color: ["#1da256", "#48d483"],
            grow: true
        },
        {
            title: "Pending Orders",
            count: metrics.pendingOrders,
            icon: <IoMdCart />,
            color: ["#c012e2", "#eb64fe"]
        },
        {
            title: "Low Stock Items",
            count: metrics.lowStockItems,
            icon: <IoIosTimer />,
            color: ["#2c78e5", "#60aff5"]
        },
        {
            title: "Monthly Revenue",
            count: `₹${metrics.monthlyRevenue}`,
            icon: <MdTrendingUp />,
            color: ["#f39c12", "#ffcd4d"],
            grow: true
        }
    ];

    useEffect(() => {
        // Fetch dashboard data
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
        <div className="right-content w-100" style={styles.mainContainer}>
            <div style={styles.headerSection}>
                <h1 style={styles.title}>Supplier Dashboard</h1>
                <p style={styles.subtitle}>Welcome back! Here's your business overview</p>
            </div>

            <div style={styles.metricsContainer}>
                {dashboardBoxes.map((box, index) => (
                    <DashboardBox
                        key={index}
                        title={box.title}
                        count={box.count}
                        icon={box.icon}
                        color={box.color}
                        grow={box.grow}
                    />
                ))}
            </div>

            <div style={styles.chartsSection}>
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>Sales Overview</h3>
                    <Chart
                        width={'100%'}
                        height={'300px'}
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
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
