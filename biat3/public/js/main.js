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

// Sayfa içeriğini yükle
function setupContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const mahkemeId = urlParams.get('id');

    if (window.location.pathname.includes('mahkeme-detay.html')) {
        // Detay sayfasındayız
        loadMahkemeDetay(mahkemeId);
    } else {
        // Ana sayfadayız
        loadCourtOfficesContent();
        setupFilters();
    }
}

// Mahkeme detaylarını yükle
function loadMahkemeDetay(mahkemeId) {
    const mahkeme = state.courtOffices.find(m => m.id === mahkemeId);
    if (!mahkeme) {
        console.error('Mahkeme bulunamadı:', mahkemeId);
        return;
    }

    document.title = `${mahkeme.ad} - BIAT`;

    // Mahkeme bilgilerini doldur
    const elements = {
        mahkemeAdi: mahkeme.ad,
        detayMahkemeAdi: mahkeme.ad,
        detayKonum: mahkeme.konum,
        detayTelefon: mahkeme.telefon,
        detayEposta: mahkeme.eposta,
        hakimAdSoyad: mahkeme.personel.hakim.adSoyad,
        hakimSicil: mahkeme.personel.hakim.sicilNo,
        katipAdSoyad: mahkeme.personel.katip.adSoyad,
        katipSicil: mahkeme.personel.katip.sicilNo,
        mubasirAdSoyad: mahkeme.personel.mubasir.adSoyad,
        mubasirSicil: mahkeme.personel.mubasir.sicilNo
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    // QR Kod ve Barkod oluştur
    generateQRCode(window.location.href);
    generateBarCode(mahkemeId);
}

// QR Kod oluştur
function generateQRCode(text) {
    const element = document.getElementById('qrCode');
    if (element) {
        element.innerHTML = '';
        new QRCode(element, {
            text: text,
            width: 128,
            height: 128
        });
    }
}

// Barkod oluştur
function generateBarCode(text) {
    const element = document.getElementById('barCode');
    if (element) {
        JsBarcode(element, text, {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: true
        });
    }
}

// Filtreleri ayarla
function setupFilters() {
    // Konum filtresi için seçenekleri doldur
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
        const locations = [...new Set(state.courtOffices.map(office => office.konum))];
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }

    // Arama ve filtreleme işlevleri
    const searchInput = document.getElementById('courtOfficeSearch');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');

    const filterCourts = () => {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const selectedType = typeFilter?.value || '';
        const selectedLocation = locationFilter?.value || '';
        const selectedStatus = statusFilter?.value || '';

        const filteredCourts = state.courtOffices.filter(office => {
            const matchesSearch = office.ad.toLowerCase().includes(searchTerm) ||
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
    };

    // Event listeners
    searchInput?.addEventListener('input', filterCourts);
    typeFilter?.addEventListener('change', filterCourts);
    locationFilter?.addEventListener('change', filterCourts);
    statusFilter?.addEventListener('change', filterCourts);

    // Yeni kalem ekleme butonu
    const addNewOfficeBtn = document.getElementById('addNewOfficeBtn');
    addNewOfficeBtn?.addEventListener('click', () => {
        // TODO: Yeni kalem ekleme modalını aç
        console.log('Yeni kalem ekleme modalı açılacak');
    });
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