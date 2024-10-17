import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDataFromApi, postData } from '../../utils/api';
import { Box, TextField, Button, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import swal from 'sweetalert2';

const CancelOrder = () => {
    const [reason, setReason] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDataFromApi(`/api/orders/${id}`).then((res) => {
            setOrder(res);
            setLoading(false);
        });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const finalReason = cancelReason === 'Other' ? otherReason : cancelReason;
        try {
            await postData(`/api/orders/${id}/cancel`, { reason: finalReason });
            swal.fire("success","Order Cancelled Successfully","success");
            navigate('/orders', { state: { message: 'Order cancelled successfully' } });
        } catch (error) {
            console.error('Error cancelling order:', error);
            setSubmitting(false);
        }
    };

    if (loading) {
        return <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
    }

    return (
        <Box sx={{
            maxWidth: 600,
            margin: '40px auto',
            padding: '30px',
            backgroundColor: '#f8f8f8',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#333', fontWeight: 'bold', marginBottom: '20px' }}>
                Cancel Order
            </Typography>
            <Box sx={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <Typography variant="body1" gutterBottom sx={{ fontSize: '18px', color: '#555' }}>
                    Order ID: <span style={{ fontWeight: 'bold', color: '#333' }}>{order._id}</span>
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ fontSize: '18px', color: '#555' }}>
                    Total Amount: <span style={{ fontWeight: 'bold', color: '#333' }}>₹{order.amount}</span>
                </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ marginBottom: 3 }}>
                    <InputLabel id="cancel-reason-label">Reason for Cancellation</InputLabel>
                    <Select
                        labelId="cancel-reason-label"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        label="Reason for Cancellation"
                        required
                    >
                        <MenuItem value="Changed my mind">Changed my mind</MenuItem>
                        <MenuItem value="Found a better price elsewhere">Found a better price elsewhere</MenuItem>
                        <MenuItem value="Product no longer needed">Product no longer needed</MenuItem>
                        <MenuItem value="Ordered by mistake">Ordered by mistake</MenuItem>
                        <MenuItem value="Delivery time too long">Delivery time too long</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>
                {cancelReason === 'Other' && (
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        label="Other Reason"
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        required
                        sx={{
                            marginBottom: 3,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#ccc',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#999',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                },
                            },
                        }}
                    />
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting || (cancelReason === 'Other' && !otherReason)}
                    sx={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            backgroundColor: '#1565c0',
                        },
                    }}
                >
                    {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
            </form>
        </Box>
    );
};

export default CancelOrder;
