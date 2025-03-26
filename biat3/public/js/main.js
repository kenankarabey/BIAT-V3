// Örnek Veri
const state = {
    courtOffices: [
        {
            id: 'AC1',
            ad: "1. Ağır Ceza Mahkemesi",
            konum: "A Blok, 3. Kat",
            telefon: "0312 123 45 67",
            eposta: "agirceza1@adalet.gov.tr",
            personel: {
                hakim: { adSoyad: "Ahmet Yılmaz", sicilNo: "H123456" },
                katip: { adSoyad: "Ayşe Demir", sicilNo: "K789012" },
                mubasir: { adSoyad: "Mehmet Kaya", sicilNo: "M345678" }
            },
            durum: "active",
            cihazlar: [
                { tip: "Bilgisayar", durum: "active" },
                { tip: "Yazıcı", durum: "issue" },
                { tip: "Tarayıcı", durum: "active" },
                { tip: "Telefon", durum: "active" }
            ]
        },
        {
            id: 'TM1',
            ad: "1. Tüketici Mahkemesi",
            konum: "B Blok, 2. Kat",
            telefon: "0312 123 45 68",
            eposta: "tuketici1@adalet.gov.tr",
            personel: {
                hakim: { adSoyad: "Fatma Şahin", sicilNo: "H234567" },
                katip: { adSoyad: "Ali Yıldız", sicilNo: "K890123" },
                mubasir: { adSoyad: "Zeynep Kara", sicilNo: "M456789" }
            },
            durum: "issue",
            cihazlar: [
                { tip: "Bilgisayar", durum: "issue" },
                { tip: "Yazıcı", durum: "active" },
                { tip: "Tarayıcı", durum: "maintenance" },
                { tip: "Telefon", durum: "active" }
            ]
        },
        {
            id: 'AH1',
            ad: "1. Asliye Hukuk Mahkemesi",
            konum: "C Blok, 1. Kat",
            telefon: "0312 123 45 69",
            eposta: "asliyehukuk1@adalet.gov.tr",
            personel: {
                hakim: { adSoyad: "Mustafa Öztürk", sicilNo: "H345678" },
                katip: { adSoyad: "Elif Yılmaz", sicilNo: "K901234" },
                mubasir: { adSoyad: "Hasan Demir", sicilNo: "M567890" }
            },
            durum: "maintenance",
            cihazlar: [
                { tip: "Bilgisayar", durum: "maintenance" },
                { tip: "Yazıcı", durum: "active" },
                { tip: "Tarayıcı", durum: "active" },
                { tip: "Telefon", durum: "active" }
            ]
        }
    ],
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
});

