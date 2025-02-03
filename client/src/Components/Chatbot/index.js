import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    CircularProgress,
    Fab,
    Collapse,
    Avatar,
    Chip,
    Tooltip,
    Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { postData } from '../../utils/api';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 3px 15px rgba(33, 150, 243, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 3px 20px rgba(33, 150, 243, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 3px 15px rgba(33, 150, 243, 0.3);
  }
`;

const StyledFab = styled(Fab)(({ theme, isOpen }) => ({
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    boxShadow: '0 3px 15px rgba(33, 150, 243, 0.3)',
    animation: isOpen ? 'none' : `${pulse} 2s infinite`,
    '&:hover': {
        background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 90%)',
        transform: 'scale(1.1)',
        transition: 'transform 0.3s ease'
    }
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '350px',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    borderRadius: '12px',
    overflow: 'hidden'
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #1976d2 0%, #2196F3 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    '& .MuiTypography-root': {
        fontWeight: 600,
        fontSize: '1.1rem',
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.3rem',
    }
}));

const MessageContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#f8fafc',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#c0c0c0',
        borderRadius: '10px',
        '&:hover': {
            background: '#a8a8a8',
        },
    },
}));

const Message = styled(Box)(({ isUser, theme }) => ({
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: isUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser ? '#1976d2' : 'white',
    color: isUser ? 'white' : '#2c3e50',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    transition: 'all 0.3s ease',
    margin: '4px 0',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
}));

const SuggestedQuestions = styled(Box)(({ theme }) => ({
    padding: '12px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    backgroundColor: 'white',
    '& .MuiChip-root': {
        borderRadius: '16px',
        transition: 'all 0.2s ease',
        backgroundColor: '#f0f7ff',
        color: '#1976d2',
        '&:hover': {
            backgroundColor: '#1976d2',
            color: 'white',
            transform: 'translateY(-1px)',
        }
    }
}));

const predefinedQuestions = [
    "What are today's deals?",
    "Track my order",
    "Return policy",
    "Product recommendations",
    "Delivery options"
];

const QuoteBox = styled(Box)(({ theme }) => ({
    position: 'fixed',
    bottom: '85px',
    right: '30px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    zIndex: 999,
    width: '250px',
    animation: `${fadeInUp} 0.5s ease`,
    border: '1px solid rgba(25, 118, 210, 0.1)',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-8px',
        right: '28px',
        width: '16px',
        height: '16px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        transform: 'rotate(45deg)',
        borderRight: '1px solid rgba(25, 118, 210, 0.1)',
        borderBottom: '1px solid rgba(25, 118, 210, 0.1)',
    }
}));

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const wave = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isOpen && chatHistory.length === 0) {
            // Add welcome message when chat is opened
            setChatHistory([{
                role: 'assistant',
                content: "Hello! I'm your shopping assistant. How can I help you today?"
            }]);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleQuestionClick = (question) => {
        setMessage(question);
        handleSend(question);
    };

    const handleSend = async (customMessage = null) => {
        const messageToSend = customMessage || message;
        if (!messageToSend.trim()) return;

        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: messageToSend }]);
        setIsLoading(true);

        try {
            const response = await postData('/api/chatbot/chat', {
                message: messageToSend
            });

            if (response.success) {
                setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const textFieldStyles = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            backgroundColor: '#f8fafc',
            '&:hover fieldset': {
                borderColor: '#1976d2',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
            }
        },
        '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
            fontSize: '0.95rem',
        }
    };

    return (
        <>
            {!isOpen && (
                <Zoom in={true}>
                    <QuoteBox 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 500, 
                                color: '#1976d2',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                lineHeight: 1.4,
                                fontSize: '0.95rem'
                            }}
                        >
                            <span 
                                role="img" 
                                aria-label="wave"
                                style={{
                                    display: 'inline-block',
                                    animation: isHovered ? `${wave} 2.5s infinite` : 'none',
                                    transformOrigin: '70% 70%',
                                    fontSize: '1.2rem'
                                }}
                            >
                                👋
                            </span>
                            Hey! I'm your shopping assistant. Need help?
                        </Typography>
                    </QuoteBox>
                </Zoom>
            )}
            
            <Tooltip 
                title={isOpen ? "Close chat" : "Chat with me!"} 
                placement="left"
                TransitionComponent={Zoom}
            >
                <StyledFab
                    isOpen={isOpen}
                    onClick={() => {
                        setIsOpen(!isOpen);
                    }}
                    sx={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000,
                    }}
                >
                    {isOpen ? (
                        <CloseIcon />
                    ) : (
                        <ForumRoundedIcon 
                            sx={{ 
                                fontSize: '28px',
                                transform: 'scaleX(-1)' // Flip the icon horizontally
                            }} 
                        />
                    )}
                </StyledFab>
            </Tooltip>

            <Collapse in={isOpen}>
                <ChatWindow>
                    <ChatHeader>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SmartToyIcon />
                            <Typography variant="h6">Shopping Assistant</Typography>
                        </Box>
                    </ChatHeader>

                    <MessageContainer>
                        {chatHistory.map((msg, index) => (
                            <Message key={index} isUser={msg.role === 'user'}>
                                <Avatar sx={{ 
                                    width: 28, 
                                    height: 28,
                                    bgcolor: msg.role === 'user' ? '#1565c0' : '#4caf50',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    border: '2px solid white'
                                }}>
                                    {msg.role === 'user' ? <PersonIcon sx={{ fontSize: 16 }} /> : <SmartToyIcon sx={{ fontSize: 16 }} />}
                                </Avatar>
                                <Typography 
                                    sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {msg.content}
                                </Typography>
                            </Message>
                        ))}
                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </MessageContainer>

                    <SuggestedQuestions>
                        {predefinedQuestions.map((question, index) => (
                            <Chip
                                key={index}
                                label={question}
                                onClick={() => handleQuestionClick(question)}
                                sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                        color: 'white'
                                    }
                                }}
                            />
                        ))}
                    </SuggestedQuestions>

                    <Box sx={{ p: 2, backgroundColor: 'white' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            sx={textFieldStyles}
                            InputProps={{
                                endAdornment: (
                                    <IconButton 
                                        onClick={() => handleSend()}
                                        color="primary"
                                        disabled={isLoading}
                                        sx={{
                                            backgroundColor: message.trim() ? '#1976d2' : 'transparent',
                                            color: message.trim() ? 'white' : '#1976d2',
                                            '&:hover': {
                                                backgroundColor: message.trim() ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                                            },
                                            marginRight: '-8px'
                                        }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                )
                            }}
                        />
                    </Box>
                </ChatWindow>
            </Collapse>
        </>
    );
};

export default Chatbot; 