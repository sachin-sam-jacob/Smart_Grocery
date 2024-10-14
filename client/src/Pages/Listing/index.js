import Sidebar from "../../Components/Sidebar";
import Button from '@mui/material/Button';
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridR } from "react-icons/cg";
import { HiViewGrid } from "react-icons/hi";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { FaAngleDown } from "react-icons/fa6";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useContext, useEffect, useState } from "react";
import ProductItem from "../../Components/ProductItem";
import Pagination from '@mui/material/Pagination';

import { useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { FaFilter } from "react-icons/fa";

import { MyContext } from "../../App";

const Listing = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [productView, setProductView] = useState('four');
    const [productData, setProductData] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [filterId, setFilterId] = useState("");

    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const openDropdown = Boolean(anchorEl);
    const context = useContext(MyContext);

    const { id } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
        setFilterId("");  // Reset filters when switching category
        loadProducts();
    }, [id]);

    const loadProducts = () => {
        let url = window.location.href;
        let apiEndPoint = "";
        
        if (url.includes('subCat')) {
            apiEndPoint = `/api/products?subCat=${id}&location=${localStorage.getItem("location")}`;
        } else if (url.includes('category')) {
            apiEndPoint = `/api/products?category=${id}&location=${localStorage.getItem("location")}`;
        }

        setisLoading(true);
        fetchDataFromApi(apiEndPoint).then((res) => {
            if (res?.products?.length === 0) {
                setProductData([]);  // Handle empty results
            } else {
                setProductData(res);
            }
            setisLoading(false);
        });
    };

    const filterData = (subCatId) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setFilterId(subCatId);
        setisLoading(true);

        const apiEndPoint = `/api/products?subCatId=${subCatId}&location=${localStorage.getItem("location")}`;
        fetchDataFromApi(apiEndPoint).then((res) => {
            setProductData(res);
            setisLoading(false);
        });
    };

    const filterByPrice = (price) => {
        let apiEndPoint = "";
      
        if (!filterId) {
            apiEndPoint = `/api/products/filterByPrice?minPrice=${price[0]}&maxPrice=${price[1]}&category=${id}&location=${localStorage.getItem("location")}`;
        } else {
            apiEndPoint = `/api/products/filterByPrice?minPrice=${price[0]}&maxPrice=${price[1]}&subCatId=${filterId}&location=${localStorage.getItem("location")}`;
        }
    
        setisLoading(true);
        fetchDataFromApi(apiEndPoint).then((res) => {
            console.log("Filtered products",res)
            if (res ) {
                console.log("Entered the api")
                setProductData({ products: res }); // Set products if found
            } else 
            {
                setProductData({ products: [], message: "No products found" }); // Handle empty results
            }
            setisLoading(false);
        });
    };
    
    const filterByRating = (rating) => {
        let apiEndPoint = "";

        if (!filterId) {
            apiEndPoint = `/api/products?rating=${rating}&category=${id}&location=${localStorage.getItem("location")}`;
        } else {
            apiEndPoint = `/api/products?rating=${rating}&subCatId=${filterId}&location=${localStorage.getItem("location")}`;
        }

        setisLoading(true);
        fetchDataFromApi(apiEndPoint).then((res) => {
            setProductData(res);
            setisLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    const handleChange = (event, value) => {
        setisLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const apiEndPoint = `/api/products?subCatId=${id}&page=${value}&perPage=6&location=${localStorage.getItem("location")}`;
        fetchDataFromApi(apiEndPoint).then((res) => {
            setProductData(res);
            setisLoading(false);
        });
    };

    const openFilters = () => {
        setIsOpenFilter(!isOpenFilter);
    };

    return (
        <>
            <section className="product_Listing_Page pt-5">
                <div className="container">
                    <div className="productListing d-flex">
                        <Sidebar filterData={filterData} filterByPrice={filterByPrice} filterByRating={filterByRating} isOpenFilter={isOpenFilter} />

                        <div className="content_right">
                            <div className="showBy mt-0 mb-3 d-flex align-items-center">
                                <div className="d-flex align-items-center btnWrapper">
                                    <Button className={productView === 'one' && 'act'} onClick={() => setProductView('one')}><IoIosMenu /></Button>
                                    <Button className={productView === 'three' && 'act'} onClick={() => setProductView('three')}><CgMenuGridR /></Button>
                                    <Button className={productView === 'four' && 'act'} onClick={() => setProductView('four')}><TfiLayoutGrid4Alt /></Button>
                                </div>
                            </div>

                            <div className="productListing">
                                {isLoading ? (
                                    <div className="loading d-flex align-items-center justify-content-center">
                                        <CircularProgress color="inherit" />
                                    </div>
                                ) : productData?.products?.length ? (
                                    productData?.products?.map((item, index) => (
                                        <ProductItem key={index} itemView={productView} item={item} />
                                    ))
                                ) : (
                                    <div style={{
                                        padding: '50px',
                                        backgroundColor: '#f8f9fa', // Light background for contrast
                                        borderRadius: '8px', // Rounded corners
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow
                                        margin: '20px 0',
                                        textAlign: 'center', // Center text
                                        marginTop:'100px',
                                        marginLeft:'30%'
                                    }}>
                                        <h3 style={{
                                            fontSize: '24px', // Larger font size for the heading
                                            color: '#343a40', // Darker text color
                                            marginBottom: '10px' // Space below the heading
                                        }}>
                                            No products found
                                        </h3>
                                        <p style={{
                                            fontSize: '16px', // Standard font size for the paragraph
                                            color: '#6c757d', // Muted text color
                                            marginBottom: '20px' // Space below the paragraph
                                        }}>
                                            Try adjusting your filters or search for different products.
                                        </p>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            onClick={loadProducts} 
                                            style={{
                                                padding: '10px 20px', // Padding for the button
                                                fontSize: '16px', // Font size for the button
                                                borderRadius: '5px', // Rounded corners for the button
                                                transition: 'background-color 0.3s' // Smooth transition for hover effect
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} // Darker blue on hover
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''} // Reset background on mouse out
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {context.windowWidth < 992 && (
                <>
                    {!context.isOpenNav && (
                        <div className="fixedBtn row">
                            <div className="col">
                                <Button className='btn-blue bg-red btn-lg btn-big' onClick={openFilters}>
                                    <FaFilter />
                                    {isOpenFilter ? 'Close Filters' : 'Open Filters'}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Listing;
