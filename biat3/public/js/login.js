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

// Login form submit handler
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik basit bir kontrol yapıyoruz
    if (username === 'admin' && password === 'admin') {
        // Başarılı giriş
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        if (remember) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Tema ayarını koru
    
        window.location.href = 'index.html';
    } else {
        showNotification('Kullanıcı adı veya şifre hatalı!', 'error');
    }
}

// Logout function
function logout() {
    // Sadece login ile ilgili verileri temizle
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    
    // Login sayfasına yönlendir
    window.location.href = 'login.html';
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
    // Burada gerçek bir API çağrısı yapılacak
    showNotification('Şifre sıfırlama bağlantısı gönderildi!', 'success');
    closeForgotPassword();
}

// Show notification
function showNotification(message, type = 'info') {
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

// Call checkLoginStatus when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Tema ayarını uygula
 
    
    // Login durumunu kontrol et
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isLoggedIn && currentPage !== 'login.html') {
        window.location.href = 'login.html';
    } else if (isLoggedIn && currentPage === 'login.html') {
        window.location.href = 'index.html';
    }
}); 