// Profile Navigation

const supabase = window.supabaseClient;

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
    const inputs = form.querySelectorAll('input:not([type="email"]):not([type="password"])');
    const editBtn = document.querySelector('.btn-edit-profile');
    const saveBtn = document.querySelector('.btn-save-profile');
    
    inputs.forEach(input => {
        input.disabled = false;
    });
    
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
}

// Save profile changes
async function saveProfileChanges() {
    try {
        // Disable save button and show loading
        const saveBtn = document.querySelector('.btn-save-profile');
    const editBtn = document.querySelector('.btn-edit-profile');
        
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Kaydediliyor...</span>';
        }
        
        // Get form data - only collect editable fields (not password)
        const formData = {
            adSoyad: document.getElementById('ad_soyad')?.value || '',
            telefon: document.getElementById('telefon')?.value || '',
            departman: document.getElementById('departman')?.value || '',
            konum: document.getElementById('konum')?.value || ''
            // Password is not included and will be handled separately in changePassword function
        };

        // Validate form data
        if (!formData.adSoyad || !formData.telefon || !formData.departman || !formData.konum) {
            showNotification('Lütfen tüm alanları doldurun.', 'error');
            
            // Reset button
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> <span>Kaydet</span>';
            }
            return;
        }

        console.log("Profil verileri güncelleniyor:", formData);
        
        // Update profile in Supabase
        const { success, error } = await updateUserProfile(formData);
        
        if (success) {
            // Update UI with new data
            const user = JSON.parse(localStorage.getItem('user'));
    
            // Update user data in localStorage with the new values
            if (user) {
                const updatedUser = {
                    ...user,
                    ad_soyad: formData.adSoyad,
                    telefon: formData.telefon,
                    departman: formData.departman,
                    konum: formData.konum
                    // Password is not updated here
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Reload profile data to update all UI elements
                populateProfileData(updatedUser);
            }
            
            // Disable form inputs
            const formInputs = document.querySelectorAll('.profile-form input:not([type="email"]):not([type="password"])');
            formInputs.forEach(input => {
        input.disabled = true;
    });
    
            // Show edit button, hide save button
            if (editBtn) editBtn.style.display = 'flex';
            if (saveBtn) saveBtn.style.display = 'none';
    
            showNotification('Profil bilgileri başarıyla güncellendi.', 'success');
        } else {
            console.error("Profil güncelleme hatası:", error);
            showNotification(error?.message || 'Profil güncellenemedi.', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Profil güncellenirken bir hata oluştu.', 'error');
    } finally {
        // Reset save button
        const saveBtn = document.querySelector('.btn-save-profile');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> <span>Kaydet</span>';
        }
    }
}