// Tema ayarları
function setupTheme() {
    const htmlElement = document.documentElement;
    const toggleThemeButton = document.querySelector('.toggle-theme');
    
    if (toggleThemeButton) {
        // Kaydedilmiş tema varsa uygula
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
        toggleThemeButton.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        // Tema değiştirme olayı
        toggleThemeButton.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            toggleThemeButton.querySelector('i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('theme', newTheme);
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

// İstatistikleri güncelle
function updateStatistics() {
    // Toplam mahkeme sayısı
    const totalCourts = state.courtOffices.length;
    document.getElementById('totalCourts').textContent = totalCourts;

    // Aktif arıza sayısı
    const activeIssues = state.arizalar.filter(ariza => ariza.durum === 'beklemede' || ariza.durum === 'işlemde').length;
    document.getElementById('activeIssues').textContent = activeIssues;

    // Bakımda olan cihaz sayısı
    const maintenanceCount = state.courtOffices.reduce((total, office) => {
        return total + office.cihazlar.filter(cihaz => cihaz.durum === 'maintenance').length;
    }, 0);
    document.getElementById('maintenanceCount').textContent = maintenanceCount;

    // Aktif cihaz sayısı
    const activeDevices = state.courtOffices.reduce((total, office) => {
        return total + office.cihazlar.filter(cihaz => cihaz.durum === 'active').length;
    }, 0);
    document.getElementById('activeDevices').textContent = activeDevices;
}

// Arıza dağılımı grafiği
function createIssueDistributionChart() {
    const ctx = document.getElementById('issueDistribution');
    if (!ctx) return;

    const issuesByType = {};
    state.arizalar.forEach(ariza => {
        issuesByType[ariza.cihaz] = (issuesByType[ariza.cihaz] || 0) + 1;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(issuesByType),
            datasets: [{
                data: Object.values(issuesByType),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Cihaz Türüne Göre Arıza Dağılımı'
                }
            }
        }
    });
}

// Cihaz durumları grafiği
function createDeviceStatusChart() {
    const ctx = document.getElementById('deviceStatus');
    if (!ctx) return;

    const deviceStatus = {
        active: 0,
        issue: 0,
        maintenance: 0
    };

    state.courtOffices.forEach(office => {
        office.cihazlar.forEach(cihaz => {
            deviceStatus[cihaz.durum]++;
        });
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Aktif', 'Arızalı', 'Bakımda'],
            datasets: [{
                label: 'Cihaz Sayısı',
                data: [
                    deviceStatus.active,
                    deviceStatus.issue,
                    deviceStatus.maintenance
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#F44336',
                    '#FFC107'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Cihaz Durumları'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Sayfa içeriğini yükle
function setupContent() {
    const path = window.location.pathname;
    
    if (path.includes('durusma-salonlari.html')) {
        setupCourtroomsPage();
    } else if (path.includes('mahkeme-detay.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const mahkemeId = urlParams.get('id');
        loadMahkemeDetay(mahkemeId);
    } else if (path.includes('mahkeme-kalemleri.html')) {
        loadCourtOfficesContent();
        setupFilters();
    } else if (path.includes('index.html') || path === '/') {
        updateStatistics();
        createIssueDistributionChart();
        createDeviceStatusChart();
    } else if (path.includes('hakim-odalari.html')) {
        setupChambersPage();
    } else if (path.includes('hakim-odasi-detay.html')) {
        setupChamberDetailPage();
    }
}

// Mahkeme detay sayfası için yeni fonksiyonlar
async function loadMahkemeDetay(mahkemeId) {
    // Simüle edilmiş veri
    const mahkemeData = {
        id: mahkemeId,
        name: "Ankara 1. Asliye Hukuk Mahkemesi",
        type: "Asliye Hukuk Mahkemesi",
        location: "Ankara Adliyesi",
        status: "Aktif",
        lastUpdate: "2024-03-15T10:30:00",
        stats: {
            totalIssues: 156,
            resolvedIssues: 142,
            avgResolutionTime: "2.5 gün",
            resolutionRate: 91,
            trend: 5.2
        },
        personnel: [
            { id: 1, name: "Ahmet Yılmaz", role: "Hakim", avatar: "avatars/1.jpg" },
            { id: 2, name: "Ayşe Demir", role: "Yazı İşleri Müdürü", avatar: "avatars/2.jpg" },
            { id: 3, name: "Mehmet Kaya", role: "Zabıt Katibi", avatar: "avatars/3.jpg" }
        ],
        devices: [
            { id: 1, name: "Yazıcı HP-1", type: "Yazıcı", status: "Aktif", lastMaintenance: "2024-02-20" },
            { id: 2, name: "Tarayıcı-1", type: "Tarayıcı", status: "Bakımda", lastMaintenance: "2024-03-10" },
            { id: 3, name: "Bilgisayar-1", type: "Bilgisayar", status: "Aktif", lastMaintenance: "2024-01-15" }
        ],
        activities: [
            { id: 1, type: "issue", title: "Yazıcı arızası giderildi", date: "2024-03-14T15:20:00", status: "Çözüldü" },
            { id: 2, type: "maintenance", title: "Rutin bakım yapıldı", date: "2024-03-10T09:00:00", status: "Tamamlandı" },
            { id: 3, type: "issue", title: "Network sorunu", date: "2024-03-05T11:30:00", status: "Çözüldü" }
        ]
    };

    updateDetailHeader(mahkemeData);
    updateInfoCards(mahkemeData);
    updatePersonnel(mahkemeData.personnel);
    updateDevices(mahkemeData.devices);
    updateActivityTimeline(mahkemeData.activities);
    generateQRCode(mahkemeData);
    generateBarcode(mahkemeData);
}

function updateDetailHeader(data) {
    const header = document.querySelector('.quick-info');
    if (header) {
        header.innerHTML = `
            <h1>${data.name}</h1>
            <div class="status-indicator">
                <span class="status-dot"></span>
                <span class="status-text">${data.status}</span>
            </div>
        `;
    }
}

function updateInfoCards(data) {
    const { stats } = data;
    const infoCardsRow = document.querySelector('.info-cards-row');
    if (infoCardsRow) {
        infoCardsRow.innerHTML = `
            <div class="info-card">
                <div class="info-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="info-details">
                    <span class="info-label">Toplam Arıza</span>
                    <span class="info-value">${stats.totalIssues}</span>
                    <div class="info-trend positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>${stats.trend}%</span>
                    </div>
                </div>
            </div>
            <div class="info-card">
                <div class="info-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="info-details">
                    <span class="info-label">Ortalama Çözüm Süresi</span>
                    <span class="info-value">${stats.avgResolutionTime}</span>
                </div>
            </div>
            <div class="info-card">
                <div class="info-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="info-details">
                    <span class="info-label">Çözüm Oranı</span>
                    <span class="info-value">%${stats.resolutionRate}</span>
                </div>
            </div>
        `;
    }
}

function updatePersonnel(personnel) {
    const personnelGrid = document.querySelector('.personnel-grid');
    if (personnelGrid) {
        personnelGrid.innerHTML = personnel.map(person => `
            <div class="personnel-card">
                <img src="${person.avatar}" alt="${person.name}" class="personnel-avatar">
                <div class="personnel-info">
                    <h3>${person.name}</h3>
                    <span>${person.role}</span>
                </div>
            </div>
        `).join('');
    }
}

function updateDevices(devices) {
    const devicesGrid = document.querySelector('.devices-grid');
    if (devicesGrid) {
        devicesGrid.innerHTML = devices.map(device => `
            <div class="device-card">
                <div class="device-icon">
                    <i class="fas ${getDeviceIcon(device.type)}"></i>
                </div>
                <div class="device-info">
                    <h3>${device.name}</h3>
                    <span class="device-type">${device.type}</span>
                    <span class="device-status ${device.status.toLowerCase()}">${device.status}</span>
                    <span class="device-maintenance">Son Bakım: ${formatDate(device.lastMaintenance)}</span>
                </div>
            </div>
        `).join('');
    }
}

function updateActivityTimeline(activities) {
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        timeline.innerHTML = activities.map(activity => `
            <div class="timeline-item ${activity.type}">
                <div class="timeline-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="timeline-content">
                    <h3>${activity.title}</h3>
                    <span class="timeline-date">${formatDate(activity.date)}</span>
                    <span class="timeline-status">${activity.status}</span>
                </div>
            </div>
        `).join('');
    }
}

async function generateQRCode(data) {
    const qrContainer = document.getElementById('qrCode');
    if (qrContainer) {
        // Clear previous QR code if exists
        qrContainer.innerHTML = '';
        
        new QRCode(qrContainer, {
            text: `https://biat.adalet.gov.tr/mahkeme/${data.id}`,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

async function generateBarcode(data) {
    const barcodeContainer = document.getElementById('barcode');
    if (barcodeContainer) {
        JsBarcode("#barcode", data.id, {
            format: "CODE128",
            width: 2.5,
            height: 80,
            displayValue: true,
            fontSize: 16,
            margin: 10,
            background: "#ffffff",
            lineColor: "#000000"
        });
    }
}

// Yardımcı fonksiyonlar
function getDeviceIcon(type) {
    const icons = {
        'Yazıcı': 'fa-print',
        'Tarayıcı': 'fa-scanner',
        'Bilgisayar': 'fa-desktop'
    };
    return icons[type] || 'fa-cube';
}

function getActivityIcon(type) {
    const icons = {
        'issue': 'fa-exclamation-circle',
        'maintenance': 'fa-wrench',
        'update': 'fa-sync'
    };
    return icons[type] || 'fa-info-circle';
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Mahkeme kartı HTML'i oluştur
function createMahkemeCard(mahkeme) {
    const statusClass = {
        active: 'status-active',
        issue: 'status-issue',
        maintenance: 'status-maintenance'
    }[mahkeme.durum] || '';

    const statusText = {
        active: 'Aktif',
        issue: 'Arızalı',
        maintenance: 'Bakımda'
    }[mahkeme.durum] || 'Bilinmiyor';

    return `
        <div class="court-office-card ${statusClass}" onclick="window.open('mahkeme-detay.html?id=${mahkeme.id}', '_blank')">
            <div class="card-header">
                <div class="card-icon">
                    <i class="fas fa-building"></i>
            </div>
                <div class="card-title">
                    <h2>${mahkeme.ad}</h2>
                    <p>${mahkeme.konum}</p>
            </div>
                <div class="card-status">
                    <span class="status-badge">${statusText}</span>
            </div>
        </div>
        <div class="card-content">
                <div class="info-row">
                    <i class="fas fa-user"></i>
                    <span>${mahkeme.personel.hakim.adSoyad}</span>
            </div>
                <div class="info-row">
                    <i class="fas fa-phone"></i>
                    <span>${mahkeme.telefon}</span>
        </div>
                <div class="info-row">
                    <i class="fas fa-envelope"></i>
                    <span>${mahkeme.eposta}</span>
        </div>
            </div>
        </div>
    `;
}

// Mahkeme listesini yükle
function loadCourtOfficesContent() {
    const grid = document.querySelector('.court-offices-grid');
    if (grid) {
        grid.innerHTML = state.courtOffices.map(createMahkemeCard).join('');
    }
}

// Filtreleri ayarla
function setupFilters() {
    // DOM elementlerini seç
    const searchInput = document.getElementById('courtOfficeSearch');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetButton = document.getElementById('resetFilters');
    const applyButton = document.getElementById('applyFilters');
    const activeFiltersContainer = document.getElementById('activeFilters');

    // Konum filtresi için seçenekleri doldur
    if (locationFilter) {
        const locations = [...new Set(state.courtOffices.map(office => office.konum))];
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }

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

        // Tür filtresi
        if (typeFilter?.value) {
            hasActiveFilters = true;
            addFilterTag('Tür', typeFilter.options[typeFilter.selectedIndex].text);
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
                case 'tür':
                    if (typeFilter) typeFilter.value = '';
                    break;
                case 'konum':
                    if (locationFilter) locationFilter.value = '';
                    break;
                case 'durum':
                    if (statusFilter) statusFilter.value = '';
                    break;
            }
            filterCourts();
        });

        activeFiltersContainer.appendChild(tag);
    }

    // Filtreleme fonksiyonu
    function filterCourts() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const selectedType = typeFilter?.value || '';
        const selectedLocation = locationFilter?.value || '';
        const selectedStatus = statusFilter?.value || '';

        const filteredCourts = state.courtOffices.filter(office => {
            const matchesSearch = !searchTerm || 
                office.ad.toLowerCase().includes(searchTerm) ||
                office.konum.toLowerCase().includes(searchTerm) ||
                office.personel.hakim.adSoyad.toLowerCase().includes(searchTerm);
            
            const matchesType = !selectedType || office.ad.includes(selectedType);
            const matchesLocation = !selectedLocation || office.konum === selectedLocation;
            const matchesStatus = !selectedStatus || office.durum === selectedStatus;

            return matchesSearch && matchesType && matchesLocation && matchesStatus;
        });

        const grid = document.querySelector('.court-offices-grid');
        if (grid) {
            grid.innerHTML = filteredCourts.map(createMahkemeCard).join('');
        }

        // Aktif filtreleri güncelle
        updateActiveFilters();
    }

    // Event listeners
    searchInput?.addEventListener('input', filterCourts);
    typeFilter?.addEventListener('change', filterCourts);
    locationFilter?.addEventListener('change', filterCourts);
    statusFilter?.addEventListener('change', filterCourts);

    // Filtreleri sıfırla
    resetButton?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (typeFilter) typeFilter.value = '';
        if (locationFilter) locationFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        filterCourts();
    });

    // Filtreleri uygula
    applyButton?.addEventListener('click', filterCourts);

    // İlk yükleme
    filterCourts();
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
        todayHearings: 12 // Örnek veri
    };

    document.getElementById('activeCourtroomsCount').textContent = stats.active;
    document.getElementById('issuesCourtroomsCount').textContent = stats.issue;
    document.getElementById('maintenanceCourtroomsCount').textContent = stats.maintenance;
    document.getElementById('todayHearingsCount').textContent = stats.todayHearings;
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
                <span class="courtroom-status ${salon.durum}">${statusText}</span>
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

/* ... existing code ... */ 