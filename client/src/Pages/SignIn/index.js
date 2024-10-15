import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/MainLogo.png";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import GoogleImg from "../../assets/images/googleImg.png";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase"; // Ensure firebaseApp is correctly initialized
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const navigate = useNavigate(); // useNavigate instead of history

  useEffect(() => {
    context.setisHeaderFooterShow(false);
  }, []);

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

  const login = (e) => {
    e.preventDefault();

    if (formfields.email === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Email cannot be blank!",
      });
      return false;
    }

    if (formfields.password === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Password cannot be blank!",
      });
      return false;
    }

    setIsLoading(true);
    postData("/api/user/signin", formfields).then((res) => {
      try {
        if (res.error !== true) {
          localStorage.setItem("token", res.token);

          const user = {
            name: res.user?.name,
            email: res.user?.email,
            userId: res.user?.id,
            isAdmin: res.user?.isAdmin, // Store isAdmin status
          };

          localStorage.setItem("user", JSON.stringify(user));

          context.setAlertBox({
            open: true,
            error: false,
            msg: res.msg,
          });

          setTimeout(() => {
            context.setIsLogin(true);
            setIsLoading(false);
            context.setisHeaderFooterShow(true);

            // Redirect based on isAdmin status
            if (user.isAdmin) {
              window.location.href = "http://localhost:3002/"; // Redirect to admin page
            } else {
              navigate("/"); // Redirect to user home page
            }
          }, 2000);
        } else {
          // Handle blocked user message
          if (res.msg === "User is blocked by the admin due to unauthorized activities.") {
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Your account is blocked. Please contact support for further assistance.",
            });
          } else {
            context.setAlertBox({
              open: true,
              error: true,
              msg: res.msg,
            });
          }
          setIsLoading(false);
        }
      } 
      catch (error) {
        console.log(error);
        setIsLoading(false);
      }
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
                navigate("/"); // Use navigate instead of history
                context.setIsLogin(true);
                setIsLoading(false);
                context.setisHeaderFooterShow(true);
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
          msg: "User authentication successful!",
        });
      })
      .catch((error) => {
        context.setAlertBox({
          open: true,
          error: true,
          msg: error.message,
        });
      });
  };

  // const handleForgot=(res) => {
  //   navigate(`/forgotpassword`)
  // };

  const handleBackToHomepage = () => {
    window.location.href = "/"; // Navigate to homepage and reload
  };

  return (
    <section className="section signInPage">
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
                required
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
                required
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

            <Button
              className="loginWithGoogle mt-2"
              variant="outlined"
              onClick={signInWithGoogle}
            >
              <img src={GoogleImg} alt="Google" /> Sign In with Google
            </Button>

               {/* Add Back to Homepage Button */}
               <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <Button 
                onClick={handleBackToHomepage} 
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  backgroundColor: '#007bff',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0056b3'; // Darker blue on hover
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#007bff'; // Original blue
                }}
              >
                Back to Homepage
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