// Change password directly from the profile page
async function changePasswordDirect() {
    const currentPassword = document.getElementById('currentPasswordField').value;
    const newPassword = document.getElementById('newPasswordField').value;
    const confirmPassword = document.getElementById('confirmPasswordField').value;
    
    // Clear any previous error messages
    const errorElement = document.querySelector('.password-change-form .error-message');
    if (errorElement) errorElement.remove();
    
    // Disable the change button and show loading state
    const changeBtn = document.querySelector('.password-change-form .btn-primary');
    if (changeBtn) {
        changeBtn.disabled = true;
        changeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Değiştiriliyor...';
    }
    
    try {
        // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
            showPasswordChangeError('Lütfen tüm alanları doldurun.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
            showPasswordChangeError('Yeni şifre ve tekrarı eşleşmiyor.');
        return;
    }
    
        if (newPassword.length < 6) {
            showPasswordChangeError('Şifre en az 6 karakter olmalıdır.');
        return;
    }
    
        // Update password in Supabase
        console.log("Şifre değiştiriliyor...");
        const { success, error } = await changeUserPassword(currentPassword, newPassword);
        
        if (success) {
            console.log("Şifre başarıyla değiştirildi");
            showNotification('Şifreniz başarıyla değiştirildi.', 'success');
    
            // Clear form fields
            document.getElementById('currentPasswordField').value = '';
            document.getElementById('newPasswordField').value = '';
            document.getElementById('confirmPasswordField').value = '';
        } else {
            console.error("Şifre değiştirme hatası:", error);
            showPasswordChangeError(error?.message || 'Şifre değiştirilemedi.');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showPasswordChangeError('Şifre değiştirilirken bir hata oluştu.');
    } finally {
        // Reset button state
        if (changeBtn) {
            changeBtn.disabled = false;
            changeBtn.innerHTML = '<i class="fas fa-key"></i> <span>Şifreyi Değiştir</span>';
        }
    }
}

// Show password change error message
function showPasswordChangeError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.password-change-form .error-message');
    if (existingError) existingError.remove();
    
    // Create and add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const formActions = document.querySelector('.password-change-form .form-actions');
    if (formActions) {
        formActions.insertAdjacentElement('beforebegin', errorDiv);
}

    // Reset button state
    const changeBtn = document.querySelector('.password-change-form .btn-primary');
    if (changeBtn) {
        changeBtn.disabled = false;
        changeBtn.innerHTML = '<i class="fas fa-key"></i> <span>Şifreyi Değiştir</span>';
    }
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
        smsNotifications: 'SMS bildirimleri'
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
async function changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async e => {
        const file = e.target.files[0];
        if (file) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const userId = user?.id || user?.user_id || user?.uuid || 'user';
                const fileExt = file.name.split('.').pop();
                const filePath = `avatars/${userId}_${Date.now()}.${fileExt}`;
                let { data, error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
                if (error) throw error;

                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                const publicUrl = publicUrlData?.publicUrl;
                if (!publicUrl) throw new Error('Fotoğraf URL alınamadı!');

                const { error: updateError } = await supabase
                    .from('users')
                    .update({ foto_url: publicUrl })
                    .eq('id', userId);
                if (updateError) throw updateError;

                user.foto_url = publicUrl;
                localStorage.setItem('user', JSON.stringify(user));
                updateUserAvatar(user);
                populateProfileData(user);
                showNotification('Profil fotoğrafı başarıyla güncellendi', 'success');
            } catch (err) {
                console.error('Profil fotoğrafı güncelleme hatası:', err);
                showNotification('Profil fotoğrafı güncellenemedi: ' + (err.message || 'Bilinmeyen hata'), 'error');
            }
        }
    };
    input.click();
}

// Fetch and render user's solved issues in activity section
async function renderUserSolvedIssues() {
    try {
        // Kullanıcı adı (arizayi_cozen_personel) localStorage'dan veya profilden alınır
        const user = JSON.parse(localStorage.getItem('user'));
        const userName = user?.ad_soyad;
        if (!userName) return;
        // Supabase'den son çözdüğü arızaları çek
        const { data, error } = await supabase
            .from('cozulen_arizalar')
            .select('*')
            .eq('arizayi_cozen_personel', userName)
            .order('cozulme_tarihi', { ascending: false })
            .limit(10);
        if (error) {
            console.error('Çözülen arızalar alınamadı:', error);
            return;
        }
        const timeline = document.getElementById('activityTimeline');
        if (!timeline) return;
        timeline.innerHTML = '';
        if (!data || data.length === 0) {
            timeline.innerHTML = '<div style="padding:24px;color:#888;">Son çözdüğünüz arıza bulunamadı.</div>';
            return;
        }
        data.forEach(issue => {
            const tarih = issue.cozulme_tarihi ? new Date(issue.cozulme_tarihi).toLocaleString('tr-TR') : '-';
            const aciklama = issue.ariza_aciklamasi || '-';
            const html = `
                <div class="timeline-item" data-type="issue">
                    <div class="timeline-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <h3>Arıza Çözüldü</h3>
                            <span class="timeline-time">${tarih}</span>
                        </div>
                        <p>${aciklama}</p>
                    </div>
                </div>
            `;
            timeline.insertAdjacentHTML('beforeend', html);
        });
    } catch (err) {
        console.error('Aktivite arıza listesi hatası:', err);
    }
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
        // Kullanıcının çözdüğü arızaları getir
        renderUserSolvedIssues();
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
    const url = userData.foto_url || userData.avatar_url;
    avatarElements.forEach(avatar => {
        if (url) {
            avatar.src = url;
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
            switchProfileSection(item.getAttribute('data-section'));
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
    
    // Show profile section by default
    switchProfileSection('profile');
} 