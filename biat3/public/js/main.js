// Örnek Veri
const state = {
    hakimOdalari: [
        { id: 'HO1', hakim: "Ahmet Yılmaz", konum: "A Blok, 3. Kat", durum: "active" },
        { id: 'HO2', hakim: "Fatma Şahin", konum: "B Blok, 2. Kat", durum: "active" },
        { id: 'HO3', hakim: "Mustafa Öztürk", konum: "C Blok, 1. Kat", durum: "active" },
        { id: 'HO4', hakim: "Ayşe Kaya", konum: "A Blok, 4. Kat", durum: "issue" },
        { id: 'HO5', hakim: "Mehmet Demir", konum: "B Blok, 3. Kat", durum: "active" },
        { id: 'HO6', hakim: "Zeynep Yıldız", konum: "C Blok, 2. Kat", durum: "active" },
        { id: 'HO7', hakim: "Ali Çelik", konum: "A Blok, 5. Kat", durum: "maintenance" },
        { id: 'HO8', hakim: "Elif Arslan", konum: "B Blok, 4. Kat", durum: "active" },
        { id: 'HO9', hakim: "Hasan Şahin", konum: "C Blok, 3. Kat", durum: "active" },
        { id: 'HO10', hakim: "Ayşe Yılmaz", konum: "A Blok, 6. Kat", durum: "active" },
        { id: 'HO11', hakim: "Mehmet Kaya", konum: "B Blok, 5. Kat", durum: "active" },
        { id: 'HO12', hakim: "Fatma Demir", konum: "C Blok, 4. Kat", durum: "active" },
        { id: 'HO13', hakim: "Mustafa Yıldız", konum: "A Blok, 7. Kat", durum: "active" },
        { id: 'HO14', hakim: "Zeynep Arslan", konum: "B Blok, 6. Kat", durum: "active" },
        { id: 'HO15', hakim: "Ali Şahin", konum: "C Blok, 5. Kat", durum: "active" }
    ],
    arizalar: [
        { id: 'A1', birim: "1. Ağır Ceza Mahkemesi", cihaz: "Yazıcı", tarih: "2024-02-15", durum: "beklemede" },
        { id: 'A2', birim: "1. Tüketici Mahkemesi", cihaz: "Bilgisayar", tarih: "2024-02-14", durum: "işlemde" },
        { id: 'A3', birim: "2 Nolu Salon", cihaz: "Ses Sistemi", tarih: "2024-02-13", durum: "beklemede" },
        { id: 'A4', birim: "Hakim Odası - Ayşe Kaya", cihaz: "Klima", tarih: "2024-02-12", durum: "işlemde" },
        { id: 'A5', birim: "1. Asliye Hukuk Mahkemesi", cihaz: "Bilgisayar", tarih: "2024-02-11", durum: "tamamlandı" }
    ]
};

// Sayfa yüklendiğinde çalışacak ana fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    setupSidebar();
    setupContent();
    checkUserAuthStatus();
    setupThemeToggle();
    
    // Tema değişimini test et
    console.log('Mevcut tema:', document.documentElement.getAttribute('data-theme'));
});

