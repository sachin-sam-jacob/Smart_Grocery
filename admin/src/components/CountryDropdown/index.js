import React, { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { FaAngleDown } from "react-icons/fa6";
import Dialog from '@mui/material/Dialog';
import { IoIosSearch } from "react-icons/io";
import { MdClose } from "react-icons/md";
import Slide from '@mui/material/Slide';
import { MyContext } from '../../App';
import { districtsInKerala } from '../../data/districts'; // Import the districts data

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CountryDropdown = (props) => {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null);
    const [districtList, setDistrictList] = useState(districtsInKerala); // Initialize with districts in Kerala

    const context = useContext(MyContext);

    const selectDistrict = (index, district) => {
        setSelectedTab(index);
        setIsOpenModal(false);
        context.setselectedCountry(district);
    }

    useEffect(() => {
        setDistrictList(districtsInKerala); // Set the initial district list
        context.setselectedCountry(props.selectedLocation); // Set the selected location from props
    }, [props.selectedLocation]);

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

    return (
        <>
            <Button className='countryDrop' onClick={() => {
                setIsOpenModal(true);
                setDistrictList(districtsInKerala); // Reset list when opening modal
            }}>
                <div className='info d-flex flex-column'>
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

            <Dialog open={isOpenModal} onClose={() => setIsOpenModal(false)} className='locationModal' TransitionComponent={Transition}>
                <h4 className='mb-0'>Choose your Delivery Location</h4>
                <p>Enter your address and we will specify the offer for your area.</p>
                <Button className='close_' onClick={() => setIsOpenModal(false)}><MdClose /></Button>

                <div className='headerSearch w-100'>
                    <input type='text' placeholder='Search your area...' onChange={filterList} />
                    <Button><IoIosSearch /></Button>
                </div>

                <ul className='countryList mt-3'>
                    {districtList?.length !== 0 && districtList.map((item, index) => (
                        <li key={index}>
                            <Button 
                                onClick={() => selectDistrict(index, item)} 
                                className={`${selectedTab === index ? 'active' : ''}`}
                            >
                                {item}
                            </Button>
                        </li>
                    ))}
                </ul>
            </Dialog>
        </>
    );
}

export default CountryDropdown;
