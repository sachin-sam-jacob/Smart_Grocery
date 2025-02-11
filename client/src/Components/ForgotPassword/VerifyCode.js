import React, {useContext, useState,useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { postData } from '../../utils/api';
import { MyContext } from "../../App";

const VerifyCode = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state;

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const context = useContext(MyContext);

    useEffect(() => {
        context.setisHeaderFooterShow(false);
    }, [context]);

    const handleVerifyCode = async () => {
        try {
            const response = await postData('/api/verifycode', { email, code });
            if (response.error) {
                setError(response.msg);
            } else {
                navigate('/reset-password', { state: { email } });
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Verify Code</h2>
            {error && <p style={styles.errorMsg}>{error}</p>}
            <TextField
                label="Enter 4-digit code"
                value={code}
                onChange={handleCodeChange}
                variant="outlined"
                fullWidth
                style={styles.textField}
            />
            <div style={styles.buttonContainer}>
                <Button
                    onClick={handleVerifyCode}
                    variant="contained"
                    color="primary"
                    style={styles.verifyButton}
                >
                    Verify Code
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
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: 'auto',
    },
    heading: {
        marginBottom: '20px',
        color: '#333',
        fontWeight: '600',
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
    verifyButton: {
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

export default VerifyCode;
