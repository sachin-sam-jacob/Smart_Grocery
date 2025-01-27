import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import React, { createContext, useEffect, useState, useRef } from 'react';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Products from './pages/Products';
import Category from './pages/Category/categoryList';
import ProductDetails from './pages/ProductDetails';
import ProductUpload from './pages/Products/addProduct';
import EditProduct from './pages/Products/editProduct';
import CategoryAdd from "./pages/Category/addCategory";
import EditCategory from "./pages/Category/editCategory";
import SubCatAdd from "./pages/Category/addSubCat";
import SubCatList from "./pages/Category/subCategoryList";
import ProductWeight from "./pages/Products/addProductWeight";
import  ProductSize from './pages/Products/addProductSize';
import  Orders from './pages/Orders';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LoadingBar from 'react-top-loading-bar'
import { fetchDataFromApi } from './utils/api';
import axios from 'axios';
import AddPincode from './pages/Pincode/AddPincode';
import ListPincode from './pages/Pincode/ListPincode';
import { MyContextProvider } from './contexts/MyContext';
import StockOrders from './components/StockOrders';
import OrderHistory from './components/StockOrders/OrderHistory';

const MyContext = createContext();

function App() {

  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isHideSidebarAndHeader, setisHideSidebarAndHeader] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );
  const [catData, setCatData] = useState([]);
  const [user, setUser] = useState(null);
  
  
  const [baseUrl, setBaseUrl] = useState("http://localhost:4000");

  const [progress, setProgress] = useState(0);
  const [alertBox, setAlertBox] = useState({
    msg: '',
    error: false,
    open: false
  })


  const [selectedLocation, setSelectedLocation] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setselectedCountry] = useState('');

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (token && userData && userData.isSupplier) {
        setIsLogin(true);
        setUser(userData);
        setisHideSidebarAndHeader(false);
    } else {
        setIsLogin(false);
        setUser(null);
        setisHideSidebarAndHeader(true);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
  }, []);



  useEffect(()=>{
    getCountry("https://countriesnow.space/api/v0.1/countries/");
  },[])
  

  const getCountry = async (url) => {
    const responsive = await axios.get(url).then((res) => {
        setCountryList(res.data.data)
    })
}

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlertBox({
      open: false
    });
  };


  useEffect(() => {
    setProgress(20);
    fetchCategory();
  }, []);



  const fetchCategory=()=>{
    fetchDataFromApi('/api/category').then((res) => {
      setCatData(res);
      setProgress(100);
    })
  }


  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    isLogin,
    setIsLogin,
    isHideSidebarAndHeader,
    setisHideSidebarAndHeader,
    theme,
    setTheme,
    alertBox,
    setAlertBox,
    setProgress,
    baseUrl,
    catData,
    fetchCategory,
    setUser,
    user,
    countryList,
    selectedCountry,
    setselectedCountry
  }

  return (
    <MyContextProvider>
      <BrowserRouter>
        <MyContext.Provider value={values}>

          <LoadingBar
            color='#f11946'
            progress={progress}
            onLoaderFinished={() => setProgress(0)}
            className='topLoadingBar'
          />

          <Snackbar open={alertBox.open} autoHideDuration={6000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              autoHideDuration={6000}
              severity={alertBox.error === false ? "success" : 'error'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {alertBox.msg}
            </Alert>
          </Snackbar>


          {isLogin && <Header />}
          <div className='main d-flex'>
            {isLogin && (
              <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''}`}>
                <Sidebar />
              </div>
            )}

            <div className={`content ${!isLogin && 'full'} ${isToggleSidebar === true ? 'toggle' : ''}`}>
              <Routes>
                <Route path="/login" element={!isLogin ? <Login /> : <Navigate to="/" />} />
                <Route path="/signup" element={!isLogin ? <SignUp /> : <Navigate to="/" />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/products" exact={true} element={<Products />} />
                <Route path="/product/details/:id" exact={true} element={<ProductDetails />} />
                <Route path="/product/upload" exact={true} element={<ProductUpload />} />
                <Route path="/product/edit/:id" exact={true} element={<EditProduct />} />
                <Route path="/category" exact={true} element={<Category />} />
                <Route path="/category/add" exact={true} element={<CategoryAdd />} />
                <Route path="/category/edit/:id" exact={true} element={<EditCategory />} />
                <Route path="/subCategory/" exact={true} element={<SubCatList />} />
                <Route path="/subCategory/add" exact={true} element={<SubCatAdd />} />
                <Route path="/productWEIGHT/add" exact={true} element={<ProductWeight />} />
                <Route path="/productSIZE/add" exact={true} element={<ProductSize />} />
                <Route path="/orders/" exact={true} element={<Orders />} />
                <Route path="/addpincode" exact={true} element={<AddPincode />}/>
                <Route path="/listpincode" exact={true} element={<ListPincode />}/>
                <Route path="/stock-orders" element={<StockOrders />} />
                <Route path="/stock-orders/history" element={<OrderHistory />} />

                <Route path="*" element={<Navigate to={isLogin ? "/" : "/login"} />} />
              </Routes>
            </div>
          </div>
        </MyContext.Provider>
      </BrowserRouter>
    </MyContextProvider>
  );
}

export default App;
export { MyContext }
