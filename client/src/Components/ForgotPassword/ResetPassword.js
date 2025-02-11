import React, { useContext, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { postData } from '../../utils/api';
import { MyContext } from "../../App";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state;

    const context = useContext(MyContext);

    useEffect(() => {
        context.setisHeaderFooterShow(false);
    }, [context]);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await postData('/api/resetpassword', { email, password });
            if (response.error) {
                setError(response.msg);
            } else {
                navigate('/signIn');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Reset Password</h2>
            {error && <p style={styles.errorMsg}>{error}</p>}
            <TextField
                label="New Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                variant="outlined"
                fullWidth
                style={styles.textField}
            />
            <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                variant="outlined"
                fullWidth
                style={{ ...styles.textField, marginTop: '20px' }}
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
                    onClick={() => window.location.href='/signin'}
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
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: 'auto',
    },
    heading: {
        color: '#333',
        fontWeight: '600',
        marginBottom: '20px',
        textAlign: 'center',
    },
    errorMsg: {
        color: 'red',
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
        backgroundColor: '#007BFF',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '16px',
        textTransform: 'none',
        marginRight: '10px',
    },
    cancelButton: {
        flex: 1,
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '16px',
        textTransform: 'none',
        borderColor: '#333',
        color: '#333',
    },
};

export default ResetPassword;
