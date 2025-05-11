// Sample device data
let devices = [];

// DOM Elements
let tabButtons;
let tabPanes;
let isFilterVisible = false;
let currentDeviceId = null;

// Update son temizlik tarihi when ilk temizlik tarihi changes
function updateSonTemizlikTarihi() {
    const ilkTemizlikTarihi = document.getElementById('ilk_temizlik_tarihi').value;
    if (ilkTemizlikTarihi) {
        const ilkTarih = new Date(ilkTemizlikTarihi);
        const sonTarih = new Date(ilkTarih);
        sonTarih.setFullYear(sonTarih.getFullYear() + 1);
        
        // Format the date as YYYY-MM-DD
        const sonTemizlikTarihi = sonTarih.toISOString().split('T')[0];
        document.getElementById('son_temizlik_tarihi').value = sonTemizlikTarihi;
    }
}

// Show/hide temizlik fields only for kasa (computer)
function updateFormFieldsForDeviceType(deviceType) {
    const temizlikGroups = document.querySelectorAll('.temizlik-group');
    if (deviceType === 'computer') {
        temizlikGroups.forEach(el => el.style.display = '');
    } else {
        temizlikGroups.forEach(el => el.style.display = 'none');
    }
}

// Initialize the page
async function initializePage() {
    console.log('Sayfa başlatılıyor...');
    
    // DOM elementlerini seç
    tabButtons = document.querySelectorAll('.tab-button');
    tabPanes = document.querySelectorAll('.tab-pane');
    
    // Tab butonlarını ayarla
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabType = button.getAttribute('data-tab');
            console.log('Tab clicked:', tabType);
            switchTab(tabType);
        });
    });

    // Device type değişimini dinle
    const deviceTypeSelect = document.getElementById('deviceType');
    if (deviceTypeSelect) {
        deviceTypeSelect.addEventListener('change', function() {
            updateFormFieldsForDeviceType(this.value);
        });
    }
    
    const editDeviceTypeSelect = document.getElementById('editDeviceType');
    if (editDeviceTypeSelect) {
        editDeviceTypeSelect.addEventListener('change', function() {
            updateFormFieldsForDeviceType(this.value);
        });
    }

    // İlk tab'ı aktif yap
    const firstTab = tabButtons[0]?.getAttribute('data-tab') || 'computer';
    switchTab(firstTab);
    
    // Veritabanından verileri çek
    await fetchDevices();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializePage);

