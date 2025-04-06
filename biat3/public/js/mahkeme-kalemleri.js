// Mahkeme Kalemleri verilerini tutacak dizi
let mahkemeKalemleri = [];

// Mahkeme kalemleri verisi
let courtOffices = JSON.parse(localStorage.getItem('courtOffices')) || [
    { id: '1', name: 'Ağır Ceza Mahkemesi Kalemi', location: 'A Blok, 2. Kat' },
    { id: '2', name: 'Asliye Ceza Mahkemesi Kalemi', location: 'B Blok, 1. Kat' },
    { id: '3', name: 'Asliye Hukuk Mahkemesi Kalemi', location: 'C Blok, 3. Kat' }
];

// Cihaz verisi
let devices = JSON.parse(localStorage.getItem('devices')) || [];

document.addEventListener('DOMContentLoaded', function() {
    // Modal elementlerini seç
    const addOfficeModal = document.querySelector('#addOfficeModal');
    const addDeviceModal = document.querySelector('#addDeviceModal');
    const addButton = document.querySelector('.page-header .btn-primary');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.btn-secondary');
    const form = document.querySelector('#mahkemeKalemiForm');

    // Local storage'dan verileri yükle
    loadMahkemeKalemleri();

    // Yeni Kalem Ekle butonuna tıklandığında
    if (addButton) {
        addButton.addEventListener('click', function() {
            openOfficeModal();
        });
    }

    // Modal kapatma butonlarına tıklandığında (X ikonları)
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            if (modal.id === 'addOfficeModal') {
                closeOfficeModal();
            } else if (modal.id === 'addDeviceModal') {
                closeDeviceModal();
            }
        });
    });

    // İptal butonlarına tıklandığında
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            if (modal.id === 'addOfficeModal') {
                closeOfficeModal();
            } else if (modal.id === 'addDeviceModal') {
                closeDeviceModal();
            }
        });
    });

    // Form gönderildiğinde
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMahkemeKalemi();
        });
    }

    // Kartları ilk yükleme
    renderMahkemeKalemleri();

    // Arama ve filtreleme işlemleri
    const searchInput = document.querySelector('#courtOfficeSearch');
    const typeFilter = document.querySelector('#typeFilter');
    const statusFilter = document.querySelector('#statusFilter');
    const resetButton = document.querySelector('#resetFilters');
    const applyButton = document.querySelector('#applyFilters');

    if (searchInput) {
        searchInput.addEventListener('input', filterMahkemeKalemleri);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', filterMahkemeKalemleri);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterMahkemeKalemleri);
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    if (applyButton) {
        applyButton.addEventListener('click', filterMahkemeKalemleri);
    }
});

