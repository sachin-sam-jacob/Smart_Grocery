import React, { useContext, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../utils/api'; // Assuming you have a postData function to handle API calls
import { MyContext } from "../../App";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const context = useContext(MyContext);

    useEffect(() => {
        context.setisHeaderFooterShow(false);
    }, [context]);

    const handleResetPassword = async () => {
        try {
            const response = await postData('/api/forgotpassword', { email });
            if (response.error) {
                setError(response.msg);
            } else {
                setSuccess('Verification code sent to your email.');
                navigate('/verify-code', { state: { email } });
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Forgot Password</h2>
            {error && <p style={styles.errorMsg}>{error}</p>}
            {success && <p style={styles.successMsg}>{success}</p>}
            <TextField
                label="Enter your email"
                value={email}
                onChange={handleEmailChange}
                variant="outlined"
                fullWidth
                style={styles.textField}
            />
            <div style={styles.buttonContainer}>
                <Button
                    onClick={handleResetPassword}
                    variant="contained"
                    color="primary"
                    style={styles.resetButton}
                >
                    Reset Password
                </Button>
                <Button
                    onClick={() => window.location.replace('/signin')}
                    variant="outlined"
                    color="secondary"
                    style={styles.cancelButton}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: 'auto',
    },
    heading: {
        marginBottom: '20px',
        color: '#333',
        fontWeight: '600',
    },
    errorMsg: {
        color: 'red',
        marginBottom: '10px',
        fontSize: '14px',
    },
    successMsg: {
        color: 'green',
        marginBottom: '10px',
        fontSize: '14px',
    },
    textField: {
        marginBottom: '20px',
        borderRadius: '8px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
    },
    resetButton: {
        flex: 1,
        marginRight: '10px',
        backgroundColor: '#007BFF',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '16px',
        textTransform: 'none',
    },
    cancelButton: {
        flex: 1,
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '16px',
        textTransform: 'none',
        color: '#333',
        borderColor: '#333',
    },
};

export default ForgotPassword;