// Modal işlemleri için fonksiyonlar
function showAddModal() {
    const modal = document.getElementById('addDeviceModal');
    if (!modal) {
        console.error('Add device modal not found!');
        return;
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAddModal() {
    const modal = document.getElementById('addDeviceModal');
    if (!modal) {
        console.error('Add device modal not found!');
        return;
    }
    modal.classList.remove('show');
    document.body.style.overflow = '';
    resetForm();
}

function resetForm() {
    const form = document.getElementById('addDeviceForm');
    form.reset();
    // Özel alanları temizle
    const computerFields = document.querySelectorAll('.computer-specific');
    computerFields.forEach(field => {
        field.style.display = 'none';
    });
}

// Remove any duplicate/anonymous submit handlers for addDeviceForm
const addDeviceForm = document.getElementById('addDeviceForm');
if (addDeviceForm) {
    addDeviceForm.addEventListener('submit', saveDevice);
}

// Only one function for updating dynamic fields
function updateFormFields() {
    const deviceType = document.getElementById('deviceType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';

    if (deviceType) {
        const fields = getFormFieldsByType(deviceType);
        fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            // Benzersiz id ekle
            formGroup.id = `form-group-${field.id}`;
            formGroup.innerHTML = `
                <label for="${field.id}">
                    <i class="fas fa-user-tie"></i>
                    ${field.label}
                </label>
                ${field.type === 'select' ? `
                    <select id="${field.id}" name="${field.id}" class="modern-select" ${field.required ? 'required' : ''}>
                        <option value="">${field.label} seçin</option>
                        ${field.options.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                ` : `
                    <input type="text" id="${field.id}" name="${field.id}" class="modern-input" ${field.required ? 'required' : ''}>
                `}
            `;
            dynamicFields.appendChild(formGroup);
        });
        // Temizlik alanlarını göster/gizle
        const temizlikGroup = document.querySelector('.temizlik-group');
        if (temizlikGroup) {
            temizlikGroup.style.display = deviceType === 'computer' ? 'block' : 'none';
        }
        // Birim değiştiğinde kontrol et
        const birimSelect = document.getElementById('birim');
        if (birimSelect && !birimSelect._mahkemeKalemiListener) {
            birimSelect.addEventListener('change', () => hidePersonFieldsIfMahkemeKalemi(''));
            birimSelect._mahkemeKalemiListener = true;
        }
        hidePersonFieldsIfMahkemeKalemi('');
    }
}

// When device type changes in add/edit forms
const deviceTypeSelect = document.getElementById('deviceType');
if (deviceTypeSelect) {
    deviceTypeSelect.addEventListener('change', updateFormFields);
}

// Save new device
async function saveDevice(event) {
    event.preventDefault();
    console.log('=== Form Gönderimi Başlıyor ===');

    // Form elementini al
    const form = document.getElementById('addDeviceForm');
    if (!form) {
        console.error('Form bulunamadı!');
        return;
    }
    console.log('Form başarıyla bulundu');

    // Cihaz tipini kontrol et
    const deviceType = form.querySelector('#deviceType').value;
    console.log('Seçilen cihaz tipi:', deviceType);
    
    if (!deviceType) {
        console.error('Cihaz tipi seçilmedi!');
        showNotification('Lütfen bir cihaz tipi seçin', 'error');
        return;
    }
    console.log('Cihaz tipi doğrulandı:', deviceType);

    // Birim kontrolü
    const birim = form.querySelector('#birim').value.trim();
    console.log('Birim değeri:', birim);
    if (!birim) {
        console.error('Birim alanı boş!');
        showNotification('Lütfen birim adını girin', 'error');
        return;
    }
    console.log('Birim alanı doğrulandı');

    // Garanti tarihlerini kontrol et
    const ilkGaranti = form.querySelector('#ilk_garanti_tarihi').value;
    const sonGaranti = form.querySelector('#son_garanti_tarihi').value;
    console.log('Garanti tarihleri:', {
        ilkGaranti,
        sonGaranti
    });
    
    if (!ilkGaranti || !sonGaranti) {
        console.error('Garanti tarihleri eksik!');
        showNotification('Lütfen garanti tarihlerini girin', 'error');
        return;
    }

    // Tarih formatı kontrolü
    const ilkGarantiDate = new Date(ilkGaranti);
    const sonGarantiDate = new Date(sonGaranti);
    console.log('Tarih formatı kontrolü:', {
        ilkGarantiDate,
        sonGarantiDate
    });

    if (sonGarantiDate < ilkGarantiDate) {
        console.error('Son garanti tarihi, ilk garanti tarihinden önce!');
        showNotification('Son garanti tarihi, ilk garanti tarihinden önce olamaz', 'error');
        return;
    }
    console.log('Garanti tarihleri doğrulandı');

    // Yeni cihaz nesnesini oluştur
    const odaTipiSelect = form.querySelector('#oda_tipi');
    const odaTipi = odaTipiSelect.options[odaTipiSelect.selectedIndex].text;
    const newDevice = {
        birim: birim,
        ilk_garanti_tarihi: ilkGaranti,
        son_garanti_tarihi: sonGaranti,
        oda_tipi: odaTipi,
        mahkeme_no: form.querySelector('#mahkeme_no').value.trim()
    };
    console.log('Supabase\'a gönderilecek cihaz:', newDevice); // DEBUG

    // Cihaz tipine özel alanları ekle
    const fields = getFormFieldsByType(deviceType);
    console.log('Cihaz tipine özel alanlar:', fields);

    // Her alanı kontrol et ve değerini yazdır
    fields.forEach(field => {
        const input = form.querySelector(`#${field.id}`);
        if (input) {
            const value = input.value.trim();
            console.log(`${field.id} alanı kontrol ediliyor:`, {
                değer: value,
                tip: input.type,
                zorunlu: field.required
            });
            
            if (field.required && !value) {
                console.error(`${field.label} alanı boş!`);
                showNotification(`Lütfen ${field.label} alanını doldurun`, 'error');
                throw new Error(`${field.label} alanı zorunludur`);
            }
            
            if (value) {
                // PRINTER için sicilno düzeltmesi
                if (deviceType === 'printer' && field.id === 'sicil_no') {
                    newDevice.sicilno = value;
                } else {
                    newDevice[field.id] = value;
                }
                console.log(`${field.id} alanı eklendi:`, value);
            }
        } else {
            console.warn(`${field.id} alanı bulunamadı!`);
        }
    });

    // Temizlik tarihlerini ekle (sadece kasa için)
    if (deviceType === 'computer') {
        console.log('Kasa cihazı için temizlik tarihleri kontrol ediliyor');
        const ilkTemizlik = form.querySelector('#ilk_temizlik_tarihi').value;
        const sonTemizlik = form.querySelector('#son_temizlik_tarihi').value;
        
        console.log('Temizlik tarihleri:', {
            ilkTemizlik,
            sonTemizlik
        });
        
        if (!ilkTemizlik || !sonTemizlik) {
            console.error('Temizlik tarihleri eksik!');
            showNotification('Lütfen temizlik tarihlerini girin', 'error');
            return;
        }

        const ilkTemizlikDate = new Date(ilkTemizlik);
        const sonTemizlikDate = new Date(sonTemizlik);
        console.log('Temizlik tarihi formatı kontrolü:', {
            ilkTemizlikDate,
            sonTemizlikDate
        });

        if (sonTemizlikDate < ilkTemizlikDate) {
            console.error('Son temizlik tarihi, ilk temizlik tarihinden önce!');
            showNotification('Son temizlik tarihi, ilk temizlik tarihinden önce olamaz', 'error');
            return;
        }
        
        newDevice.ilk_temizlik_tarihi = ilkTemizlik;
        newDevice.son_temizlik_tarihi = sonTemizlik;
        console.log('Temizlik tarihleri eklendi:', {
            ilk_temizlik_tarihi: newDevice.ilk_temizlik_tarihi,
            son_temizlik_tarihi: newDevice.son_temizlik_tarihi
        });
    }

    // QR ve barkod oluştur
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    newDevice.qr_kod = `${deviceType}_${timestamp}_${random}`;
    newDevice.barkod = `${deviceType}_${timestamp}_${random}`;
    console.log('QR ve barkod oluşturuldu:', {
        qr_kod: newDevice.qr_kod,
        barkod: newDevice.barkod
    });

    // Tablo adını belirle
    let table = deviceType;
    if (deviceType === 'e_durusma') {
        table = 'e_durusma';
    } else {
        table = `${deviceType}s`;
    }
    console.log('Hedef tablo belirlendi:', table);

    console.log('Son hali ile gönderilecek veri:', JSON.stringify(newDevice, null, 2));

    try {
        console.log('Supabase veri gönderimi başlıyor...');
        const { data, error } = await supabase
            .from(table)
            .insert([newDevice])
            .select();
            
        if (error) {
            console.error('Supabase hatası:', error);
            showNotification('Cihaz kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error');
            return;
        }
        
        console.log('Başarılı yanıt:', data);
        showNotification('Cihaz başarıyla kaydedildi', 'success');
        closeAddModal();
        await fetchDevices();
    } catch (error) {
        console.error('Cihaz kaydetme hatası:', error);
        showNotification('Cihaz kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error');
    }
}

// Toggle Filter Section
function toggleFilter() {
    isFilterVisible = !isFilterVisible;
    const filterBtn = document.querySelector('.btn-secondary');
    
    if (isFilterVisible) {
        // Create and show filter section
        const filterSection = document.createElement('div');
        filterSection.className = 'filter-section';
        filterSection.innerHTML = `
            <div class="filter-form">
                <div class="form-group">
                    <label for="filterBirim">Birim</label>
                    <input type="text" id="filterBirim" placeholder="Birim ara..." onkeyup="handleFilterChange()">
                </div>
                <div class="form-group">
                    <label for="filterMarka">Marka</label>
                    <input type="text" id="filterMarka" placeholder="Marka ara..." onkeyup="handleFilterChange()">
                </div>
                <div class="form-group">
                    <label for="filterModel">Model</label>
                    <input type="text" id="filterModel" placeholder="Model ara..." onkeyup="handleFilterChange()">
                </div>
                <div class="form-group">
                    <label for="filterSeriNo">Seri No</label>
                    <input type="text" id="filterSeriNo" placeholder="Seri No ara..." onkeyup="handleFilterChange()">
                </div>
            </div>
            <div class="filter-actions">
                <button class="btn-reset" onclick="clearFilters()">
                    <i class="fas fa-times"></i>
                    Temizle
                </button>
                <button class="btn-apply" onclick="applyFilters()">
                    <i class="fas fa-check"></i>
                    Uygula
                </button>
            </div>
            <div class="active-filters" id="activeFilters"></div>
        `;
        
        // Insert after action buttons
        const actionButtons = document.querySelector('.action-buttons');
        actionButtons.insertAdjacentElement('afterend', filterSection);
        
        // Update button text and icon
        filterBtn.innerHTML = '<i class="fas fa-times"></i> Filtreyi Kapat';
    } else {
        // Remove filter section
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.remove();
        }
        
        // Update button text and icon
        filterBtn.innerHTML = '<i class="fas fa-filter"></i> Filtrele';
        
        // Clear filters and show all devices
        renderDevices(devices);
    }
}

// Handle Filter Change
function handleFilterChange() {
    updateActiveFilters();
}

// Update Active Filters
function updateActiveFilters() {
    const activeFilters = document.getElementById('activeFilters');
    if (!activeFilters) return;

    const filters = {
        'Birim': document.getElementById('filterBirim').value,
        'Marka': document.getElementById('filterMarka').value,
        'Model': document.getElementById('filterModel').value,
        'Seri No': document.getElementById('filterSeriNo').value
    };

    let filterTags = '';
    for (const [key, value] of Object.entries(filters)) {
        if (value) {
            filterTags += `
                <div class="filter-tag">
                    ${key}: ${value}
                    <i class="fas fa-times" onclick="clearFilter('${key.toLowerCase()}')"></i>
                </div>
            `;
        }
    }

    activeFilters.innerHTML = filterTags;
}

// Clear Single Filter
function clearFilter(filterType) {
    const input = document.getElementById(`filter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
    if (input) {
        input.value = '';
        handleFilterChange();
        applyFilters();
    }
}

// Clear All Filters
function clearFilters() {
    const inputs = document.querySelectorAll('.filter-form input');
    inputs.forEach(input => input.value = '');
    handleFilterChange();
    renderDevices(devices);
}

// Apply Filters
function applyFilters() {
    const birim = document.getElementById('filterBirim').value.toLowerCase();
    const marka = document.getElementById('filterMarka').value.toLowerCase();
    const model = document.getElementById('filterModel').value.toLowerCase();
    const seriNo = document.getElementById('filterSeriNo').value.toLowerCase();
    
    const filteredDevices = devices.filter(device => {
        const matchBirim = device.birim.toLowerCase().includes(birim);
        
        let matchMarka = false;
        let matchModel = false;
        let matchSeriNo = false;
        
        // Check device type specific properties
        switch (device.type) {
            case 'computer':
                matchMarka = device.kasa_marka.toLowerCase().includes(marka);
                matchModel = device.kasa_model.toLowerCase().includes(model);
                matchSeriNo = device.kasa_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'laptop':
                matchMarka = device.laptop_marka.toLowerCase().includes(marka);
                matchModel = device.laptop_model.toLowerCase().includes(model);
                matchSeriNo = device.laptop_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'screen':
                matchMarka = device.ekran_marka.toLowerCase().includes(marka);
                matchModel = device.ekran_model.toLowerCase().includes(model);
                matchSeriNo = device.ekran_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'printer':
                matchMarka = device.yazici_marka.toLowerCase().includes(marka);
                matchModel = device.yazici_model.toLowerCase().includes(model);
                matchSeriNo = device.yazici_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'scanner':
                matchMarka = device.tarayici_marka.toLowerCase().includes(marka);
                matchModel = device.tarayici_model.toLowerCase().includes(model);
                matchSeriNo = device.tarayici_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'tv':
                matchMarka = device.tv_marka.toLowerCase().includes(marka);
                matchModel = device.tv_model.toLowerCase().includes(model);
                matchSeriNo = device.tv_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'camera':
                matchMarka = device.kamera_marka.toLowerCase().includes(marka);
                matchModel = device.kamera_model.toLowerCase().includes(model);
                matchSeriNo = device.kamera_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'segbis':
                matchMarka = device.segbis_marka.toLowerCase().includes(marka);
                matchModel = device.segbis_model.toLowerCase().includes(model);
                matchSeriNo = device.segbis_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'e_durusma':
                matchMarka = device.edurusma_marka.toLowerCase().includes(marka);
                matchModel = device.edurusma_model.toLowerCase().includes(model);
                matchSeriNo = device.edurusma_seri_no.toLowerCase().includes(seriNo);
                break;
            case 'microphone':
                matchMarka = device.mikrofon_marka.toLowerCase().includes(marka);
                matchModel = device.mikrofon_model.toLowerCase().includes(model);
                matchSeriNo = device.mikrofon_seri_no.toLowerCase().includes(seriNo);
                break;
        }
        
        return matchBirim && (!marka || matchMarka) && (!model || matchModel) && (!seriNo || matchSeriNo);
    });
    
    renderDevices(filteredDevices);
}

// Switch active tab
function switchTab(tabType) {
    console.log('Switching to tab:', tabType);
    
    // Remove active class from all buttons and panes
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if(button.getAttribute('data-tab') === tabType) {
            button.classList.add('active');
        }
    });
    
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if(pane.id === `${tabType}Tab`) {
            pane.classList.add('active');
        }
    });
    
    // Re-render devices for the current tab
    renderDevices(tabType);
}

// Update device statistics
function updateDeviceStats() {
    const stats = {
        computer: 0,
        laptop: 0,
        screen: 0,
        printer: 0,
        scanner: 0,
        tv: 0,
        camera: 0,
        segbis: 0,
        e_durusma: 0,
        microphone: 0
    };
    
    devices.forEach(device => {
        if (stats.hasOwnProperty(device.type)) {
            stats[device.type]++;
        }
    });
    
    // Update stat numbers in UI
    Object.keys(stats).forEach(type => {
        let elementId = `${type}Count`;
        // E-Duruşma için özel id düzeltmesi
        if (type === 'e_durusma') elementId = 'ehearingCount';
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = stats[type];
        }
    });
}

// Render devices in their respective tables
function renderDevices(activeTab = 'computer') {
    console.log('Rendering devices for tab:', activeTab);
    if (!devicesCurrentPage[activeTab]) devicesCurrentPage[activeTab] = 1;
    // Get devices for the active tab
    const filteredDevices = devices.filter(device => device.type === activeTab);
    console.log(`${activeTab} için ${filteredDevices.length} cihaz bulundu`);
    // Get the appropriate table body
    const tbody = document.getElementById(`${activeTab}TableBody`);
    if (!tbody) {
        console.warn(`Table body not found for tab: ${activeTab}`);
        return;
    }
    tbody.innerHTML = '';
    // Pagination
    const totalRows = filteredDevices.length;
    const currentPage = devicesCurrentPage[activeTab];
    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageRows = filteredDevices.slice(startIdx, endIdx);
    // Render devices
    const deviceTabsWithMahkemeNo = [
        'computer', 'laptop', 'screen', 'printer', 'scanner',
        'tv', 'camera', 'segbis', 'microphone', 'e_durusma'
    ];
    pageRows.forEach(device => {
        const row = document.createElement('tr');
        let cells = [];
        // ... mevcut switch-case ile hücreleri doldur ...
        switch (activeTab) {
            case 'computer':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.unvan || '-'}</td>`,
                    `<td>${device.adi_soyadi || '-'}</td>`,
                    `<td>${device.sicil_no || '-'}</td>`,
                    `<td>${device.kasa_marka || '-'}</td>`,
                    `<td>${device.kasa_model || '-'}</td>`,
                    `<td>${device.kasa_seri_no || '-'}</td>`
                ];
                break;
            case 'laptop':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.unvan || '-'}</td>`,
                    `<td>${device.adi_soyadi || '-'}</td>`,
                    `<td>${device.sicil_no || '-'}</td>`,
                    `<td>${device.laptop_marka || '-'}</td>`,
                    `<td>${device.laptop_model || '-'}</td>`,
                    `<td>${device.laptop_seri_no || '-'}</td>`
                ];
                break;
            case 'screen':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.unvan || '-'}</td>`,
                    `<td>${device.adi_soyadi || '-'}</td>`,
                    `<td>${device.sicil_no || '-'}</td>`,
                    `<td>${device.ekran_marka || '-'}</td>`,
                    `<td>${device.ekran_model || '-'}</td>`,
                    `<td>${device.ekran_seri_no || '-'}</td>`
                ];
                break;
            case 'printer':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.unvan || '-'}</td>`,
                    `<td>${device.adi_soyadi || '-'}</td>`,
                    `<td>${device.sicil_no || '-'}</td>`,
                    `<td>${device.yazici_marka || '-'}</td>`,
                    `<td>${device.yazici_model || '-'}</td>`,
                    `<td>${device.yazici_seri_no || '-'}</td>`
                ];
                break;
            case 'scanner':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.tarayici_marka || '-'}</td>`,
                    `<td>${device.tarayici_model || '-'}</td>`,
                    `<td>${device.tarayici_seri_no || '-'}</td>`
                ];
                break;
            case 'tv':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.tv_marka || '-'}</td>`,
                    `<td>${device.tv_model || '-'}</td>`,
                    `<td>${device.tv_seri_no || '-'}</td>`
                ];
                break;
            case 'camera':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.kamera_marka || '-'}</td>`,
                    `<td>${device.kamera_model || '-'}</td>`,
                    `<td>${device.kamera_seri_no || '-'}</td>`
                ];
                break;
            case 'segbis':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.segbis_marka || '-'}</td>`,
                    `<td>${device.segbis_model || '-'}</td>`,
                    `<td>${device.segbis_seri_no || '-'}</td>`
                ];
                break;
            case 'e_durusma':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.edurusma_marka || '-'}</td>`,
                    `<td>${device.edurusma_model || '-'}</td>`,
                    `<td>${device.edurusma_seri_no || '-'}</td>`
                ];
                break;
            case 'microphone':
                cells = [
                    `<td>${device.mahkeme_no || '-'}</td>`,
                    `<td>${device.birim || '-'}</td>`,
                    `<td>${device.mikrofon_marka || '-'}</td>`,
                    `<td>${device.mikrofon_model || '-'}</td>`,
                    `<td>${device.mikrofon_seri_no || '-'}</td>`
                ];
                break;
        }
        // İşlem butonlarını ekle
        cells.push(`
            <td class="table-actions">
                <button onclick="showDeviceDetails('${device.id}', '${device.type}')" class="btn-icon info" title="Detayları Göster">
                    <i class="fas fa-info-circle"></i>
                </button>
                <button onclick="showEditModal('${device.id}', '${device.type}')" class="btn-icon edit" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteDevice('${device.id}', '${device.type}')" class="btn-icon delete" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `);
        row.innerHTML = cells.join('');
        tbody.appendChild(row);
    });
    // Pagination kontrollerini ekle
    renderPaginationControlsDevices(totalRows, currentPage, (page) => { devicesCurrentPage[activeTab] = page; renderDevices(activeTab); }, `${activeTab}Pagination`);
    // Update device statistics
    updateDeviceStats();
}

