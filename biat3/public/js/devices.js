// Sample device data
let devices = [
    // ... existing devices ...
];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');
let isFilterVisible = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateDeviceStats();
    renderDevices();
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabType = button.dataset.tab;
            switchTab(tabType);
        });
    });
});

// Show Add Device Modal
function showAddModal() {
    const modal = document.getElementById('addDeviceModal');
    modal.classList.add('show');
    updateFormFields(); // İlk form alanlarını oluştur
}

// Close Add Device Modal
function closeAddModal() {
    const modal = document.getElementById('addDeviceModal');
    modal.classList.remove('show');
    document.getElementById('addDeviceForm').reset();
}

// Update Form Fields based on device type
function updateFormFields() {
    const deviceType = document.getElementById('deviceType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = ''; // Mevcut alanları temizle

    // Cihaz türüne göre form alanlarını oluştur
    const fields = getFormFieldsByType(deviceType);
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="${field.id}">${field.label}</label>
            <input type="text" id="${field.id}" ${field.required ? 'required' : ''}>
        `;
        dynamicFields.appendChild(formGroup);
    });
}

// Get form fields based on device type
function getFormFieldsByType(type) {
    const fields = [];
    switch (type) {
        case 'computer':
            fields.push(
                { id: 'unvan', label: 'Unvan', required: false },
                { id: 'adiSoyadi', label: 'Adı Soyadı', required: false },
                { id: 'sicilNo', label: 'Sicil No', required: false },
                { id: 'kasaMarka', label: 'Kasa Marka', required: false },
                { id: 'kasaModel', label: 'Kasa Model', required: false },
                { id: 'kasaSeriNo', label: 'Kasa Seri No', required: false }
            );
            break;
        case 'laptop':
            fields.push(
                { id: 'unvan', label: 'Unvan', required: false },
                { id: 'adiSoyadi', label: 'Adı Soyadı', required: false },
                { id: 'sicilNo', label: 'Sicil No', required: false },
                { id: 'laptopMarka', label: 'Laptop Marka', required: false },
                { id: 'laptopModel', label: 'Laptop Model', required: false },
                { id: 'laptopSeriNo', label: 'Laptop Seri No', required: false }
            );
            break;
        case 'screen':
            fields.push(
                { id: 'unvan', label: 'Unvan', required: false },
                { id: 'adiSoyadi', label: 'Adı Soyadı', required: false },
                { id: 'sicilNo', label: 'Sicil No', required: false },
                { id: 'ekranMarka', label: 'Monitör Marka', required: false },
                { id: 'ekranModel', label: 'Monitör Model', required: false },
                { id: 'ekranSeriNo', label: 'Monitör Seri No', required: false }
            );
            break;
        case 'printer':
            fields.push(
                { id: 'yaziciMarka', label: 'Yazıcı Marka', required: false },
                { id: 'yaziciModel', label: 'Yazıcı Model', required: false },
                { id: 'yaziciSeriNo', label: 'Yazıcı Seri No', required: false }
            );
            break;
        case 'scanner':
            fields.push(
                { id: 'tarayiciMarka', label: 'Tarayıcı Marka', required: true },
                { id: 'tarayiciModel', label: 'Tarayıcı Model', required: true },
                { id: 'tarayiciSeriNo', label: 'Tarayıcı Seri No', required: true }
            );
            break;
        case 'tv':
            fields.push(
                { id: 'tvMarka', label: 'TV Marka', required: true },
                { id: 'tvModel', label: 'TV Model', required: true },
                { id: 'tvSeriNo', label: 'TV Seri No', required: true }
            );
            break;
        case 'camera':
            fields.push(
                { id: 'kameraMarka', label: 'Kamera Marka', required: true },
                { id: 'kameraModel', label: 'Kamera Model', required: true },
                { id: 'kameraSeriNo', label: 'Kamera Seri No', required: true }
            );
            break;
        case 'segbis':
            fields.push(
                { id: 'segbisMarka', label: 'SEGBIS Marka', required: true },
                { id: 'segbisModel', label: 'SEGBIS Model', required: true },
                { id: 'segbisSeriNo', label: 'SEGBIS Seri No', required: true }
            );
            break;
        case 'ehearing':
            fields.push(
                { id: 'edurusmaMarka', label: 'E-Duruşma Marka', required: true },
                { id: 'edurusmaModel', label: 'E-Duruşma Model', required: true },
                { id: 'edurusmaSeriNo', label: 'E-Duruşma Seri No', required: true }
            );
            break;
        case 'microphone':
            fields.push(
                { id: 'mikrofonMarka', label: 'Mikrofon Marka', required: true },
                { id: 'mikrofonModel', label: 'Mikrofon Model', required: true },
                { id: 'mikrofonSeriNo', label: 'Mikrofon Seri No', required: true }
            );
            break;
    }
    return fields;
}

// Save new device
function saveDevice() {
    const form = document.getElementById('addDeviceForm');
    const deviceType = document.getElementById('deviceType').value;
    const birim = document.getElementById('birim').value;
    
    // Yeni cihaz objesi oluştur
    const newDevice = {
        id: Date.now(), // Basit bir unique ID
        type: deviceType,
        birim: birim
    };

    // Cihaz türüne göre diğer alanları ekle
    const fields = getFormFieldsByType(deviceType);
    fields.forEach(field => {
        const value = document.getElementById(field.id)?.value;
        if (value) {
            newDevice[field.id] = value;
        }
    });

    // Cihazı listeye ekle
    devices.push(newDevice);

    // Modalı kapat ve tabloyu güncelle
    closeAddModal();
    renderDevices();
    updateDeviceStats();

    // Başarılı bildirim göster
    showNotification('Cihaz başarıyla eklendi', 'success');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
                matchMarka = device.kasaMarka.toLowerCase().includes(marka);
                matchModel = device.kasaModel.toLowerCase().includes(model);
                matchSeriNo = device.kasaSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'laptop':
                matchMarka = device.laptopMarka.toLowerCase().includes(marka);
                matchModel = device.laptopModel.toLowerCase().includes(model);
                matchSeriNo = device.laptopSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'screen':
                matchMarka = device.ekranMarka.toLowerCase().includes(marka);
                matchModel = device.ekranModel.toLowerCase().includes(model);
                matchSeriNo = device.ekranSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'printer':
                matchMarka = device.yaziciMarka.toLowerCase().includes(marka);
                matchModel = device.yaziciModel.toLowerCase().includes(model);
                matchSeriNo = device.yaziciSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'scanner':
                matchMarka = device.tarayiciMarka.toLowerCase().includes(marka);
                matchModel = device.tarayiciModel.toLowerCase().includes(model);
                matchSeriNo = device.tarayiciSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'tv':
                matchMarka = device.tvMarka.toLowerCase().includes(marka);
                matchModel = device.tvModel.toLowerCase().includes(model);
                matchSeriNo = device.tvSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'camera':
                matchMarka = device.kameraMarka.toLowerCase().includes(marka);
                matchModel = device.kameraModel.toLowerCase().includes(model);
                matchSeriNo = device.kameraSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'segbis':
                matchMarka = device.segbisMarka.toLowerCase().includes(marka);
                matchModel = device.segbisModel.toLowerCase().includes(model);
                matchSeriNo = device.segbisSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'ehearing':
                matchMarka = device.edurusmaMarka.toLowerCase().includes(marka);
                matchModel = device.edurusmaModel.toLowerCase().includes(model);
                matchSeriNo = device.edurusmaSeriNo.toLowerCase().includes(seriNo);
                break;
            case 'microphone':
                matchMarka = device.mikrofonMarka.toLowerCase().includes(marka);
                matchModel = device.mikrofonModel.toLowerCase().includes(model);
                matchSeriNo = device.mikrofonSeriNo.toLowerCase().includes(seriNo);
                break;
        }
        
        return matchBirim && (!marka || matchMarka) && (!model || matchModel) && (!seriNo || matchSeriNo);
    });
    
    renderDevices(filteredDevices);
}

// Switch active tab
function switchTab(tabType) {
    // Remove active class from all buttons and panes
    tabButtons.forEach(button => button.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected button and pane
    const selectedButton = document.querySelector(`.tab-button[data-tab="${tabType}"]`);
    const selectedPane = document.getElementById(`${tabType}Tab`);
    
    if (selectedButton && selectedPane) {
        selectedButton.classList.add('active');
        selectedPane.classList.add('active');
    }
    
    // Re-render devices for the current tab
    renderDevices();
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
        ehearing: 0,
        microphone: 0
    };
    
    devices.forEach(device => {
        if (stats.hasOwnProperty(device.type)) {
            stats[device.type]++;
        }
    });
    
    // Update stat numbers in UI
    Object.keys(stats).forEach(type => {
        const element = document.getElementById(`${type}Count`);
        if (element) {
            element.textContent = stats[type];
        }
    });
}

// Render devices in their respective tables
function renderDevices(devicesList = devices) {
    // Get current active tab
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;
    
    // Clear all table bodies
    document.querySelectorAll('.devices-table tbody').forEach(tbody => tbody.innerHTML = '');
    
    // Filter devices by type and render in appropriate table
    devicesList.forEach(device => {
        if (device.type === activeTab) {
            const tbody = document.getElementById(`${activeTab}TableBody`);
            if (!tbody) return;
            
            let row = document.createElement('tr');
            let cells = [];
            
            // Common field
            cells.push(`<td>${device.birim}</td>`);
            
            // Device specific fields
            switch (activeTab) {
                case 'computer':
                    cells.push(
                        `<td>${device.unvan || ''}</td>`,
                        `<td>${device.adiSoyadi || ''}</td>`,
                        `<td>${device.sicilNo || ''}</td>`,
                        `<td>${device.kasaMarka || ''}</td>`,
                        `<td>${device.kasaModel || ''}</td>`,
                        `<td>${device.kasaSeriNo || ''}</td>`
                    );
                    break;
                case 'laptop':
                    cells.push(
                        `<td>${device.unvan || ''}</td>`,
                        `<td>${device.adiSoyadi || ''}</td>`,
                        `<td>${device.sicilNo || ''}</td>`,
                        `<td>${device.laptopMarka || ''}</td>`,
                        `<td>${device.laptopModel || ''}</td>`,
                        `<td>${device.laptopSeriNo || ''}</td>`
                    );
                    break;
                case 'screen':
                    cells.push(
                        `<td>${device.unvan || ''}</td>`,
                        `<td>${device.adiSoyadi || ''}</td>`,
                        `<td>${device.sicilNo || ''}</td>`,
                        `<td>${device.ekranMarka || ''}</td>`,
                        `<td>${device.ekranModel || ''}</td>`,
                        `<td>${device.ekranSeriNo || ''}</td>`
                    );
                    break;
                case 'printer':
                    cells.push(
                        `<td>${device.yaziciMarka || ''}</td>`,
                        `<td>${device.yaziciModel || ''}</td>`,
                        `<td>${device.yaziciSeriNo || ''}</td>`
                    );
                    break;
                case 'scanner':
                    cells.push(
                        `<td>${device.tarayiciMarka || ''}</td>`,
                        `<td>${device.tarayiciModel || ''}</td>`,
                        `<td>${device.tarayiciSeriNo || ''}</td>`
                    );
                    break;
                case 'tv':
                    cells.push(
                        `<td>${device.tvMarka || ''}</td>`,
                        `<td>${device.tvModel || ''}</td>`,
                        `<td>${device.tvSeriNo || ''}</td>`
                    );
                    break;
                case 'camera':
                    cells.push(
                        `<td>${device.kameraMarka || ''}</td>`,
                        `<td>${device.kameraModel || ''}</td>`,
                        `<td>${device.kameraSeriNo || ''}</td>`
                    );
                    break;
                case 'segbis':
                    cells.push(
                        `<td>${device.segbisMarka || ''}</td>`,
                        `<td>${device.segbisModel || ''}</td>`,
                        `<td>${device.segbisSeriNo || ''}</td>`
                    );
                    break;
                case 'ehearing':
                    cells.push(
                        `<td>${device.edurusmaMarka || ''}</td>`,
                        `<td>${device.edurusmaModel || ''}</td>`,
                        `<td>${device.edurusmaSeriNo || ''}</td>`
                    );
                    break;
                case 'microphone':
                    cells.push(
                        `<td>${device.birim || ''}</td>`,
                        `<td>${device.mikrofonMarka || ''}</td>`,
                        `<td>${device.mikrofonModel || ''}</td>`,
                        `<td>${device.mikrofonSeriNo || ''}</td>`
                    );
                    break;
            }
            
            // Action buttons
            cells.push(`
                <td class="table-actions">
                    <button onclick="showDeviceDetails(${device.id})" class="btn-icon info" title="Detayları Göster">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button onclick="showEditModal(${device.id})" class="btn-icon edit" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteDevice(${device.id})" class="btn-icon delete" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `);
            
            row.innerHTML = cells.join('');
            tbody.appendChild(row);
        }
    });
    
    // Update device statistics
    updateDeviceStats();
}

