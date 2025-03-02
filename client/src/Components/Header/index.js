import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/MainLogo.png';
import Button from '@mui/material/Button';
import CountryDropdown from '../CountryDropdown';
import { FiUser } from "react-icons/fi";
import { IoBagOutline } from "react-icons/io5";
import SearchBar from '../SearchBar';
import Navigation from './Navigation';
import { useContext } from 'react';
import { MyContext } from '../../App';
import { districtsInKerala } from '../../data/districts'; // Import the districts data
import Swal from 'sweetalert2';
import 'animate.css';

import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { FaClipboardCheck } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { RiLogoutCircleRFill } from "react-icons/ri";
import { FaUserAlt } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { FaAngleLeft } from "react-icons/fa6";
import VisualSearch from '../VisualSearch';
import { IoIosCamera } from "react-icons/io";
import './styles.css';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpenNav, setIsOpenNav] = useState(false);
    const [isOpenSearch, setIsOpenSearch] = useState(false);
    const open = Boolean(anchorEl);

    const headerRef = useRef();
    const context = useContext(MyContext);
    const history = useNavigate();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const logout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out of your account",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout',
            background: '#fff',
            customClass: {
                popup: 'animated fadeInDown',
                title: 'swal2-title',
                confirmButton: 'swal2-confirm',
                cancelButton: 'swal2-cancel'
            },
            padding: '2em',
            borderRadius: '15px',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    // First close the menu
                    setAnchorEl(null);
                    
                    // Clear all local storage items
                    localStorage.clear();
                    
                    // Update context
                    context.setIsLogin(false);
                    context.setCartData([]);  // Clear cart data if you have it in context
                    
                    // Show success message
                    Swal.fire({
                        title: '<span style="color: #28a745">Successfully Logged Out!</span>',
                        html: '<span style="font-size: 1.1em">Thank you for using our service</span>',
                        icon: 'success',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        background: '#fff',
                        customClass: {
                            popup: 'animated fadeInDown',
                            title: 'swal2-title',
                        },
                        padding: '2em',
                        borderRadius: '15px',
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    }).then(() => {
                        // Redirect after the success message is shown
                        window.location.href = '/signIn';
                    });
                } catch (error) {
                    Swal.fire({
                        title: '<span style="color: #dc3545">Oops!</span>',
                        html: '<span style="font-size: 1.1em">Something went wrong while logging out</span>',
                        icon: 'error',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        background: '#fff',
                        customClass: {
                            popup: 'animated fadeInDown',
                            title: 'swal2-title',
                        },
                        padding: '2em',
                        borderRadius: '15px',
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    });
                }
            }
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", () => {
            let position = window.pageYOffset;
            if (headerRef.current) {
                if (position > 100) {
                    headerRef.current.classList.add('fixed');
                } else {
                    headerRef.current.classList.remove('fixed');
                }
            }
        });
    }, []);

    const openNav = () => {
        setIsOpenNav(!isOpenNav);
        context.setIsOpenNav(true);
    };

    const closeNav = () => {
        setIsOpenNav(false);
        context.setIsOpenNav(false);
    };

    const addToCart = (product) => {
        // Implementation of addToCart function
        // You can move this from Cart component or implement as needed
    };

    return (
        <>
            <div className='headerWrapperFixed' ref={headerRef}>
                <div className="headerWrapper">
                    <header className="header">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="logoWrapper d-flex align-items-center col-sm-2">
                                    <Link to={'/'}>
                                        <img style={{ width: '130px', height: '50px' }} src={Logo} alt='Logo' />
                                    </Link>
                                </div>

                                <div className='col-sm-10 d-flex align-items-center part2'>
                                    {context.windowWidth > 992 && (
                                        <CountryDropdown selectedLocation={context.selectedCountry} />
                                    )}

                                    <div className="header-search-wrapper">
                                        <div className="search-bar-container">
                                            <SearchBar />
                                        </div>
                                        <div className="visual-search-wrapper">
                                            <VisualSearch 
                                                addToCart={addToCart}
                                                buttonStyle="icon"
                                                id="visualSearch"
                                            />
                                        </div>
                                    </div>

                                    <div className='part3 d-flex align-items-center ml-auto'>
                                        {context.windowWidth < 992 && <Button className="circle ml-3 toggleNav" onClick={openNav}><IoMdMenu /></Button>}

                                        {context.isLogin !== true && context.windowWidth > 992 && (
                                            <Link to="/signIn">
                                                <Button style={{ width: '130px', height: '40px' }} className="btn-blue mr-3">Sign In</Button>
                                            </Link>
                                        )}

                                        {context.isLogin === true && (
                                            <>
                                                <Button className='circle mr-3' onClick={handleClick}><FiUser /></Button>
                                                <Menu
                                                    anchorEl={anchorEl}
                                                    id="accDrop"
                                                    open={open}
                                                    onClose={handleClose}
                                                    onClick={handleClose}
                                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                >
                                                    <Link to="/my-account">
                                                        <MenuItem onClick={handleClose}>
                                                            <ListItemIcon>
                                                                <FaUserAlt fontSize="small" />
                                                            </ListItemIcon>
                                                            My Account
                                                        </MenuItem>
                                                    </Link>
                                                    <Link to="/orders">
                                                        <MenuItem onClick={handleClose}>
                                                            <ListItemIcon>
                                                                <FaClipboardCheck fontSize="small" />
                                                            </ListItemIcon>
                                                            Orders
                                                        </MenuItem>
                                                    </Link>
                                                    <Link to="/my-list">
                                                        <MenuItem onClick={handleClose}>
                                                            <ListItemIcon>
                                                                <FaHeart fontSize="small" />
                                                            </ListItemIcon>
                                                            My List
                                                        </MenuItem>
                                                    </Link>
                                                    <MenuItem onClick={logout}>
                                                        <ListItemIcon>
                                                            <RiLogoutCircleRFill fontSize="small" />
                                                        </ListItemIcon>
                                                        Logout
                                                    </MenuItem>
                                                </Menu>
                                            </>
                                        )}

                                        <div className='ml-auto cartTab d-flex align-items-center'>
                                            {context.windowWidth > 1000 && (
                                                <span className='price'>
                                                    {(context.cartData?.length !== 0 ?
                                                        context.cartData?.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0) : 0)?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                                </span>
                                            )}

                                            <div className='position-relative ml-2'>
                                                <Link to="/cart">
                                                    <Button className='circle' id="cart"><IoBagOutline /></Button>
                                                    <span className='count d-flex align-items-center justify-content-center'>{context.cartData?.length > 0 ? context.cartData?.length : 0}</span>
                                                </Link>
                                            </div>

                                            {context.windowWidth < 992 && (
                                                <Button className="circle ml-3 toggleNav" onClick={openNav}><IoMdMenu /></Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {context.categoryData?.length !== 0 && <Navigation navData={context.categoryData} isOpenNav={isOpenNav} closeNav={closeNav} />}
                </div>
            </div>
        </>
    );
};

export default Header;