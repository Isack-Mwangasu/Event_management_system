// =============================================
// register.js — Register Page Logic
// =============================================

// Redirect if already logged in
if (localStorage.getItem('spu_token')) {
    window.location.href = 'index.html';
}

let selectedRole = 'student';

// ── Role selector ─────────────────────────────
function selectRole(role, el) {
    selectedRole = role;
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

// ── Toggle password visibility ────────────────
function togglePw() {
    const input = document.getElementById('password');
    const icon = document.querySelector('.toggle-pw i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
    }
}

// ── Password strength indicator ───────────────
function checkStrength(val) {
    const bars = ['bar1', 'bar2', 'bar3', 'bar4'].map(id => document.getElementById(id));
    bars.forEach(b => b.className = 'pw-bar');
    if (!val.length) return;

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const cls = score <= 1 ? 'weak' : score === 2 ? 'fair' : 'strong';
    for (let i = 0; i < score; i++) bars[i].classList.add(cls);
}

// ── Show alert ────────────────────────────────
function showAlert(msg, type = 'error') {
    const box = document.getElementById('alertBox');
    box.className = `alert ${type}`;
    document.getElementById('alertMsg').textContent = msg;
}

// ── Handle Register ───────────────────────────
async function handleRegister() {
    const name = document.getElementById('name').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const email = document.getElementById('email').value.trim();
    const department = document.getElementById('department').value;
    const password = document.getElementById('password').value;
    const termsChecked = document.getElementById('terms').checked;

    if (!name || !email || !password) return showAlert('Please fill in all required fields.');
    if (password.length < 6) return showAlert('Password must be at least 6 characters.');
    if (!termsChecked) return showAlert('Please accept the terms and conditions.');

    const btn = document.getElementById('registerBtn');
    const spinner = document.getElementById('spinner');
    btn.disabled = true;
    spinner.style.display = 'block';

    try {
        const result = await registerUser({ name, email, password, role: selectedRole, studentId, department });

        if (result.success) {
            showAlert('Account created! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            showAlert(result.message || 'Registration failed. Please try again.');
            btn.disabled = false;
            spinner.style.display = 'none';
        }
    } catch (err) {
        showAlert('Cannot connect to server. Make sure the backend is running.');
        btn.disabled = false;
        spinner.style.display = 'none';
    }
}