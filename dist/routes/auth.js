"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User")); // Import the Sequelize User model
const router = (0, express_1.Router)();
// Register a new user
router.post("/register", async (req, res, next) => {
    try {
        const { email, password, name, phone_number } = req.body;
        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        // Check if user already exists using Sequelize
        const existingUser = await User_1.default.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }
        // Create user using Sequelize Model
        const newUser = await User_1.default.create({
            name,
            email,
            password, // Password will be hashed via User model hooks
            phone_number
        });
        // User data to return (exclude password)
        const userData = newUser.get({ plain: true });
        // Instead of using delete operator, create a new object without the password
        const { password: _, ...userWithoutPassword } = userData;
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1d" });
        // Send response
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map((e) => e.message);
            return res.status(400).json({ message: 'Validation failed', errors: messages });
        }
        console.error("Registration Error:", error.message);
        next(error);
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Verify user exists
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Verify password
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check if user has a verification code
        if (user.verification_code && user.verification_code_expires_at) {
            // If verification code exists but is expired, generate a new one
            if (new Date() > user.verification_code_expires_at) {
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + 10);
                await user.update({
                    verification_code: verificationCode,
                    verification_code_expires_at: expiresAt
                });
            }
            return res.status(403).json({
                message: 'Verification required',
                requiresVerification: true
            });
        }
        // Update last login timestamp
        user.last_login = new Date();
        await user.save();
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        // Return user data without password
        const userData = user.get({ plain: true });
        // Use destructuring to omit the password field
        const { password: _, ...userWithoutPassword } = userData;
        // Set token in cookie and response
        res.cookie('sessionToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600 * 1000
        });
        return res.status(200).json({
            message: "Login successful",
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({ message: 'Server error during login' });
    }
});
// Send verification code
router.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // Find user
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiration time (10 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        // Update user with verification code
        await user.update({
            verification_code: verificationCode,
            verification_code_expires_at: expiresAt
        });
        // TODO: Send verification code via email or SMS
        return res.status(200).json({
            message: 'Verification code sent successfully',
            expiresAt: expiresAt
        });
    }
    catch (error) {
        console.error("Verification Error:", error.message);
        return res.status(500).json({ message: 'Error sending verification code' });
    }
});
// Verify code
router.post('/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        // Validate input
        if (!email || !code) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }
        // Find user
        const user = await User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if verification code exists and is not expired
        if (!user.verification_code || !user.verification_code_expires_at) {
            return res.status(400).json({ message: 'No verification code found' });
        }
        if (new Date() > user.verification_code_expires_at) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }
        // Verify code
        if (user.verification_code !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        // Clear verification code after successful verification
        await user.update({
            verification_code: null,
            verification_code_expires_at: null
        });
        return res.status(200).json({
            message: 'Verification successful'
        });
    }
    catch (error) {
        console.error("Verification Error:", error.message);
        return res.status(500).json({ message: 'Error verifying code' });
    }
});
exports.default = router;
