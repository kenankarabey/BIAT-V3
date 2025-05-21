window.supabase = window.supabaseClient;

let durusmaSalonlari = [];

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadDurusmaSalonlari();

    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');

    function triggerFilter() {
        filterDurusmaSalonlari(
            searchInput ? searchInput.value : '',
            locationFilter ? locationFilter.value : '',
            statusFilter ? statusFilter.value : ''
        );
    }

    if (searchInput) searchInput.addEventListener('input', triggerFilter);
    if (locationFilter) locationFilter.addEventListener('change', triggerFilter);
    if (statusFilter) statusFilter.addEventListener('change', triggerFilter);
});

function setupEventListeners() {
    const addButton = document.getElementById('addDurusmaSalonuBtn');
    const modal = document.getElementById('durusmaSalonuModal');
    const form = document.getElementById('durusmaSalonuForm');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.btn-secondary');

    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) {
                modal.classList.add('show');
                if (form) form.reset();
            }
        });
    }
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) {
                modal.classList.remove('show');
                if (form) form.reset();
            }
        });
    });
    cancelButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                const form = modal.querySelector('form');
                if (form) form.reset();
            }
        });
    });
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            if (form) form.reset();
        }
    });
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            await saveDurusmaSalonu();
        };
    }
}

async function loadDurusmaSalonlari() {
    const { data, error } = await supabase
        .from('durusma_salonlari')
        .select('*')
        .order('id', { ascending: true });
    if (error) {
        console.error('Veri çekme hatası:', error);
        durusmaSalonlari = [];
    } else {
        durusmaSalonlari = data;
    }
    updateStats();
    renderDurusmaSalonlari();
}

function updateStats() {
    const activeCount = durusmaSalonlari.filter(s => s.durum === 'Aktif' || s.durum === 'active').length;
    const issueCount = durusmaSalonlari.filter(s => s.durum === 'Arızalı' || s.durum === 'issue').length;
    const maintenanceCount = durusmaSalonlari.filter(s => s.durum === 'Bakımda' || s.durum === 'maintenance').length;
    document.getElementById('activeCourtroomsCount').textContent = activeCount;
    document.getElementById('issuesCourtroomsCount').textContent = issueCount;
    document.getElementById('maintenanceCourtroomsCount').textContent = maintenanceCount;
}

async function saveDurusmaSalonu() {
    const form = document.getElementById('durusmaSalonuForm');
    const mahkeme_turu = form.querySelector('#mahkemeTuru').value;
    const salon_no = form.querySelector('#salonNo').value;
    const blok = form.querySelector('#blok').value;
    const kat = form.querySelector('#konum').value;
    const durum = form.querySelector('#status').value;
    const yeniSalon = { mahkeme_turu, salon_no, blok, kat, durum };
    const { error } = await supabase
        .from('durusma_salonlari')
        .insert([yeniSalon]);
    if (error) {
        showNotification('Kayıt eklenemedi: ' + error.message, 'error');
        return;
    }
    form.reset();
    document.getElementById('durusmaSalonuModal').classList.remove('show');
    await loadDurusmaSalonlari();
}

