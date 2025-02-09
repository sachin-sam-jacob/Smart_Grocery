import React, { useState } from 'react';
import { 
  IconButton, 
  Dialog, 
  DialogContent, 
  Typography, 
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import styled from 'styled-components';
import { postData } from '../../utils/api';

const VisualSearchButton = styled(IconButton)`
  background: linear-gradient(45deg, #2196F3, #1976D2) !important;
  color: white !important;
  width: 50px;
  height: 50px;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3) !important;
  margin-left: 10px;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4) !important;
  }

  svg {
    font-size: 24px;
  }
`;

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: linear-gradient(145deg, #ffffff, #f5f5f5);
    border-radius: 20px !important;
    padding: 0;
    min-width: 350px;
    max-width: 90vw;
  }
`;

const DialogHeader = styled(Box)`
  background: linear-gradient(45deg, #2196F3, #1976D2);
  color: white;
  padding: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  text-align: center;
  position: relative;
`;

const ImagePreview = styled(Box)`
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 10px;
  margin: 10px 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ResultsContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const ProductCard = styled(Box)`
  padding: 10px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100%;
    height: 100px;
    object-fit: contain;
  }
`;

const VisualSearch = ({ addToCart }) => {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // Test Python server
      const testResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/visual-search/test-python`);
      const testResult = await testResponse.json();
      
      if (!testResult.success) {
        throw new Error('Visual search service is not available');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Send to server
      const response = await postData('/api/visual-search/analyze', formData, true);

      if (response.success) {
        if (response.products.length === 0) {
          setError(response.message || 'No matching products found');
        } else {
          setResults(response.products);
        }
      } else {
        setError(response.message || 'Could not analyze image');
      }
    } catch (err) {
      console.error('Visual search error:', err);
      setError(err.message || 'An error occurred during image analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setOpen(false);
  };

  return (
    <>
      <VisualSearchButton
        onClick={() => setOpen(true)}
        aria-label="visual search"
      >
        <CameraAltIcon />
      </VisualSearchButton>

      <StyledDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogHeader>
          <Typography variant="h6">Visual Search</Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogHeader>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <input
              accept="image/*"
              type="file"
              id="visual-search-input"
              hidden
              onChange={handleImageUpload}
            />
            <label htmlFor="visual-search-input">
              <Button
                variant="contained"
                component="span"
                sx={{ 
                  background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                  mb: 2 
                }}
              >
                Upload Image
              </Button>
            </label>

            {image && (
              <ImagePreview>
                <img src={image} alt="Preview" />
              </ImagePreview>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Typography color="error" sx={{ my: 2 }}>
                {error}
              </Typography>
            )}

            {results.length > 0 && (
              <ResultsContainer>
                {results.map((product) => (
                  <ProductCard key={product._id} onClick={() => handleAddToCart(product)}>
                    <img src={product.images[0]} alt={product.name} />
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      ${product.price}
                    </Typography>
                  </ProductCard>
                ))}
              </ResultsContainer>
            )}
          </Box>
        </DialogContent>
      </StyledDialog>
    </>
  );
};

export default VisualSearch; 