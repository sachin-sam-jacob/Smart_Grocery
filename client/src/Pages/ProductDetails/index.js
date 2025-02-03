import ProductZoom from "../../Components/ProductZoom";
import Rating from '@mui/material/Rating';
import QuantityBox from "../../Components/QuantityBox";
import Button from '@mui/material/Button';
import { BsCartFill } from "react-icons/bs";
import { useContext, useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdOutlineCompareArrows } from "react-icons/md";
import Tooltip from '@mui/material/Tooltip';
import RelatedProducts from "./RelatedProducts";
import swal from 'sweetalert2';
import { useParams } from "react-router-dom";
import { fetchDataFromApi, postData } from "../../utils/api";
import CircularProgress from '@mui/material/CircularProgress';
import { MyContext } from "../../App";
import { FaHeart } from "react-icons/fa";
import { isDeliverable } from "../../data/pincode"; // Add this import
import AIDescription from './Aidescription';
import { Box, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for better presentation
const AIContentBox = styled(Box)(({ theme }) => ({
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    '& .section-title': {
        color: '#1976d2',
        fontWeight: 600,
        fontSize: '1.1rem',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e0e0e0'
    },
    '& .content-section': {
        marginBottom: '20px',
        '&:last-child': {
            marginBottom: 0
        }
    },
    '& .highlight': {
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '6px',
        marginTop: '12px'
    }
}));

const ProductDetails = () => {

    const [activeSize, setActiveSize] = useState(null);
    const [activeTabs, setActiveTabs] = useState(0);
    const [productData, setProductData] = useState([]);
    const [relatedProductData, setRelatedProductData] = useState([]);
    const [recentlyViewdProducts, setRecentlyViewdProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [reviewsData, setreviewsData] = useState([]);
    const [isAddedToMyList, setSsAddedToMyList] = useState(false);

    let [cartFields, setCartFields] = useState({});
    let [productQuantity, setProductQuantity] = useState();
    const [tabError, setTabError] = useState(false);

    const { id } = useParams();

    const context = useContext(MyContext);

    const [pincode, setPincode] = useState('');
    const [pincodeError, setPincodeError] = useState('');
    const [isDeliverablePincode, setIsDeliverablePincode] = useState(false);

    const [aiDescription, setAiDescription] = useState('');
    const [showAIDescription, setShowAIDescription] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    const isActive = (index) => {
        setActiveSize(index);
        setTabError(false);
    }


    useEffect(() => {
        window.scrollTo(0, 0);
        setActiveSize(null);
        fetchDataFromApi(`/api/products/${id}`).then((res) => {
            setProductData(res);

            if (res?.productRam.length === 0 && res?.productWeight.length === 0 && res?.size.length === 0) {
                setActiveSize(1);
            }

            fetchDataFromApi(`/api/products?subCatId=${res?.subCatId}`)
                .then((res) => {
                    const filteredData = res?.products?.filter(item => item.id !== id);
                    setRelatedProductData(filteredData)
                })



          


        })


        fetchDataFromApi(`/api/productReviews?productId=${id}`).then((res) => {
            setreviewsData(res)
        })


        const user = JSON.parse(localStorage.getItem("user"));

        fetchDataFromApi(`/api/my-list?productId=${id}&userId=${user?.userId}`).then((res) => {
            if (res.length !== 0) {
                setSsAddedToMyList(true);
            }
        })

    }, [id]);


    const [rating, setRating] = useState(1);
    const [reviews, setReviews] = useState({
        productId: "",
        customerName: "",
        customerId: "",
        review: "",
        customerRating: 0
    });

    const onChangeInput = (e) => {
        setReviews(() => ({
            ...reviews,
            [e.target.name]: e.target.value
        }))
    }

    const changeRating = (e) => {
        setRating(e.target.value)
        reviews.customerRating = e.target.value
    }

    const addReview = (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));

        reviews.customerName = user?.name;
        reviews.customerId = user?.userId;
        reviews.productId = id

        setIsLoading(true);

        postData("/api/productReviews/add", reviews).then((res) => {
            setIsLoading(false);

            reviews.customerRating = 1;

            setReviews({
                review: "",
                customerRating: 1
            })

            fetchDataFromApi(`/api/productReviews?productId=${id}`).then((res) => {
                setreviewsData(res);
            })
        })

    }

    const quantity = (val) => {
        setProductQuantity(val)
    }

    const handlePincodeChange = (e) => {
        setPincode(e.target.value);
        setPincodeError('');
        setIsDeliverablePincode(false);
    };

    const checkPincode = async () => {
        try {
            const response = await fetchDataFromApi(`/api/products/check-pincode/${productData.id}?pincode=${pincode}`);
            if (response.isDeliverable) {
                setIsDeliverablePincode(true);
                setPincodeError('');
            } else {
                setIsDeliverablePincode(false);
                setPincodeError('Delivery not available to this pincode');
            }
        } catch (error) {
            console.error('Error checking pincode:', error);
            setPincodeError('Error checking pincode. Please try again.');
        }
    };

    const addtoCart = () => {
        if (activeSize !== null) {
            if (isDeliverablePincode) {
                const user = JSON.parse(localStorage.getItem("user"));

                cartFields.productTitle = productData?.name;
                cartFields.image = productData?.images[0];
                cartFields.rating = productData?.rating;
                cartFields.price = productData?.price;
                cartFields.quantity = productQuantity;
                cartFields.subTotal = parseInt(productData?.price * productQuantity);
                cartFields.productId = productData?.id;
                cartFields.countInStock = productData?.countInStock;
                cartFields.productWeight = productData?.productWeight[0];
                cartFields.userId = user?.userId;

                context.addToCart(cartFields);
            } else {
                setPincodeError('Please enter a deliverable pincode');
            }
        } else {
            setTabError(true);
        }
    }

    const selectedItem = () => {

    }



    const gotoReviews = () => {
        window.scrollTo({
            top: 550,
            behavior: 'smooth',
        })

        setActiveTabs(2)
    }



    const addToMyList = (id) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user !== undefined && user !== null && user !== "") {
            const data = {
                productTitle: productData?.name,
                image: productData?.images[0],
                rating: productData?.rating,
                price: productData?.price,
                productId: id,
                userId: user?.userId
            }
            postData(`/api/my-list/add/`, data).then((res) => {
                if (res.status !== false) {
                    swal.fire("success","Product added to wishlist!","success")
                    

            
                    fetchDataFromApi(`/api/my-list?productId=${id}&userId=${user?.userId}`).then((res) => {
                        if (res.length !== 0) {
                            setSsAddedToMyList(true);
                        }
                    })


                } else {
                    context.setAlertBox({
                        open: true,
                        error: true,
                        msg: res.msg
                    })
                }

            })
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please Login to continue"
            })
        }

    }

    const handleDescriptionGenerated = (description) => {
        setAiDescription(description);
        setShowAIDescription(true);
        setIsGeneratingDescription(false);
    };

    const formatAIDescription = (description) => {
        // Remove asterisks and format the content
        const cleanDescription = description.replace(/\*/g, '');
        
        // Split into sections based on numbers (1., 2., etc.)
        const sections = cleanDescription.split(/\d+\.\s+/).filter(Boolean);
        
        return sections.map((section, index) => {
            const sectionTitle = section.split('\n')[0].trim();
            const sectionContent = section.split('\n').slice(1).join('\n').trim();
            
            return {
                title: sectionTitle,
                content: sectionContent
            };
        });
    };

    return (
        <>
            <section className="productDetails section">
                <div className="container">
                    <div className="row">
                        <div className="col-md-4 pl-5 part1">
                            <ProductZoom images={productData?.images} discount={productData?.discount} />
                        </div>

                        <div className="col-md-7 pl-5 pr-5 part2">
                            <h2 className="hd text-capitalize">{productData?.name}</h2>
                            <ul className="list list-inline d-flex align-items-center">
                                <li className="list-inline-item">
                                    <div className="d-flex align-items-center">
                                        <span className="text-light mr-2">Brands : </span>
                                        <span>{productData?.brand}</span>
                                    </div>
                                </li>

                                <li className="list-inline-item">
                                    <div className="d-flex align-items-center">
                                        <Rating name="read-only" value={parseInt(productData?.rating)} precision={0.5} readOnly size="small" />

                                        <span className="text-light cursor ml-2" onClick={gotoReviews}>{reviewsData?.length} Review</span>
                                    </div>
                                </li>

                            </ul>



                            <div className="d-flex info mb-3">
                                <span className="oldPrice">Rs: {productData?.oldPrice}</span>
                                <span className="netPrice text-danger ml-2">Rs: {productData?.price}</span>
                            </div>

                            {
                                productData?.countInStock >= 1 ?
                                    <span className="badge badge-success">IN STOCK</span>
                                    :
                                    <span className="badge badge-danger">OUT OF STOCK</span>
                            }



                            {/* Add AI Description section
                            <Box sx={{ mt: 3, mb: 3 }}>
                                <AIDescription 
                                    productName={productData?.name}
                                    onDescriptionGenerated={handleDescriptionGenerated}
                                />
                                
                                {showAIDescription && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                                            AI-Generated Product Information
                                        </Typography>
                                        <Typography 
                                            component="div" 
                                            sx={{ 
                                                whiteSpace: 'pre-line',
                                                color: '#333',
                                                '& p': { mb: 1 }
                                            }}
                                        >
                                            {aiDescription}
                                        </Typography>
                                        <Button 
                                            size="small"
                                            onClick={() => setShowAIDescription(false)}
                                            sx={{ mt: 2 }}
                                        >
                                            Hide AI Description
                                        </Button>
                                    </Box>
                                )}
                            </Box> */}

                            <Divider sx={{ my: 2 }} />

                            <p className="mt-3">
                                {productData?.description}
                            </p>


                            {
                                productData?.productRam?.length !== 0 &&
                                <div className='productSize d-flex align-items-center'>
                                    <span>RAM:</span>
                                    <ul className={`list list-inline mb-0 pl-4 ${tabError === true && 'error'}`}>
                                        {
                                            productData?.productRam?.map((item, index) => {
                                                return (
                                                    <li className='list-inline-item'><a className={`tag ${activeSize === index ? 'active' : ''}`} onClick={() => isActive(index)}>{item}</a></li>
                                                )
                                            })
                                        }

                                    </ul>
                                </div>
                            }


                            {
                                productData?.size?.length !== 0 &&
                                <div className='productSize d-flex align-items-center'>
                                    <span>Size:</span>
                                    <ul className={`list list-inline mb-0 pl-4 ${tabError === true && 'error'}`}>
                                        {
                                            productData?.size?.map((item, index) => {
                                                return (
                                                    <li className='list-inline-item'><a className={`tag ${activeSize === index ? 'active' : ''}`} onClick={() => isActive(index)}>{item}</a></li>
                                                )
                                            })
                                        }

                                    </ul>
                                </div>
                            }


                            {
                                productData?.productWeight?.length !== 0 &&
                                <div className='productSize d-flex align-items-center'>
                                    <span>Weight:</span>
                                    <ul className={`list list-inline mb-0 pl-4 ${tabError === true && 'error'}`}>
                                        {
                                            productData?.productWeight?.map((item, index) => {
                                                return (
                                                    <li className='list-inline-item'><a id="weightchoose" className={`tag ${activeSize === index ? 'active' : ''}`} onClick={() => isActive(index)}>{item}</a></li>
                                                )
                                            })
                                        }

                                    </ul>
                                </div>
                            }


                            {/* Add pincode input after the product weight section */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginTop: '20px',
                                marginBottom: '20px',
                                width: '100%',
                                maxWidth: '300px'
                            }}>
                                <div style={{ display: 'flex' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter Pincode"
                                        id="enterpincode"
                                        value={pincode}
                                        onChange={handlePincodeChange}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '5px 0 0 5px',
                                            border: '1px solid #ccc',
                                            borderRight: 'none',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <Button 
                                        onClick={checkPincode} 
                                        id="checkpincode"
                                        style={{ 
                                            padding: '10px 15px',
                                            borderRadius: '0 5px 5px 0',
                                            border: 'none',
                                            backgroundColor: '#6d4aae',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Check
                                    </Button>
                                </div>
                                {pincodeError && (
                                    <span style={{ 
                                        marginTop: '5px',
                                        fontSize: '14px',
                                        color: 'red'
                                    }}>
                                        {pincodeError}
                                    </span>
                                )}
                                {isDeliverablePincode && (
                                    <span style={{ 
                                        marginTop: '5px',
                                        fontSize: '14px',
                                        color: 'green'
                                    }}>
                                        Delivery available to this pincode
                                    </span>
                                )}
                            </div>

                            <div className="d-flex align-items-center mt-3 actions_">
                            {productData?.countInStock > 0 && ( // Conditionally render QuantityBox
                                <QuantityBox quantity={quantity} item={productData} selectedItem={selectedItem} />
                            )}
                                <div className="d-flex align-items-center btnActions">
                                    {productData?.countInStock > 0 && (
                                        <Button 
                                            className="btn-blue btn-lg btn-big btn-round bg-red" 
                                            id="addtocart"
                                            onClick={() => addtoCart()}
                                            disabled={!isDeliverablePincode}
                                            style={{
                                                opacity: isDeliverablePincode ? 1 : 0.6,
                                                cursor: isDeliverablePincode ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            <BsCartFill /> &nbsp;
                                            {context.addingInCart === true ? "adding..." : " Add to cart"}
                                        </Button>
                                    )}

                                    <Tooltip title={`${isAddedToMyList === true ? 'Added to Wishlist' : 'Add to Wishlist'}`} placement="top">
                                        <Button className={`btn-blue btn-lg btn-big btn-circle ml-4`} onClick={() => addToMyList(id)}>
                                            {
                                                isAddedToMyList === true ? <FaHeart className="text-danger" />

                                                    :
                                                    <FaRegHeart />
                                            }

                                        </Button>
                                    </Tooltip>

                                    {/* <Tooltip title="Add to Compare" placement="top">
                                        <Button className="btn-blue btn-lg btn-big btn-circle ml-2">
                                            <MdOutlineCompareArrows />
                                        </Button>
                                    </Tooltip> */}

                                </div>

                            </div>


                        </div>
                    </div>


                    <br />



                    <div className='card mt-5 p-5 detailsPageTabs'>
                        <div className='customTabs'>
                            <ul className='list list-inline'>
                                <li className='list-inline-item'>
                                    <Button className={`${activeTabs === 0 && 'active'}`}
                                        onClick={() => setActiveTabs(0)}
                                    >
                                        Description
                                    </Button>
                                </li>
                                <li className='list-inline-item'>
                                    <Button className={`${activeTabs === 1 && 'active'}`}
                                        onClick={() => setActiveTabs(1)}
                                    >
                                        Additional info
                                    </Button>
                                </li>
                                <li className='list-inline-item'>
                                    <Button className={`${activeTabs === 2 && 'active'}`}
                                        onClick={() => setActiveTabs(2)}
                                    >
                                        Reviews ({reviewsData?.length})
                                    </Button>
                                </li>
                            </ul>

                            <br />

                            {activeTabs === 0 && (
                                <div className='tabContent'>
                                    {productData?.description}
                                </div>
                            )}

                            {activeTabs === 1 && (
                                <div className='tabContent'>
                                    {!showAIDescription ? (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            padding: '20px'
                                        }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    mb: 3, 
                                                    color: '#333',
                                                    textAlign: 'center' 
                                                }}
                                            >
                                                Get AI-Powered Insights About This Product
                                            </Typography>
                                            <AIDescription 
                                                productName={productData?.name}
                                                onDescriptionGenerated={handleDescriptionGenerated}
                                            />
                                            {isGeneratingDescription && (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 2, 
                                                    mt: 3 
                                                }}>
                                                    <CircularProgress size={24} />
                                                    <Typography color="text.secondary">
                                                        Generating detailed product information...
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    ) : (
                                        <AIContentBox>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                mb: 3
                                            }}>
                                                <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 600 }}>
                                                    AI-Generated Product Insights
                                                </Typography>
                                                <Button 
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => {
                                                        setShowAIDescription(false);
                                                        setAiDescription('');
                                                    }}
                                                    sx={{ 
                                                        borderColor: '#1976d2',
                                                        color: '#1976d2',
                                                        '&:hover': {
                                                            borderColor: '#1565c0'
                                                        }
                                                    }}
                                                >
                                                    Generate New Insights
                                                </Button>
                                            </Box>

                                            {formatAIDescription(aiDescription).map((section, index) => (
                                                <div key={index} className="content-section">
                                                    <Typography className="section-title">
                                                        {section.title}
                                                    </Typography>
                                                    <Typography 
                                                        component="div" 
                                                        sx={{ 
                                                            color: '#555',
                                                            lineHeight: 1.6,
                                                            '& p': { mb: 1 }
                                                        }}
                                                    >
                                                        {section.content.split('\n').map((paragraph, pIndex) => (
                                                            <p key={pIndex}>{paragraph.trim()}</p>
                                                        ))}
                                                    </Typography>
                                                </div>
                                            ))}

                                            {/* Nutritional Information Highlight Box */}
                                            {aiDescription.toLowerCase().includes('nutritional') && (
                                                <div className="highlight">
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: '#666',
                                                            fontStyle: 'italic'
                                                        }}
                                                    >
                                                        Note: Nutritional information is AI-generated and should be verified with the product packaging.
                                                    </Typography>
                                                </div>
                                            )}
                                        </AIContentBox>
                                    )}
                                </div>
                            )}

                            {activeTabs === 2 && (
                                <div className='tabContent'>
                                    <div className='row'>
                                        <div className='col-md-8'>
                                            <h3>Customer questions & answers</h3>
                                            <br />



                                            {
                                                reviewsData?.length !== 0 && reviewsData?.slice(0)?.reverse()?.map((item, index) => {
                                                    return (
                                                        <div className='reviewBox mb-4 border-bottom' key={index}>

                                                            <div className='info'>
                                                                <div className='d-flex align-items-center w-100'>
                                                                    <h5>{item?.customerName}</h5>

                                                                    <div className='ml-auto'>
                                                                        <Rating name="half-rating-read"
                                                                            value={item?.customerRating} readOnly size="small" />
                                                                    </div>
                                                                </div>

                                                                <h6 className='text-light'>{item?.dateCreated}</h6>

                                                                <p>{item?.review} </p>
                                                            </div>

                                                        </div>

                                                    )
                                                })
                                            }



                                            <br className='res-hide' />


                                            {/* <form className='reviewForm' onSubmit={addReview}>

                                                <h4>Add a review</h4>
                                                <div className='form-group'>
                                                    <textarea className='form-control shadow' placeholder='Write a Review'
                                                        name='review' value={reviews.review} onChange={onChangeInput} ></textarea>
                                                </div>

                                                <div className='row'>

                                                    <div className='col-md-6'>
                                                        <div className='form-group'>
                                                            <Rating name="rating" value={rating} precision={0.5}
                                                                onChange={changeRating}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>


                                                <br />
                                                <div className='form-group'>
                                                    <Button type='submit' className='btn-blue btn-lg btn-big btn-round'>
                                                        {isLoading === true ? <CircularProgress color="inherit" className="loader" /> : 'Submit Review'}

                                                    </Button>
                                                </div>

                                            </form> */}

                                        </div>


                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    <br />

                    {
                        relatedProductData?.length !== 0 && <RelatedProducts title="RELATED PRODUCTS" data={relatedProductData} />
                    }

                  

                </div>
            </section>
        </>
    )
}

export default ProductDetails;
