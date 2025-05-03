// Profile Navigation
function switchProfileSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav item
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

// Profile Information
function enableProfileEdit() {
    const form = document.querySelector('.profile-form');
    const inputs = form.querySelectorAll('input:not([type="email"])');
    const editBtn = document.querySelector('.btn-edit-profile');
    const saveBtn = document.querySelector('.btn-save-profile');
    
    inputs.forEach(input => {
        input.disabled = false;
    });
    
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
}

function saveProfileChanges() {
    const form = document.querySelector('.profile-form');
    const inputs = form.querySelectorAll('input:not([type="email"])');
    const editBtn = document.querySelector('.btn-edit-profile');
    const saveBtn = document.querySelector('.btn-save-profile');
    
    // Here you would typically send the form data to your backend
    const formData = new FormData(form);
    
    // For demonstration, we'll just disable the inputs
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    editBtn.style.display = 'inline-flex';
    saveBtn.style.display = 'none';
    
    // Show success message
    showNotification('Profil bilgileri başarıyla güncellendi', 'success');
}

// Security Settings
function showPasswordDialog() {
    const dialog = document.getElementById('passwordDialog');
    dialog.classList.add('show');
}

function closePasswordDialog() {
    const dialog = document.getElementById('passwordDialog');
    dialog.classList.remove('show');
    
    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Lütfen tüm alanları doldurun', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Yeni şifreler eşleşmiyor', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Şifre en az 8 karakter olmalıdır', 'error');
        return;
    }
    
    // Here you would typically send the password change request to your backend
    // For demonstration, we'll just show a success message
    showNotification('Şifreniz başarıyla güncellendi', 'success');
    
    // Close the dialog and clear fields
    closePasswordDialog();
}

function viewSessions() {
    const dialog = document.getElementById('sessionsDialog');
    const sessionsList = dialog.querySelector('.sessions-list');
    
    // Here you would typically fetch the sessions from your backend
    // For demonstration, we'll show some dummy data
    const sessions = [
        {
            device: 'Chrome / Windows 10',
            location: 'Ankara, Türkiye',
            ip: '192.168.1.1',
            lastActive: 'Şu anda aktif',
            isCurrentSession: true
        },
        {
            device: 'Safari / iPhone',
            location: 'Ankara, Türkiye',
            ip: '192.168.1.2',
            lastActive: '2 saat önce',
            isCurrentSession: false
        },
        {
            device: 'Firefox / MacOS',
            location: 'İstanbul, Türkiye',
            ip: '192.168.1.3',
            lastActive: '1 gün önce',
            isCurrentSession: false
        }
    ];
    
    // Clear previous content
    sessionsList.innerHTML = '';
    
    // Add sessions to the list
    sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item';
        sessionItem.innerHTML = `
            <div class="session-info">
                <h3>${session.device}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${session.location}</p>
                <p><i class="fas fa-network-wired"></i> ${session.ip}</p>
                <p><i class="fas fa-clock"></i> ${session.lastActive}</p>
            </div>
            ${!session.isCurrentSession ? `
                <button class="btn btn-warning" onclick="terminateSession('${session.ip}')">
                    <i class="fas fa-times"></i>
                    <span>Oturumu Kapat</span>
                </button>
            ` : '<span class="badge success">Mevcut Oturum</span>'}
        `;
        sessionsList.appendChild(sessionItem);
    });
    
    dialog.classList.add('show');
}

function closeSessionsDialog() {
    const dialog = document.getElementById('sessionsDialog');
    dialog.classList.remove('show');
}

function terminateSession(sessionId) {
    // Here you would typically send a request to your backend to terminate the session
    // For demonstration, we'll just show a success message
    showNotification('Oturum başarıyla sonlandırıldı', 'success');
}

// Notification Settings
function toggleNotification(setting) {
    const toggle = document.querySelector(`#${setting}`);
    const isEnabled = toggle.checked;
    
    // Here you would typically send the setting change to your backend
    // For demonstration, we'll just show a message
    const settingNames = {
        emailNotifications: 'E-posta bildirimleri',
        desktopNotifications: 'Masaüstü bildirimleri',
        smsNotifications: 'SMS bildirimleri',
        twoFactorAuth: 'İki faktörlü doğrulama'
    };
    
    showNotification(
        `${settingNames[setting]} ${isEnabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`,
        'info'
    );
}

