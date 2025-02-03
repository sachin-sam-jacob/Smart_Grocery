import React, { useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Paper,
    Tooltip
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoIcon from '@mui/icons-material/Info';
import { postData } from '../../utils/api';

const AIDescription = ({ productName, onDescriptionGenerated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateDescription = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await postData('/api/ai-description/generate-description', {
                productName
            });

            if (response.success) {
                onDescriptionGenerated(response.data);
            } else {
                throw new Error(response.error || 'Failed to generate description');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
                variant="outlined"
                startIcon={<AutoFixHighIcon />}
                onClick={generateDescription}
                disabled={loading}
                size="small"
                sx={{
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                        borderColor: '#115293',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                }}
            >
                {loading ? (
                    <>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        Generating...
                    </>
                ) : (
                    'View AI Details'
                )}
            </Button>

            <Tooltip title="Get AI-generated product details including nutritional information and usage suggestions">
                <InfoIcon sx={{ color: '#666', fontSize: 20 }} />
            </Tooltip>

            {error && (
                <Paper sx={{ p: 1, backgroundColor: '#ffebee' }}>
                    <Typography color="error" variant="caption">
                        {error}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default AIDescription; 