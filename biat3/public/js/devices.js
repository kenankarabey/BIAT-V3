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
    // Implementation will depend on your modal structure
    console.log('Show add device modal');
}

// Toggle Filter Section
function toggleFilter() {
    isFilterVisible = !isFilterVisible;
    const filterBtn = document.querySelector('.filter-btn');
    
    if (isFilterVisible) {
        // Create and show filter section
        const filterSection = document.createElement('div');
        filterSection.className = 'filter-section';
        filterSection.innerHTML = `
            <div class="filter-form">
                <input type="text" placeholder="Birim ara..." id="filterBirim">
                <input type="text" placeholder="Marka ara..." id="filterMarka">
                <input type="text" placeholder="Model ara..." id="filterModel">
                <input type="text" placeholder="Seri No ara..." id="filterSeriNo">
                <button onclick="applyFilters()">Uygula</button>
                <button onclick="clearFilters()">Temizle</button>
            </div>
        `;
        
        // Insert after action buttons
        const actionButtons = document.querySelector('.action-buttons');
        actionButtons.insertAdjacentElement('afterend', filterSection);
        
        // Update button text
        filterBtn.innerHTML = '<i class="fas fa-times"></i><span>Filtreyi Kapat</span>';
    } else {
        // Remove filter section
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.remove();
        }
        
        // Update button text
        filterBtn.innerHTML = '<i class="fas fa-filter"></i><span>Filtrele</span>';
        
        // Clear filters and show all devices
        renderDevices(devices);
    }
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
            // ... add cases for other device types ...
        }
        
        return matchBirim && matchMarka && matchModel && matchSeriNo;
    });
    
    renderDevices(filteredDevices);
}

// Clear Filters
function clearFilters() {
    const inputs = document.querySelectorAll('.filter-form input');
    inputs.forEach(input => input.value = '');
    renderDevices(devices);
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
        screen: 0,
        printer: 0,
        scanner: 0,
        tv: 0,
        camera: 0,
        segbis: 0,
        ehearing: 0
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
                case 'screen':
                    cells.push(
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
            }
            
            // Action buttons
            cells.push(`
                <td>
                    <button onclick="editDevice(${device.id})" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteDevice(${device.id})" class="delete-btn">
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

// Make functions globally accessible
window.showAddModal = showAddModal;
window.toggleFilter = toggleFilter;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.deleteDevice = deleteDevice;
window.editDevice = editDevice;