import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Alert,
    CircularProgress,
    Fab,
    Tooltip,
    MenuItem,
    Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MyContext } from '../../MyContext';
import { fetchDataFromApi, postData, updateData, deleteData } from '../../utils/api';
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles';

// Custom SweetAlert2 styles
const sweetAlertStyles = {
    customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button'
    },
    buttonsStyling: false,
    target: 'body'
};

// Add styles to document head
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .custom-swal-popup {
        font-family: 'Inter', sans-serif !important;
        padding: 2rem !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1) !important;
    }

    .custom-swal-title {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        color: #2c3e50 !important;
        padding: 1rem 0 !important;
    }

    .custom-swal-html {
        font-size: 1rem !important;
        color: #4a5568 !important;
        padding: 1rem 0 !important;
    }

    .custom-swal-confirm-button {
        background-color: #3085d6 !important;
        color: white !important;
        padding: 0.75rem 1.5rem !important;
        font-weight: 500 !important;
        border-radius: 8px !important;
        margin: 0.5rem !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
    }

    .custom-swal-confirm-button:hover {
        background-color: #2c77c0 !important;
        transform: translateY(-1px) !important;
    }

    .custom-swal-cancel-button {
        background-color: #d33 !important;
        color: white !important;
        padding: 0.75rem 1.5rem !important;
        font-weight: 500 !important;
        border-radius: 8px !important;
        margin: 0.5rem !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
    }

    .custom-swal-cancel-button:hover {
        background-color: #bf2e2e !important;
        transform: translateY(-1px) !important;
    }

    .swal2-actions {
        gap: 1rem !important;
    }
