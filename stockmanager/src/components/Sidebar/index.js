import Button from '@mui/material/Button';
import { MdDashboard } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";
import { FaProductHunt } from "react-icons/fa";
import { FaCartArrowDown } from "react-icons/fa6";
import { MdMessage } from "react-icons/md";
import { FaBell } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { Link, NavLink } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from '../../App';
import { FaClipboardCheck } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaWarehouse } from "react-icons/fa"; // New import for Stock Manager icon
import { FaMapMarkerAlt } from "react-icons/fa"; // New import for Manage Pincode icon
import { FaUsers } from "react-icons/fa";
import { IoBarChart } from "react-icons/io5";
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PaymentIcon from '@mui/icons-material/Payment';
import { IoStatsChart } from "react-icons/io5";

const Sidebar = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [location, setLocation] = useState(''); // State for location

    const context = useContext(MyContext);
    const history = useNavigate();

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
            history("/login");
        }
    }, []);

    const isOpenSubmenu = (index) => {
        setActiveTab(index);
        setIsToggleSubmenu(!isToggleSubmenu)
    }

    const logout = () => {
        localStorage.clear();
        context.setAlertBox({
            open: true,
            error: false,
            msg: "Logout successful"
        });
        setTimeout(() => {
            history("/login");
        }, 2000);
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

    const sidebarItems = [
        {
            title: "Supplier Management",
            icon: <FaUsers />,
            submenu: [
                { title: "Add Supplier", path: "/add-supplier" },
                { title: "Manage Suppliers", path: "/suppliers" }
            ]
        },
        {
            title: "Stock Management",
            icon: <IoBarChart />,
            submenu: [
                { title: "Stock Overview", path: "/stock-management" },
                { title: "Stock Alerts", path: "/stock-alerts" },
                { title: "Payments", path: "/stock-payments" }
            ]
        }
    ];

    return (
        <>
            <div className="sidebar">
                {/* Display stock manager location */}
                <div style={locationStyle}>
                    <FaMapMarkerAlt style={iconStyle} />
                    <span style={textStyle}>{location}</span>
                </div>

                <ul>
                    <li>
                        <NavLink exact activeClassName='is-active' to="/">
                            <Button className={`w-100 ${activeTab === 0 ? 'active' : ''}`} onClick={() => isOpenSubmenu(0)}>
                                <span className='icon'><MdDashboard /></span>
                                Dashboard
                             
                            </Button>
                        </NavLink>
                    </li>
                    <li>
                        <Button className={`w-100 ${activeTab === 1 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(1)}>
                            <span className='icon'><FaProductHunt /></span>
                            Products
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 1 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><NavLink exact activeClassName='is-active' to="/products">Product List</NavLink></li>
                               
                                <li><NavLink exact activeClassName='is-active' to="/product/upload">Product Upload</NavLink></li>
                                <li><NavLink exact activeClassName='is-active' to="/productWEIGHT/add">Add Product WEIGHT</NavLink></li>
                                {/* <li><NavLink exact activeClassName='is-active' to="/productSIZE/add">Add Product SIZE</NavLink></li> */}
                            </ul>
                        </div>
                    </li>

                    <li>
                        <Button className={`w-100 ${activeTab === 2 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(2)}>
                            <span className='icon'><FaProductHunt /></span>
                            Category
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 2 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><Link to="/category">Category List</Link></li>
                                <li><Link to="/category/add">Add a category</Link></li>
                                <li><Link to="/subCategory">Sub Category List</Link></li>
                                <li><Link to="/subCategory/add">Add a sub category</Link></li>
                            </ul>
                        </div>
                    </li>

                    <li>
                        <NavLink exact activeClassName='is-active' to="/orders">
                            <Button className={`w-100 ${activeTab === 3 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(3)}>
                                <span className='icon'> <FaClipboardCheck fontSize="small" /></span>
                                Orders
                            </Button>
                        </NavLink>
                    </li>

                    {/* New Manage Pincode section */}
                    <li>
                        <Button className={`w-100 ${activeTab === 4 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(4)}>
                            <span className='icon'><FaMapMarkerAlt /></span>
                            Manage Pincode
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 4 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><Link to="/listpincode">List Pincode</Link></li>
                                <li><Link to="/addpincode">Add Pincode</Link></li>
                            </ul>
                        </div>
                    </li>

                    <li>
                        <Button className={`w-100 ${activeTab === 6 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpenSubmenu(6)}>
                            <span className='icon'><IoBarChart /></span>
                            Stock Management
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 6 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><Link to="/stock-management">Stock Overview</Link></li>
                                <li><Link to="/stock-alerts">Stock Alerts</Link></li>
                                <li><Link to="/stock-payments">Payments</Link></li>
                            </ul>
                        </div>
                    </li>

                    <li>
                        <Button className={`w-100 ${activeTab === 5 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpenSubmenu(5)}>
                            <span className='icon'><FaUsers /></span>
                            Supplier Management
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 5 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><Link to="/add-supplier">Add Supplier</Link></li>
                                <li><Link to="/suppliers">Manage Suppliers</Link></li>
                            </ul>
                        </div>
                    </li>

                    <li>
                        <Button className={`w-100 ${activeTab === 7 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpenSubmenu(7)}>
                            <span className='icon'><IoStatsChart /></span>
                            Reports
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 7 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><Link to="/reports/sales">Sales Reports</Link></li>
                                <li><Link to="/reports/inventory">Inventory Reports</Link></li>
                                <li><Link to="/reports/supplier">Supplier Reports</Link></li>
                                <li><Link to="/reports/custom">Custom Reports</Link></li>
                            </ul>
                        </div>
                    </li>

                </ul>


                <br />

                <div className='logoutWrapper'>
                    <div className='logoutBox'>
                        <Button variant="contained" onClick={logout}><IoMdLogOut /> Logout</Button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Sidebar;