// Activity Timeline
function filterActivity(filter) {
    const timeline = document.querySelector('.activity-timeline');
    const items = timeline.querySelectorAll('.timeline-item');
    
    items.forEach(item => {
        if (filter === 'all' || item.dataset.type === filter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Profile Picture
function changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.querySelector('.profile-avatar').src = event.target.result;
                // Here you would typically upload the file to your backend
                showNotification('Profil fotoğrafı başarıyla güncellendi', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Utility Functions
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

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication and load profile data
        const user = await checkAuth();
        
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
        
        // Load profile data from Supabase
        const { success, data, error } = await getUserProfile();
        
        if (success) {
            // Populate profile form with user data
            populateProfileData(data);
        } else {
            showNotification(error.message || 'Profil bilgileri yüklenemedi.', 'error');
        }
        
        // Add event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Profile initialization error:', error);
        showNotification('Profil sayfası yüklenirken bir hata oluştu.', 'error');
    }
});

// Populate profile form with user data
function populateProfileData(userData) {
    console.log("Profil verisi yükleniyor:", userData);
    
    // Kullanıcı nesnesini kontrol et
    if (!userData) {
        console.error("Kullanıcı verisi boş veya tanımsız!");
        return;
    }
    
    // Profil adını güncelle
    const profileNameElement = document.querySelector('.profile-name h1');
    if (profileNameElement) {
        profileNameElement.textContent = userData.ad_soyad || 'İsimsiz Kullanıcı';
    }
    
    // Rol bilgisini güncelle
    const profileRoleElement = document.querySelector('.profile-role');
    if (profileRoleElement) {
        profileRoleElement.textContent = userData.departman || 'Departman Belirtilmemiş';
    }
    
    // Meta bilgilerini güncelle
    const metaItems = document.querySelectorAll('.profile-meta .meta-item span');
    if (metaItems && metaItems.length >= 3) {
        metaItems[0].textContent = userData.konum || 'Konum Belirtilmemiş';
        metaItems[1].textContent = userData.email || 'E-posta Belirtilmemiş';
        metaItems[2].textContent = userData.telefon || 'Telefon Belirtilmemiş';
    }
    
    // Form değerlerini güncelle
    updateFormInput('ad_soyad', userData.ad_soyad);
    updateFormInput('email', userData.email);
    updateFormInput('telefon', userData.telefon);
    updateFormInput('departman', userData.departman);
    updateFormInput('konum', userData.konum);
    
    // Üst bilgi avatar resmini güncelle
    updateUserAvatar(userData);
    
    console.log("Profil verisi başarıyla yüklendi");
}

// Form input değerini güncelleme yardımcı fonksiyonu
function updateFormInput(fieldName, value) {
    const formInputs = document.querySelectorAll('.profile-form input');
    if (!formInputs || formInputs.length === 0) {
        console.error(`Form alanları bulunamadı: ${fieldName}`);
        return;
    }
    
    // Form alanlarını bul
    let found = false;
    formInputs.forEach(input => {
        // Ana sınıf adı yerine değer eşleşmesine bak
        if (input.name === fieldName || 
            input.id === fieldName || 
            input.placeholder && input.placeholder.toLowerCase().includes(fieldName.toLowerCase())) {
            input.value = value || '';
            found = true;
        }
        // Label ile eşleştir
        const label = input.previousElementSibling;
        if (label && label.tagName === 'LABEL' && 
            label.textContent.toLowerCase().includes(fieldName.toLowerCase())) {
            input.value = value || '';
            found = true;
        }
    });
    
    if (!found) {
        console.warn(`'${fieldName}' için form alanı bulunamadı`);
    }
}

// Kullanıcı avatarını güncelleme
function updateUserAvatar(userData) {
    const avatarElements = document.querySelectorAll('.profile-avatar, .user-profile img');
    avatarElements.forEach(avatar => {
        // Eğer kullanıcının avatar URL'si varsa kullan, yoksa varsayılan resmi kullan
        if (userData.avatar_url) {
            avatar.src = userData.avatar_url;
            avatar.alt = userData.ad_soyad || 'Kullanıcı Avatarı';
        }
    });
    
    // Sidebar kullanıcı bilgisini de güncelle
    const sidebarUserName = document.querySelector('.user-info p');
    if (sidebarUserName) {
        sidebarUserName.textContent = userData.ad_soyad || 'Kullanıcı';
    }
}

// Setup event listeners for profile page
function setupEventListeners() {
    // Profile navigation
    const navItems = document.querySelectorAll('.profile-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.getAttribute('data-section');
            const sections = document.querySelectorAll('.profile-section');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Initialize notification toggles
    document.querySelectorAll('.switch input').forEach(toggle => {
        toggle.addEventListener('change', () => {
            toggleNotification(toggle.id);
        });
    });
    
    // Initialize activity filter
    const activityFilter = document.querySelector('.activity-filter select');
    if (activityFilter) {
        activityFilter.addEventListener('change', (e) => {
            filterActivity(e.target.value);
        });
    }
    
    // Initialize profile picture change
    const btnChangeAvatar = document.querySelector('.btn-change-avatar');
    if (btnChangeAvatar) {
        btnChangeAvatar.addEventListener('click', changeProfilePicture);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const passwordDialog = document.getElementById('passwordDialog');
        const sessionsDialog = document.getElementById('sessionsDialog');
        
        if (e.target === passwordDialog) {
            closePasswordDialog();
        }
        
        if (e.target === sessionsDialog) {
            closeSessionsDialog();
        }
    });
    
    // Show profile section by default
    switchProfileSection('profile');
}

// Enable profile edit mode
function enableProfileEdit() {
    // Enable form inputs
    const formInputs = document.querySelectorAll('.profile-form input');
    formInputs.forEach(input => {
        // Skip email field which should not be editable
        if (input.type !== 'email') {
            input.disabled = false;
        }
    });
    
    // Show save button, hide edit button
    document.querySelector('.btn-edit-profile').style.display = 'none';
    document.querySelector('.btn-save-profile').style.display = 'flex';
}

// Save profile changes
async function saveProfileChanges() {
    try {
        // Collect form data
        const formInputs = document.querySelectorAll('.profile-form input');
        const userData = {
            adSoyad: formInputs[0].value,
            telefon: formInputs[2].value,
            departman: formInputs[3].value,
            konum: formInputs[4].value
        };
        
        // Validate form data
        if (!userData.adSoyad || !userData.telefon || !userData.departman || !userData.konum) {
            showNotification('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        
        // Update profile in Supabase
        const { success, error } = await updateUserProfile(userData);
        
        if (success) {
            // Update profile UI
            document.querySelector('.profile-name h1').textContent = userData.adSoyad;
            const metaItems = document.querySelectorAll('.profile-meta .meta-item span');
            if (metaItems.length >= 3) {
                metaItems[0].textContent = userData.konum;
                metaItems[2].textContent = userData.telefon;
            }
            
            // Disable form inputs
            formInputs.forEach(input => {
                input.disabled = true;
            });
            
            // Show edit button, hide save button
            document.querySelector('.btn-edit-profile').style.display = 'flex';
            document.querySelector('.btn-save-profile').style.display = 'none';
            
            showNotification('Profil bilgileri başarıyla güncellendi.', 'success');
        } else {
            showNotification(error.message || 'Profil güncellenemedi.', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Profil güncellenirken bir hata oluştu.', 'error');
    }
}

// Show password change dialog
function showPasswordDialog() {
    document.getElementById('passwordDialog').style.display = 'block';
}

// Close password change dialog
function closePasswordDialog() {
    document.getElementById('passwordDialog').style.display = 'none';
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Change password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Yeni şifre ve tekrarı eşleşmiyor.', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Şifre en az 6 karakter olmalıdır.', 'error');
        return;
    }
    
    try {
        // Update password in Supabase
        const { success, error } = await changeUserPassword(currentPassword, newPassword);
        
        if (success) {
            showNotification('Şifreniz başarıyla değiştirildi.', 'success');
            closePasswordDialog();
        } else {
            showNotification(error.message || 'Şifre değiştirilemedi.', 'error');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showNotification('Şifre değiştirilirken bir hata oluştu.', 'error');
    }
}

// Toggle notification settings
function toggleNotification(settingId) {
    const setting = document.getElementById(settingId);
    const isEnabled = setting.checked;
    
    // In a real app, this would update user preferences in the database
    console.log(`${settingId} is now ${isEnabled ? 'enabled' : 'disabled'}`);
    
    showNotification(`${settingId} ${isEnabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`, 'info');
}

// View session history
function viewSessions() {
    document.getElementById('sessionsDialog').style.display = 'block';
    
    // In a real app, this would fetch session data from the database
    const sessionsList = document.querySelector('.sessions-list');
    sessionsList.innerHTML = `
        <div class="session-item">
            <div class="session-info">
                <h3>Windows 10 - Chrome</h3>
                <p>IP: 192.168.1.1</p>
                <p>Son Giriş: 1 saat önce</p>
            </div>
            <div class="session-status current">
                <span>Aktif Oturum</span>
            </div>
        </div>
        <div class="session-item">
            <div class="session-info">
                <h3>iPhone - Safari</h3>
                <p>IP: 192.168.1.2</p>
                <p>Son Giriş: 2 gün önce</p>
            </div>
            <button class="btn btn-danger btn-sm">
                <i class="fas fa-sign-out-alt"></i>
                <span>Oturumu Kapat</span>
            </button>
        </div>
    `;
}

// Close sessions dialog
function closeSessionsDialog() {
    document.getElementById('sessionsDialog').style.display = 'none';
}

// Filter activity timeline
function filterActivity(type) {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        if (type === 'all' || item.getAttribute('data-type') === type) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
} 