import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./responsive.css";
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Listing from "./Pages/Listing";
import ProductDetails from "./Pages/ProductDetails";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ProductModal from "./Components/ProductModal";
import Cart from "./Pages/Cart";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import MyList from "./Pages/MyList";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import MyAccount from "./Pages/MyAccount";
import SearchPage from "./Pages/Search";
import { fetchDataFromApi, postData } from "./utils/api";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Invoice from "./Pages/Orders/Invoice";
import CancelOrder from "./Pages/Orders/cancelorder";
import AddReview from "./Pages/Orders/addreview";
import swal from 'sweetalert2';
import StockManagerDashboard from "./Pages/StockManager/Dashboard";
import Products from "./Pages/StockManager/products/Products";
import Preloader from "./Components/Preloader/Preloader";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";
import VerifyCode from "./Components/ForgotPassword/VerifyCode";
import ResetPassword from "./Components/ForgotPassword/ResetPassword";
import axios from "axios";
import Chatbot from './Components/Chatbot';
import VoiceAssistant from './Components/VoiceAssistant';

export const MyContext = React.createContext();

// Create a wrapper component to access useNavigate
const AppWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return <App navigate={navigate} location={location} />;
};

function App({ navigate, location }) {
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setselectedCountry] = useState("");
  const [isOpenProductModal, setisOpenProductModal] = useState(false);
  const [isHeaderFooterShow, setisHeaderFooterShow] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setsubCategoryData] = useState([]);
  const [addingInCart, setAddingInCart] = useState(false);
  const [cartData, setCartData] = useState();
  const [searchData, setSearchData] = useState([]);
  const [filteredSearchData, setFilteredSearchData] = useState([]);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [alertBox, setAlertBox] = useState({
    msg: "",
    error: false,
    open: false,
  });
  const [user, setUser] = useState({
    name: "",
    email: "",
    userId: "",
  });
  const [deliverablePincode, setDeliverablePincode] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resetFilters, setResetFilters] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (
      user?.userId !== "" &&
      user?.userId !== undefined &&
      user?.userId !== null
    ) {
      fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
        setCartData(res);
      });
    }
  }, [isLogin]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await getCountry("https://countriesnow.space/api/v0.1/countries/");

        const categoryResponse = await fetchDataFromApi("/api/category");
        setCategoryData(categoryResponse.categoryList);

        const subCatArr = [];
        categoryResponse.categoryList?.forEach((cat) => {
          if (cat?.children.length !== 0) {
            cat?.children?.forEach((subCat) => {
              subCatArr.push(subCat);
            });
          }
        });
        setsubCategoryData(subCatArr);

        const location = localStorage.getItem("location");
        if (location) {
          setselectedCountry(location);
        } else {
          setselectedCountry("All");
          localStorage.setItem("location", "All");
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        // Simulate a longer loading time
        setTimeout(() => {
          setIsLoading(false); // Hide preloader after 5 seconds
        }, 2000);
      }
    };

    fetchInitialData();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getCartData = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
      setCartData(res);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLogin(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  const openProductDetailsModal = (id, status) => {
    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      setProductData(res);
      setisOpenProductModal(status);
    });
  };

  const getCountry = async (url) => {
    const response = await axios.get(url);
    setCountryList(response.data.data);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertBox({
      open: false,
    });
  };

  const addToCart = (data) => {
    return new Promise((resolve, reject) => {
        if (isLogin) {
            setAddingInCart(true);
            const user = JSON.parse(localStorage.getItem("user"));
            
            const cartData = {
                productTitle: data.productTitle || data.name,
                image: data.image,
                rating: data.rating || 0,
                price: data.price,
                quantity: data.quantity || 1,
                productId: data.productId || data._id,
                userId: user.userId,
                countInStock: data.countInStock,
                weight: data.weight || data.productWeight,
                subTotal: data.price * (data.quantity || 1)
            };

            postData(`/api/cart/add`, cartData)
                .then((res) => {
                    setAddingInCart(false);
                    if (!res.error && res.status !== false) {
                        getCartData();
                        resolve(res);
                    } else {
                        // Pass the server error message
                        reject({
                            status: 400,
                            message: res.msg || "Failed to add product to cart"
                        });
                    }
                })
                .catch((error) => {
                    setAddingInCart(false);
                    // Handle API error from api.js
                    if (error.message.includes('HTTP error! status: 400')) {
                        reject({
                            status: 400,
                            message: "This product is already in your cart"
                        });
                    } else {
                        reject({
                            status: 500,
                            message: "Failed to add product to cart"
                        });
                    }
                });
        } else {
            reject({
                status: 401,
                message: "Please login to add items to cart"
            });
        }
    });
  };

  const contextValue = {
    countryList,
    setselectedCountry,
    selectedCountry,
    isOpenProductModal,
    setisOpenProductModal,
    isHeaderFooterShow,
    setisHeaderFooterShow,
    isLogin,
    setIsLogin,
    categoryData,
    setCategoryData,
    subCategoryData,
    setsubCategoryData,
    openProductDetailsModal,
    alertBox,
    setAlertBox,
    addToCart,
    addingInCart,
    setAddingInCart,
    cartData,
    setCartData,
    getCartData,
    searchData,
    setSearchData,
    filteredSearchData,
    setFilteredSearchData,
    windowWidth,
    isOpenNav,
    setIsOpenNav,
    deliverablePincode,
    setDeliverablePincode,
    progress,
    setProgress,
    resetFilters,
    setResetFilters,
  };

  // Add this function to check if current page is an auth page
  const isAuthPage = () => {
    const authPaths = [
      '/signIn',
      '/signUp',
      '/forgotpassword',
      '/verify-code',
      '/reset-password'
    ];
    return authPaths.includes(location.pathname);
  };

  return (
    <MyContext.Provider value={contextValue}>
      {isLoading && <Preloader />}
      {!isLoading && (
        <div className="app-container">
          <Snackbar
            open={alertBox.open}
            autoHideDuration={6000}
            onClose={handleClose}
            className="snackbar"
          >
            <Alert
              onClose={handleClose}
              autoHideDuration={6000}
              severity={alertBox.error === false ? "success" : "error"}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {alertBox.msg}
            </Alert>
          </Snackbar>

          {isHeaderFooterShow && <Header />}

          <Routes>
            <Route path="/" exact={true} element={<Home />} />
            <Route path="/products/category/:id" exact={true} element={<Listing />} />
            <Route path="/products/subCat/:id" exact={true} element={<Listing />} />
            <Route exact={true} path="/product/:id" element={<ProductDetails />} />
            <Route exact={true} path="/cart" element={<Cart />} />
            <Route exact={true} path="/signIn" element={<SignIn />} />
            <Route exact={true} path="/forgotpassword" element={<ForgotPassword />} />
            <Route exact={true} path="/verify-code" element={<VerifyCode />} />
            <Route exact={true} path="/reset-password" element={<ResetPassword />} />
            <Route exact={true} path="/signUp" element={<SignUp />} />
            <Route exact={true} path="/my-list" element={<MyList />} />
            <Route exact={true} path="/checkout" element={<Checkout />} />
            <Route exact={true} path="/orders" element={<Orders />} />
            <Route exact={true} path="/my-account" element={<MyAccount />} />
            <Route exact={true} path="/search" element={<SearchPage />} />
            <Route path="/orders/invoice/:id" element={<Invoice />} />
            <Route path="/cancel-order/:id" element={<CancelOrder />} />
            <Route path="/add-review/:productId" element={<AddReview />} />
            <Route path="/stockmanager-dashboard" element={<StockManagerDashboard />} />
            <Route path="/stockmanager" element={<StockManagerDashboard />} />
            <Route path="/stockmanager/products" element={<Products />} />
          </Routes>

          {isHeaderFooterShow && <Footer />}

          {isOpenProductModal && <ProductModal data={productData} />}
          
          {/* Only show assistants if not on auth pages */}
          {!isAuthPage() && (
            <div className="assistants-container">
              <VoiceAssistant 
                addToCart={addToCart} 
                navigate={navigate}
              />
              <Chatbot />
            </div>
          )}
        </div>
      )}
    </MyContext.Provider>
  );
}

// Export the wrapper instead of App directly
export default function () {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
