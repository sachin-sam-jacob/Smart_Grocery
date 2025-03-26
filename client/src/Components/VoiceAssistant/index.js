import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Dialog, DialogContent, Typography, Box, Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import styled from 'styled-components';
import { postData } from '../../utils/api';
import CloseIcon from '@mui/icons-material/Close';

const AVAILABLE_COMMANDS = `
Available commands:
- Search: "search for [product]", "find [product]"
- Cart: "show cart", "add [product] to cart"
- Profile: "open profile", "show my account"
- Orders: "show my orders", "order history"
- Help: "help", "what can you do"
`;

const VoiceButton = styled(IconButton)`
  background: linear-gradient(45deg, #0BDA51, #17863c) !important;
  color: white !important;
  z-index: 9998 !important;
  width: 50px;
  height: 50px;
  box-shadow: 0 4px 15px rgba(11, 218, 81, 0.3) !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-in-out !important;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(11, 218, 81, 0.4) !important;
  }

  &.listening {
    animation: pulseAnimation 1.5s ease-in-out infinite;
    background: linear-gradient(45deg, #ff4b4b, #ff0000) !important;
    box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3) !important;
  }

  svg {
    font-size: 26px;
    transition: all 0.3s ease;
  }

  @keyframes pulseAnimation {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: linear-gradient(145deg, #ffffff, #f5f5f5);
    border-radius: 20px !important;
    padding: 0;
    min-width: 350px;
    max-width: 90vw;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
  }
`;

const DialogHeader = styled(Box)`
  background: linear-gradient(45deg, #0BDA51, #17863c);
  color: white;
  padding: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  text-align: center;
  position: relative;
`;

const CloseButton = styled(IconButton)`
  position: absolute !important;
  right: 10px;
  top: 10px;
  color: white !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
`;

const ResponseText = styled(Typography)`
  margin: 15px 0;
  padding: 15px;
  border-radius: 15px;
  background: ${props => props.isUser ? '#e8f5e9' : '#f5f5f5'};
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  
  &.user-message {
    margin-right: 20px;
    margin-left: 10px;
  }
  
  &.assistant-message {
    margin-left: 20px;
    margin-right: 10px;
  }
`;

