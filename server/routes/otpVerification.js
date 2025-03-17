const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { User } = require('../models/user');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Store OTP temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: true,
                msg: "Email Already Exists",
                details: "This email address is already registered. Please use a different email or sign in."
            });
        }

        // Generate OTP
        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            timestamp: Date.now(),
            attempts: 0
        });

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            msg: "OTP sent successfully",
            details: "Please check your email for the verification code."
        });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            error: true,
            msg: "Failed to send OTP",
            details: "Something went wrong while sending the verification code."
        });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        const otpData = otpStore.get(email);
        
        if (!otpData) {
            return res.status(400).json({
                error: true,
                msg: "Invalid Request",
                details: "No OTP request found for this email."
            });
        }

        // Check if OTP has expired (10 minutes)
        if (Date.now() - otpData.timestamp > 600000) {
            otpStore.delete(email);
            return res.status(400).json({
                error: true,
                msg: "OTP Expired",
                details: "The verification code has expired. Please request a new one."
            });
        }

        // Check attempts
        if (otpData.attempts >= 3) {
            otpStore.delete(email);
            return res.status(400).json({
                error: true,
                msg: "Too Many Attempts",
                details: "Too many failed attempts. Please request a new OTP."
            });
        }

        // Verify OTP
        if (otpData.otp !== parseInt(otp)) {
            otpData.attempts++;
            return res.status(400).json({
                error: true,
                msg: "Invalid OTP",
                details: "The verification code is incorrect. Please try again."
            });
        }

        // Clear OTP data
        otpStore.delete(email);

        res.status(200).json({
            success: true,
            msg: "OTP Verified Successfully",
            details: "Email verified successfully."
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            error: true,
            msg: "Verification Failed",
            details: "Something went wrong while verifying the code."
        });
    }
});

module.exports = router; 