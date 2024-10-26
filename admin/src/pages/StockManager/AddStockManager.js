import React, { useState, useContext } from 'react';
import { postData } from '../../utils/api';
import { Button, TextField, Typography, Box, Container, FormControl, InputLabel } from '@mui/material';
import CountryDropdown from '../../components/CountryDropdown';
import { MyContext } from '../../App';
import Swal from 'sweetalert2';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from "react-router-dom";

// Breadcrumb styling
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

const AddStockManager = () => {
    const context = useContext(MyContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                location: context.selectedCountry
            };
            const response = await postData('/api/stockManagers/add', dataToSubmit);
            Swal.fire("Success", "Stock Manager Added Successfully!", "success");
            setFormData({ name: '', email: '' });
            context.setselectedCountry(''); // Reset the selected location
        } catch (error) {
            Swal.fire("Error", "Error adding Stock Manager", "error");
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Add Stock Manager</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Add Stock Manager"
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                </div>
            </div>

            <div className="card shadow border-0 p-4 mt-4">
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                    />
                    <FormControl fullWidth variant="outlined">
                        <InputLabel htmlFor="location"></InputLabel>
                        <CountryDropdown selectedLocation={context.selectedCountry} />
                    </FormControl>
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
                        Add Stock Manager
                    </Button>
                </Box>
            </div>
        </div>
    );
};

export default AddStockManager;