// Delete device from database
async function deleteDeviceFromDatabase(device) {
    try {
        let table = `${device.type}s`;
        if (device.type === 'e_durusma') table = 'e_durusma';
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', device.id);

        if (error) throw error;

        showNotification('Cihaz başarıyla silindi', 'success');
        await fetchDevices(); // Listeyi güncelle
    } catch (error) {
        console.error('Error deleting device:', JSON.stringify(error), device);
        showNotification('Cihaz silinirken bir hata oluştu', 'error');
    }
}

// Delete device
async function deleteDevice(deviceId, type) {
    if (confirm('Bu cihazı silmek istediğinizden emin misiniz?')) {
        const idNumber = Number(deviceId);
        if (isNaN(idNumber)) {
            console.error('Silme işlemi için geçersiz id:', deviceId);
            showNotification('Geçersiz cihaz id\'si!', 'error');
            return;
        }
        await deleteDeviceFromDatabase({ id: idNumber, type: type });
    }
}

// Edit device
function editDevice(id, type) {
    const device = devices.find(d => d.id === parseInt(id) && d.type === type);
    if (!device) return;
    
    // Show edit modal with device data
    // Implementation will depend on your modal structure
    console.log('Editing device:', device);
}

// Show Edit Modal
function showEditModal(deviceId, deviceType) {
    console.log('showEditModal çağrıldı:', deviceId, deviceType);
    console.log('Mevcut cihazlar:', devices);
    
    const device = devices.find(d => String(d.id) === String(deviceId) && d.type === deviceType);
    console.log('Bulunan cihaz:', device);
    
    if (!device) {
        console.error('Düzenleme için cihaz bulunamadı:', deviceId, deviceType);
        return;
    }

    currentDeviceId = deviceId;
    const modal = document.getElementById('editDeviceModal');
    modal.classList.add('show');

    // Form alanlarını doldur
    document.getElementById('editDeviceId').value = device.id;
    document.getElementById('editDeviceType').value = device.type;
    document.getElementById('editBirim').value = device.birim;

    console.log('Form alanları dolduruluyor...');
    updateEditFormFields();
    fillEditFormFields(device);
    console.log('Form alanları dolduruldu.');
}