async function deleteDurusmaSalonu(id) {
    if (!confirm('Bu duruşma salonunu silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase
        .from('durusma_salonlari')
        .delete()
        .eq('id', id);
    if (error) {
        showNotification('Silinemedi: ' + error.message, 'error');
        return;
    }
    await loadDurusmaSalonlari();
}

function renderDurusmaSalonlari() {
    const container = document.getElementById('durusmaSalonlariGrid');
    if (!container) return;
    container.innerHTML = '';
    if (!durusmaSalonlari || durusmaSalonlari.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>Henüz duruşma salonu eklenmemiş.</p>
            </div>
        `;
        return;
    }
    durusmaSalonlari.forEach(salon => {
        let statusClass = 'active';
        if (salon.durum === 'Bakımda' || salon.durum === 'maintenance') statusClass = 'maintenance';
        else if (salon.durum === 'Arızalı' || salon.durum === 'issue') statusClass = 'issue';
        else if (salon.durum === 'Aktif' || salon.durum === 'active') statusClass = 'active';
        const card = document.createElement('div');
        card.className = `court-office-card ${statusClass}`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="card-header">
                <h3>${salon.salon_no} ${salon.mahkeme_turu}</h3>
                <div class="card-actions">
                    <button class="btn-icon edit" onclick="event.stopPropagation(); editDurusmaSalonu('${salon.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="event.stopPropagation(); deleteDurusmaSalonu('${salon.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="status-badge ${statusClass}" style="margin: 8px 0 0 0;">
                ${getStatusText(salon.durum)}
            </div>
            <div class="info-row">
                <i class="fas fa-map-marker-alt"></i>
                ${salon.blok} - ${salon.kat}
            </div>
        `;
        card.addEventListener('click', function() {
            window.location.href = `durusma-salonu-detay.html?id=${salon.id}`;
        });
        container.appendChild(card);
    });
}

function getStatusText(durum) {
    switch (durum) {
        case 'active':
        case 'Aktif':
            return 'Aktif';
        case 'issue':
        case 'Arızalı':
            return 'Arızalı';
        case 'maintenance':
        case 'Bakımda':
            return 'Bakımda';
        default:
            return 'Belirsiz';
    }
}

// DÜZENLEME FONKSİYONU
window.editDurusmaSalonu = function(id) {
    const salon = durusmaSalonlari.find(s => String(s.id) === String(id));
    if (!salon) return;
    const modal = document.getElementById('durusmaSalonuModal');
    const form = document.getElementById('durusmaSalonuForm');
    if (!modal || !form) return;
    // Alanları doldur
    form.querySelector('#mahkemeTuru').value = salon.mahkeme_turu || '';
    form.querySelector('#salonNo').value = salon.salon_no || '';
    form.querySelector('#blok').value = salon.blok || '';
    form.querySelector('#konum').value = salon.kat || '';
    form.querySelector('#status').value = salon.durum || '';
    // Modalı aç
    modal.classList.add('show');
    // Eski submit handler'ı kaldır
    form.onsubmit = null;
    // Yeni submit handler
    form.onsubmit = async function(e) {
        e.preventDefault();
        const mahkeme_turu = form.querySelector('#mahkemeTuru').value;
        const salon_no = form.querySelector('#salonNo').value;
        const blok = form.querySelector('#blok').value;
        const kat = form.querySelector('#konum').value;
        const durum = form.querySelector('#status').value;
        const updatedSalon = { mahkeme_turu, salon_no, blok, kat, durum };
        const { error } = await supabase
            .from('durusma_salonlari')
            .update(updatedSalon)
            .eq('id', salon.id);
        if (error) {
            showNotification('Güncelleme hatası: ' + error.message, 'error');
            return;
        }
        form.reset();
        modal.classList.remove('show');
        await loadDurusmaSalonlari();
        // Kaydetten sonra submit handler'ı eski haline döndür
        setupEventListeners();
    };
};

function filterDurusmaSalonlari(query, location, status) {
    query = (query || '').toLowerCase();
    location = (location || '').toLowerCase();
    status = (status || '').toLowerCase();

    const filtered = durusmaSalonlari.filter(salon => {
        const matchesQuery =
            (salon.salon_no && salon.salon_no.toString().toLowerCase().includes(query)) ||
            (salon.mahkeme_turu && salon.mahkeme_turu.toLowerCase().includes(query)) ||
            (salon.blok && salon.blok.toLowerCase().includes(query)) ||
            (salon.kat && salon.kat.toLowerCase().includes(query));
        const matchesLocation = !location || (salon.blok && salon.blok.toLowerCase() === location);
        const matchesStatus = !status || (salon.durum && salon.durum.toLowerCase() === status);

        return matchesQuery && matchesLocation && matchesStatus;
    });
    renderFilteredDurusmaSalonlari(filtered);
}

function renderFilteredDurusmaSalonlari(list) {
    const container = document.getElementById('durusmaSalonlariGrid');
    if (!container) return;
    container.innerHTML = '';
    if (!list || list.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>Aramanıza uygun salon bulunamadı.</p>
            </div>
        `;
        return;
    }
    list.forEach(salon => {
        let statusClass = 'active';
        if (salon.durum === 'Bakımda' || salon.durum === 'maintenance') statusClass = 'maintenance';
        else if (salon.durum === 'Arızalı' || salon.durum === 'issue') statusClass = 'issue';
        else if (salon.durum === 'Aktif' || salon.durum === 'active') statusClass = 'active';
        const card = document.createElement('div');
        card.className = `court-office-card ${statusClass}`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="card-header">
                <h3>${salon.salon_no} ${salon.mahkeme_turu}</h3>
                <div class="card-actions">
                    <button class="btn-icon edit" onclick="event.stopPropagation(); editDurusmaSalonu('${salon.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="event.stopPropagation(); deleteDurusmaSalonu('${salon.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="status-badge ${statusClass}" style="margin: 8px 0 0 0;">
                ${getStatusText(salon.durum)}
            </div>
            <div class="info-row">
                <i class="fas fa-map-marker-alt"></i>
                ${salon.blok} - ${salon.kat}
            </div>
        `;
        card.addEventListener('click', function() {
            window.location.href = `durusma-salonu-detay.html?id=${salon.id}`;
        });
        container.appendChild(card);
    });
} 