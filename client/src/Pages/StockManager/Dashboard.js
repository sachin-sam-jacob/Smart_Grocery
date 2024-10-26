import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { FaBox, FaClipboardList, FaWarehouse } from 'react-icons/fa';
import { Button, CircularProgress } from '@mui/material';
import Header from './Header';
import StockManagerSidebar from './StockManagerSidebar';

const StockManagerDashboard = () => {
    const { theme, setAlertBox } = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        lowStockProducts: 0,
        pendingOrders: 0,
    });
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    const context = useContext(MyContext);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.isStockManager) {
            navigate('/signin', { replace: true });
            return;
        }
        setUser(userData);
        fetchDashboardData();
        context.setisHeaderFooterShow(false);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await fetchDataFromApi('/api/stockmanager/dashboard');
            setDashboardData(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        setAlertBox({
            open: true,
            error: false,
            msg: "Logout successful"
        });
        setTimeout(() => {
            navigate("/signin");
        }, 2000);
    }

    const styles = {
        main: {
            display: 'flex',
            minHeight: 'calc(100vh - 70px)',
            marginTop: '70px',
            backgroundColor: theme === 'light' ? '#f4f6f8' : '#121212',
            color: theme === 'light' ? '#333' : '#fff',
            transition: 'all 0.3s ease',
        },
        content: {
            flexGrow: 1,
            padding: '30px',
            overflowY: 'auto',
        },
        dashboardTitle: {
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '30px',
            color: theme === 'light' ? '#333' : '#fff',
        },
        dashboardBoxWrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
        },
        dashboardBox: {
            flex: '1',
            minWidth: '250px',
            padding: '25px',
            borderRadius: '15px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '180px',
            transition: 'all 0.3s ease',
            marginRight: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            '&:last-child': {
                marginRight: 0,
            },
        },
        dashboardBoxTitle: {
            fontSize: '20px',
            marginBottom: '15px',
            fontWeight: '500',
        },
        dashboardBoxValue: {
            fontSize: '42px',
            fontWeight: 'bold',
        },
        dashboardBoxIcon: {
            fontSize: '54px',
            opacity: 0.8,
            alignSelf: 'flex-end',
        },
        actionButtonsWrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
        },
        actionButton: {
            padding: '15px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '48%',
            marginBottom: '20px',
            borderRadius: '10px',
            textTransform: 'none',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
    };

    return (
        <>
            <Header />
            <div style={styles.main}>
                <StockManagerSidebar 
                    user={user} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    logout={logout}
                />
                <div style={styles.content}>
                    <h1 style={styles.dashboardTitle}>Stock Manager Dashboard</h1>
                    {isLoading ? (
                        <CircularProgress style={{ margin: '20px auto', display: 'block' }} />
                    ) : (
                        <>
                            <div style={styles.dashboardBoxWrapper}>
                                {[
                                    { title: 'Total Products', value: dashboardData.totalProducts, icon: <FaBox />, color: '#4CAF50' },
                                    { title: 'Low Stock Products', value: dashboardData.lowStockProducts, icon: <FaWarehouse />, color: '#FFC107' },
                                    { title: 'Pending Orders', value: dashboardData.pendingOrders, icon: <FaClipboardList />, color: '#2196F3' },
                                ].map((box, index) => (
                                    <div key={index} style={{ ...styles.dashboardBox, backgroundColor: box.color }}>
                                        <div>
                                            <h4 style={styles.dashboardBoxTitle}>{box.title}</h4>
                                            <span style={styles.dashboardBoxValue}>{box.value}</span>
                                        </div>
                                        <div style={styles.dashboardBoxIcon}>{box.icon}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={styles.actionButtonsWrapper}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={styles.actionButton}
                                    component={Link}
                                    to="/stockmanager/products"
                                >
                                    Manage Products
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    style={styles.actionButton}
                                    component={Link}
                                    to="/stockmanager/orders"
                                >
                                    Manage Orders
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default StockManagerDashboard;
