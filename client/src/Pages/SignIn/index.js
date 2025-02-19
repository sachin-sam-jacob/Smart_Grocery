import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/MainLogo.png";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import GoogleImg from "../../assets/images/googleImg.png";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Swal from 'sweetalert2';
import 'animate.css';
import './styles.css';
import { firebaseApp } from "../../firebase"; // Ensure firebaseApp is correctly initialized
import FaceLogin from '../../Components/FaceLogin/FaceLogin';
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const navigate = useNavigate(); // useNavigate instead of history
  const location = useLocation();
  const [showFaceLogin, setShowFaceLogin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to home page if already logged in
      window.location.replace("/");
    }
    context.setisHeaderFooterShow(false);
  }, [navigate]);

  const [formfields, setFormfields] = useState({
    email: "",
    password: "",
  });

  const onchangeInput = (e) => {
    setFormfields(() => ({
      ...formfields,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSuccessfulLogin = (user, token, isAdmin, isStockManager) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    Swal.fire({
      title: 'Login successful!',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
    });

    context.setIsLogin(true);
    setIsLoading(false);

    // Use replace: true to prevent going back to login page
    setTimeout(() => {
      if (isAdmin) {
        window.location.replace("http://localhost:3002/");
      } else if (isStockManager) {
        window.location.replace("/stockmanager-dashboard");
      } else {
        window.location.replace("/");
      }
    }, 2000);
  };

  const login = (e) => {
    e.preventDefault();

    if (formfields.email === "") {
        Swal.fire({
            title: '<span style="color: #dc3545">Email Required</span>',
            html: '<div class="custom-error-message">Please enter your email address</div>',
            icon: 'warning',
            background: '#fff',
            customClass: {
                popup: 'animated fadeInDown error-popup',
                title: 'error-title',
                htmlContainer: 'error-container',
            },
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545',
            padding: '2em',
            borderRadius: '15px',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
        return false;
    }

    if (formfields.password === "") {
        Swal.fire({
            title: '<span style="color: #dc3545">Password Required</span>',
            html: '<div class="custom-error-message">Please enter your password</div>',
            icon: 'warning',
            background: '#fff',
            customClass: {
                popup: 'animated fadeInDown error-popup',
                title: 'error-title',
                htmlContainer: 'error-container',
            },
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545',
            padding: '2em',
            borderRadius: '15px',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
        return false;
    }

    setIsLoading(true);
    postData("/api/user/signin", formfields)
        .then((res) => {
            if (!res.error) {
                const user = {
                    name: res.user?.name,
                    email: res.user?.email,
                    userId: res.user?.id,
                    isStockManager: res.user?.isStockManager,
                    location: res.user?.location,
                };
                handleSuccessfulLogin(user, res.token, res.user.isAdmin, res.user.isStockManager);
            } else {
                throw new Error(res.msg);
            }
        })
        .catch((error) => {
            let errorMessage = error.message;
            // Handle specific error responses
            if (error.message.includes('HTTP error! status: 400')) {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.message.includes('HTTP error! status: 404')) {
                errorMessage = 'No account found with this email address.';
            } else if (error.message.includes('HTTP error! status: 403')) {
                errorMessage = 'Your account has been blocked. Please contact support.';
            }

            Swal.fire({
                title: '<span style="color: #dc3545">Error</span>',
                html: `<div class="custom-error-message">${errorMessage}</div>`,
                icon: 'error',
                background: '#fff',
                customClass: {
                    popup: 'animated fadeInDown error-popup',
                    title: 'error-title',
                    htmlContainer: 'error-container',
                },
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545',
                padding: '2em',
                borderRadius: '15px',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
            setIsLoading(false);
        });
  };
    
  const signInWithGoogle = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;

        const fields = {
          name: user.providerData[0].displayName,
          email: user.providerData[0].email,
          password: null,
          images: user.providerData[0].photoURL,
          phone: user.providerData[0].phoneNumber,
        };

        postData("/api/user/authWithGoogle", fields).then((res) => {
          try {
            if (res.error !== true) {
              const user = {
                name: res.user?.name,
                email: res.user?.email,
                userId: res.user?.id,
              };

              handleSuccessfulLogin(user, res.token, res.user.isAdmin, res.user.isStockManager);
            } else {
              Swal.fire({
                title: 'Error!',
                text: res.msg,
                icon: 'error',
                timer: 1500,
                timerProgressBar: true,
              });
              setIsLoading(false);
            }
          } catch (error) {
            console.log(error);
            setIsLoading(false);
          }
        });

        Swal.fire({
          title: 'Login successful!',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
        });
      })
      .catch((error) => {
        Swal.fire({
          open: true,
          error: true,
          msg: error.message,
        });
      });
  };

  const handleFaceLogin = async (faceDescriptor) => {
    try {
      setIsLoading(true);
      console.log('Attempting face login...');
      console.log(faceDescriptor);
      const response = await postData('/api/face/login', { faceDescriptor });
      console.log(response);
      if (response.success) {
        const user = {
          name: response.user.name,
          email: response.user.email,
          userId: response.user.id,
          isStockManager: response.user.isStockManager,
          location: response.user.location,
        };

        handleSuccessfulLogin(
          user,
          response.token,
          response.user.isAdmin,
          response.user.isStockManager
        );
      } else {
        throw new Error(response.message || 'Face login failed');
      }
    } catch (error) {
      console.error('Face login error:', error);
      Swal.fire({
        title: 'Face Login Failed',
        text: 'Face ID not recognized. Please try again or use password.',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Try Again',
        cancelButtonText: 'Use Password'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowFaceLogin(true); // Retry face login
        } else {
          setShowFaceLogin(false); // Switch to password login
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHomepage = () => {
    window.location.href = "/"; // Navigate to homepage and reload
  };

  const renderFaceLoginModal = () => {
    if (!showFaceLogin) return null;

    return (
      <div className="face-login-modal">
        <div className="face-login-modal-content">
          <button 
            className="close-modal-btn"
            onClick={() => setShowFaceLogin(false)}
          >
            <i className="fas fa-times"></i>
          </button>
          <FaceLogin
            onFaceDetected={handleFaceLogin}
            mode="login"
          />
        </div>
      </div>
    );
  };

  return (
    <section className="section signInPage">
      {/* Add Back to Homepage Button */}
      <div className="back-to-home-wrapper">
        <button 
          onClick={handleBackToHomepage}
          className="back-to-home-btn"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Back to Homepage</span>
        </button>
      </div>

      <div className="shape-bottom">
        <svg
          fill="#fff"
          id="Layer_1"
          x="0px"
          y="0px"
          viewBox="0 0 1921 819.8"
          style={{ enableBackground: "new 0 0 1921 819.8" }}
        >
          <path
            className="st0"
            d="M1921,413.1v406.7H0V0.5h0.4l228.1,598.3c30,74.4,80.8,130.6,152.5,168.6c107.6,57,212.1,40.7,245.7,34.4 c22.4-4.2,54.9-13.1,97.5-26.6L1921,400.5V413.1z"
          ></path>
        </svg>
      </div>

      <div className="container">
        <div className="box card p-3 shadow border-0">
          <div className="text-center">
            <img style={{width:'130px',height:'50px'}} src={Logo} alt="Logo" />
          </div>

          <form className="mt-3" onSubmit={login}>
            <h2 className="mb-4">Sign In</h2>

            <div className="form-group">
              <TextField
                id="emailid"
                label="Email"
                type="email"
                
                variant="standard"
                className="w-100"
                name="email"
                onChange={onchangeInput}
              />
            </div>
            <div className="form-group">
              <TextField
                id="passwords"
                label="Password"
                type="password"
                
                variant="standard"
                className="w-100"
                name="password"
                onChange={onchangeInput}
              />
            </div>
            <Link to="/forgotpassword">
            <a className="border-effect cursor txt" >
              Forgot Password?
            </a>
            </Link>
            <div className="d-flex align-items-center mt-3 mb-3">
              <Button type="submit" id="login" className="btn-blue col btn-lg btn-big">
                {isLoading === true ? <CircularProgress /> : "Sign In"}
              </Button>
              <Link to="/">
                <Button
                  className="btn-lg btn-big col ml-3"
                  variant="outlined"
                  onClick={() => context.setisHeaderFooterShow(true)}
                >
                  Cancel
                </Button>
              </Link>
            </div>

         

            <p className="txt">
              Not Registered?{" "}
              <Link to="/signUp" className="border-effect">
                Sign Up
              </Link>
            </p>

            <h6 className="mt-4 text-center font-weight-bold">
              Or continue with social account
            </h6>

            <div className="login-options mt-4">
              <Button
                className="loginWithGoogle mb-3 w-100"
                variant="outlined"
                onClick={signInWithGoogle}
              >
                <img src={GoogleImg} alt="Google" /> Sign In with Google
              </Button>

              <Button
                className="faceIdLogin w-100"
                variant="outlined"
                onClick={() => setShowFaceLogin(true)}
                startIcon={<i className="fas fa-face-viewfinder"></i>}
              >
                Sign In with Face ID
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Render face login modal */}
      {renderFaceLoginModal()}
    </section>
  );
};

export default SignIn;