// Update Edit Form Fields
function updateEditFormFields() {
    const deviceType = document.getElementById('editDeviceType').value;
    const dynamicFields = document.getElementById('editDynamicFields');
    dynamicFields.innerHTML = '';

    if (deviceType) {
        const fields = getFormFieldsByType(deviceType);
        fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            // Benzersiz id ekle
            formGroup.id = `form-group-edit_${field.id}`;
            formGroup.innerHTML = `
                <label for="edit_${field.id}">
                    <i class="fas fa-user-tie"></i>
                    ${field.label}
                </label>
                ${field.type === 'select' ? `
                    <select id="edit_${field.id}" name="edit_${field.id}" class="modern-select" ${field.required ? 'required' : ''}>
                        <option value="">${field.label} seçin</option>
                        ${field.options.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                ` : `
                    <input type="text" id="edit_${field.id}" name="edit_${field.id}" class="modern-input" ${field.required ? 'required' : ''}>
                `}
            `;
            dynamicFields.appendChild(formGroup);
        });
        // Temizlik alanlarını göster/gizle
        const temizlikGroup = document.querySelector('.edit-temizlik-group');
        if (temizlikGroup) {
            temizlikGroup.style.display = deviceType === 'computer' ? 'block' : 'none';
        }
    }
}

// Fill Edit Form Fields
function fillEditFormFields(device) {
    console.log('fillEditFormFields başladı, cihaz:', device);
    
    const fields = getFormFieldsByType(device.type);
    console.log('Cihaz tipi için alanlar:', fields);
    
    fields.forEach(field => {
        const input = document.getElementById(`edit_${field.id}`);
        console.log(`Alan dolduruluyor: ${field.id}`, {
            inputElement: input,
            deviceValue: device[field.id]
        });
        if (input) {
            input.value = device[field.id] || '';
        }
    });

    // Temel alanları doldur
    console.log('Temel alanlar dolduruluyor...');
    document.getElementById('editBirim').value = device.birim || '';
    document.getElementById('editMahkemeNo').value = device.mahkeme_no || '';
    
    const editOdaTipiSelect = document.getElementById('editOdaTipi');
    if (editOdaTipiSelect) {
        const editOdaTipi = editOdaTipiSelect.options[editOdaTipiSelect.selectedIndex].text;
        document.getElementById('editOdaTipi').value = editOdaTipi;
    }

    // Garanti tarihlerini doldur
    document.getElementById('editIlkGarantiTarihi').value = device.ilk_garanti_tarihi || '';
    document.getElementById('editSonGarantiTarihi').value = device.son_garanti_tarihi || '';

    // Temizlik tarihlerini doldur (sadece kasa için)
    if (device.type === 'computer') {
        const temizlikGroup = document.querySelector('.temizlik-group');
        if (temizlikGroup) {
            temizlikGroup.style.display = 'block';
            const ilkTemizlikInput = document.getElementById('editIlkTemizlikTarihi');
            const sonTemizlikInput = document.getElementById('editSonTemizlikTarihi');
            
            if (ilkTemizlikInput && sonTemizlikInput) {
                console.log('Temizlik tarihleri dolduruluyor:', {
                    ilk: device.ilk_temizlik_tarihi,
                    son: device.son_temizlik_tarihi
                });
                
                // Tarihleri YYYY-MM-DD formatına çevir
                const formatDate = (dateStr) => {
                    if (!dateStr) return '';
                    const date = new Date(dateStr);
                    return date.toISOString().split('T')[0];
                };

                ilkTemizlikInput.value = formatDate(device.ilk_temizlik_tarihi);
                sonTemizlikInput.value = formatDate(device.son_temizlik_tarihi);
            }
        }
    } else {
        const temizlikGroup = document.querySelector('.temizlik-group');
        if (temizlikGroup) {
            temizlikGroup.style.display = 'none';
        }
    }
    
    console.log('Tüm alanlar dolduruldu.');
}

