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
    isAdmin: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

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
      default:
        break;
    }
  };

  const register = (e) => {
    e.preventDefault();

    const phoneError = validatePhone(formfields.phone);
    const passwordError = validatePassword(formfields.password);
    const emailError = validateEmail(formfields.email);

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

  return (
    <section className="section signInPage signUpPage">
      <div className="shape-bottom">
        {/* SVG for background */}
      </div>

      <div className="container" style={{fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'}}>
        <div className="box card p-3 shadow border-0">
          <div className="text-center">
            <img style={{ width: "130px", height: "50px" }} src={Logo} />
          </div>

          <form className="mt-2" onSubmit={register}>
            <h2 className="mb-3">Sign Up</h2>

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

            <div className="mt-3 text-center">
              <Button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isLoading}
                style={{backgroundColor:'#0BDA51',color:'white',fontSize:'15px',fontWeight:'bolder'
                }}
              >
                {isLoading ? <CircularProgress size={24} /> : "Sign Up"}
              </Button>
            </div>

            <div className="text-center my-3">
              <span>or</span>
            </div>

            <div className="googleBtnContainer" style={{ maxWidth: '200px', margin: '0 auto' }}>
              <Button
                onClick={signInWithGoogle}
                variant="outlined"
                className="d-flex align-items-center justify-content-center"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '20px',
                  borderColor: '#0BDA51',
                  color: '#0BDA51',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0BDA51'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <img src={GoogleImg} alt="google" style={{ width: '20px', height: '20px', marginRight: '5px' }} />
                Continue with Google
              </Button>
            </div>

            <div className="mt-3 text-center">
              <Link to="/signIn">Already have an account? Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
