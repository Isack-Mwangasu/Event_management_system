// =============================================
// models/Event.js — Event Data Model
// =============================================
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },

        description: {
            type: String,
            required: [true, 'Event description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },

        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'Technology',
                'Health & Medic',
                'Communication',
                'Sports',
                'Spiritual',
                'Campus Life',
                'Academic',
                'Entertainment',
                'Other'
            ]
        },

        date: {
            type: Date,
            required: [true, 'Event date is required']
        },

        endDate: {
            type: Date // Optional — for multi-day events
        },

        location: {
            venue: {
                type: String,
                required: [true, 'Venue is required'],
                trim: true
                // e.g. "Main Hall", "SPU Grounds", "Chapel"
            },
            isOnline: {
                type: Boolean,
                default: false
            },
            onlineLink: {
                type: String,
                trim: true // Zoom/Meet link if online
            }
        },

        image: {
            type: String,
            default: '' // URL or filename of uploaded image
        },

        // The organizer who created this event (links to a User)
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Students who clicked "RSVP / I'm Going"
        attendees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        maxAttendees: {
            type: Number,
            default: null // null = unlimited
        },

        isFree: {
            type: Boolean,
            default: true
        },

        ticketPrice: {
            type: Number,
            default: 0
        },

        tags: [
            {
                type: String,
                trim: true
                // e.g. ["free food", "workshop", "certificate"]
            }
        ],

        status: {
            type: String,
            enum: ['draft', 'published', 'cancelled', 'completed'],
            default: 'published'
        }
    },
    {
        timestamps: true,
        // This adds a virtual field so we can get attendee count easily
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ── Virtual: Attendee Count ───────────────────
// Lets you call event.attendeeCount without storing it in DB
EventSchema.virtual('attendeeCount').get(function () {
    return this.attendees.length;
});

// ── Virtual: Is the event full? ───────────────
EventSchema.virtual('isFull').get(function () {
    if (!this.maxAttendees) return false;
    return this.attendees.length >= this.maxAttendees;
});

// ── Index for fast searching ──────────────────
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });
EventSchema.index({ date: 1 }); // Sort by date quickly
EventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', EventSchema);