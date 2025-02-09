import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  Typography, 
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IoIosCamera } from "react-icons/io";
import styled from 'styled-components';
import { postData } from '../../utils/api';
import './VisualSearch.css';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    max-width: 800px;
    width: 100%;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }
`;

const DialogHeader = styled(Box)`
  background: linear-gradient(135deg, #00C6FF, #0072FF);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%);
  }
`;

const ImagePreview = styled(Box)`
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 15px;
  margin: 20px 0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2px dashed #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #0072FF;
    box-shadow: 0 0 0 4px rgba(0,114,255,0.1);
  }
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ResultsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  padding: 24px 0;
`;

const ProductCard = styled(Box)`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  }

  .product-image {
    height: 180px;
    width: 100%;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.02) 100%);
    }
    
    img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }
  }

  &:hover .product-image img {
    transform: scale(1.1);
  }

  .product-info {
    padding: 16px;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .product-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1a202c;
    margin-bottom: 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price {
    color: #0072FF;
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .add-to-cart-btn {
    margin-top: 8px !important;
    background: linear-gradient(135deg, #00C6FF, #0072FF) !important;
    color: white !important;
    padding: 6px 16px !important;
    border-radius: 8px !important;
    font-size: 0.85rem !important;
    text-transform: none !important;
    transition: all 0.3s ease !important;
    opacity: 0;
    transform: translateY(10px);
  }

  &:hover .add-to-cart-btn {
    opacity: 1;
    transform: translateY(0);
  }

  .add-to-cart-btn:hover {
    box-shadow: 0 4px 12px rgba(0,114,255,0.3) !important;
  }
`;

const UploadOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const VisualSearch = ({ buttonStyle = "default" }) => {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setOpen(true);
    setError('');
    setLoading(true);
    setImage(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await postData('/api/visual-search/analyze', formData, true);

      if (response.success) {
        setResults(response.products);
      } else {
        setError(response.message || 'Could not analyze image');
      }
    } catch (err) {
      console.error('Visual search error:', err);
      setError('An error occurred during image analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    setOpen(false);
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="visual-search">
      <Tooltip title="Search by image" arrow placement="bottom">
        <Button 
          className={buttonStyle === "icon" ? "visual-search-icon-btn" : "visual-search-default-btn"}
          onClick={() => document.getElementById('imageInput').click()}
        >
          <IoIosCamera />
          {buttonStyle !== "icon" && <span>&nbsp; Visual Search</span>}
        </Button>
      </Tooltip>

      <input
        type="file"
        id="imageInput"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      <StyledDialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogHeader>
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
            Visual Search
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogHeader>

        <DialogContent sx={{ p: 3 }}>
          <ImagePreview>
            {image ? (
              <img src={image} alt="Preview" />
            ) : (
              <UploadOverlay>
                <IoIosCamera size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Click or drag image to upload
                </Typography>
              </UploadOverlay>
            )}
          </ImagePreview>

          {loading && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexDirection: 'column',
              my: 4 
            }}>
              <CircularProgress size={40} sx={{ color: '#0072FF' }} />
              <Typography sx={{ mt: 2, color: '#64748b' }}>
                Analyzing image...
              </Typography>
            </Box>
          )}

          {error && (
            <Typography 
              color="error" 
              sx={{ 
                textAlign: 'center', 
                my: 2,
                p: 2,
                background: '#FEF2F2',
                borderRadius: '12px',
                color: '#DC2626'
              }}
            >
              {error}
            </Typography>
          )}

          {results.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 3, color: '#1a202c' }}>
                Similar Products
              </Typography>
              <ResultsGrid>
                {results.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    className="product-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="product-image">
                      <img src={product.images[0]} alt={product.name} />
                    </div>
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-price">
                        <span>₹</span>
                        {product.price.toLocaleString()}
                      </div>
                    </div>
                  </ProductCard>
                ))}
              </ResultsGrid>
            </>
          )}
        </DialogContent>
      </StyledDialog>
    </div>
  );
};

export default VisualSearch; 