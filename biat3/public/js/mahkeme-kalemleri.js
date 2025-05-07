// Mahkeme Kalemleri verilerini tutacak dizi
let mahkemeKalemleri = [];

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
        const turMatch = currentFilters.tip === 'all' || (kalem.mahkeme_turu && kalem.mahkeme_turu === currentFilters.tip);
        // Eğer durum alanı yoksa, her zaman true kabul et
        const durumMatch = true;
        const searchMatch =
            (kalem.mahkeme_turu && kalem.mahkeme_turu.toLowerCase().includes(currentFilters.search.toLowerCase())) ||
            (kalem.mahkeme_no && kalem.mahkeme_no.toString().toLowerCase().includes(currentFilters.search.toLowerCase())) ||
            (kalem.blok && kalem.blok.toLowerCase().includes(currentFilters.search.toLowerCase())) ||
            (kalem.kat && kalem.kat.toLowerCase().includes(currentFilters.search.toLowerCase()));

        return turMatch && durumMatch && searchMatch;
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    // Modal elementlerini seç
    const addOfficeModal = document.querySelector('#addOfficeModal');
    const addDeviceModal = document.querySelector('#addDeviceModal');
    const addButton = document.getElementById('addOfficeBtn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.btn-secondary');
    const form = document.querySelector('#mahkemeKalemiForm');

    // Debug log
    console.log('addButton:', addButton);

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

    // Supabase'dan veri çek ve render et
    mahkemeKalemleri = await fetchMahkemeKalemleri();
    renderMahkemeKalemleri();

    // Yeni Kalem Ekle butonuna tıklandığında
    if (addButton) {
        addButton.addEventListener('click', function() {
            console.log('Yeni Kalem Ekle butonuna tıklandı');
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
});

// Kalem ekleme modalını açma
function openOfficeModal() {
    console.log('openOfficeModal çağrıldı');
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

// Mahkeme kalemlerini Supabase'dan çek
async function fetchMahkemeKalemleri() {
    const { data, error } = await supabase
        .from('mahkeme_kalemleri')
        .select('*')
        .order('id', { ascending: true });
    if (error) {
        console.error('Veri çekme hatası:', error);
        return [];
    }
    return data;
}

// Yeni mahkeme kalemi kaydetme
async function saveMahkemeKalemi() {
    const form = document.querySelector('#mahkemeKalemiForm');
    const mahkeme_turu = form.querySelector('#mahkemeTuru').value;
    const mahkeme_no = form.querySelector('#tip').value;
    const blok = form.querySelector('#blok').value;
    const kat = form.querySelector('#konum').value;
    const mahkeme_hakimi = form.querySelector('#mahkemeHakimi').value;

    const yeniKalem = {
        mahkeme_turu,
        mahkeme_no,
        blok,
        kat,
        mahkeme_hakimi
    };

    const { data, error } = await supabase
        .from('mahkeme_kalemleri')
        .insert([yeniKalem])
        .select();

    if (error) {
        showNotification('Kayıt eklenemedi: ' + error.message, 'error');
        return;
    }

    showNotification('Mahkeme kalemi başarıyla eklendi', 'success');
    form.reset();
    closeOfficeModal();
    mahkemeKalemleri = await fetchMahkemeKalemleri();
    renderMahkemeKalemleri();
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
        const card = document.createElement('div');
        card.className = 'court-office-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${kalem.mahkeme_no}. ${kalem.mahkeme_turu}</h3>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <i class="fas fa-gavel"></i>
                    <span>Mahkeme No: ${kalem.mahkeme_no}</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${kalem.blok}, ${kalem.kat}</span>
                </div>
                <div class="info-row">
                    <i class="fas fa-user-tie"></i>
                    <span>Hakim: ${kalem.mahkeme_hakimi || '-'}</span>
                </div>
            </div>
            <div class="card-footer">
                <!--<button class="btn-icon" onclick="openAddDeviceModal('${kalem.id}')" title="Cihaz Ekle">
                    <i class="fas fa-plus"></i>
                </button>-->
                <button class="btn-icon edit" onclick="editKalem('${kalem.id}')" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteKalem('${kalem.id}')" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            // Sadece kartın boş alanına tıklanınca yönlendir, butonlara tıklanınca değil
            if (e.target.closest('.btn-icon')) return;
            window.location.href = `mahkeme-detay.html?id=${kalem.id}`;
        });
        grid.appendChild(card);
    });
}

// Mahkeme kalemi silme
async function deleteKalem(id) {
    if (confirm('Bu mahkeme kalemini silmek istediğinize emin misiniz?')) {
        // Supabase'den sil
        const { error } = await supabase
            .from('mahkeme_kalemleri')
            .delete()
            .eq('id', id);

        if (error) {
            showNotification('Silme işlemi başarısız: ' + error.message, 'error');
            return;
        }

        // Başarılı silme işlemi
        showNotification('Mahkeme kalemi başarıyla silindi', 'success');
        
        // Verileri tekrar çek ve ekranı güncelle
        mahkemeKalemleri = await fetchMahkemeKalemleri();
        renderMahkemeKalemleri();
    }
}

// Mahkeme kalemi düzenleme
async function editKalem(id) {
    const kalem = mahkemeKalemleri.find(k => String(k.id) === String(id));
    if (!kalem) return;

    const form = document.querySelector('#mahkemeKalemiForm');
    form.querySelector('#mahkemeTuru').value = kalem.mahkeme_turu || '';
    form.querySelector('#tip').value = kalem.mahkeme_no || '';
    form.querySelector('#blok').value = kalem.blok || '';
    form.querySelector('#konum').value = kalem.kat || '';
    form.querySelector('#mahkemeHakimi').value = kalem.mahkeme_hakimi || '';

    // Mevcut form submit event listener'ını kaldır
    form.onsubmit = null;

    // Yeni submit handler ekle
    form.onsubmit = async function(e) {
        e.preventDefault();
        const mahkeme_turu = form.querySelector('#mahkemeTuru').value;
        const mahkeme_no = form.querySelector('#tip').value;
        const blok = form.querySelector('#blok').value;
        const kat = form.querySelector('#konum').value;
        const mahkeme_hakimi = form.querySelector('#mahkemeHakimi').value;

        const updatedKalem = {
            mahkeme_turu,
            mahkeme_no,
            blok,
            kat,
            mahkeme_hakimi
        };

        // Supabase'da güncelle
        const { error } = await supabase
            .from('mahkeme_kalemleri')
            .update(updatedKalem)
            .eq('id', kalem.id);
        if (error) {
            showNotification('Güncelleme hatası: ' + error.message, 'error');
            return;
        }
        showNotification('Mahkeme kalemi başarıyla güncellendi', 'success');
        form.reset();
        closeOfficeModal();
        mahkemeKalemleri = await fetchMahkemeKalemleri();
        renderMahkemeKalemleri();
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