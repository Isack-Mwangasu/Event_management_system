// =============================================
// routes/auth.js — Register & Login Routes
// =============================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── POST /api/auth/register ───────────────────
// Creates a new user account
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, studentId, department } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with that email already exists.'
            });
        }

        // Create the user (password is hashed automatically by the model)
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            studentId,
            department
        });

        // Generate JWT token and send back
        const token = user.getSignedToken();

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (err) {
        // Handle mongoose validation errors nicely
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ── POST /api/auth/login ──────────────────────
// Logs in a user and returns a token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.'
            });
        }

        // Find user — we need password so we use .select('+password')
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Compare entered password with hashed one in DB
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = user.getSignedToken();

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ── GET /api/auth/me ──────────────────────────
// Returns the currently logged-in user's profile
// Requires: Authorization: Bearer <token>
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;