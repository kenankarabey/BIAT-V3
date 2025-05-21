// Sadece login işlemleri burada olacak. Supabase client ve tema/menü kodları main.js'de tanımlı olmalı.

// Toggle password visibility
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
    if (!username || !password) {
        showNotification('E-posta ve şifre gereklidir.', 'error');
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        showNotification('Lütfen geçerli bir e-posta adresi girin.', 'error');
        return false;
    }
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Giriş Yapılıyor...</span>';
    loginBtn.disabled = true;
    try {
        const { success, data, error } = await signInUser(username, password);
        if (success) {
            const { data: userData, error: userError } = await window.supabaseClient
                .from('users')
                .select('yetki')
                .eq('email', username)
                .single();
            if (userError) {
                throw userError;
            }
            if (userData.yetki === 'admin') {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'personel-ariza-bildir.html';
            }
        } else {
            showNotification('Şifreniz veya e-postanız yanlış, tekrar deneyin.', 'error');
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Giriş Yap</span>';
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification("Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 'error');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Giriş Yap</span>';
        loginBtn.disabled = false;
    }
    return false;
}

// Kullanıcı giriş fonksiyonu
    async function signInUser(email, password) {
        try {
        const { data, error } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('sifre', password)
                .single();
            if (error || !data) {
                return { success: false, error: error || { message: 'Kullanıcı bulunamadı veya şifre yanlış.' } };
            }
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