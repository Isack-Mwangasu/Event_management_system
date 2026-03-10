// =============================================
// routes/events.js — Event CRUD Routes
// =============================================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// ── Image Upload Config (Multer) ──────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        // Creates a unique filename: event-1234567890.jpg
        const uniqueName = `event-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPG, PNG, WebP) are allowed'));
        }
    }
});

// ── GET /api/events ───────────────────────────
// Get all events. Supports: ?category=Sports&search=rugby&upcoming=true
router.get('/', async (req, res) => {
    try {
        const { category, search, upcoming, limit = 20, page = 1 } = req.query;

        // Build the query filter dynamically
        let filter = { status: 'published' };

        if (category) filter.category = category;

        if (upcoming === 'true') filter.date = { $gte: new Date() };

        if (search) {
            // MongoDB text search (uses the index we set in the model)
            filter.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const events = await Event.find(filter)
            .populate('organizer', 'name email department') // Attach organizer name
            .sort({ date: 1 }) // Soonest events first
            .limit(Number(limit))
            .skip(skip);

        const total = await Event.countDocuments(filter);

        res.json({
            success: true,
            count: events.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: events
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/events/:id ───────────────────────
// Get a single event by its ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email department avatar')
            .populate('attendees', 'name avatar'); // Show who's attending

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        res.json({ success: true, data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/events ──────────────────────────
// Create a new event (organizers and admins only)
router.post('/', protect, authorize('organizer', 'admin'), upload.single('image'), async (req, res) => {
    try {
        const eventData = { ...req.body };

        // If an image was uploaded, store its path
        if (req.file) {
            eventData.image = `/uploads/${req.file.filename}`;
        }

        // Automatically set the organizer to whoever is logged in
        eventData.organizer = req.user._id;

        // Parse location object from form data
        if (typeof eventData.location === 'string') {
            eventData.location = JSON.parse(eventData.location);
        }

        // Parse tags array if sent as string
        if (typeof eventData.tags === 'string') {
            eventData.tags = JSON.parse(eventData.tags);
        }

        const event = await Event.create(eventData);

        res.status(201).json({
            success: true,
            message: 'Event created successfully!',
            data: event
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PUT /api/events/:id ───────────────────────
// Update an event (only the organizer who created it, or an admin)
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('image'), async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        // Make sure the logged-in user owns this event (unless they're admin)
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own events.'
            });
        }

        const updates = { ...req.body };
        if (req.file) updates.image = `/uploads/${req.file.filename}`;

        event = await Event.findByIdAndUpdate(req.params.id, updates, {
            new: true, // Return the updated document
            runValidators: true
        });

        res.json({ success: true, message: 'Event updated!', data: event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/events/:id ────────────────────
// Delete an event (owner or admin only)
router.delete('/:id', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own events.'
            });
        }

        await event.deleteOne();
        res.json({ success: true, message: 'Event deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/events/:id/rsvp ─────────────────
// Toggle RSVP — student clicks "I'm Going" or "Cancel RSVP"
router.post('/:id/rsvp', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const userId = req.user._id;
        const alreadyRsvpd = event.attendees.includes(userId);

        if (alreadyRsvpd) {
            // Remove from attendees (un-RSVP)
            event.attendees.pull(userId);
            await event.save();
            return res.json({ success: true, message: 'RSVP cancelled.', attending: false });
        }

        // Check if event is full
        if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
            return res.status(400).json({ success: false, message: 'This event is fully booked.' });
        }

        // Add to attendees
        event.attendees.push(userId);
        await event.save();

        res.json({ success: true, message: "You're going! 🎉", attending: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;