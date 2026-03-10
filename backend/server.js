// =============================================
// server.js — SPU EventHub API Entry Point
// =============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors()); // Allows your frontend to call this API
app.use(express.json()); // Parses incoming JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
// e.g. http://localhost:5000/uploads/event-image.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users'));

// ── Health Check ──────────────────────────────
// Visit http://localhost:5000/api/health to confirm server is running
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SPU EventHub API is running',
        timestamp: new Date().toISOString()
    });
});

// ── 404 Handler ───────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ── Connect to MongoDB & Start Server ─────────
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1); // Exit if DB can't connect
    });