const StatusIndicator = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.isListening ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.isListening ? '#ff4b4b' : '#4CAF50'};
    animation: ${props => props.isListening ? 'pulse 1.5s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const HelpDialog = styled(Dialog)`
  .MuiDialog-paper {
    padding: 20px;
    max-width: 400px;
  }
`;

const RetryButton = styled(Button)`
  background: linear-gradient(135deg, #0BDA51, #17863c) !important;
  color: white !important;
  padding: 8px 24px !important;
  border-radius: 24px !important;
  margin-top: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  text-transform: none !important;
  font-size: 1rem !important;
  box-shadow: 0 4px 15px rgba(11, 218, 81, 0.2) !important;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(11, 218, 81, 0.3) !important;
    background: linear-gradient(135deg, #17863c, #0BDA51) !important;
  }

  .MuiSvgIcon-root {
    margin-right: 8px;
  }
`;

const VoiceAssistant = ({ addToCart, navigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recognitionFailed, setRecognitionFailed] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();
        console.log('Voice command received:', command);
        setTranscript(command);
        await processVoiceCommand(command);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setResponse('Error: Could not understand. Please try again.');
        setRecognitionFailed(true);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        if (!transcript) {
          setRecognitionFailed(true);
          setResponse('I couldn\'t hear anything. Please try again.');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);

  const startListening = () => {
    try {
      setIsListening(true);
      setShowDialog(true);
      setTranscript('');
      setResponse('');
      setRecognitionFailed(false);
      if (recognitionRef.current) {
        recognitionRef.current.start();
        console.log('Started listening...');
      }
    } catch (error) {
      console.error('Error starting recognition:', error);
      setResponse('Error starting voice recognition. Please try again.');
      setRecognitionFailed(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleRetry = () => {
    setRecognitionFailed(false);
    setResponse('');
    setTranscript('');
    startListening();
  };

  const processVoiceCommand = async (command) => {
    console.log('Processing command:', command);
    try {
      // Help command
      if (command.includes('help') || command.includes('what can you do')) {
        setResponse(AVAILABLE_COMMANDS);
        setShowHelp(true);
        return;
      }

      // Profile commands
      if (command.includes('profile') || command.includes('account')) {
        if (command.includes('open') || command.includes('show') || command.includes('view')) {
          setResponse('Opening your profile...');
          setTimeout(() => {
            navigate('/my-account');
          }, 1000);
          return;
        }
      }

      // Orders commands
      if (command.includes('orders') || command.includes('order history')) {
        setResponse('Opening your orders...');
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
        return;
      }

      // Improved search command handling
      if (command.includes('search for') || command.includes('find') || command.includes('search')) {
        let searchTerm = command
          .replace(/(search for|search|find)/gi, '')
          .trim();

        if (!searchTerm) {
          setResponse('What would you like to search for?');
          return;
        }

        setResponse(`Searching for "${searchTerm}"...`);
        
        try {
          const data = await postData('/api/voice-assistant/process', {
            command: `search for ${searchTerm}`
          });
          
          console.log('Search response:', data);

          if (data.products && data.products.length > 0) {
            setResponse(`Found ${data.products.length} products matching "${searchTerm}"`);
            
            // Store search results in localStorage with proper formatting
            try {
              localStorage.setItem('voiceSearchResults', JSON.stringify({
                term: searchTerm,
                results: data.products,
                timestamp: new Date().getTime()
              }));
              
              console.log('Search results stored in localStorage');
              
              // Navigate to search page with query parameter
              setTimeout(() => {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}&source=voice`);
              }, 1500);
            } catch (storageError) {
              console.error('Error storing search results:', storageError);
              // Still navigate even if storage fails
              setTimeout(() => {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
              }, 1500);
            }
          } else {
            setResponse(`No products found for "${searchTerm}". Try a different search term.`);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResponse('Sorry, there was an error performing the search. Please try again.');
        }
        return;
      }

      if (command.includes('cart')) {
        if (command.includes('view') || command.includes('show') || command.includes('open')) {
          setResponse('Opening your cart...');
          setTimeout(() => {
            navigate('/cart');
          }, 1000);
          return;
        }

        if (command.includes('add')) {
          const response = await postData('/api/voice-assistant/process', {
            command: command
          });

          setResponse(response.message);

          if (response.product) {
            setTimeout(() => {
              addToCart(response.product);
            }, 1000);
          }
          return;
        }
      }

      // For other commands, send to backend
      const response = await postData('/api/voice-assistant/process', {
        command: command
      });

      setResponse(response.message);

      switch (response.intent) {
        case 'openProfile':
          setTimeout(() => {
            navigate('/my-account');
          }, 1000);
          break;
        case 'search':
          if (response.products && response.products.length > 0) {
            setTimeout(() => {
              navigate(`/search?q=${response.searchTerm}`);
            }, 1500);
          }
          break;
        case 'addToCart':
          if (response.product) {
            setTimeout(() => {
              addToCart(response.product);
            }, 1000);
          }
          break;
        case 'viewCart':
          setTimeout(() => {
            navigate('/cart');
          }, 1000);
          break;
        default:
          setResponse('I heard you say: ' + command + '. How can I help you with that?');
          break;
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setResponse('Sorry, I couldn\'t process that command. Try saying "help" for available commands.');
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    stopListening();
    setTranscript('');
    setResponse('');
  };

  return (
    <div className="voice-assistant-container">
      <VoiceButton 
        onClick={isListening ? stopListening : startListening}
        size="large"
        aria-label="voice assistant"
        className={isListening ? 'listening' : ''}
      >
        {isListening ? <StopIcon /> : <MicIcon />}
      </VoiceButton>

      <StyledDialog 
        open={showDialog} 
        onClose={handleClose}
        aria-labelledby="voice-assistant-dialog"
      >
        <DialogHeader>
          <StatusIndicator isListening={isListening}>
            <div className="status-dot" />
            <Typography variant="h6">
              {isListening ? 'Listening...' : 'Voice Assistant'}
            </Typography>
          </StatusIndicator>
          <CloseButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </DialogHeader>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ 
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {transcript && (
              <ResponseText 
                variant="body1" 
                isUser 
                className="user-message"
              >
                <strong>You:</strong> {transcript}
              </ResponseText>
            )}
            {response && (
              <ResponseText 
                variant="body1" 
                className="assistant-message"
              >
                <strong>Assistant:</strong> {response}
              </ResponseText>
            )}
            {recognitionFailed && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 2,
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <RetryButton
                  onClick={handleRetry}
                  startIcon={<MicIcon />}
                  variant="contained"
                >
                  Try Again
                </RetryButton>
              </Box>
            )}
          </Box>
        </DialogContent>
      </StyledDialog>

      <HelpDialog 
        open={showHelp} 
        onClose={() => setShowHelp(false)}
        PaperProps={{
          style: {
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          }
        }}
      >
        <DialogHeader>
          <Typography variant="h6">Voice Commands</Typography>
          <CloseButton onClick={() => setShowHelp(false)} size="small">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </DialogHeader>
        <DialogContent>
          <Typography variant="body1" style={{ whiteSpace: 'pre-line', padding: '20px' }}>
            {AVAILABLE_COMMANDS}
          </Typography>
        </DialogContent>
      </HelpDialog>
    </div>
  );
};

export default VoiceAssistant; 