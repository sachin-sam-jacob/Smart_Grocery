import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDataFromApi, postData, editData } from '../../utils/api';
import { Box, TextField, Button, Typography, CircularProgress, Rating } from '@mui/material';
import swal from 'sweetalert2';

const AddReview = () => {
    const [product, setProduct] = useState(null);
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const { productId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const productData = await fetchDataFromApi(`/api/products/${productId}`);
            setProduct(productData);

            const user = JSON.parse(localStorage.getItem("user"));
            const reviewsData = await fetchDataFromApi(`/api/productReviews?productId=${productId}&customerId=${user?.userId}`);
            if (reviewsData.length > 0) {
                setExistingReview(reviewsData[0]);
                setReview(reviewsData[0].review);
                setRating(reviewsData[0].customerRating);
            }
        };
        fetchData();
    }, [productId]);

    const handleReviewChange = (e) => {
        setReview(e.target.value);
    };

    const handleRatingChange = (event, newValue) => {
        setRating(newValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const user = JSON.parse(localStorage.getItem("user"));
        const reviewData = {
            productId: productId,
            customerName: user?.name,
            customerId: user?.userId,
            review: review,
            customerRating: rating
        };

        try {
            if (existingReview) {
                // Use editData (PUT request) for updating an existing review
                await editData(`/api/productReviews/${existingReview._id}`, reviewData);
                swal.fire({text:"Review Updated Successfully",icon: "success"});
            } else {
                // Use postData (POST request) for adding a new review
                await postData("/api/productReviews/add", reviewData);
                swal.fire({text:"Review Submitted Successfully",icon: "success"});
            }
            navigate(`/product/${productId}`);
        } catch (error) {
            swal.fire("Error", "Failed to submit review", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) {
        return <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
    }

    return (
        <Box sx={{
            maxWidth: 600,
            margin: '40px auto',
            padding: '30px',
            backgroundColor: '#f8f8f8',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#333', fontWeight: 'bold', marginBottom: '20px' }}>
                {existingReview ? 'Edit Your Review' : 'Add a Review'}
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: '#555', marginBottom: '20px' }}>
                Product: {product.name}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ marginBottom: 3 }}>
                    <Typography component="legend">Your Rating</Typography>
                    <Rating
                        name="rating"
                        value={rating}
                        precision={0.5}
                        onChange={handleRatingChange}
                        size="large"
                    />
                </Box>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="Write your review"
                    value={review}
                    onChange={handleReviewChange}
                    required
                    sx={{
                        marginBottom: 3,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#ccc',
                            },
                            '&:hover fieldset': {
                                borderColor: '#999',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                            },
                        },
                    }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    sx={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            backgroundColor: '#1565c0',
                        },
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : (existingReview ? 'Update Review' : 'Submit Review')}
                </Button>
            </form>
        </Box>
    );
};

export default AddReview;
