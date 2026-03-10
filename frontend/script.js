// =============================================
// script.js — SPU EventHub Main Script
// =============================================

// ── Filter Tags ───────────────────────────────
// Makes the filter buttons on events.html actually work
document.querySelectorAll('.filter-tag').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // If events are loaded dynamically, trigger a reload with the new filter
        if (typeof loadEvents === 'function') loadEvents();
    });
});

// ── Search Bar Enter Key ──────────────────────
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && typeof loadEvents === 'function') loadEvents();
    });
}
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        if (typeof loadEvents === 'function') loadEvents();
    });
}