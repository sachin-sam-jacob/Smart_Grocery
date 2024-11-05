import React, { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { FaAngleDown } from "react-icons/fa6";
import Dialog from '@mui/material/Dialog';
import { IoIosSearch } from "react-icons/io";
import { MdClose } from "react-icons/md";
import Slide from '@mui/material/Slide';
import { MyContext } from '../../App';
import { districtsInKerala } from '../../data/districts'; // Import the districts data
import { isDeliverable } from '../../data/pincode';
import axios from 'axios'; // Add this import
import { fetchDataFromApi } from '../../utils/api'; // Add this import
import CircularProgress from '@mui/material/CircularProgress';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CountryDropdown = () => {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null);
    const [districtList, setDistrictList] = useState(districtsInKerala); // Initialize with districts in Kerala
    const [pincode, setPincode] = useState('');
    const [pincodeError, setPincodeError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state if needed

    const context = useContext(MyContext);

    const selectDistrict = (index, district) => {
        setSelectedTab(index);
        setIsOpenModal(false);
        context.setselectedCountry(district);
        localStorage.setItem("location", district);
        window.location.href = "/"; // Redirect to home after selection
    }

    useEffect(() => {
        setDistrictList(districtsInKerala); // Set the initial district list
    }, []);

    const filterList = (e) => {
        const keyword = e.target.value.toLowerCase();
        if (keyword !== "") {
            const filteredList = districtsInKerala.filter((item) => 
                item.toLowerCase().includes(keyword)
            );
            setDistrictList(filteredList);
        } else {
            setDistrictList(districtsInKerala); // Reset to original list
        }
    }

    const handlePincodeChange = (e) => {
        setPincode(e.target.value);
        setPincodeError('');
    };

    const checkPincode = async () => {
        if (!pincode) {
            setPincodeError('Please enter a pincode');
            return;
        }

        try {
            setIsLoading(true);
            setPincodeError('');
            
            // Using postData from utils/api
            const response = await fetchDataFromApi(`/api/pincodes/check/${pincode}`);
            
            if (!response.error) {
                if (response.found) {
                    // Update the context and local storage
                    context.setselectedCountry(response.district);
                    context.setDeliverablePincode(pincode);
                    localStorage.setItem("location", response.district);
                    
                    // Show success message
                    context.setAlertBox({
                        open: true,
                        error: false,
                        msg: "Location updated successfully!"
                    });

                    // Close modal and redirect
                    setIsOpenModal(false);
                    window.location.href = "/";
                } else {
                    setPincodeError(response.msg || 'This pincode is not serviceable');
                }
            } else {
                setPincodeError(response.msg || 'Error checking pincode');
                context.setAlertBox({
                    open: true,
                    error: true,
                    msg: response.msg || 'Error checking pincode'
                });
            }
        } catch (error) {
            console.error('Error checking pincode:', error);
            setPincodeError('Something went wrong. Please try again.');
            context.setAlertBox({
                open: true,
                error: true,
                msg: 'Something went wrong. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button 
                className='countryDrop' 
                onClick={() => {
                    setIsOpenModal(true);
                    setDistrictList(districtsInKerala); // Reset list when opening modal
                }}
                style={{
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    padding: '10px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                }}
            >
                <div className='info d-flex flex-column'>
                    <span className='label'>Your Location</span>
                    <span className='name'>
                        {context.selectedCountry !== "" 
                            ? context.selectedCountry.length > 10 
                                ? context.selectedCountry.substr(0, 10) + '...' 
                                : context.selectedCountry 
                            : 'Select Location'}
                    </span>
                </div>
                <span className='ml-auto'><FaAngleDown /></span>
            </Button>

            <Dialog 
                open={isOpenModal} 
                onClose={() => setIsOpenModal(false)} 
                className='locationModal' 
                TransitionComponent={Transition}
            >
                <div style={{ padding: '20px' }}>
                    <h4 className='mb-0'>Choose your Delivery Location</h4>
                    <p>Enter your address and we will specify the offer for your area.</p>
                    <Button 
                        className='close_' 
                        onClick={() => setIsOpenModal(false)} 
                        style={{ float: 'right' }}
                    >
                        <MdClose />
                    </Button>

                    <div className='headerSearch w-100' style={{ margin: '10px 0' }}>
                        <input 
                            type='text' 
                            placeholder='Search your area...' 
                            onChange={filterList} 
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                marginRight: '5px',
                            }} 
                        />
                        <Button style={{ padding: '10px' }}><IoIosSearch /></Button>
                    </div>

                    <ul className='countryList mt-3' style={{ listStyle: 'none', padding: 0 }}>
                        <li>
                            <Button 
                                onClick={() => selectDistrict(0, "All")} 
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    textAlign: 'left',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                }}
                            >
                                All
                            </Button>
                        </li>
                        {districtList?.length !== 0 && districtList.map((item, index) => (
                            <li key={index}>
                                <Button 
                                    onClick={() => selectDistrict(index, item)} 
                                    className={`${selectedTab === index ? 'active' : ''}`}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        textAlign: 'left',
                                        backgroundColor: selectedTab === index ? '#d0e0ff' : 'transparent',
                                        border: 'none',
                                        transition: 'background-color 0.3s',
                                    }}
                                >
                                    {item}
                                </Button>
                            </li>
                        ))}
                    </ul>
                    {context.selectedCountry && (
                        <div style={{ marginTop: '20px' }}>
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                value={pincode}
                                onChange={handlePincodeChange}
                                style={{
                                    width: 'calc(100% - 100px)',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    marginRight: '5px',
                                }}
                            />
                            <Button 
                                onClick={checkPincode} 
                                style={{ padding: '10px', width: '95px' }}
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={20} /> : 'Check'}
                            </Button>
                            {pincodeError && <span style={{ color: 'red', display: 'block', marginTop: '5px' }}>{pincodeError}</span>}
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
}

export default CountryDropdown;