// Close Edit Modal
function closeEditModal() {
    const modal = document.getElementById('editDeviceModal');
    modal.classList.remove('show');
    currentDeviceId = null;
}

// Update Device
async function updateDevice(event) {
    if (event) event.preventDefault();
    const form = document.getElementById('editDeviceForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const deviceId = Number(document.getElementById('editDeviceId').value);
    const deviceType = document.getElementById('editDeviceType').value;
    const birim = document.getElementById('editBirim').value;
    const mahkemeNo = document.getElementById('editMahkemeNo').value;
    const editOdaTipiSelect = document.getElementById('editOdaTipi');
    const editOdaTipi = editOdaTipiSelect.options[editOdaTipiSelect.selectedIndex].text;

    // Cihazı güncelle
    const updatedDevice = {
        id: deviceId,
        birim: birim,
        mahkeme_no: mahkemeNo,
        oda_tipi: editOdaTipi,
        ilk_garanti_tarihi: document.getElementById('editIlkGarantiTarihi').value,
        son_garanti_tarihi: document.getElementById('editSonGarantiTarihi').value
    };

    // Temizlik tarihlerini sadece kasa için ekle
    if (deviceType === 'computer') {
        updatedDevice.ilk_temizlik_tarihi = document.getElementById('editIlkTemizlikTarihi').value || null;
        updatedDevice.son_temizlik_tarihi = document.getElementById('editSonTemizlikTarihi').value || null;
    }

    // Diğer alanları ekle (snake_case)
    const fields = getFormFieldsByType(deviceType);
    fields.forEach(field => {
        const input = document.getElementById(`edit_${field.id}`);
        if (input) {
            // PRINTER için sicilno düzeltmesi
            if (deviceType === 'printer' && field.id === 'sicil_no') {
                updatedDevice.sicilno = input.value;
            } else {
                updatedDevice[field.id] = input.value;
            }
        }
    });

    // Tablo adını ayarla
    let table = `${deviceType}s`;
    if (deviceType === 'e_durusma') table = 'e_durusma';

    try {
        const { error } = await supabase
            .from(table)
            .update(updatedDevice)
            .eq('id', deviceId);
        if (error) throw error;
        showNotification('Cihaz başarıyla güncellendi', 'success');
        closeEditModal();
        await fetchDevices();
    } catch (error) {
        console.error('Error updating device:', JSON.stringify(error), updatedDevice);
        showNotification('Cihaz güncellenirken bir hata oluştu', 'error');
    }
}

// Show Device Details
function showDeviceDetails(deviceId, deviceType) {
    const device = devices.find(d => d.id === Number(deviceId) && d.type === deviceType);
    console.log("Detay modalına gelen cihaz:", device); // DEBUG
    if (!device) {
        console.error('Device not found:', deviceId, deviceType);
        return;
    }

    // Modalı aç
    const modal = document.getElementById('deviceDetailsModal');
    if (!modal) {
        console.error('Device details modal not found');
        return;
    }
    modal.classList.add('show');

    // Ortak alanlar
    document.getElementById('detailUnit').textContent = device.birim || '';
    document.getElementById('detailMahkemeNo').textContent = device.mahkeme_no || '';
    document.getElementById('detailOdaTipi').textContent = device.oda_tipi || '';

    // Garanti tarihlerini HER cihaz türü için göster
    const ilkGaranti = device.ilk_garanti_tarihi && device.ilk_garanti_tarihi !== "" ? new Date(device.ilk_garanti_tarihi).toLocaleDateString('tr-TR') : "-";
    const sonGaranti = device.son_garanti_tarihi && device.son_garanti_tarihi !== "" ? new Date(device.son_garanti_tarihi).toLocaleDateString('tr-TR') : "-";
    document.getElementById('detailIlkGaranti').textContent = ilkGaranti;
    document.getElementById('detailSonGaranti').textContent = sonGaranti;

    // Cihaz türüne göre alanlar
    let brand = '', model = '', serial = '';
    switch (deviceType) {
        case 'computer':
            brand = device.kasa_marka || '';
            model = device.kasa_model || '';
            serial = device.kasa_seri_no || '';
            
            // Temizlik alanlarını görünür yap
            document.getElementById('detailIlkTemizlikRow').style.display = '';
            document.getElementById('detailSonTemizlikRow').style.display = '';
            
            // Temizlik tarihlerini göster
            if (device.ilk_temizlik_tarihi) {
                try {
                    const ilkTemizlikDate = new Date(device.ilk_temizlik_tarihi);
                    const sonTemizlikDate = new Date(device.son_temizlik_tarihi);
                    document.getElementById('detailIlkTemizlik').textContent = ilkTemizlikDate.toLocaleDateString('tr-TR');
                    document.getElementById('detailSonTemizlik').textContent = sonTemizlikDate.toLocaleDateString('tr-TR');
                } catch (error) {
                    console.error('Error formatting cleaning dates:', error);
                    document.getElementById('detailIlkTemizlik').textContent = device.ilk_temizlik_tarihi || '-';
                    document.getElementById('detailSonTemizlik').textContent = device.son_temizlik_tarihi || '-';
                }
            } else {
                document.getElementById('detailIlkTemizlik').textContent = '-';
                document.getElementById('detailSonTemizlik').textContent = '-';
            }
            break;
        case 'laptop':
            brand = device.laptop_marka || '';
            model = device.laptop_model || '';
            serial = device.laptop_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'screen':
            brand = device.ekran_marka || '';
            model = device.ekran_model || '';
            serial = device.ekran_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'printer':
            brand = device.yazici_marka || '';
            model = device.yazici_model || '';
            serial = device.yazici_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'scanner':
            brand = device.tarayici_marka || '';
            model = device.tarayici_model || '';
            serial = device.tarayici_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'tv':
            brand = device.tv_marka || '';
            model = device.tv_model || '';
            serial = device.tv_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'camera':
            brand = device.kamera_marka || '';
            model = device.kamera_model || '';
            serial = device.kamera_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'segbis':
            brand = device.segbis_marka || '';
            model = device.segbis_model || '';
            serial = device.segbis_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'e_durusma':
            brand = device.edurusma_marka || '';
            model = device.edurusma_model || '';
            serial = device.edurusma_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
        case 'microphone':
            brand = device.mikrofon_marka || '';
            model = device.mikrofon_model || '';
            serial = device.mikrofon_seri_no || '';
            // Temizlik alanlarını gizle
            document.getElementById('detailIlkTemizlikRow').style.display = 'none';
            document.getElementById('detailSonTemizlikRow').style.display = 'none';
            break;
    }

    // Marka, model ve seri numarasını göster
    document.getElementById('detailBrand').textContent = brand;
    document.getElementById('detailModel').textContent = model;
    document.getElementById('detailSerial').textContent = serial;

    // Unvan, Adı Soyadı, Sicil No alanlarını göster/gizle
    const unvanRow = document.getElementById('detailUnvanRow');
    const adSoyadRow = document.getElementById('detailAdSoyadRow');
    const sicilNoRow = document.getElementById('detailSicilNoRow');
    if (deviceType === 'computer' || deviceType === 'screen' || deviceType === 'laptop') {
        unvanRow.style.display = '';
        adSoyadRow.style.display = '';
        sicilNoRow.style.display = '';
        document.getElementById('detailUnvan').textContent = device.unvan || '';
        document.getElementById('detailAdSoyad').textContent = device.adi_soyadi || '';
        document.getElementById('detailSicilNo').textContent = device.sicil_no || '';
    } else {
        unvanRow.style.display = 'none';
        adSoyadRow.style.display = 'none';
        sicilNoRow.style.display = 'none';
    }

    // QR ve barkod görsellerini oluştur
    const qrValue = device.qr_kod || '';
    const barcodeValue = device.barkod || '';

    // Küçük bir gecikme ile QR ve barkod oluştur
    setTimeout(() => {
        // QR kodu
        if (window.qrcode && qrValue) {
            document.getElementById('qrCode').innerHTML = '';
            const qr = window.qrcode(4, 'L');
            qr.addData(qrValue);
            qr.make();
            document.getElementById('qrCode').innerHTML = qr.createImgTag(4);
        } else {
            document.getElementById('qrCode').innerHTML = '';
        }

        // Barkod
        if (window.JsBarcode && barcodeValue) {
            document.getElementById('barcode').innerHTML = '<svg id="barcodeSvg"></svg>';
            JsBarcode("#barcodeSvg", barcodeValue, {format: "CODE128"});
        } else {
            document.getElementById('barcode').innerHTML = '';
        }
    }, 50);
}

// Close Details Modal
function closeDetailsModal() {
    const modal = document.getElementById('deviceDetailsModal');
    modal.classList.remove('show');
    currentDeviceId = null;
}

// Get Device Type Name
function getDeviceTypeName(type) {
    const types = {
        computer: 'Bilgisayar',
        laptop: 'Laptop',
        screen: 'Monitör',
        printer: 'Yazıcı',
        scanner: 'Tarayıcı',
        tv: 'Televizyon',
        camera: 'Kamera',
        segbis: 'SEGBIS',
        microphone: 'Mikrofon',
        e_durusma: 'E-Duruşma'
    };
    return types[type] || type;
}

// Make functions globally accessible
window.showAddModal = showAddModal;
window.closeAddModal = closeAddModal;
window.updateFormFields = updateFormFields;
window.saveDevice = saveDevice;
window.toggleFilter = toggleFilter;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.deleteDevice = deleteDevice;
window.editDevice = editDevice;
window.showEditModal = showEditModal;
window.closeEditModal = closeEditModal;
window.updateDevice = updateDevice;
window.showDeviceDetails = showDeviceDetails;
window.closeDetailsModal = closeDetailsModal;
window.updateEditFormFields = updateEditFormFields;

// Key mapping function: Supabase -> camelCase (ŞİMDİ snake_case döndürsün)
function mapDeviceKeys(device, type) {
    switch (type) {
        case 'computer':
            return {
                id: device.id,
                type: 'computer',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                unvan: device.unvan,
                adi_soyadi: device.adi_soyadi,
                sicil_no: device.sicil_no,
                kasa_marka: device.kasa_marka,
                kasa_model: device.kasa_model,
                kasa_seri_no: device.kasa_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                ilk_temizlik_tarihi: device.ilk_temizlik_tarihi,
                son_temizlik_tarihi: device.son_temizlik_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'laptop':
            return {
                id: device.id,
                type: 'laptop',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                unvan: device.unvan,
                adi_soyadi: device.adi_soyadi,
                sicil_no: device.sicil_no,
                laptop_marka: device.laptop_marka,
                laptop_model: device.laptop_model,
                laptop_seri_no: device.laptop_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'screen':
            return {
                id: device.id,
                type: 'screen',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                unvan: device.unvan,
                adi_soyadi: device.adi_soyadi,
                sicil_no: device.sicil_no,
                ekran_marka: device.ekran_marka,
                ekran_model: device.ekran_model,
                ekran_seri_no: device.ekran_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'printer':
            return {
                id: device.id,
                type: 'printer',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                unvan: device.unvan,
                adi_soyadi: device.adi_soyadi,
                sicil_no: device.sicilno,
                yazici_marka: device.yazici_marka,
                yazici_model: device.yazici_model,
                yazici_seri_no: device.yazici_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'scanner':
            return {
                id: device.id,
                type: 'scanner',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                tarayici_marka: device.tarayici_marka,
                tarayici_model: device.tarayici_model,
                tarayici_seri_no: device.tarayici_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'tv':
            return {
                id: device.id,
                type: 'tv',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                tv_marka: device.tv_marka,
                tv_model: device.tv_model,
                tv_seri_no: device.tv_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'camera':
            return {
                id: device.id,
                type: 'camera',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                kamera_marka: device.kamera_marka,
                kamera_model: device.kamera_model,
                kamera_seri_no: device.kamera_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'segbis':
            return {
                id: device.id,
                type: 'segbis',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                segbis_marka: device.segbis_marka,
                segbis_model: device.segbis_model,
                segbis_seri_no: device.segbis_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'e_durusma':
            return {
                id: device.id,
                type: 'e_durusma',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                edurusma_marka: device.edurusma_marka,
                edurusma_model: device.edurusma_model,
                edurusma_seri_no: device.edurusma_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        case 'microphone':
            return {
                id: device.id,
                type: 'microphone',
                birim: device.birim,
                mahkeme_no: device.mahkeme_no,
                oda_tipi: device.oda_tipi,
                mikrofon_marka: device.mikrofon_marka,
                mikrofon_model: device.mikrofon_model,
                mikrofon_seri_no: device.mikrofon_seri_no,
                ilk_garanti_tarihi: device.ilk_garanti_tarihi,
                son_garanti_tarihi: device.son_garanti_tarihi,
                qr_kod: device.qr_kod,
                barkod: device.barkod
            };
        default:
            return device;
    }
}

// Database functions
async function fetchDevices() {
    try {
        console.log('Veritabanından cihazlar çekiliyor...');
        // Tablo adı -> type eşlemesi
        const tableTypeMap = {
            computers: 'computer',
            laptops: 'laptop',
            screens: 'screen',
            printers: 'printer',
            scanners: 'scanner',
            tvs: 'tv',
            cameras: 'camera',
            segbis: 'segbis',
            microphones: 'microphone',
            e_durusma: 'e_durusma'
        };
        // Tablo adı -> select alanları eşlemesi (tamamen snake_case!)
        const tableSelectMap = {
            computers: 'id, birim, mahkeme_no, oda_tipi, unvan, adi_soyadi, sicil_no, kasa_marka, kasa_model, kasa_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, ilk_temizlik_tarihi, son_temizlik_tarihi, qr_kod, barkod',
            laptops: 'id, birim, mahkeme_no, oda_tipi, unvan, adi_soyadi, sicil_no, laptop_marka, laptop_model, laptop_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            screens: 'id, birim, mahkeme_no, oda_tipi, unvan, adi_soyadi, sicil_no, ekran_marka, ekran_model, ekran_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            printer: 'id, birim, mahkeme_no, oda_tipi, unvan, adi_soyadi, sicilno, yazici_marka, yazici_model, yazici_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            scanners: 'id, birim, mahkeme_no, oda_tipi, tarayici_marka, tarayici_model, tarayici_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            tvs: 'id, birim, mahkeme_no, oda_tipi, tv_marka, tv_model, tv_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            cameras: 'id, birim, mahkeme_no, oda_tipi, kamera_marka, kamera_model, kamera_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            segbis: 'id, birim, mahkeme_no, oda_tipi, segbis_marka, segbis_model, segbis_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            microphones: 'id, birim, mahkeme_no, oda_tipi, mikrofon_marka, mikrofon_model, mikrofon_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod',
            e_durusma: 'id, birim, mahkeme_no, oda_tipi, edurusma_marka, edurusma_model, edurusma_seri_no, ilk_garanti_tarihi, son_garanti_tarihi, qr_kod, barkod'
        };
        const tables = Object.keys(tableTypeMap);
        let allDevices = [];
        for (const table of tables) {
            console.log(`${table} tablosundan veri çekiliyor...`);
            const { data, error } = await supabase
                .from(table)
                .select(tableSelectMap[table]);
            if (error) {
                console.error(`Error fetching ${table}:`, error);
                continue;
            }
            if (data && data.length > 0) {
                console.log(`${table} tablosundan çekilen veriler:`, data);
                const type = tableTypeMap[table];
                const devicesWithType = data.map(device => mapDeviceKeys(device, type));
                console.log(`${table} tablosundan dönüştürülen veriler:`, devicesWithType);
                allDevices = [...allDevices, ...devicesWithType];
            } else {
                console.log(`${table} tablosunda veri bulunamadı`);
            }
        }
        devices = allDevices;
        console.log('Toplam cihaz sayısı:', devices.length);
        // Aktif tab'ı render et
        const activeTab = document.querySelector('.tab-button.active')?.getAttribute('data-tab') || 'computer';
        renderDevices(activeTab);
        updateDeviceStats();
    } catch (error) {
        console.error('Error fetching devices:', error);
        showNotification('Cihazlar yüklenirken bir hata oluştu', 'error');
    }
}

// Save new device to database
async function saveDeviceToDatabase(device) {
    try {
        if (!device.type) {
            throw new Error('Cihaz tipi belirtilmedi!');
        }

        // Tablo adını doğru şekilde oluştur
        let table = device.type;
        if (device.type === 'e_durusma') {
            table = 'e_durusma';
        } else if (device.type === 'printers') {
            table = 'printers';
        } else {
            table = `${device.type}s`;
        }

        // Veritabanına gönderilecek veriyi hazırla
        const deviceData = { ...device };
        delete deviceData.type; // type alanını kaldır
        // PRINTER için sicilno düzeltmesi
        if (device.type === 'printer' && deviceData.sicil_no) {
            deviceData.sicilno = deviceData.sicil_no;
            delete deviceData.sicil_no;
        }

        // QR ve barkod oluştur
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        deviceData.qr_kod = `${device.type}_${timestamp}_${random}`;
        deviceData.barkod = `${device.type}_${timestamp}_${random}`;

        console.log('Son hali ile gönderilecek veri:', JSON.stringify(deviceData, null, 2));

        const { data, error } = await supabase
            .from(table)
            .insert([deviceData])
            .select();

        if (error) {
            console.error('Supabase hatası:', error);
            throw error;
        }

        console.log('Başarılı yanıt:', data);
        showNotification('Cihaz başarıyla kaydedildi', 'success');
        await fetchDevices();
        return data[0];
    } catch (error) {
        console.error('Cihaz kaydetme hatası:', error);
        showNotification('Cihaz kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error');
        throw error;
    }
}

// Update device in database
async function updateDeviceInDatabase(device) {
    try {
        // Tablo adını doğru şekilde oluştur
        let table = device.type;
        if (device.type === 'e_durusma') {
            table = 'e_durusma';
        } else if (device.type === 'printers') {
            table = 'printers';
        } else {
            table = `${device.type}s`;
        }

        const { data, error } = await supabase
            .from(table)
            .update(device)
            .eq('id', device.id)
            .select();

        if (error) throw error;

        showNotification('Cihaz başarıyla güncellendi', 'success');
        await fetchDevices(); // Listeyi güncelle
    } catch (error) {
        console.error('Error updating device:', error);
        showNotification('Cihaz güncellenirken bir hata oluştu', 'error');
    }
}

// Get form fields by device type
function getFormFieldsByType(deviceType) {
    const unvanField = { 
        id: 'unvan', 
        label: 'Unvan', 
        required: true,
        type: 'select',
        options: [
            'Zabıt Katibi',
            'Mübaşir',
            'İcra Katibi',
            'İcra Memuru',
            'İcra Müdür Yardımcısı',
            'İcra Müdürü',
            'Yazı İşleri Müdürü',
            'Hakim',
            'Savcı',
            'Veznedar',
            'Hizmetli',
            'Tarama Memuru',
            'Memur',
            'Teknisyen',
            'Tekniker',
            'Bilgi İşlem Müdürü',
            'Uzman'
        ]
    };

    // Get the selected oda_tipi
    const odaTipiSelect = document.getElementById('oda_tipi') || document.getElementById('editOdaTipi');
    const isHakimOdasi = odaTipiSelect && odaTipiSelect.value === 'Hakim Odaları';

    let personalFields = [];
    if (deviceType === 'printer') {
        // Sadece yazıcı ve Hakim Odaları ise personalFields ekle
        if (isHakimOdasi) {
            personalFields = [
                unvanField,
                { id: 'adi_soyadi', label: 'Adı Soyadı', required: true },
                { id: 'sicil_no', label: 'Sicil No', required: true }
            ];
        } else {
            personalFields = [];
        }
    } else if (deviceType === 'computer' || deviceType === 'laptop' || deviceType === 'screen') {
        // Kasa, laptop, monitör için her zaman personalFields ekle
        personalFields = [
            unvanField,
            { id: 'adi_soyadi', label: 'Adı Soyadı', required: true },
            { id: 'sicil_no', label: 'Sicil No', required: true }
        ];
    } else if (isHakimOdasi) {
        // Diğer cihazlarda eski kural geçerli
        personalFields = [
            unvanField,
            { id: 'adi_soyadi', label: 'Adı Soyadı', required: true },
            { id: 'sicil_no', label: 'Sicil No', required: true }
        ];
    }

    switch (deviceType) {
        case 'computer':
            return [
                ...personalFields,
                { id: 'kasa_marka', label: 'Kasa Marka', required: true },
                { id: 'kasa_model', label: 'Kasa Model', required: true },
                { id: 'kasa_seri_no', label: 'Kasa Seri No', required: true }
            ];
        case 'laptop':
            return [
                ...personalFields,
                { id: 'laptop_marka', label: 'Laptop Marka', required: true },
                { id: 'laptop_model', label: 'Laptop Model', required: true },
                { id: 'laptop_seri_no', label: 'Laptop Seri No', required: true }
            ];
        case 'screen':
            return [
                ...personalFields,
                { id: 'ekran_marka', label: 'Monitör Marka', required: true },
                { id: 'ekran_model', label: 'Monitör Model', required: true },
                { id: 'ekran_seri_no', label: 'Monitör Seri No', required: true }
            ];
        case 'printer':
            return [
                ...personalFields,
                { id: 'yazici_marka', label: 'Yazıcı Marka', required: true },
                { id: 'yazici_model', label: 'Yazıcı Model', required: true },
                { id: 'yazici_seri_no', label: 'Yazıcı Seri No', required: true }
            ];
        case 'scanner':
            return [
                { id: 'tarayici_marka', label: 'Tarayıcı Marka', required: true },
                { id: 'tarayici_model', label: 'Tarayıcı Model', required: true },
                { id: 'tarayici_seri_no', label: 'Tarayıcı Seri No', required: true }
            ];
        case 'tv':
            return [
                { id: 'tv_marka', label: 'TV Marka', required: true },
                { id: 'tv_model', label: 'TV Model', required: true },
                { id: 'tv_seri_no', label: 'TV Seri No', required: true }
            ];
        case 'camera':
            return [
                { id: 'kamera_marka', label: 'Kamera Marka', required: true },
                { id: 'kamera_model', label: 'Kamera Model', required: true },
                { id: 'kamera_seri_no', label: 'Kamera Seri No', required: true }
            ];
        case 'segbis':
            return [
                { id: 'segbis_marka', label: 'SEGBIS Marka', required: true },
                { id: 'segbis_model', label: 'SEGBIS Model', required: true },
                { id: 'segbis_seri_no', label: 'SEGBIS Seri No', required: true }
            ];
        case 'microphone':
            return [
                { id: 'mikrofon_marka', label: 'Mikrofon Marka', required: true },
                { id: 'mikrofon_model', label: 'Mikrofon Model', required: true },
                { id: 'mikrofon_seri_no', label: 'Mikrofon Seri No', required: true }
            ];
        case 'e_durusma':
            return [
                { id: 'edurusma_marka', label: 'E-Duruşma Marka', required: true },
                { id: 'edurusma_model', label: 'E-Duruşma Model', required: true },
                { id: 'edurusma_seri_no', label: 'E-Duruşma Seri No', required: true }
            ];
        default:
            return [];
    }
}

// Show new device modal
function showNewDeviceModal() {
    const modal = document.getElementById('newDeviceModal');
    if (!modal) {
        console.error('New device modal not found!');
        return;
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    resetNewDeviceForm();
    
    // Update dynamic fields based on selected device type
    const deviceTypeSelect = document.getElementById('newDeviceType');
    if (deviceTypeSelect) {
        updateNewDeviceFields();
    }
}

function closeNewDeviceModal() {
    const modal = document.getElementById('newDeviceModal');
    if (!modal) {
        console.error('New device modal not found!');
        return;
    }
    modal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Reset form
    resetNewDeviceForm();
}

function resetNewDeviceForm() {
    const form = document.getElementById('newDeviceForm');
    if (!form) {
        console.error('New device form not found!');
        return;
    }
    form.reset();
    
    // Clear dynamic fields
    const dynamicFields = document.getElementById('newDynamicFields');
    if (dynamicFields) {
        dynamicFields.innerHTML = '';
    }
    
    // Hide cleaning fields
    const temizlikGroup = document.querySelector('.temizlik-group');
    if (temizlikGroup) {
        temizlikGroup.style.display = 'none';
    }
}

function updateNewDeviceFields() {
    const deviceType = document.getElementById('newDeviceType').value;
    const dynamicFields = document.getElementById('newDynamicFields');
    if (!dynamicFields) {
        console.error('Dynamic fields container not found!');
        return;
    }
    
    // Clear existing fields
    dynamicFields.innerHTML = '';
    
    // Get fields for selected device type
    const fields = getFormFieldsByType(deviceType);
    
    // Create form groups for each field
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="${field.id}">
                <i class="fas fa-user-tie"></i>
                ${field.label}
            </label>
            ${field.type === 'select' ? `
                <select id="${field.id}" name="${field.id}" class="modern-select" ${field.required ? 'required' : ''}>
                    <option value="">${field.label} seçin</option>
                    ${field.options.map(option => `<option value="${option}">${option}</option>`).join('')}
                </select>
            ` : `
                <input type="text" id="${field.id}" name="${field.id}" class="modern-input" ${field.required ? 'required' : ''}>
            `}
        `;
        dynamicFields.appendChild(formGroup);
    });
    
    // Show/hide cleaning fields based on device type
    const temizlikGroup = document.querySelector('.temizlik-group');
    if (temizlikGroup) {
        temizlikGroup.style.display = deviceType === 'computer' ? 'block' : 'none';
    }
}

// Save new device
async function saveNewDevice(event) {
    event.preventDefault();
    const form = document.getElementById('newDeviceForm');
    const formData = new FormData(form);

    // Get device type
    const deviceType = formData.get('newDeviceType');
    if (!deviceType) {
        showNotification('Lütfen bir cihaz tipi seçin', 'error');
        return;
    }

    // Create new device object
    const newDevice = {
        birim: formData.get('birim') || '',
        oda_tipi: formData.get('oda_tipi') || '',
        mahkeme_no: formData.get('mahkeme_no') || ''
    };

    // Add dynamic fields
    const fields = getFormFieldsByType(deviceType);
    fields.forEach(field => {
        newDevice[field.id] = formData.get(field.id) || '';
    });

    // Determine table name
    let table = deviceType;
    if (deviceType === 'e_durusma') {
        table = 'e_durusma';
    } else {
        table = `${deviceType}s`;
    }

    // Generate QR and barcode
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    newDevice.qr_kod = `${deviceType}_${timestamp}_${random}`;
    newDevice.barkod = `${deviceType}_${timestamp}_${random}`;

    console.log('Sending data:', JSON.stringify(newDevice, null, 2));
    try {
        const { data, error } = await supabase
            .from(table)
            .insert([newDevice])
            .select();
        if (error) {
            console.error('Supabase error:', error);
            showNotification('Cihaz kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error');
            return;
        }
        showNotification('Cihaz başarıyla kaydedildi', 'success');
        closeNewDeviceModal();
        await fetchDevices();
    } catch (error) {
        console.error('Device save error:', error);
        showNotification('Cihaz kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'), 'error');
    }
}

// Event listener'ları ekle
document.addEventListener('DOMContentLoaded', function() {
    const newDeviceForm = document.getElementById('newDeviceForm');
    if (newDeviceForm) {
        newDeviceForm.addEventListener('submit', saveNewDevice);
    }
});

// Make functions globally accessible
window.showNewDeviceModal = showNewDeviceModal;
window.closeNewDeviceModal = closeNewDeviceModal;
window.updateNewDeviceFields = updateNewDeviceFields;
window.saveNewDevice = saveNewDevice;

// Add event listener for oda_tipi changes to update form fields
document.addEventListener('DOMContentLoaded', function() {
    const odaTipiSelect = document.getElementById('oda_tipi');
    const editOdaTipiSelect = document.getElementById('editOdaTipi');
    
    function updateFormFieldsOnOdaTipiChange() {
        const deviceTypeSelect = this.id === 'oda_tipi' ? 
            document.getElementById('deviceType') : 
            document.getElementById('editDeviceType');
            
        if (deviceTypeSelect && deviceTypeSelect.value) {
            if (this.id === 'oda_tipi') {
                updateFormFields();
            } else {
                updateEditFormFields();
            }
        }
    }
    
    if (odaTipiSelect) {
        odaTipiSelect.addEventListener('change', updateFormFieldsOnOdaTipiChange);
    }
    if (editOdaTipiSelect) {
        editOdaTipiSelect.addEventListener('change', updateFormFieldsOnOdaTipiChange);
    }
});

// ... mevcut kodun başına ekle ...
const ROWS_PER_PAGE = 5;
let devicesCurrentPage = {};

function renderPaginationControlsDevices(totalRows, currentPage, onPageChange, containerId) {
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (totalPages <= 1) return;
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Önceki';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => onPageChange(currentPage - 1);
    container.appendChild(prevBtn);
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        if (i === currentPage) pageBtn.classList.add('active');
        pageBtn.onclick = () => onPageChange(i);
        container.appendChild(pageBtn);
    }
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Sonraki';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => onPageChange(currentPage + 1);
    container.appendChild(nextBtn);
}