// Kullanıcı oturum durumunu kontrol et
function checkUserAuthStatus() {
    const user = localStorage.getItem('user');
    
    if (!user) {
        // Kullanıcı oturumu yoksa ve login sayfasında değilse, login sayfasına yönlendir
        if (!window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
        return;
}

    // Kullanıcı oturumu varsa, kullanıcı bilgilerini güncelle
    updateUserInfo(JSON.parse(user));
}

// Kullanıcı bilgilerini güncelle
function updateUserInfo(userData) {
    // Sidebar'daki kullanıcı bilgilerini güncelle
    const userAvatar = document.querySelector('.user-profile img');
    const userName = document.querySelector('.user-info h3');
    const userRole = document.querySelector('.user-info p');
    
    if (userAvatar && userData.avatar_url) {
        userAvatar.src = userData.avatar_url;
    }
    
    if (userName) {
        userName.textContent = 'Hoş Geldiniz';
    }
    
    if (userRole && userData.ad_soyad) {
        userRole.textContent = userData.ad_soyad;
    }
}

// Kullanıcı çıkış fonksiyonu (tüm sayfalarda kullanılabilir)
async function logout() {
    try {
        // LocalStorage'dan kullanıcı bilgilerini temizle
        localStorage.removeItem('user');
        
        // Supabase oturumunu sonlandır (eğer varsa)
        if (typeof signOutUser === 'function') {
            await signOutUser();
        }
        
        // Login sayfasına yönlendir
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Çıkış yapılırken hata oluştu:', error);
        // Hata olsa bile login sayfasına yönlendir
        window.location.href = 'login.html';
    }
}

// Sidebar ayarları
function setupSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebarButton = document.querySelector('.toggle-sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const submenuTriggers = document.querySelectorAll('.has-submenu > a');

    if (sidebar && toggleSidebarButton) {
        // Kaydedilmiş sidebar durumunu uygula
        const savedState = localStorage.getItem('sidebarState');
        if (savedState === 'collapsed') {
            sidebar.classList.add('collapsed');
            if (toggleSidebarButton.querySelector('span')) {
            toggleSidebarButton.querySelector('span').textContent = 'Menü Aç';
            }
        }

        // Sidebar toggle olayı
        toggleSidebarButton.addEventListener('click', () => {
            toggleSidebar();
        });

        // Alt menü olayları
        submenuTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
            e.preventDefault();
                e.stopPropagation();
                
                const parent = trigger.parentElement;
                
                // Toggle active class
                parent.classList.toggle('active');
                    
                    // Alt menüyü aç/kapat
                const submenu = parent.querySelector('.submenu');
                const icon = trigger.querySelector('.submenu-icon');
                
                // Submenu height ve ikon değişimi
                    if (submenu) {
                    if (parent.classList.contains('active')) {
                        submenu.style.maxHeight = submenu.scrollHeight + 'px';
                        if (icon) {
                            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                        }
                    } else {
                        submenu.style.maxHeight = null;
                        if (icon) {
                            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                        }
                    }
                }
            });
        });
        
        // Alt menülerdeki tüm linkler için doğrudan tıklama olayı ekle
        document.querySelectorAll('.submenu a').forEach(subMenuItem => {
            subMenuItem.addEventListener('click', function(e) {
                e.stopPropagation(); // Ana menü tıklama olayını engelle
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    window.location.href = href;
                        }
            });
        });

        // Sayfa yüklendiğinde aktif olan sayfa için alt menüyü aç
        setTimeout(initActiveSubmenu, 100); // Küçük bir gecikme ekleyerek DOM'un tamamen yüklenmesini bekle

        // Overlay tıklanınca sidebar'ı kapat
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Pencere boyutu değişince sidebar'ı düzenle
        window.addEventListener('resize', handleResize);
        handleResize();
    }
}

// Sayfa yüklendiğinde aktif olan sayfa için alt menüyü aç
function initActiveSubmenu() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Hakim Odaları sayfası için özel durum
    if (currentPage === 'hakim-odalari.html') {
        const cihazlarMenuItems = document.querySelectorAll('.has-submenu > a');
        
        cihazlarMenuItems.forEach(menuItem => {
            const parent = menuItem.parentElement;
            const submenu = parent.querySelector('.submenu');
            
            if (submenu) {
                const hakimOdalariLink = submenu.querySelector('a[href="hakim-odalari.html"]');
                
                if (hakimOdalariLink) {
                    // Bu parent'a active class ekle
                    parent.classList.add('active');
                
                    // Alt menüyü aç
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    
                    // İkonu değiştir
                    const icon = menuItem.querySelector('.submenu-icon');
                    if (icon) {
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    }
                    
                    // Hakim odalari linkine active class ekle
                    hakimOdalariLink.classList.add('active');
                }
            }
        });
        
        return;
    }
    
    // Diğer sayfalar için genel işlem
    const activeMenuItem = document.querySelector(`.sidebar-nav a[href="${currentPage}"]`);
    
    if (activeMenuItem) {
        // Aktif class'ı ekle
        activeMenuItem.classList.add('active');
        
        // Eğer bu öğe bir alt menüdeyse, alt menüyü aç
        const submenuParent = activeMenuItem.closest('.submenu');
        if (submenuParent) {
            const hasSubmenuParent = submenuParent.parentElement;
            if (hasSubmenuParent && hasSubmenuParent.classList.contains('has-submenu')) {
                hasSubmenuParent.classList.add('active');
                
                // Alt menüyü aç
                submenuParent.style.maxHeight = submenuParent.scrollHeight + 'px';
                
                // İkonu değiştir
                const parentLink = hasSubmenuParent.querySelector('a');
                if (parentLink) {
                    const icon = parentLink.querySelector('.submenu-icon');
                    if (icon) {
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    }
                }
            }
        }
    }
}

