import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../App';
import ProductItem from '../../Components/ProductItem';
import SearchSidebar from '../../Components/SearchSidebar';
import Button from '@mui/material/Button';
import { useLocation } from 'react-router-dom';

const Search = () => {
    const context = useContext(MyContext);
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Get search query from URL
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        const source = params.get('source');
        
        setSearchTerm(query || '');
        
        // Check if this is a voice search
        if (source === 'voice') {
            try {
                const voiceSearchData = localStorage.getItem('voiceSearchResults');
                if (voiceSearchData) {
                    const parsedData = JSON.parse(voiceSearchData);
                    
                    // Check if the stored search term matches the URL query
                    if (parsedData.term === query && parsedData.results && parsedData.results.length > 0) {
                        console.log('Using voice search results from localStorage');
                        context.setSearchData(parsedData.results);
                        context.setFilteredSearchData(parsedData.results);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error parsing voice search results:', error);
            }
        }
        
        // Initialize filtered results with all search results
        context.setFilteredSearchData(context.searchData);
    }, [context.searchData, location.search]);

    const resetSearch = () => {
        // Reset the filtered search data to the original search data
        context.setFilteredSearchData(context.searchData);
        // Trigger filter reset in SearchSidebar
        context.setResetFilters(true);
    };

    return (
        <section className="homeProducts">
            <div className="container">
                <div className="row homeProductsRow">
                    <div className="col-md-3">
                        <SearchSidebar />
                    </div>
                    <div className="col-md-9 productRow">
                        <div className="d-flex align-items-center res-flex-column">
                            <div className="info" style={{ width: "100%" }}>
                                <h3 className="mb-0 hd">
                                    {searchTerm ? `Search Results for "${searchTerm}"` : 'Search Results'}
                                </h3>
                            </div>
                        </div>
                        {context.filteredSearchData.length > 0 ? (
                            <div className="product_row productRow2 w-100 mt-4 d-flex productScroller">
                                {context.filteredSearchData.map((item, index) => (
                                    <ProductItem key={index} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: '50px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                margin: '20px 0',
                                textAlign: 'center',
                                marginTop: '100px',
                                marginLeft: '30%'
                            }}>
                                <h3 style={{
                                    fontSize: '24px',
                                    color: '#343a40',
                                    marginBottom: '10px'
                                }}>
                                    No products found
                                </h3>
                                <p style={{
                                    fontSize: '16px',
                                    color: '#6c757d',
                                    marginBottom: '20px'
                                }}>
                                    Try adjusting your filters or search for different products.
                                </p>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={resetSearch} 
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '16px',
                                        borderRadius: '5px',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Search;
