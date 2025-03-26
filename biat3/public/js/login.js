// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    try {
        // Here you would typically send a request to your backend
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, remember })
        });
        
        if (!response.ok) {
            throw new Error('Giriş başarısız');
        }
        
        const data = await response.json();
        
        // Store the token
        if (remember) {
            localStorage.setItem('token', data.token);
        } else {
            sessionStorage.setItem('token', data.token);
        }
        
        // Redirect to dashboard
        window.location.href = '/';
        
    } catch (error) {
        showNotification('Kullanıcı adı veya şifre hatalı', 'error');
    }
    
    return false;
}

// Show forgot password dialog
function showForgotPassword() {
    const dialog = document.getElementById('forgotPasswordDialog');
    dialog.classList.add('show');
}

// Close forgot password dialog
function closeForgotPassword() {
    const dialog = document.getElementById('forgotPasswordDialog');
    dialog.classList.remove('show');
    document.getElementById('resetEmail').value = '';
}

// Send password reset link
async function sendResetLink() {
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        showNotification('Lütfen e-posta adresinizi girin', 'error');
        return;
    }
    
    try {
        // Here you would typically send a request to your backend
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        if (!response.ok) {
            throw new Error('Şifre sıfırlama başarısız');
        }
        
        showNotification('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi', 'success');
        closeForgotPassword();
        
    } catch (error) {
        showNotification('Şifre sıfırlama işlemi başarısız oldu', 'error');
    }
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

// Theme toggle
document.querySelector('.toggle-theme').addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}); 