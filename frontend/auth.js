// =============================================
// auth.js — Frontend Authentication Logic
// Drop this file in your frontend/ folder
// It's loaded by ALL pages (login, register, index, events)
// =============================================

const API_BASE = 'http://localhost:3000/api';

// ── Token Helpers ─────────────────────────────
// Saves the token and user info after login/register
function saveSession(token, user) {
    localStorage.setItem('spu_token', token);
    localStorage.setItem('spu_user', JSON.stringify(user));
}

// Returns the stored token (or null if not logged in)
function getToken() {
    return localStorage.getItem('spu_token');
}

// Returns the stored user object (or null)
function getUser() {
    const u = localStorage.getItem('spu_user');
    return u ? JSON.parse(u) : null;
}

// Clears everything and redirects to login
function logout() {
    localStorage.removeItem('spu_token');
    localStorage.removeItem('spu_user');
    window.location.href = 'login.html';
}

// Returns true if the user is logged in
function isLoggedIn() {
    return !!getToken();
}

// ── API Calls ─────────────────────────────────

// Login: POST /api/auth/login
async function loginUser(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) saveSession(data.token, data.user);
    return data;
}

// Register: POST /api/auth/register
async function registerUser(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.success) saveSession(data.token, data.user);
    return data;
}

// Fetch events: GET /api/events
async function fetchEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/events?${query}`);
    return await res.json();
}

// RSVP toggle: POST /api/events/:id/rsvp
async function toggleRSVP(eventId) {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
}

// ── Navbar Updater ────────────────────────────
// Call this on every page to update the navbar
// with the real user's name/avatar and live clock
function initNavbar() {
    updateClock();
    setInterval(updateClock, 1000); // Update every second
    updateUserNav();
}

// Live clock in the navbar
function updateClock() {
    const el = document.querySelector('.nav-time');
    if (!el) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${hours}:${mins} GMT+3`;
}

// Replace the placeholder avatar with the real user
function updateUserNav() {
    const user = getUser();
    const profileImg = document.querySelector('.user-profile img');
    const createBtn = document.querySelector('.nav-create-btn');

    if (!profileImg) return;

    if (user) {
        // Show real user initials avatar
        profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=800000&color=f6f0be&bold=true`;
        profileImg.alt = user.name;
        profileImg.title = `${user.name} (${user.role})`;

        // Add logout on click
        profileImg.style.cursor = 'pointer';
        profileImg.onclick = () => {
            if (confirm(`Logged in as ${user.name}\n\nClick OK to log out.`)) logout();
        };

        // Show "Create Event" only to organizers and admins
        if (createBtn) {
            if (user.role === 'organizer' || user.role === 'admin') {
                createBtn.style.display = 'flex';
                createBtn.href = 'create-event.html';
            } else {
                createBtn.style.display = 'none';
            }
        }
    } else {
        // Not logged in — show login button
        profileImg.src = `https://ui-avatars.com/api/?name=Guest&background=cccccc&color=666666`;
        profileImg.alt = 'Guest';
        profileImg.title = 'Click to log in';
        profileImg.style.cursor = 'pointer';
        profileImg.onclick = () => window.location.href = 'login.html';

        // Change "Create Event" to "Login"
        if (createBtn) {
            createBtn.textContent = 'Login';
            createBtn.href = 'login.html';
        }
    }
}

// ── Auto-run on every page ────────────────────
document.addEventListener('DOMContentLoaded', initNavbar);