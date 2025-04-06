// Mahkeme Kalemleri verilerini tutacak dizi
let mahkemeKalemleri = JSON.parse(localStorage.getItem('mahkemeKalemleri')) || [
    { 
        id: '1', 
        ad: 'Ağır Ceza Mahkemesi Kalemi', 
        tip: 'Ağır Ceza',
        konum: 'A Blok, 2. Kat',
        durum: 'Aktif',
        createdAt: new Date().toLocaleDateString('tr-TR'),
        cihazSayisi: 0
    },
    { 
        id: '2', 
        ad: 'Asliye Ceza Mahkemesi Kalemi', 
        tip: 'Asliye Ceza',
        konum: 'B Blok, 1. Kat',
        durum: 'Aktif',
        createdAt: new Date().toLocaleDateString('tr-TR'),
        cihazSayisi: 0
    },
    { 
        id: '3', 
        ad: 'Asliye Hukuk Mahkemesi Kalemi', 
        tip: 'Asliye Hukuk',
        konum: 'C Blok, 3. Kat',
        durum: 'Aktif',
        createdAt: new Date().toLocaleDateString('tr-TR'),
        cihazSayisi: 0
    }
];

// Cihaz verisi
let devices = JSON.parse(localStorage.getItem('devices')) || [];

// Filtreleme durumunu tutacak değişkenler
let currentFilters = {
    tip: 'all',
    durum: 'all',
    search: ''
};

