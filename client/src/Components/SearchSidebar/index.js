import React, { useEffect, useState, useContext } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import Rating from '@mui/material/Rating';
import { MyContext } from '../../App';

const SearchSidebar = () => {
    const [priceRange, setPriceRange] = useState([100, 60000]);
    const [selectedRating, setSelectedRating] = useState(0);
    const context = useContext(MyContext);

    useEffect(() => {
        applyFilters();
    }, [priceRange, selectedRating]);

    useEffect(() => {
        if (context.resetFilters) {
            setPriceRange([100, 60000]);
            setSelectedRating(0);
            context.setResetFilters(false);
        }
    }, [context.resetFilters]);

    const applyFilters = () => {
        const filteredResults = context.searchData.filter(product => 
            product.price >= priceRange[0] &&
            product.price <= priceRange[1] &&
            product.rating >= selectedRating
        );
        context.setFilteredSearchData(filteredResults);
    };

    const sidebarStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '20px',
    };

    const filterBoxStyle = {
        marginBottom: '25px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '20px',
    };

    const headerStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '15px',
    };

    const priceRangeStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
        fontSize: '14px',
        color: '#666',
    };

    const ratingListStyle = {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    };

    const ratingItemStyle = {
        cursor: 'pointer',
        marginBottom: '10px',
        transition: 'transform 0.2s',
    };

    return (
        <div style={sidebarStyle}>
            <div style={filterBoxStyle}>
                <h6 style={headerStyle}>FILTER BY PRICE</h6>
                <RangeSlider 
                    value={priceRange} 
                    onInput={setPriceRange} 
                    min={100} 
                    max={60000} 
                    step={5}
                    style={{marginBottom: '15px'}}
                />
                <div style={priceRangeStyle}>
                    <span>From: <strong style={{color: '#333'}}>Rs: {priceRange[0]}</strong></span>
                    <span>To: <strong style={{color: '#333'}}>Rs: {priceRange[1]}</strong></span>
                </div>
            </div>

            <div style={filterBoxStyle}>
                <h6 style={headerStyle}>FILTER BY RATING</h6>
                <ul style={ratingListStyle}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <li 
                            key={rating} 
                            onClick={() => setSelectedRating(rating)} 
                            style={{
                                ...ratingItemStyle,
                                transform: selectedRating === rating ? 'scale(1.05)' : 'scale(1)',
                            }}
                        >
                            <Rating 
                                name="read-only" 
                                value={rating} 
                                readOnly 
                                size="small"
                                style={{color: selectedRating === rating ? '#ffa41c' : '#bdbdbd'}}
                            />
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{textAlign: 'center'}}>
                <img 
                    src='https://klbtheme.com/bacola/wp-content/uploads/2021/05/sidebar-banner.gif' 
                    alt="Banner" 
                    style={{maxWidth: '100%', borderRadius: '4px'}}
                />
            </div>
        </div>
    );
};

export default SearchSidebar;
