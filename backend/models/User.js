// =============================================
// models/User.js — User Data Model
// =============================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters']
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Never return password in queries by default
        },

        role: {
            type: String,
            enum: ['student', 'organizer', 'admin'],
            default: 'student'
        },

        // Student/Staff ID (e.g. SPU/CS/2024/001)
        studentId: {
            type: String,
            trim: true
        },

        department: {
            type: String,
            trim: true
        },

        avatar: {
            type: String,
            default: '' // URL to profile picture
        },

        // Events this user has RSVP'd to
        rsvpedEvents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event'
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt automatically
    }
);

// ── Hash password before saving ───────────────
// This runs automatically every time a user is saved
UserSchema.pre('save', async function (next) {
    // Only hash if password was actually changed
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Method: Compare entered password with hashed ─
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ── Method: Generate a JWT token for this user ──
UserSchema.methods.getSignedToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = mongoose.model('User', UserSchema);