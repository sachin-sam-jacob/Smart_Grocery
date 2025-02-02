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

const Sidebar = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const context = useContext(MyContext);
    const history = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token !== "" && token !== undefined && token !== null) {
            setIsLogin(true);
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

    return (
        <>
            <div className="sidebar">
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
                               
                                {/* <li><NavLink exact activeClassName='is-active' to="/product/upload">Product Upload</NavLink></li>
                                <li><NavLink exact activeClassName='is-active' to="/productRAMS/add">Add Product RAMS</NavLink></li>
                                <li><NavLink exact activeClassName='is-active' to="/productWEIGHT/add">Add Product WEIGHT</NavLink></li>
                                <li><NavLink exact activeClassName='is-active' to="/productSIZE/add">Add Product SIZE</NavLink></li> */}
                            </ul>
                        </div>
                    </li>

                    {/* <li>
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
                    </li> */}

                    <li>
                        <NavLink exact activeClassName='is-active' to="/orders">
                            <Button className={`w-100 ${activeTab === 3 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(3)}>
                                <span className='icon'> <FaClipboardCheck fontSize="small" /></span>
                                Orders
                            </Button>
                        </NavLink>
                    </li>



                    <li>
                        <Button className={`w-100 ${activeTab === 4 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(4)}>
                            <span className='icon'><FaProductHunt /></span>
                            Home Banner Slides
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 4 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><NavLink exact activeClassName='is-active' to="/homeBannerSlide/add">Add Home Banner Slide</NavLink></li>
                                <li><NavLink exact activeClassName='is-active' to="/homeBannerSlide/list">Home Slides List</NavLink></li>
                            </ul>
                        </div>
                    </li>

                    
                    <li>
                        <Button className={`w-100 ${activeTab === 5 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(5)}>
                            <span className='icon'><FaProductHunt /></span>
                            Manage user
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 5 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><NavLink exact activeClassName='is-active' to="/user/list">List Users</NavLink></li>
                                <li><NavLink exact activeClassName='is-active' to="/user/blockedUsers">Blocked Users</NavLink></li>
                            </ul>
                        </div>
                    </li>

                    {/* New Stock Manager section */}
                    <li>
                        <Button className={`w-100 ${activeTab === 6 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(6)}>
                            <span className='icon'><FaWarehouse /></span>
                            District Operation Manager
                            <span className='arrow'><FaAngleRight /></span>
                        </Button>
                        <div className={`submenuWrapper ${activeTab === 6 && isToggleSubmenu === true ? 'colapse' : 'colapsed'}`}>
                            <ul className='submenu'>
                                <li><NavLink exact activeClassName='is-active' to="/stockManager/add">Add District Operation Managers</NavLink></li>
                                <li><NavLink exact activeClassName='is-active' to="/stockManager/list">List District Operation Managers</NavLink></li>
                                {/* <li><NavLink exact activeClassName='is-active' to="/stockManager/approve">Approve Stock Managers</NavLink></li> */}
                                <li><NavLink exact activeClassName='is-active' to="/stockManager/manage">Manage District Operation Managers</NavLink></li>
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
