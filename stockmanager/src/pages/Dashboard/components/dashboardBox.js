import { HiDotsVertical } from "react-icons/hi";
import Button from '@mui/material/Button';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from "react";
import { IoIosTimer } from "react-icons/io";

const DashboardBox = ({ color, icon, title, count, grow = false }) => {
    // Format the count with commas for better readability
    const formatCount = (value) => {
        if (value === undefined || value === null) return '0';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const ITEM_HEIGHT = 48;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Button 
            className="dashboardBox" 
            style={{
                backgroundImage: `linear-gradient(to right, ${color?.[0] || '#000'}, ${color?.[1] || '#000'})`,
                cursor: 'default'  // Remove pointer cursor since it's not clickable
            }}
        >
            {typeof grow === 'boolean' && (
                <span className="chart">
                    {grow ? <TrendingUpIcon /> : <TrendingDownIcon />}
                </span>
            )}

            <div className="d-flex w-100">
                <div className="col1">
                    <h4 className="text-white mb-0">
                        {title || 'Unknown'}
                    </h4>
                    <span className="text-white" style={{ fontSize: '1.5rem' }}>
                        {formatCount(count)}
                    </span>
                </div>

                {icon && (
                    <div className="ml-auto">
                        <span className="icon">
                            {icon}
                        </span>
                    </div>
                )}
            </div>
        </Button>
    );
};

export default DashboardBox;