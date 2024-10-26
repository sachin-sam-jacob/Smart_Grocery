import React, { useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { fetchDataFromApi } from '../../utils/api';
import { useParams } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import { MyContext } from '../../App';
import Button from '@mui/material/Button';

const Sidebar = (props) => {
    const [value, setValue] = useState([100, 100000]);
    const [value2, setValue2] = useState(0);

    const [subCatId, setSubCatId] = useState('');

    const [filterSubCat, setfilterSubCat] = React.useState();
    const [isOpenFilter, setIsOpenFilter] = useState(false);
   


    const context = useContext(MyContext);

    const { id } = useParams();

    useEffect(() => {
        setSubCatId(id);
    }, [id])
    

    useEffect(() => {
        setIsOpenFilter(props.isOpenFilter)
    }, [props.isOpenFilter])


    const handleChange = (event) => {
        setfilterSubCat(event.target.value);
        props.filterData(event.target.value)
        setSubCatId(event.target.value)
    };

    useEffect(() => {
        props.filterByPrice(value, subCatId);
    }, [value,id]);

    const [selectedRating, setSelectedRating] = useState(0);

    const filterByRating = (rating) => {
        setSelectedRating(rating);
        props.filterByRating(rating, subCatId);
    }

    const applyFilters = () => {
        const minPrice = value[0];
        const maxPrice = value[1];
        const rating = selectedRating;

        context.setPriceRange([minPrice, maxPrice]);
        context.setSelectedRating(rating);

        if (window.location.pathname === '/search') {
            const searchQuery = new URLSearchParams(window.location.search).get('q');
            if (searchQuery) {
                fetchDataFromApi(`/api/search?q=${searchQuery}&minPrice=${minPrice}&maxPrice=${maxPrice}&rating=${rating}`)
                    .then((res) => {
                        context.setSearchData(res);
                    })
                    .catch((error) => {
                        console.error("Filter error:", error);
                    });
            }
        } else {
            props.filterByPrice([minPrice, maxPrice], subCatId);
            props.filterByRating(rating, subCatId);
        }
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
        <>
            <div className={`sidebar ${isOpenFilter===true && 'open'}`} style={sidebarStyle}>
                <div className="filterBox" style={filterBoxStyle}>
                    <h6 style={headerStyle}>PRODUCT CATEGORIES</h6>
                    <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={filterSubCat}
                        onChange={handleChange}
                    >
                        {
                            context?.subCategoryData?.length !== 0 &&  context?.subCategoryData?.map((item, index) => {
                                return (
                                    <FormControlLabel value={item?.id} control={<Radio />} label={item?.name} />
                                )
                            })
                        }
                    </RadioGroup>
                </div>

                <div className="filterBox" style={filterBoxStyle}>
                    <h6 style={headerStyle}>FILTER BY PRICE</h6>
                    <RangeSlider 
                        value={value} 
                        onInput={setValue} 
                        min={100} 
                        max={60000} 
                        step={5}
                        style={{marginBottom: '15px'}}
                    />
                    <div style={priceRangeStyle}>
                        <span>From: <strong style={{color: '#333'}}>Rs: {value[0]}</strong></span>
                        <span>To: <strong style={{color: '#333'}}>Rs: {value[1]}</strong></span>
                    </div>
                </div>

                <div className="filterBox" style={filterBoxStyle}>
                    <h6 style={headerStyle}>FILTER BY RATING</h6>
                    <ul style={ratingListStyle}>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <li 
                                key={rating}
                                onClick={() => filterByRating(rating)}
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

                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <img 
                        src='https://klbtheme.com/bacola/wp-content/uploads/2021/05/sidebar-banner.gif' 
                        alt="Banner"
                        style={{maxWidth: '100%', borderRadius: '4px'}}
                    />
                </div>

                {/* <Button onClick={applyFilters} variant="contained" color="primary" fullWidth>
                    Apply Filters
                </Button> */}
            </div>
        </>
    )
}

export default Sidebar;
