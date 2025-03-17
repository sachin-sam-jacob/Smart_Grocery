import React, { useContext, useEffect, useState } from "react";

import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdCloudUpload } from "react-icons/io";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Swal from 'sweetalert2';
import {
  deleteData,
  deleteImages,
  editData,
  fetchDataFromApi,
  postData,
  uploadImage,
} from "../../utils/api";

import { MyContext } from "../../App";

import NoUserImg from "../../assets/images/no-user.jpg";
import FaceLogin from '../../Components/FaceLogin/FaceLogin';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const MyAccount = () => {
  const [isLogin, setIsLogin] = useState(false);
  const history = useNavigate();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const context = useContext(MyContext);

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [previews, setPreviews] = useState([]);
  const [userData, setUserData] = useState([]);

  const formdata = new FormData();

  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    phone: "",
    images: [],
  });

  const [fields, setFields] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [showFaceRegistration, setShowFaceRegistration] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const token = localStorage.getItem("token");
    if (token !== "" && token !== undefined && token !== null) {
      setIsLogin(true);
    } else {
      history("/signIn");
    }

    // Load user data first, then clean up temporary images
    // This ensures we don't delete images that haven't been saved to the user profile yet
    loadUserData();
    
    // Don't delete temporary images on initial load
    // deleteData("/api/imageUpload/deleteAllImages");
  }, []);

  // Function to load user data
  const loadUserData = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.userId) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "User information not found. Please login again."
      });
      history("/signIn");
      return;
    }

    fetchDataFromApi(`/api/user/${user.userId}`).then((res) => {
      if (res) {
        setUserData(res);
        // Make sure we have images array
        const userImages = res.images || [];
        setPreviews(userImages);

        setFormFields({
          name: res.name || "",
          email: res.email || "",
          phone: res.phone || "",
        });
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to load user data"
        });
      }
    }).catch(err => {
      console.error("Error loading user data:", err);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Error loading user data"
      });
    });
  };

  const changeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  const changeInput2 = (e) => {
    setFields(() => ({
      ...fields,
      [e.target.name]: e.target.value,
    }));
  };

  let img_arr = [];
  let uniqueArray = [];
  let selectedImages = [];

  const onChangeFile = async (e, apiEndPoint) => {
    try {
      const files = e.target.files;
      
      if (!files || files.length === 0) return;
      
      console.log(files);
      setUploading(true);
      
      // Clear the formdata to prevent duplicate images
      for (let key of formdata.keys()) {
        formdata.delete(key);
      }
      
      selectedImages = [];
      
      for (var i = 0; i < files.length; i++) {
        // Validate file type
        if (files[i] && (files[i].type === 'image/jpeg' || files[i].type === 'image/jpg' || files[i].type === 'image/png' || files[i].type === 'image/webp')) {
          const file = files[i];
          selectedImages.push(file);
          formdata.append(`images`, file);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: 'Please select a valid JPG or PNG image file.'
          });
          setUploading(false);
          return false;
        }
      }

      // Use user upload endpoint instead of category upload
      uploadImage("/api/user/upload", formdata).then((res) => {
        console.log("Upload response:", res);
        // Store the direct response from the upload API which contains the image URLs
        if (res && Array.isArray(res)) {
          uniqueArray = res; // Direct array of image URLs
          setPreviews(res); // Update previews with the new images
          
          // Immediately save the uploaded images to the user profile
          // to prevent them from being lost on page reload
          saveUserWithImages(res);
          
          setUploading(false);
          Swal.fire({
            title: 'Success',
            text: 'Images uploaded successfully',
            icon: 'success'
          });
        } else {
          // Fallback to the old method if the direct response doesn't work
          fetchDataFromApi("/api/imageUpload").then((response) => {
            if (response !== undefined && response !== null && response !== "" && response.length !== 0) {
              img_arr = [];
              
              response.length !== 0 && response.map((item) => {
                item?.images.length !== 0 && item?.images?.map((img) => {
                  img_arr.push(img);
                });
              });

              uniqueArray = img_arr.filter((item, index) => img_arr.indexOf(item) === index);
              
              // Replace previous images instead of appending
              setPreviews(uniqueArray);
              
              // Immediately save the uploaded images to the user profile
              saveUserWithImages(uniqueArray);
              
              setUploading(false);
              Swal.fire({
                title: 'Success',
                text: 'Images uploaded successfully',
                icon: 'success'
              });
            } else {
              setUploading(false);
              context.setAlertBox({
                open: true,
                error: true,
                msg: "Failed to upload images"
              });
            }
          }).catch(err => {
            console.error("Error fetching uploaded images:", err);
            setUploading(false);
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Error fetching uploaded images"
            });
          });
        }
      }).catch(err => {
        console.error("Error uploading images:", err);
        setUploading(false);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Error uploading images"
        });
      });
    } catch (error) {
      console.log(error);
      setUploading(false);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "An error occurred during image upload"
      });
    }
  }

  // Function to save user with images immediately after upload
  const saveUserWithImages = (images) => {
    if (!images || images.length === 0) return;
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.userId) return;
    
    // Use the current form fields with the new images
    const userData = {
      name: formFields.name,
      email: formFields.email,
      phone: formFields.phone,
      images: images
    };
    
    // Update the user in the database
    editData(`/api/user/${user.userId}`, userData)
      .then(res => {
        // The response might be undefined due to the API function implementation
        // but the update might still be successful
        // Update local storage regardless
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
          currentUser.images = images;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
        console.log("User profile with new images saved successfully");
      })
      .catch(err => {
        console.error("Error saving user with new images:", err);
      });
  }

  const edituser = (e) => {
    e.preventDefault();

    // Use only the new images if they exist, otherwise use existing previews
    const imagesToUse = uniqueArray.length > 0 ? uniqueArray : previews;

    // Clear formdata to prevent duplicate data
    for (let key of formdata.keys()) {
      formdata.delete(key);
    }

    // Set the images in the form fields
    formFields.images = imagesToUse;

    if (
      formFields.name !== "" &&
      formFields.email !== "" &&
      formFields.phone !== "" &&
      imagesToUse.length !== 0
    ) {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      // Use the correct API endpoint and data format
      editData(`/api/user/${user?.userId}`, {
        name: formFields.name,
        email: formFields.email,
        phone: formFields.phone,
        images: imagesToUse // Make sure to send the images array
      }).then((res) => {
        setIsLoading(false);

        // The response might be undefined due to the API function implementation
        // but the update might still be successful
        // Check if there was an error in the response
        if (res && res.error) {
          // There was an explicit error in the response
          Swal.fire({
            title: 'Error',
            text: res.msg || 'Failed to update profile',
            icon: 'error'
          });
        } else {
          // Consider the update successful even if res is undefined
          // Update local storage with new user data
          const currentUser = JSON.parse(localStorage.getItem("user"));
          if (currentUser) {
            currentUser.name = formFields.name;
            currentUser.phone = formFields.phone;
            // Also update the images in localStorage
            currentUser.images = imagesToUse;
            localStorage.setItem("user", JSON.stringify(currentUser));
          }
          
          // Only delete temporary images after successful update
          deleteData("/api/imageUpload/deleteAllImages");
          
          // Reset arrays
          uniqueArray = [];
          img_arr = [];
          
          // Reload user data to ensure we have the latest data
          loadUserData();
          
          Swal.fire({
            title: 'Success',
            text: 'Profile updated successfully',
            icon: 'success'
          });
        }
      }).catch(err => {
        setIsLoading(false);
        console.error("Error updating user:", err);
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.msg || 'Error updating profile',
          icon: 'error'
        });
      });
    } else {
      Swal.fire({
        title: 'Warning',
        text: 'Please fill all the details',
        icon: 'warning'
      });
      return false;
    }
  };

  const changePassword = (e) => {
    e.preventDefault();

    if (fields.oldPassword !== "" && fields.password !== "" && fields.confirmPassword !== "") {
        if (fields.password !== fields.confirmPassword) {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Password and confirm password do not match"
            });
            return;
        }

        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const data = {
            name: formFields.name,
            email: formFields.email,
            password: fields.oldPassword,
            newPass: fields.password,
            phone: formFields.phone,
            images: previews,
        };

        editData(`/api/user/changePassword/${user?.userId}`, data)
            .then((res) => {
                setIsLoading(false);
                if (res?.error) {
                    context.setAlertBox({
                        open: true,
                        error: true,
                        msg: res.msg || "Failed to update password"
                    });
                } else {
                    context.setAlertBox({
                        open: true,
                        error: false,
                        msg: "Password updated successfully"
                    });
                    // Clear password fields
                    setFields({
                        oldPassword: "",
                        password: "",
                        confirmPassword: ""
                    });
                    // Reset tab to first tab
                    setValue(0);
                }
            })
            .catch((err) => {
                setIsLoading(false);
                context.setAlertBox({
                    open: true,
                    error: true,
                    msg: "Something went wrong while updating password"
                });
            });
    } else {
        context.setAlertBox({
            open: true,
            error: true,
            msg: "Please fill all the password fields"
        });
    }
  };

  const handleFaceRegistration = async (faceDescriptor) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await postData('/api/face/register', {
        userId: user?.userId,
        faceDescriptor
      });

      if (response.success) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: 'Face ID registered successfully'
        });
        setShowFaceRegistration(false);
      }
    } catch (error) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: 'Failed to register Face ID. Please try again.'
      });
    }
  };

  return (
    <section className="section myAccountPage">
      <div className="container">
        <h2 className="hd">My Account</h2>

        <Box sx={{ width: "100%" }} className="myAccBox card border-0">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Edit Profile" {...a11yProps(0)} />
              <Tab label="Change Password" {...a11yProps(1)} />
              <Tab label="Face ID Setup" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <form onSubmit={edituser}>
              <div className="row">
                <div className="col-md-4">
                  <div className="userImage">
                    {previews?.length !== 0 ? (
                      previews?.map((img, index) => {
                        return <img src={img} key={index} />;
                      })
                    ) : (
                      <img src={NoUserImg} />
                    )}
                    <div className="overlay d-flex align-items-center justify-content-center">
                      <IoMdCloudUpload />
                      <input
                        type="file"
                        multiple
                        onChange={(e) => onChangeFile(e, "/api/user/upload")}
                        name="images"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <TextField
                          label="Name"
                          variant="outlined"
                          className="w-100"
                          name="name"
                          onChange={changeInput}
                          value={formFields.name}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <TextField
                          label="Email"
                          disabled
                          variant="outlined"
                          className="w-100"
                          name="email"
                          onChange={changeInput}
                          value={formFields.email}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <TextField
                          label="Phone"
                          variant="outlined"
                          className="w-100"
                          name="phone"
                          onChange={changeInput}
                          value={formFields.phone}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <Button
                      type="submit"
                      className="btn-blue bg-red btn-lg btn-big"
                    >
                      {" "}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <form onSubmit={changePassword}>
              <div className="row">
                <div className="col-md-12">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <TextField
                          label="Old Password"
                          variant="outlined"
                          className="w-100"
                          name="oldPassword"
                          onChange={changeInput2}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <TextField
                          label="New password"
                          variant="outlined"
                          className="w-100"
                          name="password"
                          onChange={changeInput2}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <TextField
                          label="Confirm Password"
                          variant="outlined"
                          className="w-100"
                          name="confirmPassword"
                          onChange={changeInput2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <Button
                      type="submit"
                      className="btn-blue bg-red btn-lg btn-big"
                    >
                      {" "}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <div className="face-id-section">
              <div className="row">
                <div className="col-md-12">
                  <div className="text-center mb-4">
                    <h4>Face ID Authentication Setup</h4>
                    <p className="text-muted">
                      Register your face for quick and secure login to your account
                    </p>
                  </div>

                  {!showFaceRegistration ? (
                    <div className="text-center">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowFaceRegistration(true)}
                        className="register-face-btn"
                        startIcon={<i className="fas fa-face-viewfinder"></i>}
                      >
                        Start Face ID Registration
                      </Button>
                    </div>
                  ) : (
                    <div className="face-registration-container">
                      <Button
                        className="mb-3"
                        onClick={() => setShowFaceRegistration(false)}
                        startIcon={<i className="fas fa-arrow-left"></i>}
                      >
                        Back
                      </Button>
                      <FaceLogin
                        onFaceDetected={handleFaceRegistration}
                        mode="register"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CustomTabPanel>
        </Box>
      </div>
    </section>
  );
};

export default MyAccount;