// Delete device
function deleteDevice(id) {
    if (confirm('Bu cihazı silmek istediğinizden emin misiniz?')) {
        devices = devices.filter(device => device.id !== id);
        renderDevices();
    }
}

// Edit device
function editDevice(id) {
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    // Show edit modal with device data
    // Implementation will depend on your modal structure
    console.log('Editing device:', device);
}

// Show Edit Modal
function showEditModal(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    currentDeviceId = deviceId;
    const modal = document.getElementById('editDeviceModal');
    modal.classList.add('show');

    // Form alanlarını doldur
    document.getElementById('editDeviceId').value = device.id;
    document.getElementById('editDeviceType').value = device.type;
    document.getElementById('editBirim').value = device.birim;

    updateEditFormFields();
    fillEditFormFields(device);
}

// Update Edit Form Fields
function updateEditFormFields() {
    const deviceType = document.getElementById('editDeviceType').value;
    const dynamicFields = document.getElementById('editDynamicFields');
    dynamicFields.innerHTML = '';

    const fields = getFormFieldsByType(deviceType);
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="edit_${field.id}">${field.label}</label>
            <input type="text" id="edit_${field.id}" ${field.required ? 'required' : ''}>
        `;
        dynamicFields.appendChild(formGroup);
    });
}

// Fill Edit Form Fields
function fillEditFormFields(device) {
    const fields = getFormFieldsByType(device.type);
    fields.forEach(field => {
        const input = document.getElementById(`edit_${field.id}`);
        if (input) {
            input.value = device[field.id] || '';
        }
    });
}

// Close Edit Modal
function closeEditModal() {
    const modal = document.getElementById('editDeviceModal');
    modal.classList.remove('show');
    currentDeviceId = null;
}

// Update Device
function updateDevice() {
    const form = document.getElementById('editDeviceForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const deviceId = currentDeviceId;
    const deviceIndex = devices.findIndex(d => d.id === deviceId);
    if (deviceIndex === -1) return;

    const deviceType = document.getElementById('editDeviceType').value;
    const birim = document.getElementById('editBirim').value;

    // Cihazı güncelle
    const updatedDevice = {
        id: deviceId,
        type: deviceType,
        birim: birim
    };

    // Diğer alanları ekle
    const fields = getFormFieldsByType(deviceType);
    fields.forEach(field => {
        const input = document.getElementById(`edit_${field.id}`);
        if (input) {
            updatedDevice[field.id] = input.value;
        }
    });

    // Cihazı güncelle
    devices[deviceIndex] = updatedDevice;

    // Modalı kapat ve tabloyu güncelle
    closeEditModal();
    renderDevices();
    showNotification('Cihaz başarıyla güncellendi', 'success');
}

// Show Device Details
function showDeviceDetails(deviceId) {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    currentDeviceId = deviceId;
    
    // Clear previous codes
    document.getElementById('qrCode').innerHTML = '';
    document.getElementById('barcode').innerHTML = '';

    // Update general info
    document.getElementById('detailUnit').textContent = device.birim || '';
    
    // Set brand, model, and serial based on device type
    let brand = '', model = '', serial = '';
    switch (device.type) {
        case 'computer':
            brand = device.kasaMarka || '';
            model = device.kasaModel || '';
            serial = device.kasaSeriNo || '';
            break;
        case 'laptop':
            brand = device.laptopMarka || '';
            model = device.laptopModel || '';
            serial = device.laptopSeriNo || '';
            break;
        case 'screen':
            brand = device.ekranMarka || '';
            model = device.ekranModel || '';
            serial = device.ekranSeriNo || '';
            break;
        case 'printer':
            brand = device.yaziciMarka || '';
            model = device.yaziciModel || '';
            serial = device.yaziciSeriNo || '';
            break;
        case 'scanner':
            brand = device.tarayiciMarka || '';
            model = device.tarayiciModel || '';
            serial = device.tarayiciSeriNo || '';
            break;
        case 'tv':
            brand = device.tvMarka || '';
            model = device.tvModel || '';
            serial = device.tvSeriNo || '';
            break;
        case 'camera':
            brand = device.kameraMarka || '';
            model = device.kameraModel || '';
            serial = device.kameraSeriNo || '';
            break;
        case 'segbis':
            brand = device.segbisMarka || '';
            model = device.segbisModel || '';
            serial = device.segbisSeriNo || '';
            break;
        case 'ehearing':
            brand = device.edurusmaMarka || '';
            model = device.edurusmaModel || '';
            serial = device.edurusmaSeriNo || '';
            break;
        case 'microphone':
            brand = device.mikrofonMarka || '';
            model = device.mikrofonModel || '';
            serial = device.mikrofonSeriNo || '';
            break;
    }
    
    document.getElementById('detailBrand').textContent = brand;
    document.getElementById('detailModel').textContent = model;
    document.getElementById('detailSerial').textContent = serial;

    // Generate QR Code
    const qr = qrcode(0, 'M');
    const qrData = JSON.stringify({
        type: device.type,
        brand: brand,
        model: model,
        serial: serial,
        unit: device.birim
    });
    qr.addData(qrData);
    qr.make();
    document.getElementById('qrCode').innerHTML = qr.createImgTag(5);

    // Generate Barcode
    const barcodeContainer = document.getElementById('barcode');
    barcodeContainer.innerHTML = ''; // Clear previous barcode

    // Create unique barcode content based on device type and serial
    const barcodeContent = `${getDeviceTypeName(device.type).toUpperCase()}-${serial || 'NO-SERIAL'}`;
    
    try {
        // Create SVG element
        const barcodeElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        barcodeContainer.appendChild(barcodeElement);

        // Generate barcode with device-specific format
        JsBarcode(barcodeElement, barcodeContent, {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: true,
            text: barcodeContent,
            textAlign: "center",
            textPosition: "bottom",
            textMargin: 2,
            fontSize: 16,
            background: "#ffffff",
            lineColor: "#000000",
            margin: 10
        });

        // Add some styling to the SVG
        barcodeElement.style.width = '100%';
        barcodeElement.style.maxHeight = '150px';
        barcodeElement.style.marginTop = '10px';
        barcodeElement.style.marginBottom = '10px';
    } catch (error) {
        console.error('Barcode generation error:', error);
        barcodeContainer.innerHTML = '<p>Barkod oluşturulamadı</p>';
    }

    // Show modal
    document.getElementById('deviceDetailsModal').classList.add('show');
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
        ehearing: 'E-Duruşma'
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