// Sidebar toggle fonksiyonu
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebarButton = document.querySelector('.toggle-sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (!sidebar) return;
    
    if (window.innerWidth <= 768) {
        // Mobil görünümde
        sidebar.classList.toggle('active');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active');
        }
        
        // Scroll kilidini ayarla
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    } else {
        // Masaüstü görünümünde
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (toggleSidebarButton && toggleSidebarButton.querySelector('span')) {
            toggleSidebarButton.querySelector('span').textContent = isCollapsed ? 'Menü Aç' : 'Menü Küçült';
        }
        
        localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
    }
}

// Responsive davranış
function handleResize() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth <= 768) {
        sidebar?.classList.remove('collapsed');
        if (sidebar?.classList.contains('active')) {
            sidebarOverlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
            } else {
        sidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
        
        // Kaydedilmiş durumu kontrol et ve uygula
        const savedState = localStorage.getItem('sidebarState');
        if (savedState === 'collapsed' && sidebar) {
            sidebar.classList.add('collapsed');
            toggleSidebarButton.querySelector('span').textContent = 'Menü Aç';
        }
    }
}

// İçerik ayarları
function setupContent() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'hakim-odalari.html':
        setupChambersPage();
                    break;
        case 'arizalar.html':
            setupMaintenancePage();
                    break;
        case 'durusma-salonlari.html':
            // Duruşma salonları için özel bir işlem gerekmediğinden boş bırakıyoruz
                    break;
    }
}

// Hakim odaları sayfası ayarları
function setupChambersPage() {
    updateChamberStats();
    setupChamberFilters();
}

function updateChamberStats() {
    // Example stats - In a real application, these would come from an API
    const stats = {
        totalChambers: 24,
        withLaptops: 20,
        withPrinters: 12,
        issueCount: 3
    };

    // Update stats in the DOM
    document.querySelectorAll('.stat-card p').forEach((stat, index) => {
        switch(index) {
            case 0: stat.textContent = stats.totalChambers; break;
            case 1: stat.textContent = stats.withLaptops; break;
            case 2: stat.textContent = stats.withPrinters; break;
            case 3: stat.textContent = stats.issueCount; break;
        }
    });
}

function setupChamberFilters() {
    const searchInput = document.querySelector('.search-box input');
    const locationFilter = document.querySelector('select[name="location"]');
    const equipmentFilter = document.querySelector('select[name="equipment"]');

    if (searchInput) {
        searchInput.addEventListener('input', filterChambers);
    }

    if (locationFilter) {
        locationFilter.addEventListener('change', filterChambers);
    }

    if (equipmentFilter) {
        equipmentFilter.addEventListener('change', filterChambers);
    }
}

