import { useState, useContext } from 'react';
import { MyContext } from '../../App';
import { postData } from '../../utils/api';
import { TextField, Button, Card, CircularProgress } from '@mui/material';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Swal from 'sweetalert2';

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

const AddSupplier = () => {
    const { setAlertBox } = useContext(MyContext);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        district: JSON.parse(localStorage.getItem('user'))?.location || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await postData('/api/stockManagers/add-supplier', formData);
            
            if (response && !response.success) {
                throw new Error(response.message || 'Failed to add supplier');
            }

            Swal.fire("Success", "Supplier Added Successfully!", "success");
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                district: formData.district
            });

        } catch (error) {
            console.error('Error adding supplier:', error);
            Swal.fire("Error", error.message || "Failed to add supplier", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Add Supplier for {formData.district}</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                            component="a"
                            href="#"
                            label="Dashboard"
                            icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                            label="Add Supplier"
                            deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                </div>
            </div>

            <div className="card shadow border-0 p-4 mt-4">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <TextField
                            fullWidth
                            label="Supplier Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            variant="outlined"
                        />
                        
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            variant="outlined"
                        />
                        
                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                            variant="outlined"
                        />
                        
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={isLoading}
                            sx={{ 
                                marginTop: '20px',
                                padding: '10px 20px',
                                fontSize: '1rem',
                                alignSelf: 'flex-start'
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Add Supplier'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSupplier; 