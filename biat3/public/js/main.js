// Örnek Veri
const state = {
    durusmaSalonlari: [
        { id: 'DS1', ad: "1 Nolu Salon", konum: "A Blok, Zemin Kat", durum: "active" },
        { id: 'DS2', ad: "2 Nolu Salon", konum: "A Blok, 1. Kat", durum: "issue" },
        { id: 'DS3', ad: "3 Nolu Salon", konum: "B Blok, Zemin Kat", durum: "active" },
        { id: 'DS4', ad: "4 Nolu Salon", konum: "B Blok, 1. Kat", durum: "maintenance" },
        { id: 'DS5', ad: "5 Nolu Salon", konum: "C Blok, Zemin Kat", durum: "active" },
        { id: 'DS6', ad: "6 Nolu Salon", konum: "C Blok, 1. Kat", durum: "active" },
        { id: 'DS7', ad: "7 Nolu Salon", konum: "D Blok, Zemin Kat", durum: "active" },
        { id: 'DS8', ad: "8 Nolu Salon", konum: "D Blok, 1. Kat", durum: "active" }
    ],
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
    setupTheme();
    setupSidebar();
    setupContent();
    checkLoginStatus();
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

// Tema ayarları
function setupTheme() {
    const htmlElement = document.documentElement;
    const toggleThemeButton = document.querySelector('.toggle-theme');
    
    // Kaydedilmiş tema varsa uygula
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    
    // Tema değiştirme butonu varsa
    if (toggleThemeButton) {
        // İkon güncelleme fonksiyonu
        const updateThemeIcon = (theme) => {
            const themeIcon = toggleThemeButton.querySelector('i');
            if (themeIcon) {
                themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        };

        // Başlangıçta ikonu ayarla
        updateThemeIcon(savedTheme);

        // Tema değiştirme olayı
        toggleThemeButton.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Tema değişikliğini uygula
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // İkonu güncelle
            updateThemeIcon(newTheme);
        });
    }
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
            updateSidebarButtonText('Menü Aç');
        }

        // Sidebar toggle olayı
        toggleSidebarButton.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('active');
                sidebarOverlay?.classList.toggle('active');
                document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
            } else {
                sidebar.classList.toggle('collapsed');
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
                updateSidebarButtonText(isCollapsed ? 'Menü Aç' : 'Menü Küçült');
            }
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

// Sidebar buton metnini güncelle
function updateSidebarButtonText(text) {
    const toggleText = document.querySelector('.toggle-sidebar span');
    if (toggleText) {
        toggleText.textContent = text;
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
            updateSidebarButtonText('Menü Aç');
        }
    }
}

// Sayfa içeriğini ayarla
function setupContent() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'durusma-salonlari.html':
            setupCourtroomsPage();
            break;
        case 'hakim-odalari.html':
            setupChambersPage();
            break;
        case 'ariza-listesi.html':
            // Arıza listesi sayfası için gerekli işlemler
            break;
        default:
            // Ana sayfa veya diğer sayfalar için varsayılan işlemler
            break;
    }
}

// Duruşma Salonları Sayfası
function setupCourtroomsPage() {
    updateCourtroomStats();
    setupViewToggle();
    setupCourtroomFilters();
    loadCourtroomCards();
}

// İstatistikleri güncelle
function updateCourtroomStats() {
    const stats = {
        active: state.durusmaSalonlari.filter(salon => salon.durum === 'active').length,
        issue: state.durusmaSalonlari.filter(salon => salon.durum === 'issue').length,
        maintenance: state.durusmaSalonlari.filter(salon => salon.durum === 'maintenance').length,
        total: state.durusmaSalonlari.length
    };

    document.getElementById('totalCourtrooms').textContent = stats.total;
    document.getElementById('activeCourtrooms').textContent = stats.active;
    document.getElementById('issueCourtrooms').textContent = stats.issue;
    document.getElementById('maintenanceCourtrooms').textContent = stats.maintenance;
}

