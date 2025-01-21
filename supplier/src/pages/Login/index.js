import { useContext, useEffect, useState } from 'react';
import Logo from '../../assets/images/logo.webp';
import patern from '../../assets/images/pattern.webp';
import { MyContext } from '../../App';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import MainLogo from '../../assets/images/MainLogo.png';
import googleIcon from '../../assets/images/googleIcon.png';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from 'sweetalert2';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const Login = () => {
    const [inputIndex, setInputIndex] = useState(null);
    const [isShowPassword, setisShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    
    const history = useNavigate();
    const context = useContext(MyContext);

    const [formfields, setFormfields] = useState({
        email: "",
        password: "",
        isSupplier: true
    });

    useEffect(() => {
        context.setisHideSidebarAndHeader(true);
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (token && user && user.role === 'supplier' && user.isSupplier) {
            window.location.replace('/');
        }
    }, []);

    const focusInput = (index) => {
        setInputIndex(index);
    }

    const onchangeInput = (e) => {
        setFormfields({
            ...formfields,
            [e.target.name]: e.target.value
        });
    }

    const signIn = async (e) => {
        e.preventDefault();

        if (!formfields.email) {
            Swal.fire("Error", "Email cannot be blank!", "error");
            return;
        }

        if (!formfields.password) {
            Swal.fire("Error", "Password cannot be blank!", "error");
            return;
        }

        setIsLoading(true);

        try {
            const res = await postData("/api/user/signin", formfields);
            if (!res.error) {
                if (res.user?.isSupplier) {
                    const user = {
                        name: res.user?.name,
                        email: res.user?.email,
                        userId: res.user?.id,
                        isSupplier: res.user?.isSupplier,
                        location: res.user?.location,
                        role: 'supplier'
                    };

                    localStorage.setItem("token", res.token);
                    localStorage.setItem("user", JSON.stringify(user));

                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Login Successful",
                        showConfirmButton: false,
                        timer: 1500
                    });

                    setTimeout(() => {
                        context.setIsLogin(true);
                        history("/dashboard");
                    }, 1500);
                } else if (!res.user?.isSupplier) {
                    Swal.fire("Error", "Your account has been deactivated. Please contact support.", "error");
                } else {
                    Swal.fire("Error", "Invalid supplier credentials", "error");
                }
            } else {
                Swal.fire("Error", res.msg || "Login failed", "error");
            }
        } catch (error) {
            console.error('Login error:', error);
            Swal.fire("Error", "Something went wrong. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = () => {
        signInWithPopup(auth, googleProvider)
          .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
    
            const fields={
                name:user.providerData[0].displayName,
                email: user.providerData[0].email,
                password: null,
                images:user.providerData[0].photoURL,
                phone:user.providerData[0].phoneNumber,
                isAdmin:true
            }
    
            postData("/api/user/authWithGoogle", fields).then((res) => {
                try {
                  if (res.error !== true) {
                    localStorage.setItem("token", res.token);
          
                    const user = {
                      name: res.user?.name,
                      email: res.user?.email,
                      userId: res.user?.id,
                    };
          
                    localStorage.setItem("user", JSON.stringify(user));
          
                    context.setAlertBox({
                      open: true,
                      error: false,
                      msg: res.msg,
                    });
          
                    setTimeout(() => {
                        context.setIsLogin(true);
                            history("/dashboard");

                    }, 2000);
                  } else {
                    context.setAlertBox({
                      open: true,
                      error: true,
                      msg: res.msg,
                    });
                    setIsLoading(false);
                  }
                } catch (error) {
                  console.log(error);
                  setIsLoading(false);
                }
              });
    
            context.setAlertBox({
              open: true,
              error: false,
              msg: "User authentication Successfully!",
            });
    
           // window.location.href = "/";
          })
          .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            context.setAlertBox({
              open: true,
              error: true,
              msg: errorMessage,
            });
            // ...
          });
      };

    return (
        <>
            <img src={patern} className='loginPatern' alt="pattern" />
            <section className="loginSection">
                <div className="loginBox">
                    <div className='logo text-center'>
                        <img 
                            style={{width:'150px',height:'60px',marginRight:'30px'}} 
                            src={MainLogo} 
                            alt="Logo"
                        />
                        <h5 className='font-weight-bold'>Supplier Login</h5>
                    </div>

                    <div className='wrapper mt-3 card border'>
                        <form onSubmit={signIn}>
                            <div className={`form-group position-relative ${inputIndex === 0 && 'focus'}`}>
                                <span className='icon'><MdEmail /></span>
                                <input 
                                    type='email'
                                    className='form-control'
                                    placeholder='Enter your email'
                                    onFocus={() => focusInput(0)}
                                    onBlur={() => setInputIndex(null)}
                                    autoFocus
                                    name="email"
                                    onChange={onchangeInput}
                                    value={formfields.email}
                                />
                            </div>

                            <div className={`form-group position-relative ${inputIndex === 1 && 'focus'}`}>
                                <span className='icon'><RiLockPasswordFill /></span>
                                <input 
                                    type={isShowPassword ? 'text' : 'password'}
                                    className='form-control'
                                    placeholder='Enter your password'
                                    onFocus={() => focusInput(1)}
                                    onBlur={() => setInputIndex(null)}
                                    name="password"
                                    onChange={onchangeInput}
                                    value={formfields.password}
                                />
                                <span 
                                    className='toggleShowPassword'
                                    onClick={() => setisShowPassword(!isShowPassword)}
                                >
                                    {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                </span>
                            </div>

                            <div className='form-group'>
                                <Button 
                                    type='submit'
                                    className="btn-blue btn-lg w-100 btn-big"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                                </Button>
                            </div>

                            <div className='form-group text-center mb-0'>
                                <Link to='/forgot-password' className="link">
                                    Forgot Password?
                                </Link>
                                {/* <div className='d-flex align-items-center justify-content-center or mt-3 mb-3'>
                                    <span className='line'></span>
                                    <span className='txt'>or</span>
                                    <span className='line'></span>
                                </div> */}

                                {/* <Button variant="outlined" className='w-100 btn-lg btn-big loginWithGoogle' onClick={signInWithGoogle}>
                                    <img src={googleIcon} width="25px" /> &nbsp; Sign In with Google
                                </Button> */}

                            </div>

                        </form>
                    </div>

                    <div className='wrapper mt-3 card border footer p-3'>
                        <span className='text-center'>
                            Contact support for supplier registration
                        </span>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;