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
    checkLoginStatus();
    
    // Sidebar toggle butonuna tıklama olayı ekle
    const sidebarToggle = document.querySelector('.toggle-sidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
});

// Login durumunu kontrol et
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isLoggedIn && currentPage !== 'login.html') {
        window.location.href = 'login.html';
    }
}

// Logout fonksiyonu
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    window.location.href = 'login.html';
}

// Sidebar ayarları
function setupSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebarButton = document.querySelector('.toggle-sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    if (sidebar && toggleSidebarButton) {
        // Kaydedilmiş sidebar durumunu uygula
        const savedState = localStorage.getItem('sidebarState');
        if (savedState === 'collapsed') {
            sidebar.classList.add('collapsed');
            toggleSidebarButton.querySelector('span').textContent = 'Menü Aç';
        }

        // Sidebar toggle olayı
        toggleSidebarButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            toggleSidebarButton.querySelector('span').textContent = isCollapsed ? 'Menü Aç' : 'Menü Küçült';
            localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
        });

        // Alt menü olayları
        document.querySelectorAll('.has-submenu').forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => {
            e.preventDefault();
                    item.classList.toggle('active');
                    
                    // Alt menü ikonunu döndür
                    const submenuIcon = link.querySelector('.submenu-icon');
                    if (submenuIcon) {
                        submenuIcon.style.transform = item.classList.contains('active') ? 'rotate(180deg)' : '';
                    }
                    
                    // Alt menüyü aç/kapat
                    const submenu = item.querySelector('.submenu');
                    if (submenu) {
                        const isExpanding = !item.classList.contains('active');
                        submenu.style.height = isExpanding ? '0' : submenu.scrollHeight + 'px';
                        
                        // Animasyon tamamlandıktan sonra height: auto yap
                        if (!isExpanding) {
                setTimeout(() => {
                                submenu.style.height = 'auto';
                }, 300);
                        }
                    }
                });
            }
        });

        // Overlay tıklama olayı
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Ekran boyutu değişimi
        window.addEventListener('resize', handleResize);
        handleResize();
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
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Sidebar'ı aç/kapat
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar');
    
    sidebar.classList.toggle('collapsed');
    toggleBtn.querySelector('span').textContent = 
        sidebar.classList.contains('collapsed') ? 'Menü Aç' : 'Menü Küçült';
} 