function filterChambers() {
    const searchTerm = document.querySelector('.search-box input')?.value.toLowerCase() || '';
    const location = document.querySelector('select[name="location"]')?.value || '';
    const equipment = document.querySelector('select[name="equipment"]')?.value || '';

    const chambers = document.querySelectorAll('.chamber-card');
    chambers.forEach(chamber => {
        const chamberName = chamber.querySelector('.chamber-info h2').textContent.toLowerCase();
        const chamberLocation = chamber.querySelector('.chamber-info p').textContent.toLowerCase();
        const hasEquipment = equipment === '' || chamber.querySelector(`.hardware-status-item i.fa-${equipment}`);

        const matchesSearch = chamberName.includes(searchTerm) || chamberLocation.includes(searchTerm);
        const matchesLocation = location === '' || chamberLocation.includes(location.toLowerCase());
        const matchesEquipment = equipment === '' || hasEquipment;

        chamber.style.display = matchesSearch && matchesLocation && matchesEquipment ? 'block' : 'none';
    });
}

// Chamber Detail Page Functions
function setupChamberDetailPage() {
    setupMaintenanceHistory();
    setupHardwareActions();
}

function setupMaintenanceHistory() {
    // Example maintenance history - In a real application, this would come from an API
    const maintenanceHistory = [
        {
            type: 'maintenance',
            title: 'Rutin Bakım',
            date: '15.03.2024',
            description: 'Dizüstü bilgisayar ve yazıcı bakımı yapıldı. Tüm cihazlar test edildi.',
            technician: 'Mehmet Tekniker'
        },
        {
            type: 'issue',
            title: 'Yazıcı Arızası',
            date: '01.02.2024',
            description: 'Kağıt sıkışması sorunu giderildi. Yazıcı kafası temizlendi.',
            technician: 'Ali Tekniker'
        }
    ];

    const timeline = document.querySelector('.timeline');
    if (timeline) {
        maintenanceHistory.forEach(item => {
            const timelineItem = createTimelineItem(item);
            timeline.appendChild(timelineItem);
        });
    }
}

function createTimelineItem(item) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    timelineItem.innerHTML = `
        <div class="timeline-icon ${item.type === 'issue' ? 'issue' : ''}">
            <i class="fas fa-${item.type === 'issue' ? 'exclamation-circle' : 'wrench'}"></i>
                </div>
        <div class="timeline-content">
            <div class="timeline-header">
                <h3>${item.title}</h3>
                <span class="date">${item.date}</span>
                </div>
            <p>${item.description}</p>
            <div class="timeline-footer">
                <span class="technician">
                    <i class="fas fa-user"></i>
                    ${item.technician}
                </span>
                </div>
            </div>
        `;
    return timelineItem;
}

function setupHardwareActions() {
    const actionButtons = document.querySelectorAll('.hardware-card .btn-icon');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Example action menu - In a real application, this would show a dropdown menu
            const hardwareCard = button.closest('.hardware-card');
            const hardwareName = hardwareCard.querySelector('.hardware-info h3').textContent;
            console.log(`Showing actions for ${hardwareName}`);
        });
    });
}

// Initialize pages based on current URL
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('hakim-odalari.html')) {
        setupChambersPage();
    } else if (currentPath.includes('hakim-odasi-detay.html')) {
        setupChamberDetailPage();
    }
});

// Cihaz ekleme modalını aç
function openAddDeviceModal(locationId) {
    const modal = document.getElementById('addDeviceModal');
    if (modal) {
        modal.setAttribute('data-location-id', locationId);
        modal.classList.add('show');
    }
}

// Modalı kapat
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Form verilerini temizle
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Cihaz kaydetme
function saveDevice() {
    const modal = document.getElementById('addDeviceModal');
    const form = document.getElementById('addDeviceForm');
    
    if (!form) return;

    // Form verilerini al
    const formData = {
        locationId: modal.getAttribute('data-location-id'),
        deviceType: form.deviceType.value,
        deviceBrand: form.deviceBrand.value,
        deviceModel: form.deviceModel.value,
        serialNumber: form.serialNumber.value,
        person: {
            title: form.personTitle.value,
            id: form.personId.value,
            name: form.personName.value
        }
    };

    // Form validasyonu
    if (!validateDeviceForm(formData)) {
        showNotification('Lütfen tüm alanları doldurunuz', 'error');
        return;
    }

    // Cihaz verilerini kaydet (örnek olarak localStorage'a kaydediyoruz)
    saveDeviceToStorage(formData);

    // Modalı kapat ve bildirim göster
    closeModal('addDeviceModal');
    showNotification('Cihaz başarıyla eklendi', 'success');
}

