// Mock data - Replace with API call in production
let issues = [
    {
        id: "AZ2024001",
        date: "2024-02-20",
        location: "Mahkeme Kalemi",
        subLocation: "1. Asliye Hukuk Mahkemesi",
        device: "Bilgisayar",
        deviceId: "PC001",
        issueType: "Yazılım",
        urgency: "high",
        status: "beklemede",
        description: "Windows açılmıyor",
        contactName: "Ahmet Yılmaz",
        contactPhone: "0(555) 123 45 67",
        files: ["screenshot1.jpg", "screenshot2.jpg"]
    },
    // Add more mock data as needed
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const urgencyFilter = document.getElementById('urgencyFilter');
    const issuesTableBody = document.getElementById('issuesTableBody');
    const activeFilters = document.getElementById('activeFilters');

    // Initialize stats
    updateStats();

    // Real-time search
    searchInput.addEventListener('input', debounce(function() {
        applyFilters();
    }, 300));

    // Real-time filter updates
    [locationFilter, deviceTypeFilter, statusFilter, urgencyFilter].forEach(filter => {
        filter.addEventListener('change', () => {
            applyFilters();
            updateActiveFilters();
        });
    });

    // Initial render
    renderIssues(issues);
    updateActiveFilters();

    // Initialize drag and drop for status updates
    initializeDragAndDrop();
});

// Render issues table
function renderIssues(filteredIssues) {
    const issuesTableBody = document.getElementById('issuesTableBody');
    issuesTableBody.innerHTML = '';

    filteredIssues.forEach(issue => {
        const row = document.createElement('tr');
        row.setAttribute('draggable', 'true');
        row.setAttribute('data-issue-id', issue.id);
        
        row.innerHTML = `
            <td>${issue.id}</td>
            <td>${formatDate(issue.date)}</td>
            <td>
                <div class="location-info">
                    <span class="main-location">${issue.location}</span>
                    <span class="sub-location">${issue.subLocation}</span>
                </div>
            </td>
            <td>
                <div class="device-info">
                    <span class="device-type">${issue.device}</span>
                    <span class="device-id">${issue.deviceId}</span>
                </div>
            </td>
            <td>${issue.issueType}</td>
            <td>
                <span class="urgency-badge ${issue.urgency}">${getUrgencyText(issue.urgency)}</span>
            </td>
            <td>
                <span class="status-badge ${issue.status}" draggable="true">${getStatusText(issue.status)}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button onclick="showIssueDetails('${issue.id}')" class="btn-icon" title="Detayları Göster">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="updateIssueStatus('${issue.id}')" class="btn-icon" title="Durumu Güncelle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteIssue('${issue.id}')" class="btn-icon delete" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // Add hover effect for status update
        const statusBadge = row.querySelector('.status-badge');
        statusBadge.addEventListener('mouseover', () => {
            statusBadge.classList.add('hoverable');
        });

        issuesTableBody.appendChild(row);
    });

    // Update empty state
    const emptyState = document.querySelector('.empty-state');
    if (filteredIssues.length === 0) {
        if (!emptyState) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = `
                <i class="fas fa-search"></i>
                <p>Arıza kaydı bulunamadı</p>
                <a href="ariza-bildir.html" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    Yeni Arıza Bildir
                </a>
            `;
            issuesTableBody.parentElement.appendChild(empty);
        }
    } else if (emptyState) {
        emptyState.remove();
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const location = locationFilter.value;
    const deviceType = deviceTypeFilter.value;
    const status = statusFilter.value;
    const urgency = urgencyFilter.value;

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = 
            issue.id.toLowerCase().includes(searchTerm) ||
            issue.location.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm);

        const matchesLocation = !location || issue.location.toLowerCase().includes(location);
        const matchesDevice = !deviceType || issue.device.toLowerCase().includes(deviceType);
        const matchesStatus = !status || issue.status === status;
        const matchesUrgency = !urgency || issue.urgency === urgency;

        return matchesSearch && matchesLocation && matchesDevice && matchesStatus && matchesUrgency;
    });

    renderIssues(filteredIssues);
    updateStats();
}

// Update active filters display
function updateActiveFilters() {
    const activeFiltersDiv = document.getElementById('activeFilters');
    activeFiltersDiv.innerHTML = '';

    const filters = [
        { element: locationFilter, label: 'Lokasyon' },
        { element: deviceTypeFilter, label: 'Cihaz Türü' },
        { element: statusFilter, label: 'Durum' },
        { element: urgencyFilter, label: 'Aciliyet' }
    ];

    filters.forEach(filter => {
        if (filter.element.value) {
            const badge = document.createElement('div');
            badge.className = 'filter-badge';
            badge.innerHTML = `
                <span>${filter.label}: ${filter.element.options[filter.element.selectedIndex].text}</span>
                <button onclick="clearFilter('${filter.element.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            activeFiltersDiv.appendChild(badge);
        }
    });
}

// Clear individual filter
function clearFilter(filterId) {
    document.getElementById(filterId).value = '';
    applyFilters();
    updateActiveFilters();
}

