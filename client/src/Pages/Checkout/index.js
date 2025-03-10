import React, { useContext, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { IoBagCheckOutline } from "react-icons/io5";

import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';

import { useNavigate } from 'react-router-dom';

const Checkout = () => {

    const [formFields, setFormFields] = useState({
        fullName: "",
        country: "",
        streetAddressLine1: "",
        streetAddressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        phoneNumber: "",
        email: ""
    })

    const [cartData, setCartData] = useState([]);
    const [totalAmount, setTotalAmount] = useState();
    const [pincodeValidated, setPincodeValidated] = useState(false);
    const [nonDeliverableProducts, setNonDeliverableProducts] = useState([]);
    const [showPincodeError, setShowPincodeError] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [deliverableProducts, setDeliverableProducts] = useState([]);

    useEffect(() => {
        window.scrollTo(0,0)
        const user = JSON.parse(localStorage.getItem("user"));
        fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
            setCartData(res);

            setTotalAmount(res.length !== 0 &&
                res.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0))


        })

    }, []);

    const onChangeInput = async (e) => {
        const { name, value } = e.target;
        setFormFields(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate pincode when zipCode field changes
        if (name === 'zipCode' && value.length === 6) {  // Assuming 6-digit pincode
            await validatePincode(value);
        }
    }

    const context = useContext(MyContext);
    const history = useNavigate();

    const checkout = async (e) => {
        e.preventDefault();

        // Add pincode validation check
        if (!pincodeValidated) {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please enter a valid pincode where all products can be delivered"
            });
            return false;
        }

        console.log(cartData)

        console.log(formFields)
        if (formFields.fullName === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill full name "
            })
            return false
        }

        if (formFields.country === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill country "
            })
            return false
        }

        if (formFields.streetAddressLine1 === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill Street address"
            })
            return false
        }

        if (formFields.streetAddressLine2 === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill  Street address"
            })
            return false
        }

        if (formFields.city === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill city "
            })
            return false
        }

        if (formFields.state === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill state "
            })
            return false
        }

        if (formFields.zipCode === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill zipCode "
            })
            return false
        }

        if (formFields.phoneNumber === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill phone Number "
            })
            return false
        }

        if (formFields.email === "") {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please fill email"
            })
            return false
        }


        const addressInfo = {
            name: formFields.fullName,
            phoneNumber: formFields.phoneNumber,
            address: formFields.streetAddressLine1 + " " + formFields.streetAddressLine2,
            pincode: formFields.zipCode,
            date: new Date().toLocaleString(
                "en-US",
                {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                }
            )
        }




        var options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET,
            amount: parseInt(totalAmount * 100),
            currency: "INR",
            order_receipt: 'order_rcptid_' + formFields.fullName,
            name: "SMART GROCERY PAYMENT GATEWAY",
            description: "for testing purpose",
            handler: function (response) {
                console.log(response)
    
                const paymentId = response.razorpay_payment_id
    
                const user = JSON.parse(localStorage.getItem("user"));
    
                // Update the payload to include all necessary product details
                const payLoad = {
                    name: addressInfo.name,
                    phoneNumber: formFields.phoneNumber,
                    address: addressInfo.address,
                    pincode: addressInfo.pincode,
                    amount: parseInt(totalAmount),
                    paymentId: paymentId,
                    email: user.email,
                    userid: user.userId,
                    products: cartData.map(item => ({
                        productId: item.productId, // Ensure this is the correct ID
                        productTitle: item.productTitle, // Include product title
                        quantity: item.quantity,
                        price: item.price, // Include price
                        subTotal: item.subTotal ,// Include subtotal
                        image: item.image
                    }))
                }
    
                postData(`/api/orders/create`, payLoad).then(res => {
                    // Update stock and clear cart
                    updateStockAndClearCart(user.userId, cartData);
                    history("/orders");
                    window.location.reload();
                }).catch(error => {
                    console.error("Error creating order:", error);
                    context.setAlertBox({
                        open: true,
                        error: true,
                        msg: "Error creating order. Please try again."
                    });
                });
            },
            theme: {
                color: "#3399cc"
            }
        };
    
        var pay = new window.Razorpay(options);
        pay.open();
    }
    
    // Add this function to update stock and clear cart
    const updateStockAndClearCart = (userId, cartData) => {
        // Update stock
        cartData.forEach(item => {
            postData(`/api/products/updateStock`, {
                productId: item.productId,
                quantity: item.quantity
            }).catch(error => {
                console.error("Error updating stock:", error);
            });
        });
    
        // Clear cart
        postData(`/api/cart/clear`, { userId })
            .then(() => {
                console.log("Cart cleared successfully");
            })
            .catch(error => {
                console.error("Error clearing cart:", error);
            });
    };

    // Function to validate pincode
    const validatePincode = async (pincode) => {
        try {
            const response = await postData('/api/pincodes/check-deliverability', {
                pincode: pincode,
                products: cartData
            });

            if (response.success) {
                setPincodeValidated(response.isAllDeliverable);
                setNonDeliverableProducts(response.nonDeliverableProducts);
                setDeliverableProducts(response.deliverableProducts);
                setShowPincodeError(!response.isAllDeliverable);
                setDeliveryInfo({
                    district: response.deliveryDistrict,
                    pincode: pincode
                });

                // Show success message if all products are deliverable
                if (response.isAllDeliverable) {
                    context.setAlertBox({
                        open: true,
                        error: false,
                        msg: `Delivery available to ${response.deliveryDistrict}`
                    });
                }
            }
        } catch (error) {
            console.error('Error validating pincode:', error);
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Error validating pincode. Please try again."
            });
        }
    };

    return (
        <section className='section'>
            <div className='container'>
                <form className='checkoutForm' onSubmit={checkout}>
                    <div className='row'>
                        <div className='col-md-8'>
                            <h2 className='hd'>BILLING DETAILS</h2>

                            <div className='row mt-3'>
                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Full Name *" variant="outlined" className='w-100' size="small" name="fullName" onChange={onChangeInput} />
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Country *" variant="outlined" className='w-100' size="small" name="country" onChange={onChangeInput} />
                                    </div>
                                </div>


                            </div>


                            <h6>Street address *</h6>

                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField label="House number and street name" variant="outlined" className='w-100' size="small" name="streetAddressLine1" onChange={onChangeInput} />
                                    </div>

                                    <div className='form-group'>
                                        <TextField label="Apartment, suite, unit, etc. (optional)" variant="outlined" className='w-100' size="small" name="streetAddressLine2" onChange={onChangeInput} />
                                    </div>

                                </div>
                            </div>



                            <h6>Town / City *</h6>

                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField label="City" variant="outlined" className='w-100' size="small" name="city" onChange={onChangeInput} />
                                    </div>

                                </div>
                            </div>

                            <h6>State / County *</h6>

                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField label="State" variant="outlined" className='w-100' size="small" name="state" onChange={onChangeInput} />
                                    </div>

                                </div>
                            </div>


                            <h6>Postcode / ZIP *</h6>

                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField 
                                            label="ZIP Code" 
                                            variant="outlined" 
                                            className='w-100' 
                                            size="small" 
                                            name="zipCode" 
                                            onChange={onChangeInput}
                                            error={showPincodeError}
                                            helperText={showPincodeError ? 
                                                "Some products cannot be delivered to this pincode" : 
                                                deliveryInfo ? 
                                                `Delivery available to ${deliveryInfo.district}` : ""}
                                        />
                                    </div>
                                    
                                    {/* Display delivery status */}
                                    {deliveryInfo && (
                                        <div className={`alert ${showPincodeError ? 'alert-warning' : 'alert-success'} mt-2`}>
                                            <h6>Delivery Information for {deliveryInfo.district}</h6>
                                            
                                            {showPincodeError && (
                                                <>
                                                    <p>The following products cannot be delivered to pincode {deliveryInfo.pincode}:</p>
                                                    <ul className="text-danger">
                                                        {nonDeliverableProducts.map((product, index) => (
                                                            <li key={index}>
                                                                {product.productTitle}
                                                                <br/>
                                                                <small>
                                                                    {product.deliveryMessage}
                                                                </small>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <p>Please remove these products from your cart or try a different pincode.</p>
                                                </>
                                            )}

                                            {deliverableProducts.length > 0 && (
                                                <>
                                                    <p>Products available for delivery:</p>
                                                    <ul className="text-success">
                                                        {deliverableProducts.map((product, index) => (
                                                            <li key={index}>
                                                                {product.productTitle}
                                                                <br/>
                                                                <small>
                                                                    {product.deliveryMessage}
                                                                </small>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className='row'>
                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Phone Number" variant="outlined" className='w-100' size="small" name="phoneNumber" onChange={onChangeInput} />
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Email Address" variant="outlined" className='w-100' size="small" name="email" onChange={onChangeInput} />
                                    </div>
                                </div>

                            </div>


                        </div>

                        <div className='col-md-4'>
                            <div className='card orderInfo'>
                                <h4 className='hd'>YOUR ORDER</h4>
                                <div className='table-responsive mt-3'>
                                    <table className='table table-borderless'>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                cartData?.length !== 0 && cartData?.map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <td>{item?.productTitle?.substr(0, 20) + '...'}  <b>× {item?.quantity}</b></td>

                                                            <td> 
                                                            
                                                            {
                                                                item?.subTotal?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })
                                                            }
                                                            
                                                         </td>
                                                        </tr>

                                                    )
                                                })
                                            }



                                            <tr>
                                                <td>Subtotal </td>

                                                <td>

                                                {
                                                    (cartData?.length !== 0 ?
                                                        cartData?.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0) : 0)?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })
                                                }

                                                  
                                                </td>
                                            </tr>


                                        </tbody>
                                    </table>
                                </div>

                                <Button 
                                    type="submit" 
                                    className='btn-blue bg-red btn-lg btn-big'
                                    disabled={!pincodeValidated}
                                >
                                    <IoBagCheckOutline /> &nbsp; 
                                    {!pincodeValidated ? 'Please Enter Valid Pincode' : 'Checkout'}
                                </Button>

                            </div>
                        </div>


                    </div>
                </form>
            </div>
        </section>
    )
}

export default Checkout;