// Grid/List görünüm değiştirme
function setupViewToggle() {
    const viewButtons = document.querySelectorAll('.btn-view');
    const courtroomsContainer = document.getElementById('courtroomsContainer');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            
            // Aktif buton stilini güncelle
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Container sınıfını güncelle
            courtroomsContainer.classList.remove('grid-view', 'list-view');
            courtroomsContainer.classList.add(`${view}-view`);

            // Görünüm tercihini kaydet
            localStorage.setItem('courtroomsView', view);
        });
    });

    // Kaydedilmiş görünüm tercihini uygula
    const savedView = localStorage.getItem('courtroomsView') || 'grid';
    const activeViewButton = document.querySelector(`[data-view="${savedView}"]`);
    if (activeViewButton) {
        activeViewButton.click();
    }
}

// Filtreleme işlevleri
function setupCourtroomFilters() {
    const searchInput = document.getElementById('courtroomSearch');
    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');
    const capacityFilter = document.getElementById('capacityFilter');
    const resetButton = document.getElementById('resetFilters');
    const applyButton = document.getElementById('applyFilters');
    const activeFiltersContainer = document.getElementById('activeFilters');

    // Aktif filtreleri göster
    function updateActiveFilters() {
        if (!activeFiltersContainer) return;

        activeFiltersContainer.innerHTML = '';
        let hasActiveFilters = false;

        // Arama filtresi
        if (searchInput?.value) {
            hasActiveFilters = true;
            addFilterTag('Arama', searchInput.value);
        }

        // Konum filtresi
        if (locationFilter?.value) {
            hasActiveFilters = true;
            addFilterTag('Konum', locationFilter.options[locationFilter.selectedIndex].text);
        }

        // Durum filtresi
        if (statusFilter?.value) {
            hasActiveFilters = true;
            addFilterTag('Durum', statusFilter.options[statusFilter.selectedIndex].text);
        }

        // Kapasite filtresi
        if (capacityFilter?.value) {
            hasActiveFilters = true;
            addFilterTag('Kapasite', capacityFilter.options[capacityFilter.selectedIndex].text);
        }

        // Aktif filtre yoksa container'ı gizle
        activeFiltersContainer.style.display = hasActiveFilters ? 'flex' : 'none';
    }

    // Filtre etiketi ekle
    function addFilterTag(label, value) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            <span>${label}: ${value}</span>
            <i class="fas fa-times" data-filter="${label.toLowerCase()}"></i>
        `;

        // Filtre kaldırma işlevi
        tag.querySelector('i').addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            switch (filterType) {
                case 'arama':
                    if (searchInput) searchInput.value = '';
                    break;
                case 'konum':
                    if (locationFilter) locationFilter.value = '';
                    break;
                case 'durum':
                    if (statusFilter) statusFilter.value = '';
                    break;
                case 'kapasite':
                    if (capacityFilter) capacityFilter.value = '';
                    break;
            }
            filterCourtrooms();
        });

        activeFiltersContainer.appendChild(tag);
    }

    // Filtreleme fonksiyonu
    function filterCourtrooms() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const selectedLocation = locationFilter?.value || '';
        const selectedStatus = statusFilter?.value || '';
        const selectedCapacity = capacityFilter?.value || '';

        const filteredCourtrooms = state.durusmaSalonlari.filter(salon => {
            const matchesSearch = !searchTerm || 
                salon.ad.toLowerCase().includes(searchTerm) ||
                salon.konum.toLowerCase().includes(searchTerm);
            
            const matchesLocation = !selectedLocation || salon.konum.includes(selectedLocation);
            const matchesStatus = !selectedStatus || salon.durum === selectedStatus;
            
            // Kapasite filtresi için örnek kontrol
            let matchesCapacity = true;
            if (selectedCapacity) {
                const capacity = getCapacityValue(salon.ad); // Örnek fonksiyon
                switch (selectedCapacity) {
                    case 'small':
                        matchesCapacity = capacity <= 30;
                        break;
                    case 'medium':
                        matchesCapacity = capacity > 30 && capacity <= 60;
                        break;
                    case 'large':
                        matchesCapacity = capacity > 60;
                        break;
                }
            }

            return matchesSearch && matchesLocation && matchesStatus && matchesCapacity;
        });

        const container = document.getElementById('courtroomsContainer');
        if (container) {
            container.innerHTML = filteredCourtrooms.map(createCourtroomCard).join('');
        }

        // Aktif filtreleri güncelle
        updateActiveFilters();
    }

    // Event listeners
    searchInput?.addEventListener('input', filterCourtrooms);
    locationFilter?.addEventListener('change', filterCourtrooms);
    statusFilter?.addEventListener('change', filterCourtrooms);
    capacityFilter?.addEventListener('change', filterCourtrooms);

    // Filtreleri sıfırla
    resetButton?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (locationFilter) locationFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (capacityFilter) capacityFilter.value = '';
        filterCourtrooms();
    });

    // Filtreleri uygula
    applyButton?.addEventListener('click', filterCourtrooms);

    // İlk yükleme
    filterCourtrooms();
}

// Duruşma salonu kartı oluştur
function createCourtroomCard(salon) {
    const statusText = {
        active: 'Aktif',
        issue: 'Arızalı',
        maintenance: 'Bakımda'
    }[salon.durum] || 'Bilinmiyor';

    // Örnek duruşma programı
    const hearings = getHearingsForCourtroom(salon.id);

    return `
        <div class="courtroom-card">
            <div class="courtroom-header">
                <div class="courtroom-title">
                    <div class="courtroom-icon">
                        <i class="fas fa-gavel"></i>
                    </div>
                    <h2 class="courtroom-name">${salon.ad}</h2>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openAddDeviceModal('${salon.id}')">
                        <i class="fas fa-plus-circle"></i>
                    </button>
                    <span class="courtroom-status ${salon.durum}">${statusText}</span>
                </div>
            </div>
            <div class="courtroom-content">
                <div class="courtroom-info">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${salon.konum}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>Kapasite: ${getCapacityValue(salon.ad)} Kişi</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-microphone"></i>
                        <span>Ses Sistemi: ${salon.durum === 'active' ? 'Çalışıyor' : 'Kontrol Gerekli'}</span>
                    </div>
                </div>
                ${hearings.length > 0 ? `
                    <div class="courtroom-schedule">
                        <div class="schedule-title">
                            <span>Bugünkü Duruşmalar</span>
                            <span>${hearings.length} Duruşma</span>
                        </div>
                        <div class="schedule-list">
                            ${hearings.map(hearing => `
                                <div class="schedule-item">
                                    <span class="schedule-time">${hearing.time}</span>
                                    <span class="schedule-case">${hearing.case}</span>
                                    <span class="schedule-status">${hearing.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Yardımcı fonksiyonlar
function getCapacityValue(salonAdi) {
    // Örnek kapasite değerleri
    const match = salonAdi.match(/\d+/);
    const salonNo = match ? parseInt(match[0]) : 0;
    return 30 + (salonNo * 5); // Örnek hesaplama
}

function getHearingsForCourtroom(salonId) {
    // Örnek duruşma verileri
    return [
        { time: '09:30', case: '2024/123 E.', status: 'Bekliyor' },
        { time: '11:00', case: '2024/456 E.', status: 'Tamamlandı' },
        { time: '14:30', case: '2024/789 E.', status: 'Bekliyor' }
    ];
}

// Judges' Chambers Page Functions
function setupChambersPage() {
    updateChamberStats();
    setupViewToggle();
    setupChamberFilters();
    loadChamberCards();
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

/* ... existing code ... */ 