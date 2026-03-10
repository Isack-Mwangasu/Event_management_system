// =============================================
// routes/users.js — User Profile Routes
// =============================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// ── GET /api/users/profile ────────────────────
// Get the logged-in user's full profile + their RSVPs
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('rsvpedEvents', 'title date location category');

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PUT /api/users/profile ────────────────────
// Update logged-in user's name, department, studentId
router.put('/profile', protect, async (req, res) => {
    try {
        const allowedUpdates = ['name', 'department', 'studentId', 'avatar'];
        const updates = {};

        // Only allow specific fields to be updated (never role or password here)
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, message: 'Profile updated!', data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/users/my-events ──────────────────
// Get all events created by the logged-in organizer
router.get('/my-events', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id }).sort({ date: -1 });

        res.json({ success: true, count: events.length, data: events });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/users — Admin Only ───────────────
// List all users (admin dashboard)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;