// =============================================
// middleware/auth.js — JWT Protection Middleware
// =============================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── protect ───────────────────────────────────
// Blocks any request that doesn't have a valid token
// Usage: router.get('/some-route', protect, yourController)
exports.protect = async (req, res, next) => {
    let token;

    // Token is sent in the Authorization header as: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please log in.'
        });
    }

    try {
        // Verify the token is valid and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the logged-in user to the request object
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User belonging to this token no longer exists.'
            });
        }

        next(); // ✅ Token is valid — proceed to the route
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token is invalid or expired. Please log in again.'
        });
    }
};

// ── authorize ─────────────────────────────────
// Restricts a route to specific roles
// Usage: router.post('/events', protect, authorize('organizer', 'admin'), createEvent)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};