// Form validasyonu
function validateDeviceForm(data) {
    return data.deviceType && 
           data.deviceBrand && 
           data.deviceModel && 
           data.serialNumber && 
           data.person.title && 
           data.person.id && 
           data.person.name;
}

// Cihaz verilerini localStorage'a kaydet
function saveDeviceToStorage(deviceData) {
    let devices = JSON.parse(localStorage.getItem('devices') || '[]');
    devices.push({
        ...deviceData,
        id: 'D' + Date.now(),
        addedDate: new Date().toISOString()
    });
    localStorage.setItem('devices', JSON.stringify(devices));
}

// Bildirim göster
function showNotification(message, type = 'success') {
    console.log('Bildirim gösteriliyor:', { message, type });
    
    try {
        // Önceki bildirimleri temizle
        const existingNotifications = document.querySelectorAll('.notification');
        console.log('Mevcut bildirim sayısı:', existingNotifications.length);
        existingNotifications.forEach(notification => {
            console.log('Eski bildirim kaldırılıyor:', notification);
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        console.log('Bildirim elementi oluşturuldu:', notification);
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Bildirimi sayfanın üst kısmına ekle
        document.body.insertBefore(notification, document.body.firstChild);
        console.log('Bildirim DOM\'a eklendi');
        
        // Bildirimi göster
        setTimeout(() => {
            console.log('Bildirim gösteriliyor (show class eklendi)');
            notification.classList.add('show');
        }, 10);
        
        // Otomatik kapanma süresi
        const autoHide = setTimeout(() => {
            console.log('Bildirim otomatik kapanıyor');
            hideNotification(notification);
        }, 8000);
        
        // Kapatma butonu işlevi
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            console.log('Kapatma butonu bulundu');
            closeBtn.addEventListener('click', () => {
                console.log('Kapatma butonuna tıklandı');
                clearTimeout(autoHide);
                hideNotification(notification);
            });
        } else {
            console.warn('Kapatma butonu bulunamadı!');
        }
    } catch (error) {
        console.error('Bildirim gösterilirken hata oluştu:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            type: error.name
        });
    }
}

// Bildirimi gizle
function hideNotification(notification) {
    console.log('Bildirim gizleniyor:', notification);
    
    try {
        if (!notification) {
            console.warn('Gizlenecek bildirim bulunamadı!');
            return;
        }
        
        notification.classList.remove('show');
        notification.classList.add('hide');
        console.log('Bildirim gizleme sınıfları eklendi');
        
        setTimeout(() => {
            if (notification && notification.parentNode) {
                console.log('Bildirim DOM\'dan kaldırılıyor');
                notification.parentNode.removeChild(notification);
            } else {
                console.warn('Bildirim veya parent node bulunamadı!');
            }
        }, 300);
    } catch (error) {
        console.error('Bildirim gizlenirken hata oluştu:', error);
        console.error('Hata detayı:', {
            message: error.message,
            stack: error.stack,
            type: error.name
        });
    }
}

// Tema değiştirme butonunu ayarla
function setupThemeToggle() {
    const toggleThemeButton = document.querySelector('.toggle-theme');
    const htmlElement = document.documentElement;
    
    // Sayfa yüklendiğinde tema ayarlanır
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    
    if (toggleThemeButton) {
        const themeIcon = toggleThemeButton.querySelector('i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Tema değiştirme olayı
        toggleThemeButton.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Tema değişimini uygula
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // İkonu güncelle
            if (themeIcon) {
                themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            // Tema değişimini konsola yazdır (debug için)
            console.log('Tema değiştirildi:', newTheme);
        });
    } else {
        console.warn('Tema değiştirme butonu bulunamadı!');
    }
} 