// Kalem ekleme modalını açma
function openOfficeModal() {
    const modal = document.querySelector('#addOfficeModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Kalem ekleme modalını kapatma
function closeOfficeModal() {
    const modal = document.querySelector('#addOfficeModal');
    if (modal) {
        modal.classList.remove('show');
        document.querySelector('#mahkemeKalemiForm').reset();
    }
}

// Cihaz ekleme modalını açma
function openAddDeviceModal(officeId) {
    const modal = document.getElementById('addDeviceModal');
    if (modal) {
        modal.dataset.officeId = officeId;
        modal.classList.add('show');
    }
}

// Cihaz ekleme modalını kapatma
function closeDeviceModal() {
    const modal = document.getElementById('addDeviceModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('deviceForm').reset();
    }
}

// Yeni mahkeme kalemi kaydetme
function saveMahkemeKalemi() {
    const form = document.querySelector('#mahkemeKalemiForm');
    const yeniKalem = {
        id: Date.now(),
        ad: form.querySelector('[name="ad"]').value,
        tip: form.querySelector('[name="tip"]').value,
        konum: form.querySelector('[name="konum"]').value,
        durum: 'Aktif',
        createdAt: new Date().toLocaleDateString('tr-TR'),
        cihazSayisi: 0
    };

    mahkemeKalemleri.push(yeniKalem);
    localStorage.setItem('mahkemeKalemleri', JSON.stringify(mahkemeKalemleri));
    
    renderMahkemeKalemleri();
    closeOfficeModal();
    showNotification('Mahkeme kalemi başarıyla eklendi', 'success');
}

// Mahkeme kalemlerini yükleme
function loadMahkemeKalemleri() {
    const stored = localStorage.getItem('mahkemeKalemleri');
    mahkemeKalemleri = stored ? JSON.parse(stored) : [];
}

// Mahkeme kalemlerini kartlara render etme
function renderMahkemeKalemleri() {
    const grid = document.querySelector('.court-offices-grid');
    if (!grid) return;

    grid.innerHTML = '';
    mahkemeKalemleri.forEach(kalem => {
        const card = document.createElement('div');
        card.className = 'court-office-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${kalem.ad}</h3>
                <span class="status-badge ${kalem.durum.toLowerCase()}">${kalem.durum}</span>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <i class="fas fa-gavel"></i>
                    <span>${kalem.tip}</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${kalem.konum}</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-laptop"></i>
                    <span>${kalem.cihazSayisi} Cihaz</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-calendar"></i>
                    <span>${kalem.createdAt}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-icon" onclick="openAddDeviceModal(${kalem.id})" title="Cihaz Ekle">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-icon edit" onclick="editKalem(${kalem.id})" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteKalem(${kalem.id})" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Mahkeme kalemi silme
function deleteKalem(id) {
    if (confirm('Bu mahkeme kalemini silmek istediğinize emin misiniz?')) {
        mahkemeKalemleri = mahkemeKalemleri.filter(kalem => kalem.id !== id);
        localStorage.setItem('mahkemeKalemleri', JSON.stringify(mahkemeKalemleri));
        renderMahkemeKalemleri();
        showNotification('Mahkeme kalemi başarıyla silindi', 'success');
    }
}

// Mahkeme kalemi düzenleme
function editKalem(id) {
    const kalem = mahkemeKalemleri.find(k => k.id === id);
    if (!kalem) return;

    const form = document.querySelector('#mahkemeKalemiForm');
    form.querySelector('[name="ad"]').value = kalem.ad;
    form.querySelector('[name="tip"]').value = kalem.tip;
    form.querySelector('[name="konum"]').value = kalem.konum;
    
    // Form gönderme işlemini güncelleme işlemi olarak değiştir
    form.onsubmit = function(e) {
        e.preventDefault();
        kalem.ad = form.querySelector('[name="ad"]').value;
        kalem.tip = form.querySelector('[name="tip"]').value;
        kalem.konum = form.querySelector('[name="konum"]').value;
        
        localStorage.setItem('mahkemeKalemleri', JSON.stringify(mahkemeKalemleri));
        renderMahkemeKalemleri();
        closeOfficeModal();
        showNotification('Mahkeme kalemi başarıyla güncellendi', 'success');
        
        // Form submit işleyicisini varsayılana döndür
        form.onsubmit = null;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMahkemeKalemi();
        });
    };
    
    openOfficeModal();
}

// Arama ve filtreleme
function filterMahkemeKalemleri() {
    const searchTerm = document.querySelector('#courtOfficeSearch').value.toLowerCase();
    const selectedType = document.querySelector('#typeFilter').value;
    const selectedStatus = document.querySelector('#statusFilter').value;

    const filteredKalemler = mahkemeKalemleri.filter(kalem => {
        const matchesSearch = kalem.ad.toLowerCase().includes(searchTerm) ||
                            kalem.tip.toLowerCase().includes(searchTerm) ||
                            kalem.konum.toLowerCase().includes(searchTerm);
        
        const matchesType = !selectedType || kalem.tip === selectedType;
        const matchesStatus = !selectedStatus || 
                            (selectedStatus === 'active' && kalem.durum === 'Aktif') ||
                            (selectedStatus === 'issue' && kalem.durum === 'Arızalı') ||
                            (selectedStatus === 'maintenance' && kalem.durum === 'Bakımda');

        return matchesSearch && matchesType && matchesStatus;
    });

    renderFilteredKalemler(filteredKalemler);
}

// Filtrelenmiş mahkeme kalemlerini render etme
function renderFilteredKalemler(filteredKalemler) {
    const grid = document.querySelector('.court-offices-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (filteredKalemler.length === 0) {
        grid.innerHTML = '<div class="no-results">Sonuç bulunamadı</div>';
        return;
    }

    filteredKalemler.forEach(kalem => {
        const card = document.createElement('div');
        card.className = 'court-office-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${kalem.ad}</h3>
                <span class="status-badge ${kalem.durum.toLowerCase()}">${kalem.durum}</span>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <i class="fas fa-gavel"></i>
                    <span>${kalem.tip}</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${kalem.konum}</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-laptop"></i>
                    <span>${kalem.cihazSayisi} Cihaz</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-calendar"></i>
                    <span>${kalem.createdAt}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-icon" onclick="openAddDeviceModal(${kalem.id})" title="Cihaz Ekle">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-icon edit" onclick="editKalem(${kalem.id})" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteKalem(${kalem.id})" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filtreleri sıfırlama
function resetFilters() {
    const searchInput = document.querySelector('#courtOfficeSearch');
    const typeFilter = document.querySelector('#typeFilter');
    const statusFilter = document.querySelector('#statusFilter');

    if (searchInput) searchInput.value = '';
    if (typeFilter) typeFilter.value = '';
    if (statusFilter) statusFilter.value = '';

    renderMahkemeKalemleri();
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function createCourtOfficeCard(office) {
    const officeDevices = devices.filter(d => d.officeId === office.id);
    return `
        <div class="court-office-card">
            <div class="card-header">
                <div class="card-title">
                    <h2>${office.name}</h2>
                    <p>${office.location}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openAddDeviceModal('${office.id}')" title="Cihaz Ekle">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="device-stats">
                    <div class="device-stat-item">
                        <i class="fas fa-desktop"></i>
                        <span>${officeDevices.filter(d => d.type === 'computer').length} Bilgisayar</span>
                    </div>
                    <div class="device-stat-item">
                        <i class="fas fa-print"></i>
                        <span>${officeDevices.filter(d => d.type === 'printer').length} Yazıcı</span>
                    </div>
                    <div class="device-stat-item">
                        <i class="fas fa-scanner"></i>
                        <span>${officeDevices.filter(d => d.type === 'scanner').length} Tarayıcı</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Cihaz kaydetme
function saveDevice() {
    const form = document.getElementById('deviceForm');
    const modal = document.getElementById('addDeviceModal');
    const officeId = modal.dataset.officeId;

    const device = {
        id: Date.now().toString(),
        officeId: officeId,
        type: document.getElementById('deviceType').value,
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        serialNumber: document.getElementById('serialNumber').value,
        recipient: {
            title: document.getElementById('recipientTitle').value,
            id: document.getElementById('recipientId').value,
            name: document.getElementById('recipientName').value
        },
        addedAt: new Date().toISOString()
    };

    if (!validateDeviceForm(device)) {
        showNotification('Lütfen tüm alanları doldurun', 'error');
        return;
    }

    devices.push(device);
    localStorage.setItem('devices', JSON.stringify(devices));
    
    closeDeviceModal();
    renderCourtOffices();
    showNotification('Cihaz başarıyla eklendi', 'success');
}

// Form validasyonu
function validateDeviceForm(device) {
    return device.type && 
           device.brand && 
           device.model && 
           device.serialNumber && 
           device.recipient.title && 
           device.recipient.id && 
           device.recipient.name;
}

// Mahkeme kalemlerini listele
function renderCourtOffices() {
    const grid = document.querySelector('.court-offices-grid');
    grid.innerHTML = courtOffices.map(office => createCourtOfficeCard(office)).join('');
} 