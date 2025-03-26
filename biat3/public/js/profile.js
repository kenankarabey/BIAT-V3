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
document.addEventListener('DOMContentLoaded', () => {
    // Initialize profile navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            switchProfileSection(sectionId);
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
}); 