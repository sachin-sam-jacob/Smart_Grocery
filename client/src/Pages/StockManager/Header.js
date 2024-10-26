import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import { MdOutlineLightMode, MdNightlightRound } from "react-icons/md";
import { IoCartOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegBell } from "react-icons/fa6";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import { IoShieldHalfSharp } from "react-icons/io5";
import Divider from '@mui/material/Divider';
import { MyContext } from '../../App';
import swal from 'sweetalert2';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpennotificationDrop, setisOpennotificationDrop] = useState(null);
    const { theme, toggleTheme, isLogin, user, setAlertBox } = useContext(MyContext);
    const openMyAcc = Boolean(anchorEl);
    const openNotifications = Boolean(isOpennotificationDrop);

    const navigate = useNavigate();

    const handleOpenMyAccDrop = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMyAccDrop = () => {
        setAnchorEl(null);
    };

    const handleOpenotificationsDrop = (event) => {
        setisOpennotificationDrop(event.currentTarget);
    };

    const handleClosenotificationsDrop = () => {
        setisOpennotificationDrop(null);
    };

    const logout = () => {
        localStorage.clear();
        setAnchorEl(null);
        // if (setAlertBox) {
        //     setAlertBox({
        //         open: true,
        //         error: false,
        //         msg: "Logout successful"
        //     });
        // }
        swal.fire("success","Logout Successful","success");
        setTimeout(() => {
            // navigate("/login");
            window.location.href="/signin";
        }, 2000);
    };

    const styles = {
        header: {
            width: '100%',
            height: '70px',
            background: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(33,33,33,0.9)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000,
            WebkitBackdropFilter: 'blur(5px)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
        },
        container: {
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px',
        },
        row: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px',
        },
        logoContainer: {
            flex: '0 0 200px',
        },
        logo: {
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
        },
        logoText: {
            color: theme === 'light' ? '#292929' : '#ffffff',
            fontWeight: 800,
            fontSize: '24px',
            transition: 'color 0.3s ease',
        },
        menuContainer: {
            display: 'flex',
            alignItems: 'center',
        },
        iconButton: {
            minWidth: '40px',
            width: '40px',
            height: '40px',
            padding: '8px',
            marginLeft: '10px',
            background: theme === 'light' ? '#f0f5ff' : '#333',
            color: theme === 'light' ? '#0858f7' : '#fff',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
        },
        myAccWrapper: {
            marginLeft: '15px',
        },
        myAcc: {
            textAlign: 'left',
            color: theme === 'light' ? '#0858f7' : '#fff',
            textTransform: 'capitalize',
            padding: '5px 10px',
            borderRadius: '20px',
            background: theme === 'light' ? '#f0f5ff' : '#333',
            transition: 'all 0.3s ease',
        },
        userImg: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#0858f7',
            color: '#fff',
            marginRight: '10px',
        },
        userImgCircle: {
            fontSize: '18px',
            fontWeight: 'bold',
        },
        userInfo: {
            textAlign: 'left',
        },
        userName: {
            fontSize: '15px',
            lineHeight: '18px',
            fontWeight: 600,
            margin: 0,
            color: theme === 'light' ? '#292929' : '#fff',
        },
        userRole: {
            margin: 0,
            fontSize: '12px',
            color: theme === 'light' ? '#666' : '#ccc',
        },
        signInButton: {
            background: '#0858f7',
            color: '#fff',
            textTransform: 'capitalize',
            borderRadius: '20px',
            padding: '5px 20px',
            marginLeft: '15px',
        },
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <div style={styles.row}>
                    <div style={styles.logoContainer}>
                        <Link to={'/'} style={styles.logo}>
                            <span style={styles.logoText}>Stock Manager</span>
                        </Link>
                    </div>
                    <div style={styles.menuContainer}>
                        <Button style={styles.iconButton} onClick={toggleTheme}>
                            {theme === "light" ? <MdNightlightRound /> : <MdOutlineLightMode />}
                        </Button>
                        <Button style={styles.iconButton}><IoCartOutline /></Button>
                        <Button style={styles.iconButton}><MdOutlineMailOutline /></Button>
                        <Button style={styles.iconButton} onClick={handleOpenotificationsDrop}>
                            <FaRegBell />
                        </Button>
                        <Menu
                            anchorEl={isOpennotificationDrop}
                            open={openNotifications}
                            onClose={handleClosenotificationsDrop}
                            onClick={handleClosenotificationsDrop}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Orders (12)</h4>
                            </MenuItem>
                            <Divider />
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {/* Notification items */}
                            </div>
                        </Menu>
                        {isLogin ? (
                            <div style={styles.myAccWrapper}>
                                <Button style={styles.myAcc} onClick={handleOpenMyAccDrop}>
                                    <div style={styles.userImg}>
                                        <span style={styles.userImgCircle}>
                                            {user?.name?.charAt(0)}
                                        </span>
                                    </div>
                                    <div style={styles.userInfo}>
                                        <h4 style={styles.userName}>{user?.name}</h4>
                                        <p style={styles.userRole}>{user?.email}</p>
                                    </div>
                                </Button>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={openMyAcc}
                                    onClose={handleCloseMyAccDrop}
                                    onClick={handleCloseMyAccDrop}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={handleCloseMyAccDrop}>
                                        <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
                                        My Account
                                    </MenuItem>
                                    <MenuItem onClick={handleCloseMyAccDrop}>
                                        <ListItemIcon><IoShieldHalfSharp /></ListItemIcon>
                                        Reset Password
                                    </MenuItem>
                                    <MenuItem onClick={logout}>
                                        <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </div>
                        ) : (
                            <Button style={styles.signInButton} onClick={() => navigate('/login')}>
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
