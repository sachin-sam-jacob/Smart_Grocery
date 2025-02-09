import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (searchTerm.trim()) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/search?q=${searchTerm}`);
                    setSuggestions(response.data);
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Search error:', error);
                }
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300); // Debounce delay

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSearch = (productId = null) => {
        if (productId) {
            navigate(`/product/${productId}`);
        } else if (searchTerm.trim()) {
            navigate(`/search?q=${searchTerm}`);
        }
        setShowDropdown(false);
    };

    return (
        <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={() => handleSearch()}>
                    <i className="fa fa-search"></i>
                </button>
            </div>

            {showDropdown && suggestions.length > 0 && (
                <div className="search-suggestions">
                    {suggestions.map((product) => (
                        <div
                            key={product._id}
                            className="suggestion-item"
                            onClick={() => handleSearch(product._id)}
                        >
                            <img src={product.images[0]} alt={product.name} />
                            <div className="suggestion-details">
                                <h4>{product.name}</h4>
                                <p>{product.brand}</p>
                                <span>₹{product.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar; 