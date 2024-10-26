// src/pages/Pincode/AddPincode.js
import React, { useState, useEffect } from 'react';
import { postData } from '../../utils/api';
import { Button, TextField, Box } from '@mui/material';
import Swal from 'sweetalert2';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Breadcrumb styling (unchanged)
const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.06),
    },
    '&:active': {
        boxShadow: theme.shadows[1],
        backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.12),
    },
}));

const AddPincode = () => {
    const [pincode, setPincode] = useState('');
    const [place, setPlace] = useState('');
    const [district, setDistrict] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('user');
        if (token) {
            const userData = JSON.parse(token);
            setDistrict(userData.location);
        }
    }, []);

    const handlePincodeChange = (e) => {
        setPincode(e.target.value);
    };

    const handlePlaceChange = (e) => {
        setPlace(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await postData('/api/pincodes/add', { pincode, place, district });
            Swal.fire("Success", "Pincode and Place Added Successfully!", "success");
            setPincode('');
            setPlace('');
        } catch (error) {
            Swal.fire("Error", "Error adding Pincode and Place", "error");
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Add Pincode for {district}</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Add Pincode"
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                </div>
            </div>

            <div className="card shadow border-0 p-4 mt-4">
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <TextField
                        fullWidth
                        label="Pincode"
                        name="pincode"
                        value={pincode}
                        onChange={handlePincodeChange}
                        required
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Place"
                        name="place"
                        value={place}
                        onChange={handlePlaceChange}
                        required
                        variant="outlined"
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        sx={{ 
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '1rem',
                            alignSelf: 'flex-start'
                        }}
                    >
                        Add Pincode and Place
                    </Button>
                </Box>
            </div>
        </div>
    );
};

export default AddPincode;
