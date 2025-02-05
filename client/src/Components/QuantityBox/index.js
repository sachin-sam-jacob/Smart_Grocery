import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import Button from '@mui/material/Button';
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import React from "react";

const QuantityBox = ({ quantity, item, value, initialValue }) => {
    const [count, setCount] = useState(initialValue || value || 1);
    const context = useContext(MyContext);

    useEffect(() => {
        // Only update if value is different from current count
        if (value !== undefined && value !== count) {
            setCount(value);
        }
    }, [value, count]);

    const updateQuantity = (newCount) => {
        setCount(newCount);
        if (quantity) {
            quantity(newCount);
        }
    };

    const minus = () => {
        if (count > 1) {
            updateQuantity(count - 1);
        }
        context.setAlertBox({
            open: false,
        });
    };

    const plus = () => {
        const stock = parseInt(item.countInStock);
        if (count < stock) {
            updateQuantity(count + 1);
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "The quantity is greater than product count in stock"
            });
        }
    };

    const handleInputChange = (e) => {
        const newValue = parseInt(e.target.value);
        if (!isNaN(newValue) && newValue >= 1 && newValue <= item.countInStock) {
            updateQuantity(newValue);
        }
    };

    return (
        <div className='quantityDrop d-flex align-items-center'>
            <Button onClick={minus}><FaMinus /></Button>
            <input 
                type="text" 
                value={count}
                onChange={handleInputChange}
                onBlur={() => {
                    if (count < 1) updateQuantity(1);
                    if (count > item.countInStock) updateQuantity(item.countInStock);
                }}
            />
            <Button onClick={plus}><FaPlus /></Button>
        </div>
    );
};

export default React.memo(QuantityBox);