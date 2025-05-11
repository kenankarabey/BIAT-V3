// Theme handling
// function initializeTheme() {
//     const savedTheme = localStorage.getItem('theme') || 'light';
//     document.documentElement.setAttribute('data-theme', savedTheme);
// }

// Toggle password visibility
// Supabase client'ı tekrar tekrar tanımlamayı önle
var supabase = window.supabaseClient;

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
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

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!username || !password) {
        showNotification('E-posta ve şifre gereklidir.', 'error');
        return false;
    }
    
    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        showNotification('Lütfen geçerli bir e-posta adresi girin.', 'error');
        return false;
    }
    
    // Loading state
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Giriş Yapılıyor...</span>';
    loginBtn.disabled = true;
    
    try {
        // Call Supabase login function
        const { success, data, error } = await signInUser(username, password);
        
        if (success) {
            // Kullanıcının yetkisini kontrol et
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('yetki')
                .eq('email', username)
                .single();

            if (userError) {
                throw userError;
            }

            // Yetkiye göre yönlendirme yap
            if (userData.yetki === 'admin') {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'ariza-bildir-personel.html';
            }
        } else {
            // Show error message
            showNotification(error?.message || 'Giriş başarısız. Lütfen e-posta adresinizi ve şifrenizi kontrol edin.', 'error');
            
            // Reset button state
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Giriş Yap</span>';
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification("Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 'error');
        
        // Reset button state
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Giriş Yap</span>';
        loginBtn.disabled = false;
    }
    
    return false;
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // Create container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Add event listener to close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Check if user is already logged in and redirect

    async function signInUser(email, password) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('sifre', password)
                .single();
    
            if (error || !data) {
                return { success: false, error: error || { message: 'Kullanıcı bulunamadı veya şifre yanlış.' } };
            }
            // Kullanıcıyı localStorage'a kaydet
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true, data };
        } catch (err) {
            return { success: false, error: err };
        }
    }
    

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('login.html')) {
        try {
            const user = await checkAuth();
            if (user) {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
}); 