// Reset all filters
function resetFilters() {
    searchInput.value = '';
    locationFilter.value = '';
    deviceTypeFilter.value = '';
    statusFilter.value = '';
    urgencyFilter.value = '';
    
    applyFilters();
    updateActiveFilters();
}

// Update statistics
function updateStats() {
    const stats = {
        beklemede: issues.filter(i => i.status === 'beklemede').length,
        islemde: issues.filter(i => i.status === 'islemde').length,
        tamamlandi: issues.filter(i => i.status === 'tamamlandi').length,
        iptal: issues.filter(i => i.status === 'iptal').length
    };

    document.getElementById('pendingCount').textContent = stats.beklemede;
    document.getElementById('inProgressCount').textContent = stats.islemde;
    document.getElementById('completedCount').textContent = stats.tamamlandi;
    document.getElementById('canceledCount').textContent = stats.iptal;

    // Animate count changes
    document.querySelectorAll('.stat-count').forEach(el => {
        el.classList.add('updated');
        setTimeout(() => el.classList.remove('updated'), 300);
    });
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    let draggedItem = null;

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('status-badge')) {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('status-badge')) {
            e.target.classList.remove('dragging');
        }
    });

    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');

            if (draggedItem) {
                const issueId = draggedItem.closest('tr').getAttribute('data-issue-id');
                const newStatus = card.classList.contains('pending') ? 'beklemede' :
                                card.classList.contains('in-progress') ? 'islemde' :
                                card.classList.contains('completed') ? 'tamamlandi' :
                                'iptal';

                updateIssueStatus(issueId, newStatus);
            }
        });
    });
}

// Show issue details modal
function showIssueDetails(issueId) {
    const issue = issues.find(i => i.id === issueId);
    const modal = document.getElementById('issueDetailsModal');
    const detailsContainer = document.getElementById('issueDetails');

    detailsContainer.innerHTML = `
        <div class="issue-details-grid">
            <div class="detail-group">
                <h3>Arıza Bilgileri</h3>
                <div class="detail-row">
                    <span class="detail-label">Arıza No:</span>
                    <span class="detail-value">${issue.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Tarih:</span>
                    <span class="detail-value">${formatDate(issue.date)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Durum:</span>
                    <span class="status-badge ${issue.status}">${getStatusText(issue.status)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Aciliyet:</span>
                    <span class="urgency-badge ${issue.urgency}">${getUrgencyText(issue.urgency)}</span>
                </div>
            </div>

            <div class="detail-group">
                <h3>Lokasyon Bilgileri</h3>
                <div class="detail-row">
                    <span class="detail-label">Ana Lokasyon:</span>
                    <span class="detail-value">${issue.location}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Alt Lokasyon:</span>
                    <span class="detail-value">${issue.subLocation}</span>
                </div>
            </div>

            <div class="detail-group">
                <h3>Cihaz Bilgileri</h3>
                <div class="detail-row">
                    <span class="detail-label">Cihaz Türü:</span>
                    <span class="detail-value">${issue.device}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Cihaz ID:</span>
                    <span class="detail-value">${issue.deviceId}</span>
                </div>
            </div>

            <div class="detail-group">
                <h3>Arıza Açıklaması</h3>
                <div class="detail-row">
                    <span class="detail-label">Arıza Türü:</span>
                    <span class="detail-value">${issue.issueType}</span>
                </div>
                <div class="detail-row description">
                    <span class="detail-label">Açıklama:</span>
                    <span class="detail-value">${issue.description}</span>
                </div>
            </div>

            <div class="detail-group">
                <h3>İletişim Bilgileri</h3>
                <div class="detail-row">
                    <span class="detail-label">Ad Soyad:</span>
                    <span class="detail-value">${issue.contactName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Telefon:</span>
                    <span class="detail-value">${issue.contactPhone}</span>
                </div>
            </div>

            ${issue.files.length > 0 ? `
                <div class="detail-group full-width">
                    <h3>Ekler</h3>
                    <div class="attachments-grid">
                        ${issue.files.map(file => `
                            <div class="attachment-item">
                                <img src="uploads/${file}" alt="${file}">
                                <span class="file-name">${file}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('show');
}

// Helper functions
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

function getStatusText(status) {
    const statusMap = {
        'beklemede': 'Beklemede',
        'islemde': 'İşlemde',
        'tamamlandi': 'Tamamlandı',
        'iptal': 'İptal Edildi'
    };
    return statusMap[status] || status;
}

function getUrgencyText(urgency) {
    const urgencyMap = {
        'low': 'Düşük',
        'medium': 'Orta',
        'high': 'Yüksek',
        'critical': 'Kritik'
    };
    return urgencyMap[urgency] || urgency;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update issue status
function updateIssueStatus(issueId, newStatus) {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
        issue.status = newStatus;
        applyFilters();
        updateStats();
        
        showNotification('success', 'Durum başarıyla güncellendi');
    }
}

// Delete issue
function deleteIssue(issueId) {
    if (confirm('Bu arıza kaydını silmek istediğinizden emin misiniz?')) {
        issues = issues.filter(i => i.id !== issueId);
        applyFilters();
        updateStats();
        
        showNotification('success', 'Arıza kaydı başarıyla silindi');
    }
}

// Show notification
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}