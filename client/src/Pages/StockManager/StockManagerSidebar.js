import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBox, FaClipboardList, FaWarehouse, FaUserCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdDashboard, MdLocationOn } from 'react-icons/md';
import { Button, Collapse } from '@mui/material';
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from '../../App';

const StockManagerSidebar = ({ user, activeTab, setActiveTab, logout }) => {
    const { theme } = useContext(MyContext);
    const navigate = useNavigate();
    const [isProductsOpen, setIsProductsOpen] = useState(false);

    const styles = {
        sidebar: {
            width: '280px',
            backgroundColor: theme === 'light' ? '#ffffff' : '#1E1E1E',
            boxShadow: theme === 'light' ? '2px 0 10px rgba(0, 0, 0, 0.1)' : '2px 0 10px rgba(255, 255, 255, 0.1)',
            padding: '30px 0',
            transition: 'all 0.3s ease',
            height: 'calc(100vh - 70px)',
            overflowY: 'auto',
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: theme === 'light' ? '#f0f5ff' : '#2c2c2c',
            borderRadius: '15px',
            margin: '0 20px 30px',
        },
        avatar: {
            fontSize: '54px',
            marginRight: '15px',
            color: theme === 'light' ? '#0858f7' : '#4CAF50',
        },
        userDetails: {
            display: 'flex',
            flexDirection: 'column',
        },
        userName: {
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '5px',
            color: theme === 'light' ? '#333' : '#fff',
        },
        userLocation: {
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            color: theme === 'light' ? '#666' : '#ccc',
        },
        locationIcon: {
            marginRight: '5px',
        },
        sidebarList: {
            listStyleType: 'none',
            padding: 0,
            margin: 0,
        },
        sidebarItem: {
            marginBottom: '10px',
        },
        sidebarButton: {
            width: '100%',
            textAlign: 'left',
            padding: '12px 25px',
            transition: 'all 0.3s ease',
            color: theme === 'light' ? '#333' : '#fff',
            backgroundColor: 'transparent',
            borderRadius: '0 30px 30px 0',
            fontSize: '16px',
        },
        sidebarButtonActive: {
            backgroundColor: theme === 'light' ? '#f0f5ff' : '#333',
            color: '#0858f7',
            fontWeight: 'bold',
        },
        sidebarIcon: {
            marginRight: '15px',
            fontSize: '20px',
        },
        logoutButton: {
            margin: '20px',
            padding: '12px',
            borderRadius: '10px',
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '16px',
        },
        subMenu: {
            paddingLeft: '40px',
            listStyleType: 'none',
        },
        subMenuItem: {
            padding: '8px 0',
        },
        subMenuButton: {
            fontSize: '14px',
            color: theme === 'light' ? '#555' : '#ccc',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
        },
        subMenuButtonActive: {
            color: '#0858f7',
            fontWeight: 'bold',
        },
    };

    const handleNavigation = (path, index) => {
        setActiveTab(index);
        navigate(path);
    };

    const toggleProductsMenu = () => {
        setIsProductsOpen(!isProductsOpen);
    };

    const productSubMenu = [
        { text: 'Product List', path: '/stockmanager/products' },
        { text: 'Product Upload', path: '/stockmanager/products/upload' },
        { text: 'Add Product Weight', path: '/stockmanager/products/add-weight' },
    ];

    return (
        <div style={styles.sidebar}>
            <div style={styles.userInfo}>
                <FaUserCircle style={styles.avatar} />
                <div style={styles.userDetails}>
                    <span style={styles.userName}>{user?.name}</span>
                    <span style={styles.userLocation}>
                        <MdLocationOn style={styles.locationIcon} />
                        {user?.location || 'Location not set'}
                    </span>
                </div>
            </div>
            <ul style={styles.sidebarList}>
                <li style={styles.sidebarItem}>
                    <Button
                        style={{
                            ...styles.sidebarButton,
                            ...(activeTab === 0 ? styles.sidebarButtonActive : {}),
                        }}
                        onClick={() => handleNavigation('/stockmanager', 0)}
                    >
                        <span style={styles.sidebarIcon}><MdDashboard /></span>
                        Dashboard
                    </Button>
                </li>
                <li style={styles.sidebarItem}>
                    <Button
                        style={{
                            ...styles.sidebarButton,
                            ...(activeTab === 1 ? styles.sidebarButtonActive : {}),
                        }}
                        onClick={toggleProductsMenu}
                    >
                        <span style={styles.sidebarIcon}><FaBox /></span>
                        Manage Products
                        {isProductsOpen ? <FaChevronUp style={{marginLeft: 'auto'}} /> : <FaChevronDown style={{marginLeft: 'auto'}} />}
                    </Button>
                    <Collapse in={isProductsOpen}>
                        <ul style={styles.subMenu}>
                            {productSubMenu.map((item, index) => (
                                <li key={index} style={styles.subMenuItem}>
                                    <Button
                                        style={{
                                            ...styles.subMenuButton,
                                            ...(activeTab === `1.${index}` ? styles.subMenuButtonActive : {}),
                                        }}
                                        onClick={() => handleNavigation(item.path, `1.${index}`)}
                                    >
                                        {item.text}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </Collapse>
                </li>
                <li style={styles.sidebarItem}>
                    <Button
                        style={{
                            ...styles.sidebarButton,
                            ...(activeTab === 2 ? styles.sidebarButtonActive : {}),
                        }}
                        onClick={() => handleNavigation('/stockmanager/orders', 2)}
                    >
                        <span style={styles.sidebarIcon}><FaClipboardList /></span>
                        Manage Orders
                    </Button>
                </li>
                <li style={styles.sidebarItem}>
                    <Button
                        style={{
                            ...styles.sidebarButton,
                            ...(activeTab === 3 ? styles.sidebarButtonActive : {}),
                        }}
                        onClick={() => handleNavigation('/stockmanager/inventory', 3)}
                    >
                        <span style={styles.sidebarIcon}><FaWarehouse /></span>
                        Inventory
                    </Button>
                </li>
            </ul>
            <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                onClick={logout}
                style={styles.logoutButton}
            >
                <IoMdLogOut style={{ marginRight: '10px' }} /> Logout
            </Button>
        </div>
    );
};

export default StockManagerSidebar;
