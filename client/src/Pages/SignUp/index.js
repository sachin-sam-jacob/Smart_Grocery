import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/MainLogo.png";
import { MyContext } from "../../App";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleImg from "../../assets/images/googleImg.png";
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "../../firebase";

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility
  const [formfields, setFormfields] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "", // Add confirm password field
    isAdmin: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "", // Add confirm password error
  });

  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Add state for confirm password visibility

  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    context.setisHeaderFooterShow(false);
  }, []);

  const validateName = (name) => {
    const regex = /^[A-Za-z\s]+$/; // Only allows alphabets and spaces
    return regex.test(name) ? "" : "Name should contain only alphabets.";
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    const isRepeating = /^(\d)\1{9}$/.test(phone); // Check if all digits are the same
    if (!regex.test(phone)) {
      return "Phone number must be exactly 10 digits.";
    }
    if (isRepeating) {
      return "Phone number cannot consist of repeating digits.";
    }
    return "";
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? "" : "Invalid email format.";
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return regex.test(password)
      ? ""
      : "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.";
  };

  const validateConfirmPassword = (confirmPassword) => {
    return confirmPassword === formfields.password 
      ? "" 
      : "Passwords do not match";
  };

  const onchangeInput = (e) => {
    const { name, value } = e.target;

    setFormfields((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Live validation
    switch (name) {
      case "name":
        setErrors((prev) => ({
          ...prev,
          name: value === "" ? "Name cannot be blank." : validateName(value),
        }));
        break;
      case "email":
        setErrors((prev) => ({
          ...prev,
          email: validateEmail(value),
        }));
        break;
      case "phone":
        setErrors((prev) => ({
          ...prev,
          phone: validatePhone(value),
        }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
        }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: value === "" 
            ? "Confirm Password cannot be blank." 
            : validateConfirmPassword(value),
        }));
        break;
      default:
        break;
    }
  };

  const register = (e) => {
    e.preventDefault();

    const phoneError = validatePhone(formfields.phone);
    const passwordError = validatePassword(formfields.password);
    const emailError = validateEmail(formfields.email);
    const confirmPasswordError = validateConfirmPassword(formfields.confirmPassword);

    if (formfields.name === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Name cannot be blank.",
      });
      return false;
    }

    if (emailError) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: emailError,
      });
      return false;
    }

    if (phoneError) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: phoneError,
      });
      return false;
    }

    if (passwordError) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: passwordError,
      });
      return false;
    }

    if (confirmPasswordError) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: confirmPasswordError,
      });
      return false;
    }

    setIsLoading(true);

    postData("/api/user/signup", formfields)
      .then((res) => {
        if (res.error !== true) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Register Successfully!",
          });

          setTimeout(() => {
            setIsLoading(true);
            history("/signIn");
          }, 2000);
        } else {
          setIsLoading(false);
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.msg,
          });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error posting data:", error);
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
                history("/");
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
          msg: "User authentication Successfully!",
        });
      })
      .catch((error) => {
        const errorMessage = error.message;
        context.setAlertBox({
          open: true,
          error: true,
          msg: errorMessage,
        });
      });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

          <form className="mt-3" onSubmit={register}>
            <h2 className="mb-4">Sign Up</h2>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <TextField
                    label="Name"
                    name="name"
                    onChange={onchangeInput}
                    type="text"
                    variant="standard"
                    className="w-100"
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <TextField
                    label="Phone No."
                    name="phone"
                    onChange={onchangeInput}
                    type="text"
                    variant="standard"
                    className="w-100"
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <TextField
                label="Email"
                type="email"
                name="email"
                onChange={onchangeInput}
                variant="standard"
                className="w-100"
                error={!!errors.email}
                helperText={errors.email}
              />
            </div>

            <div className="form-group">
              <TextField
                label="Password"
                name="password"
                onChange={onchangeInput}
                type={showPassword ? "text" : "password"}
                variant="standard"
                className="w-100"
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div className="form-group">
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                onChange={onchangeInput}
                type={showConfirmPassword ? "text" : "password"}
                variant="standard"
                className="w-100"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowConfirmPassword}>
                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div className="d-flex align-items-center mt-3 mb-3">
              <Button 
                type="submit" 
                className="btn-blue col btn-lg btn-big"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress /> : "Sign Up"}
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
              Already have an account?{" "}
              <Link to="/signIn" className="border-effect">
                Sign In
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
              <img src={GoogleImg} alt="Google" /> Sign Up with Google
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
