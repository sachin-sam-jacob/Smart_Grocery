import Button from '@mui/material/Button';
import { MdDashboard } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";
import { FaProductHunt } from "react-icons/fa";
import { FaCartArrowDown } from "react-icons/fa6";
import { MdMessage } from "react-icons/md";
import { FaBell } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from '../../App';
import { FaClipboardCheck } from "react-icons/fa";
import { FaWarehouse } from "react-icons/fa"; // New import for Stock Manager icon
import { FaMapMarkerAlt } from "react-icons/fa"; // New import for Manage Pincode icon
import { MdShoppingBag } from "react-icons/md";
import { IoMdCart } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5"; // Add this import for the stock orders icon
import { MdInventory } from "react-icons/md"; // Add this import for Product Management icon
import Swal from 'sweetalert2';

const Sidebar = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [location, setLocation] = useState(''); // State for location

    const context = useContext(MyContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("user");
        if (token !== "" && token !== undefined && token !== null) {
            setIsLogin(true);
            try {
                // Parse the token and extract the location
                const userData = JSON.parse(token);
                setLocation(userData.location || 'Unknown Location');
            } catch (error) {
                console.error("Error parsing user token:", error);
                setLocation('Unknown Location');
            }
        }
        else {
            navigate("/login");
        }
    }, []);

    const isOpenSubmenu = (index) => {
        setActiveTab(index);
        setIsToggleSubmenu(!isToggleSubmenu)
    }

    const logout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out of the system!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!'
        });

        if (result.isConfirmed) {
            // Clear local storage
            localStorage.clear();
            
            // Show success message
            await Swal.fire({
                title: 'Logged Out!',
                text: 'You have been successfully logged out.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Navigate to login page
            window.location.href = "/login";
        }
    }

    const locationStyle = {
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    };

    const iconStyle = {
        color: '#3498db',
        fontSize: '24px',
        marginBottom: '8px',
    };

    const textStyle = {
        fontSize: '16px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
    };

    const handleNavigation = (path, index) => {
        navigate(path);
        setActiveTab(index);
    }

    return (
        <div className="sidebar">
            <div style={locationStyle}>
                <FaMapMarkerAlt style={iconStyle} />
                <span style={textStyle}>{location}</span>
            </div>

            <ul>
                <li>
                    <Button className={`w-100 ${activeTab === 1 ? 'active' : ''}`} onClick={() => handleNavigation('/dashboard', 1)}>
                        <span className='icon'><MdDashboard /></span>
                        Dashboard
                    </Button>
                </li>
                <li>
                    <Button className={`w-100 ${activeTab === 2 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpenSubmenu(2)}>
                        <span className='icon'><IoCartOutline /></span>
                        Stock Orders
                        <span className='arrow'><FaAngleRight /></span>
                    </Button>
                    <div className={`submenuWrapper ${activeTab === 2 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                        <ul className='submenu'>
                            <li>
                                <Link to="/stock-orders">View Orders</Link>
                            </li>
                            <li>
                                <Link to="/stock-orders/history">Order History</Link>
                            </li>
                        </ul>
                    </div>
                </li>
                <li>
                    <Button className={`w-100 ${activeTab === 3 ? 'active' : ''}`} onClick={() => handleNavigation('/supplier/products', 3)}>
                        <span className='icon'><MdInventory /></span>
                        Product Management
                    </Button>
                </li>
                {/* <li>
                    <Button className={`w-100 ${activeTab === 4 ? 'active' : ''}`} onClick={() => handleNavigation('/communications', 4)}>
                        <span className='icon'><MdMessage /></span>
                        District Manager Chat
                    </Button>
                </li> */}

                <div className='logoutWrapper'>
                    <div className='logoutBox'>
                        <Button variant="contained" onClick={logout}><IoMdLogOut /> Logout</Button>
                    </div>
                </div>
            </ul>
        </div>
    );
}

export default Sidebar;
