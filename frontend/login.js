// =============================================
// login.js — Login Page Logic
// =============================================

// Redirect if already logged in
if (localStorage.getItem('spu_token')) {
    window.location.href = 'index.html';
}

// ── Toggle password visibility ────────────────
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
    }
}

// ── Show alert message ────────────────────────
function showAlert(msg, type = 'error') {
    const box = document.getElementById('alertBox');
    const msgEl = document.getElementById('alertMsg');
    box.className = `alert ${type}`;
    msgEl.textContent = msg;
}

// ── Handle Login ──────────────────────────────
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginBtn');
    const spinner = document.getElementById('spinner');

    if (!email || !password) {
        return showAlert('Please fill in both email and password.');
    }

    btn.disabled = true;
    spinner.style.display = 'block';

    try {
        const result = await loginUser(email, password);

        if (result.success) {
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'index.html', 800);
        } else {
            showAlert(result.message || 'Invalid email or password.');
            btn.disabled = false;
            spinner.style.display = 'none';
        }
    } catch (err) {
        showAlert('Cannot connect to server. Make sure the backend is running.');
        btn.disabled = false;
        spinner.style.display = 'none';
    }
}

// ── Allow Enter key to submit ─────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});