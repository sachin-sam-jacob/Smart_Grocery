import React, { useState } from 'react';
import { fetchDataFromApi, postData, postsData } from '../../utils/api';
import { Box, Button, Modal, Typography, CircularProgress } from '@mui/material';
import { useContext } from 'react';
import { MyContext } from '../../App';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import styled from '@emotion/styled';
import { IoClose } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";
import jsPDF from 'jspdf';

// Styled components
const StyledButton = styled(Button)`
    background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
    border-radius: 8px;
    border: 0;
    color: white;
    height: 42px;
    padding: 0 20px;
    box-shadow: 0 3px 5px 2px rgba(33, 203, 243, .3);
    transition: all 0.3s ease;
    text-transform: none;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    margin-bottom: 10px;
    
    &:hover {
        background: linear-gradient(45deg, #1976D2 30%, #00B4E5 90%);
        transform: translateY(-2px);
        box-shadow: 0 6px 10px 2px rgba(33, 203, 243, .3);
    }

    &:disabled {
        background: #ccc;
        transform: none;
        box-shadow: none;
    }

    .MuiCircularProgress-root {
        margin-right: 10px;
    }
`;

const ModalContent = styled(Box)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    max-width: 600px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 24px;
    padding-top: 60px;
    max-height: 70vh;
    overflow-y: auto;
    margin-top: 20px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    h2 {
        color: #1976D2;
        margin-bottom: 20px;
        font-weight: 600;
        font-size: 24px;
    }

    h5 {
        color: #2196F3;
        margin-top: 20px;
        font-weight: 500;
        font-size: 18px;
    }

    h6 {
        color: #333;
        margin-top: 14px;
        font-weight: 500;
        font-size: 16px;
    }

    ul, ol {
        margin: 12px 0;
        padding-left: 20px;
    }

    li {
        margin: 6px 0;
        line-height: 1.5;
        color: #555;
        font-size: 14px;
    }

    @media (max-width: 768px) {
        width: 90%;
        padding: 20px;
    }
`;

const ModalButton = styled(Button)`
    color: #fff;
    min-width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
    background-color: #ed174a;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    margin-left: 8px;
    
    &:hover {
        background-color: #d31543;
        color: #fff;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transform: translateY(-2px);
    }

    svg {
        font-size: 20px;
    }
`;

const ButtonGroup = styled(Box)`
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    gap: 8px;
    z-index: 10;
`;

const RecipeRecommendation = ({ cartItems }) => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const context = useContext(MyContext);

    const getRecipes = async () => {
        try {
            setIsLoading(true);
            
            if (!cartItems || cartItems.length === 0) {
                throw new Error('No items in cart');
            }

            const products = cartItems.map(item => ({
                name: item.productTitle,
                quantity: item.quantity,
                weight: item.weight
            }));
            
            const response = await postData('/api/recipes', { products });

            if (!response || response.error) {
                throw new Error(response?.msg || 'Failed to get recipes');
            }

            setRecipes(response);
            setIsOpen(true);
        } catch (error) {
            console.error('Error getting recipes:', error);
            context.setAlertBox({
                open: true,
                error: true,
                msg: error.message || 'Failed to get recipes'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        let yPos = 30;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        // Add title with proper centering
        doc.setFontSize(20);
        doc.text('Recipe Suggestions', pageWidth/2, 20, { align: 'center' });

        recipes.forEach((recipe, index) => {
            // Check if we need a new page before adding content
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 30;
            }

            // Recipe name
            doc.setFontSize(16);
            const splitTitle = doc.splitTextToSize(recipe.name, maxWidth);
            doc.text(splitTitle, margin, yPos);
            yPos += 10 * splitTitle.length;

            // Check page break before ingredients
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 30;
            }

            // Ingredients
            doc.setFontSize(12);
            yPos += 5;
            doc.text('Ingredients:', margin, yPos);
            yPos += 10;
            recipe.ingredients.forEach(ingredient => {
                // Check page break before each ingredient
                if (yPos > pageHeight - 20) {
                    doc.addPage();
                    yPos = 30;
                }
                const splitIngredient = doc.splitTextToSize(`• ${ingredient}`, maxWidth - 5);
                doc.text(splitIngredient, margin + 5, yPos);
                yPos += 7 * splitIngredient.length;
            });

            // Check page break before instructions
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 30;
            }

            // Instructions
            yPos += 5;
            doc.text('Instructions:', margin, yPos);
            yPos += 10;
            recipe.instructions.forEach((instruction, i) => {
                // Check page break before each instruction
                if (yPos > pageHeight - 20) {
                    doc.addPage();
                    yPos = 30;
                }
                const splitInstruction = doc.splitTextToSize(`${i + 1}. ${instruction}`, maxWidth - 5);
                doc.text(splitInstruction, margin + 5, yPos);
                yPos += 7 * splitInstruction.length;
            });

            // Add space between recipes and check for page break
            if (index < recipes.length - 1) {
                yPos += 20;
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 30;
                }
            }
        });

        doc.save('recipes.pdf');
    };

    return (
        <>
            <StyledButton
                onClick={getRecipes}
                disabled={isLoading || cartItems.length === 0}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" id="loading" /> : <RestaurantIcon />}
            >
                {isLoading ? 'Getting Recipes...' : 'Get Recipe Suggestions'}
            </StyledButton>

            <Modal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                aria-labelledby="recipe-modal-title"
                style={{ marginTop: '60px' }}
            >
                <ModalContent>
                    <ButtonGroup>
                        <ModalButton onClick={downloadPDF}>
                            <FaDownload />
                        </ModalButton>
                        <ModalButton onClick={() => setIsOpen(false)}>
                            <IoClose />
                        </ModalButton>
                    </ButtonGroup>

                    <Typography variant="h4" component="h2">
                        Recipe Suggestions
                    </Typography>
                    {recipes.map((recipe, index) => (
                        <Box key={index} sx={{ mb: 4 }}>
                            <Typography variant="h5">
                                {recipe.name}
                            </Typography>
                            <Typography variant="h6">
                                Ingredients:
                            </Typography>
                            <ul>
                                {recipe.ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                ))}
                            </ul>
                            <Typography variant="h6">
                                Instructions:
                            </Typography>
                            <ol>
                                {recipe.instructions.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                        </Box>
                    ))}
                </ModalContent>
            </Modal>
        </>
    );
};

export default RecipeRecommendation; 