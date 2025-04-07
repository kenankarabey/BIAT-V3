// Theme handling
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.remove('fa-eye');
        toggleButton.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('fa-eye-slash');
        toggleButton.classList.add('fa-eye');
    }
}

// Form validation
function validateForm(username, password) {
    if (!username.trim()) {
        showNotification('Kullanıcı adı boş olamaz!', 'error');
        return false;
    }
    
    if (!password.trim()) {
        showNotification('Şifre boş olamaz!', 'error');
        return false;
    }
    
    if (password.length < 4) {
        showNotification('Şifre en az 4 karakter olmalıdır!', 'error');
        return false;
    }
    
    return true;
}

// Login form submit handler
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    if (!validateForm(username, password)) {
        return;
    }
    
    // Simulated API call
    setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
            // Successful login
            showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            // Redirect after notification
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification('Kullanıcı adı veya şifre hatalı!', 'error');
        }
    }, 500); // Simulate network delay
}

// Logout function
function logout() {
    showNotification('Çıkış yapılıyor...', 'info');
    
    setTimeout(() => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('rememberMe');
        
        window.location.href = 'login.html';
    }, 500);
}

// Show forgot password dialog
function showForgotPassword() {
    const dialog = document.getElementById('forgotPasswordDialog');
    dialog.style.display = 'block';
}

// Close forgot password dialog
function closeForgotPassword() {
    const dialog = document.getElementById('forgotPasswordDialog');
    dialog.style.display = 'none';
}

// Send reset link
function sendResetLink() {
    const email = document.getElementById('resetEmail').value;
    
    if (!email.trim()) {
        showNotification('E-posta adresi boş olamaz!', 'error');
        return;
    }
    
    if (!email.endsWith('@adalet.gov.tr')) {
        showNotification('Geçerli bir adalet.gov.tr e-posta adresi giriniz!', 'error');
        return;
    }
    
    showNotification('Şifre sıfırlama bağlantısı gönderildi!', 'success');
    closeForgotPassword();
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    
    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isLoggedIn && currentPage !== 'login.html') {
        showNotification('Lütfen giriş yapın!', 'info');
        window.location.href = 'login.html';
    } else if (isLoggedIn && currentPage === 'login.html') {
        window.location.href = 'index.html';
    }
    
    // Set remembered username if exists
    if (currentPage === 'login.html' && localStorage.getItem('rememberMe')) {
        const rememberedUsername = localStorage.getItem('username');
        if (rememberedUsername) {
            document.getElementById('username').value = rememberedUsername;
            document.getElementById('remember').checked = true;
        }
    }
}); 