// Mahkeme kalemlerini filtreleme
function filterMahkemeKalemleri(kalemler) {
    return kalemler.filter(kalem => {
        const tipMatch = currentFilters.tip === 'all' || kalem.tip === currentFilters.tip;
        const durumMatch = currentFilters.durum === 'all' || kalem.durum === currentFilters.durum;
        const searchMatch = kalem.ad.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                          kalem.konum.toLowerCase().includes(currentFilters.search.toLowerCase());
        
        return tipMatch && durumMatch && searchMatch;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Modal elementlerini seç
    const addOfficeModal = document.querySelector('#addOfficeModal');
    const addDeviceModal = document.querySelector('#addDeviceModal');
    const addButton = document.querySelector('.page-header .btn-primary');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.btn-secondary');
    const form = document.querySelector('#mahkemeKalemiForm');

    // Filtre elementlerini seç
    const tipFilter = document.querySelector('#tipFilter');
    const durumFilter = document.querySelector('#durumFilter');
    const searchInput = document.querySelector('#searchInput');
    const resetFiltersBtn = document.querySelector('#resetFilters');

    // Filtre değişikliklerini dinle
    if (tipFilter) {
        tipFilter.addEventListener('change', function(e) {
            currentFilters.tip = e.target.value;
            renderMahkemeKalemleri();
        });
    }

    if (durumFilter) {
        durumFilter.addEventListener('change', function(e) {
            currentFilters.durum = e.target.value;
            renderMahkemeKalemleri();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentFilters.search = e.target.value;
            renderMahkemeKalemleri();
        });
    }

    // Filtreleri sıfırlama
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            currentFilters = {
                tip: 'all',
                durum: 'all',
                search: ''
            };
            
            if (tipFilter) tipFilter.value = 'all';
            if (durumFilter) durumFilter.value = 'all';
            if (searchInput) searchInput.value = '';
            
            renderMahkemeKalemleri();
        });
    }

    // Yeni Kalem Ekle butonuna tıklandığında
    if (addButton) {
        addButton.addEventListener('click', function() {
            // Form submit handler'ı varsayılan haline getir
            if (form) {
                form.onsubmit = function(e) {
                    e.preventDefault();
                    saveMahkemeKalemi();
                };
            }
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
        form.onsubmit = function(e) {
            e.preventDefault();
            saveMahkemeKalemi();
        };
    }

    // Kartları ilk yükleme
    renderMahkemeKalemleri();
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
    const mahkemeTuru = form.querySelector('#mahkemeTuru').value;
    const mahkemeNo = form.querySelector('#tip').value;
    const blok = form.querySelector('#blok').value;
    const kat = form.querySelector('#konum').value;
    
    // Mahkeme adını formatla
    let formattedAd = '';
    if (mahkemeTuru === 'İcra') {
        formattedAd = `${mahkemeNo}. İcra Müdürlüğü`;
    } else {
        formattedAd = `${mahkemeNo}. ${mahkemeTuru} Mahkemesi`;
    }
    
    const yeniKalem = {
        id: Date.now().toString(),
        ad: formattedAd,
        tip: mahkemeTuru,
        mahkemeNo: mahkemeNo,
        blok: blok,
        kat: kat,
        konum: `${blok}, ${kat}`,
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

// Mahkeme kalemlerini kartlara render etme
function renderMahkemeKalemleri() {
    const grid = document.querySelector('.court-offices-grid');
    if (!grid) return;

    // Filtrelenmiş kalemleri al
    const filteredKalemler = filterMahkemeKalemleri(mahkemeKalemleri);

    grid.innerHTML = '';
    
    // Sonuç bulunamadı mesajı
    if (filteredKalemler.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<p>Arama kriterlerinize uygun sonuç bulunamadı.</p>';
        grid.appendChild(noResults);
        return;
    }

    filteredKalemler.forEach(kalem => {
        const officeDevices = devices.filter(d => d.officeId === kalem.id.toString());
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
                <div class="device-stats">
                    <div class="device-stat">
                        <i class="fas fa-desktop"></i>
                        <span>${officeDevices.filter(d => d.type === 'computer').length}</span>
                    </div>
                    <div class="device-stat">
                        <i class="fas fa-print"></i>
                        <span>${officeDevices.filter(d => d.type === 'printer').length}</span>
                    </div>
                    <div class="device-stat">
                        <i class="fas fa-scanner"></i>
                        <span>${officeDevices.filter(d => d.type === 'scanner').length}</span>
                    </div>
                </div>
                <div class="info-row">
                    <i class="fas fa-calendar"></i>
                    <span>${kalem.createdAt}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-icon" onclick="openAddDeviceModal('${kalem.id}')" title="Cihaz Ekle">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-icon edit" onclick="editKalem('${kalem.id}')" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteKalem('${kalem.id}')" title="Sil">
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
    const kalem = mahkemeKalemleri.find(k => k.id.toString() === id.toString());
    if (!kalem) return;

    const form = document.querySelector('#mahkemeKalemiForm');
    
    // Mahkeme adını parçalara ayır
    let mahkemeNo = kalem.mahkemeNo || '';
    
    if (!mahkemeNo) {
        if (kalem.tip === 'İcra') {
            // "2. İcra Müdürlüğü" formatından ayıklama
            const match = kalem.ad.match(/(\d+)\.\s*İcra\s*Müdürlüğü/i);
            if (match) {
                mahkemeNo = match[1];
            }
        } else {
            // "2. Ağır Ceza Mahkemesi" formatından ayıklama
            const match = kalem.ad.match(/(\d+)\.\s*.*?\s*Mahkemesi/i);
            if (match) {
                mahkemeNo = match[1];
            }
        }
    }
    
    form.querySelector('#mahkemeTuru').value = kalem.tip;
    form.querySelector('#tip').value = mahkemeNo;
    
    // Konum bilgilerini ayır ve form alanlarına yerleştir
    if (kalem.blok && kalem.kat) {
        form.querySelector('#blok').value = kalem.blok;
        form.querySelector('#konum').value = kalem.kat;
    } else if (kalem.konum) {
        const [blok, kat] = kalem.konum.split(', ');
        form.querySelector('#blok').value = blok || '';
        form.querySelector('#konum').value = kat || '';
    }
    
    // Mevcut form submit event listener'ını kaldır
    const oldSubmitHandler = form.onsubmit;
    form.removeEventListener('submit', oldSubmitHandler);
    
    // Yeni submit handler ekle
    form.onsubmit = function(e) {
        e.preventDefault();
        const mahkemeTuru = form.querySelector('#mahkemeTuru').value;
        const mahkemeNo = form.querySelector('#tip').value;
        const blok = form.querySelector('#blok').value;
        const kat = form.querySelector('#konum').value;
        
        // Mahkeme adını formatla
        let formattedAd = '';
        if (mahkemeTuru === 'İcra') {
            formattedAd = `${mahkemeNo}. İcra Müdürlüğü`;
        } else {
            formattedAd = `${mahkemeNo}. ${mahkemeTuru} Mahkemesi`;
        }
        
        kalem.ad = formattedAd;
        kalem.tip = mahkemeTuru;
        kalem.mahkemeNo = mahkemeNo;
        kalem.blok = blok;
        kalem.kat = kat;
        kalem.konum = `${blok}, ${kat}`;
        
        localStorage.setItem('mahkemeKalemleri', JSON.stringify(mahkemeKalemleri));
        renderMahkemeKalemleri();
        closeOfficeModal();
        showNotification('Mahkeme kalemi başarıyla güncellendi', 'success');
        
        // Form submit işleyicisini varsayılana döndür
        form.onsubmit = oldSubmitHandler;
    };
    
    openOfficeModal();
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
    
    // İlgili mahkeme kaleminin cihaz sayısını güncelle
    const kalem = mahkemeKalemleri.find(k => k.id.toString() === officeId);
    if (kalem) {
        kalem.cihazSayisi = devices.filter(d => d.officeId === officeId).length;
        localStorage.setItem('mahkemeKalemleri', JSON.stringify(mahkemeKalemleri));
    }
    
    closeDeviceModal();
    renderMahkemeKalemleri();
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