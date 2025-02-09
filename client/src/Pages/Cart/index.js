import { Link, useNavigate } from "react-router-dom";
import Rating from '@mui/material/Rating';
import QuantityBox from "../../Components/QuantityBox";
import { IoIosClose } from "react-icons/io";
import Button from '@mui/material/Button';
import emprtCart from '../../assets/images/emptyCart.png';
import { MyContext } from "../../App";
import { useContext, useEffect, useState, useCallback } from "react";
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import { IoBagCheckOutline } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import swal from 'sweetalert2';
import RecipeRecommendation from '../../Components/RecipeRecommendation/index';

const Cart = () => {
    const [cartData, setCartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const context = useContext(MyContext);
    const history = useNavigate();

    // Memoize fetchCartData to prevent unnecessary recreations
    const fetchCartData = useCallback(async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user?.userId) return;
            
            const res = await fetchDataFromApi(`/api/cart?userId=${user.userId}`);
            if (Array.isArray(res)) {
                // Ensure quantities are preserved as numbers
                const cartWithQuantities = res.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity) || 1,
                    subTotal: parseInt(item.price * (parseInt(item.quantity) || 1))
                }));
                setCartData(cartWithQuantities);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        const token = localStorage.getItem("token");
        if (token && token !== "undefined") {
            setIsLogin(true);
            fetchCartData();
        } else {
            history("/signIn");
        }
    }, [history, fetchCartData]);

    const handleQuantityChange = async (item, newQuantity) => {
        if (newQuantity === item.quantity) return; // Prevent unnecessary updates
        if (newQuantity < 1) return; // Prevent negative quantities
        
        setIsLoading(true);
        try {
            const updatedItem = {
                ...item,
                quantity: newQuantity,
                subTotal: parseInt(item.price * newQuantity)
            };

            await editData(`/api/cart/${item._id}`, updatedItem);
            
            // Update local state immediately
            setCartData(prevCart => 
                prevCart.map(cartItem => 
                    cartItem._id === item._id ? updatedItem : cartItem
                )
            );
            
            // Update global cart state
            context.getCartData();

        } catch (error) {
            console.error("Error updating quantity:", error);
            swal.fire('Error', 'Failed to update quantity', 'error');
            // Revert to original quantity on error
            setCartData(prevCart => [...prevCart]);
        } finally {
            setIsLoading(false);
        }
    };

    const removeItem = async (id) => {
        setIsLoading(true);
        try {
            const res = await deleteData(`/api/cart/${id}`);
            if (res.success) {
                swal.fire('Success', res.message, 'success');
                setCartData(prev => prev.filter(item => item._id !== id));
                context.getCartData();
            }
        } catch (error) {
            console.error("Error removing item:", error);
            swal.fire('Error', 'Failed to remove item', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotal = useCallback(() => {
        return cartData.reduce((total, item) => total + item.subTotal, 0);
    }, [cartData]);

    // Prevent re-renders of QuantityBox component
    const renderQuantityBox = useCallback((item) => (
        <QuantityBox 
            quantity={(val) => handleQuantityChange(item, val)} 
            item={item} 
            value={item.quantity}
            key={`${item._id}-${item.quantity}`}
            initialValue={item.quantity}
        />
    ), [handleQuantityChange]);

    const addToCart = (product) => {
        // Implementation of addToCart function
    };

    return (
        <>
            <section className="section cartPage">
                <div className="container">
                    <h2 className="hd mb-1">Your Cart</h2>
                    <p>There are <b className="text-red">{cartData.length}</b> products in your cart</p>

                    {cartData.length !== 0 ? (
                        <div className="row">
                            <div className="col-md-9 pr-5">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th width="35%">Product</th>
                                                <th width="15%">Unit Price</th>
                                                <th width="10%">Weight</th>
                                                <th width="25%">Quantity</th>
                                                <th width="15%">Subtotal</th>
                                                <th width="10%">Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartData.map((item, index) => (
                                                <tr key={index}>
                                                    <td width="35%">
                                                        <Link to={`/product/${item.productId}`}>
                                                            <div className="d-flex align-items-center cartItemimgWrapper">
                                                                <div className="imgWrapper">
                                                                    <img src={item.image} className="w-100" alt={item.productTitle} />
                                                                </div>
                                                                <div className="info px-3">
                                                                    <h6>{item.productTitle.substr(0, 30) + '...'}</h6>
                                                                    <Rating name="read-only" value={item.rating} readOnly size="small" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </td>
                                                    <td width="15%">Rs {item.price}</td>
                                                    <td width="10%">{item.weight}</td>
                                                    <td width="25%">
                                                        {renderQuantityBox(item)}
                                                    </td>
                                                    <td width="15%">Rs. {item.subTotal}</td>
                                                    <td width="10%">
                                                        <span className="remove" onClick={() => removeItem(item._id)}><IoIosClose /></span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="mb-3">
                                    <RecipeRecommendation cartItems={cartData} />
                                </div>
                                
                                <div className="card border p-3 cartDetails">
                                    <h4>CART TOTALS</h4>
                                    <div className="d-flex align-items-center mb-3">
                                        <span>Subtotal</span>
                                        <span className="ml-auto text-red font-weight-bold">
                                            {calculateTotal().toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <span>Shipping</span>
                                        <span className="ml-auto"><b>Free</b></span>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <span>Estimate for</span>
                                        <span className="ml-auto"><b>India</b></span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span>Total</span>
                                        <span className="ml-auto text-red font-weight-bold">
                                            {calculateTotal().toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                        </span>
                                    </div>
                                    <br />
                                    <div className="cart-actions">
                                        <Link to="/checkout">
                                            <Button className='btn-blue bg-red btn-lg btn-big' id="checkout">
                                                <IoBagCheckOutline /> &nbsp; Checkout
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty d-flex align-items-center justify-content-center flex-column">
                            <img src={emprtCart} width="150" alt="Empty Cart" />
                            <h3>Your Cart is currently empty</h3>
                            <br />
                            <Link to="/">
                                <Button className='btn-blue bg-red btn-lg btn-big btn-round'>
                                    <FaHome /> &nbsp; Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {isLoading && <div className="loadingOverlay"></div>}
        </>
    );
};

export default Cart;