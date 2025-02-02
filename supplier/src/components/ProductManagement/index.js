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
    MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MyContext } from '../../MyContext';
import { fetchDataFromApi, postData, putData, deleteData } from '../../utils/api';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        quantityType: 'piece',
        category: '',
        minStockAlert: ''
    });
    const [error, setError] = useState('');
    const context = useContext(MyContext);
    const user = JSON.parse(localStorage.getItem('user'));

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
        if (context && context.setProgress) {
            context.setProgress(value);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            updateProgress(30);
            const response = await fetchDataFromApi(`/api/supplier-products/supplier/${user.userId}`);
            setProducts(response);
            updateProgress(100);
        } catch (error) {
            setError('Failed to fetch products');
            updateProgress(100);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
            minStockAlert: ''
        });
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            quantityType: product.quantityType,
            category: product.category,
            minStockAlert: product.minStockAlert
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditProduct(null);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            updateProgress(30);
            if (editProduct) {
                await postData(`/api/supplier-products/${editProduct._id}`, formData);
            } else {
                await postData('/api/supplier-products', {
                    ...formData,
                    supplierId: user.userId
                });
            }
            await fetchProducts();
            handleClose();
            updateProgress(100);
        } catch (error) {
            setError(error.message);
            updateProgress(100);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            updateProgress(30);
            await deleteData(`/api/supplier-products/${id}`);
            await fetchProducts();
            updateProgress(100);
        } catch (error) {
            setError(error.message);
            updateProgress(100);
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
                                }}>Price per {/* Show the quantity type */}
                                    {products.map(product => product.quantityType)}
                                </TableCell>
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
                        />
                        <TextField
                            select
                            fullWidth
                            label="Quantity Type"
                            value={formData.quantityType}
                            onChange={(e) => setFormData({ ...formData, quantityType: e.target.value })}
                            margin="normal"
                            variant="outlined"
                            sx={{ minWidth: '150px' }}
                        >
                            {quantityTypes.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
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