`;
document.head.appendChild(styleSheet);

const ProductManagement = () => {
    const [open, setOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [progress, setProgress] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [userId, setUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        quantityType: 'piece',
        category: '',
        minStockAlert: '',
        alternateNames: [],
        tags: []
    });

    const quantityTypes = [
        { value: 'kg', label: 'Kilogram (kg)' },
        { value: 'piece', label: 'Piece' },
        { value: 'liter', label: 'Liter (L)' },
        { value: 'gram', label: 'Gram (g)' },
        { value: 'dozen', label: 'Dozen' },
        { value: 'box', label: 'Box' },
        { value: 'pack', label: 'Pack' }
    ];

    const updateProgress = (value) => {
        setProgress(value);
    };

    useEffect(() => {
        // Get userId from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setUserId(decodedToken.id);
            } catch (error) {
                console.error('Error decoding token:', error);
                setError('Error getting user information');
            }
        }
    }, []);

    const fetchProducts = async () => {
        try {
            if (!userId) {
                console.error('Invalid userId:', userId);
                setError('Invalid user ID');
                setProducts([]);
                return;
            }

            setLoading(true);
            const response = await fetchDataFromApi(`/api/supplier-products/supplier/${userId}`);
            if (response && Array.isArray(response)) {
                setProducts(response);
            } else {
                setProducts([]);
                console.error('Invalid response format:', response);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.response?.data?.error || 'Error fetching products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProducts();
        }
    }, [userId]);

    const handleOpen = () => {
        setOpen(true);
        setEditProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            quantity: '',
            quantityType: 'piece',
            category: '',
            minStockAlert: '',
            alternateNames: [],
            tags: []
        });
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            quantityType: product.quantityType || 'piece',
            category: product.category,
            minStockAlert: product.minStockAlert,
            alternateNames: product.alternateNames || [],
            tags: product.tags || []
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditProduct(null);
    };

    const handleSubmit = async () => {
        try {
            if (!userId) {
                await Swal.fire({
                    title: 'Error!',
                    text: 'Invalid user ID',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    background: '#fff',
                    ...sweetAlertStyles
                });
                return;
            }

            if (!formData.name || !formData.price || !formData.quantity || !formData.quantityType) {
                await Swal.fire({
                    title: 'Error!',
                    text: 'Please fill in all required fields',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    background: '#fff',
                    ...sweetAlertStyles
                });
                return;
            }

            setLoading(true);
            updateProgress(30);
            
            const dataToSubmit = {
                name: formData.name,
                description: formData.description || '',
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                quantityType: formData.quantityType,
                category: formData.category || '',
                minStockAlert: Number(formData.minStockAlert) || 10,
                alternateNames: formData.alternateNames || [],
                tags: formData.tags || [],
                supplierId: userId
            };

            console.log('Submitting data:', dataToSubmit);

            if (editProduct) {
                await updateData(`/api/supplier-products/${editProduct._id}`, dataToSubmit);
            } else {
                await postData('/api/supplier-products', dataToSubmit);
            }
            
            await fetchProducts();
            handleClose();
            
            // Show success message
            await Swal.fire({
                title: 'Success!',
                text: editProduct ? 'Product updated successfully' : 'Product added successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#fff',
                ...sweetAlertStyles
            });

            updateProgress(100);
        } catch (error) {
            console.error('Error submitting product:', error);
            
            // Show error message
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to ' + (editProduct ? 'update' : 'add') + ' product: ' + 
                      (error.response?.data?.error || error.message),
                icon: 'error',
                confirmButtonColor: '#3085d6',
                background: '#fff',
                ...sweetAlertStyles
            });
            
            updateProgress(100);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                background: '#fff',
                ...sweetAlertStyles
            });

            if (result.isConfirmed) {
                setLoading(true);
                await deleteData(`/api/supplier-products/${id}`);
                await fetchProducts();
                
                // Show success message
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Product has been deleted successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#fff',
                    ...sweetAlertStyles
                });
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            
            // Show error message
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to delete product: ' + (error.response?.data?.error || error.message),
                icon: 'error',
                confirmButtonColor: '#3085d6',
                background: '#fff',
                ...sweetAlertStyles
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            p: 3, 
            backgroundColor: '#fff', 
            borderRadius: '12px', 
            position: 'relative', 
            minHeight: '80vh',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            margin: '20px'
        }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid #eee'
            }}>
                <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: '#2c3e50',
                    fontSize: '1.5rem',
                    letterSpacing: '-0.5px',
                    paddingTop: '50px'
                }}>
                    Product Management
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

            {products.length === 0 ? (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    mt: 2,
                    border: '2px dashed #e0e0e0'
                }}>
                    <Typography variant="h6" sx={{ 
                        color: '#6c757d', 
                        mb: 1,
                        fontWeight: 500 
                    }}>
                        No Products Found
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: '#8c98a4', 
                        mb: 3,
                        fontSize: '0.95rem'
                    }}>
                        Start by adding your first product
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ 
                    boxShadow: 'none', 
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem',
                                    py: 2
                                }}>Name</TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                }}>Description</TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                }}>Price per Unit</TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                }}>Quantity</TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                }}>Quantity Type</TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                }}>Category</TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                }}>Min Stock Alert</TableCell>
                                <TableCell sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow 
                                    key={product._id}
                                    sx={{ 
                                        '&:hover': { 
                                            backgroundColor: '#f8f9fa' 
                                        },
                                        transition: 'background-color 0.2s ease'
                                    }}
                                >
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{product.name}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{product.description}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>
                                        ₹{product.price}/{product.quantityType}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{product.quantity}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{product.quantityType}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{product.category}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{product.minStockAlert}</TableCell>
                                    <TableCell>
                                        <IconButton 
                                            onClick={() => handleEdit(product)}
                                            sx={{ 
                                                color: '#0858f7',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(8, 88, 247, 0.08)'
                                                }
                                            }}
                                        >
                                            <EditIcon sx={{ fontSize: '1.2rem' }} />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleDelete(product._id)}
                                            sx={{ 
                                                color: '#dc3545',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(220, 53, 69, 0.08)'
                                                }
                                            }}
                                        >
                                            <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Tooltip title="Add Product" placement="left">
                <Fab 
                    color="primary" 
                    aria-label="add"
                    onClick={handleOpen}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        backgroundColor: '#0858f7',
                        '&:hover': {
                            backgroundColor: '#0646c6',
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 16px rgba(8, 88, 247, 0.4)'
                        },
                        boxShadow: '0 4px 12px rgba(8, 88, 247, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:active': {
                            transform: 'scale(0.95)'
                        },
                        zIndex: 1000
                    }}
                >
                    <AddIcon />
                </Fab>
            </Tooltip>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    borderBottom: '1px solid #eee', 
                    pb: 2,
                    fontWeight: 600,
                    color: '#2c3e50'
                }}>
                    {editProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            label={`Price per ${formData.quantityType || 'unit'}`}
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <span style={{ color: '#666' }}>₹</span>
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            label="Quantity Type"
                            value={formData.quantityType}
                            onChange={(e) => {
                                console.log('Selected quantity type:', e.target.value);
                                setFormData({ 
                                    ...formData, 
                                    quantityType: e.target.value 
                                });
                            }}
                            margin="normal"
                            variant="outlined"
                            sx={{ minWidth: '150px' }}
                            required
                        >
                            {quantityTypes.map((option) => (
                                <MenuItem 
                                    key={option.value} 
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <TextField
                        fullWidth
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Minimum Stock Alert"
                        type="number"
                        value={formData.minStockAlert}
                        onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ 
                    borderTop: '1px solid #eee', 
                    p: 2.5,
                    gap: 1
                }}>
                    <Button 
                        onClick={handleClose}
                        sx={{ 
                            color: '#6c757d',
                            '&:hover': {
                                backgroundColor: 'rgba(108, 117, 125, 0.08)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        sx={{
                            backgroundColor: '#0858f7',
                            '&:hover': {
                                backgroundColor: '#0646c6'
                            },
                            textTransform: 'none',
                            borderRadius: '8px',
                            boxShadow: 'none',
                            px: 3
                        }}
                    >
                        {editProduct ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity={snackbarSeverity}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductManagement;

// Add this CSS to your styles file or use styled-components
const styles = `
    .MuiFab-root {
        animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .MuiFab-root:hover {
        transform: scale(1.05);
    }
`; 