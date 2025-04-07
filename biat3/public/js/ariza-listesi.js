// Arıza listesi için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
    // LocalStorage'dan arıza listesini al
    let issues = JSON.parse(localStorage.getItem('issues')) || [];
    
    // İstatistikleri güncelle
    updateStats(issues);
    
    // Tabloyu güncelle
    updateTable(issues);
    
    // Yeni arıza bildirimi kontrolü
    checkNewIssues();
    
    // Filtreleme işlemleri
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const urgencyFilter = document.getElementById('urgencyFilter');
    
    // Arama inputu için event listener
    searchInput.addEventListener('input', function() {
        filterIssues();
    });
    
    // Select elementleri için event listener
    [locationFilter, deviceTypeFilter, statusFilter, urgencyFilter].forEach(filter => {
        filter.addEventListener('change', function() {
            filterIssues();
        });
    });
    
    // Tema butonunu ayarla
    setupTheme();
    
    // Tema butonuna doğrudan event listener ekle
    const themeToggle = document.querySelector('.toggle-theme');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const htmlElement = document.documentElement;
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Tema değişikliğini uygula
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // İkonu güncelle
            const themeIcon = themeToggle.querySelector('i');
            if (themeIcon) {
                themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
    
    // Modal kapatma butonları için event listener'lar
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        });
    });
    
    // Modal dışına tıklandığında modalı kapat
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
            event.target.style.display = 'none';
        }
    });
    
    // Sayfa yüklendiğinde bildirimleri temizle
    clearNotifications();
});

// İstatistikleri güncelle
function updateStats(issues) {
    const stats = {
        pending: issues.filter(issue => issue.status === 'beklemede').length,
        inProgress: issues.filter(issue => issue.status === 'islemde').length,
        completed: issues.filter(issue => issue.status === 'tamamlandi').length,
        canceled: issues.filter(issue => issue.status === 'iptal').length
    };
    
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('inProgressCount').textContent = stats.inProgress;
    document.getElementById('completedCount').textContent = stats.completed;
    document.getElementById('canceledCount').textContent = stats.canceled;
}

// Tabloyu güncelle
function updateTable(issues) {
    const tbody = document.getElementById('issuesTableBody');
    tbody.innerHTML = '';
    
    if (issues.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Henüz arıza bildirimi bulunmamaktadır.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    issues.forEach(issue => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${issue.id}</td>
            <td>${formatDate(issue.date)}</td>
            <td>${formatLocation(issue.location)}</td>
            <td>${formatDevice(issue.device)}</td>
            <td>${formatIssueType(issue.issueType)}</td>
            <td>
                <span class="urgency-badge ${issue.urgency}">
                    ${getUrgencyText(issue.urgency)}
                </span>
            </td>
            <td>
                <span class="status-badge ${issue.status}">
                    ${getStatusText(issue.status)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" onclick="viewIssue('${issue.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editIssue('${issue.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteIssue('${issue.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtreleme işlemi
function filterIssues() {
    let issues = JSON.parse(localStorage.getItem('issues')) || [];
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const location = document.getElementById('locationFilter').value;
    const deviceType = document.getElementById('deviceTypeFilter').value;
    const status = document.getElementById('statusFilter').value;
    const urgency = document.getElementById('urgencyFilter').value;
    
    issues = issues.filter(issue => {
        const matchesSearch = 
            issue.id.toLowerCase().includes(searchTerm) ||
            issue.location.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm);
        
        const matchesLocation = !location || issue.location === location;
        const matchesDeviceType = !deviceType || issue.deviceType === deviceType;
        const matchesStatus = !status || issue.status === status;
        const matchesUrgency = !urgency || issue.urgency === urgency;
        
        return matchesSearch && matchesLocation && matchesDeviceType && 
               matchesStatus && matchesUrgency;
    });
    
    updateTable(issues);
    updateStats(issues);
}

// Filtreleri sıfırla
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('deviceTypeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('urgencyFilter').value = '';
    
    const issues = JSON.parse(localStorage.getItem('issues')) || [];
    updateTable(issues);
    updateStats(issues);
}

// Arıza detayını görüntüle
function viewIssue(id) {
    const issues = JSON.parse(localStorage.getItem('issues')) || [];
    const issue = issues.find(i => i.id === id);
    
    if (issue) {
        // Detay bilgilerini doldur
        document.getElementById('detailIssueNo').textContent = issue.id;
        document.getElementById('detailDate').textContent = formatDate(issue.date);
        document.getElementById('detailLocation').textContent = formatLocation(issue.location);
        document.getElementById('detailSubLocation').textContent = issue.subLocation || '-';
        document.getElementById('detailDeviceType').textContent = formatDevice(issue.deviceType);
        document.getElementById('detailDevice').textContent = issue.device || '-';
        document.getElementById('detailIssueType').textContent = formatIssueType(issue.issueType);
        document.getElementById('detailUrgency').textContent = getUrgencyText(issue.urgency);
        document.getElementById('detailStatus').textContent = getStatusText(issue.status);
        document.getElementById('detailDescription').textContent = issue.description;
        
        // Detay modalını göster
        const modal = document.getElementById('issueDetailsModal');
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// Detay modalını kapat
function closeIssueDetailModal() {
    const modal = document.getElementById('issueDetailsModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
}

// Arıza durumunu güncelle
function updateIssueStatus() {
    const detailIssueNo = document.getElementById('detailIssueNo').textContent;
    const issues = JSON.parse(localStorage.getItem('issues')) || [];
    const issue = issues.find(i => i.id === detailIssueNo);
    
    if (issue) {
        // Form alanlarını doldur
        document.getElementById('editIssueId').value = issue.id;
        document.getElementById('editLocation').value = issue.location;
        document.getElementById('editSubLocation').value = issue.subLocation || '';
        document.getElementById('editDeviceType').value = issue.deviceType || '';
        document.getElementById('editDeviceId').value = issue.device || '';
        document.getElementById('editIssueType').value = issue.issueType;
        document.getElementById('editUrgencyLevel').value = issue.urgency;
        document.getElementById('editStatus').value = issue.status;
        document.getElementById('editIssueDescription').value = issue.description;
        
        // Detay modalını kapat
        closeIssueDetailModal();
        
        // Düzenleme modalını göster
        const modal = document.getElementById('issueEditModal');
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// Düzenleme modalını kapat
function closeIssueEditModal() {
    const modal = document.getElementById('issueEditModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
}

// Arıza sil
function deleteIssue(id) {
    if (confirm('Bu arıza kaydını silmek istediğinizden emin misiniz?')) {
        let issues = JSON.parse(localStorage.getItem('issues')) || [];
        issues = issues.filter(issue => issue.id !== id);
        localStorage.setItem('issues', JSON.stringify(issues));
        
        updateTable(issues);
        updateStats(issues);
    }
}

// Arıza düzenle
function editIssue(id) {
    const issues = JSON.parse(localStorage.getItem('issues')) || [];
    const issue = issues.find(i => i.id === id);
    
    if (issue) {
        // Form alanlarını doldur
        document.getElementById('editIssueId').value = issue.id;
        document.getElementById('editLocation').value = issue.location;
        document.getElementById('editSubLocation').value = issue.subLocation || '';
        document.getElementById('editDeviceType').value = issue.deviceType || '';
        document.getElementById('editDeviceId').value = issue.device || '';
        document.getElementById('editIssueType').value = issue.issueType;
        document.getElementById('editUrgencyLevel').value = issue.urgency;
        document.getElementById('editStatus').value = issue.status;
        document.getElementById('editIssueDescription').value = issue.description;
        
        // Düzenleme modalını göster
        const modal = document.getElementById('issueEditModal');
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

// Düzenleme değişikliklerini kaydet
function saveIssueEdit() {
    const issueId = document.getElementById('editIssueId').value;
    const location = document.getElementById('editLocation').value;
    const subLocation = document.getElementById('editSubLocation').value;
    const deviceType = document.getElementById('editDeviceType').value;
    const device = document.getElementById('editDeviceId').value;
    const issueType = document.getElementById('editIssueType').value;
    const urgency = document.getElementById('editUrgencyLevel').value;
    const status = document.getElementById('editStatus').value;
    const description = document.getElementById('editIssueDescription').value;
    
    // LocalStorage'dan arıza listesini al
    let issues = JSON.parse(localStorage.getItem('issues')) || [];
    
    // Arıza bilgilerini güncelle
    const issueIndex = issues.findIndex(i => i.id === issueId);
    if (issueIndex !== -1) {
        issues[issueIndex].location = location;
        issues[issueIndex].subLocation = subLocation;
        issues[issueIndex].deviceType = deviceType;
        issues[issueIndex].device = device;
        issues[issueIndex].issueType = issueType;
        issues[issueIndex].urgency = urgency;
        issues[issueIndex].status = status;
        issues[issueIndex].description = description;
        
        // LocalStorage'a kaydet
        localStorage.setItem('issues', JSON.stringify(issues));
        
        // Tabloyu güncelle
        updateTable(issues);
        updateStats(issues);
        
        // Modalı kapat
        closeIssueEditModal();
        
        // Başarı mesajı göster
        alert('Arıza bilgileri başarıyla güncellendi.');
    }
}

// Yardımcı fonksiyonlar
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatLocation(location) {
    const locationMap = {
        'mahkeme-kalemi': 'Mahkeme Kalemi',
        'durusma-salonu': 'Duruşma Salonu',
        'hakim-odasi': 'Hakim Odası'
    };
    return locationMap[location] || location;
}

function formatDevice(device) {
    // Cihaz kodunu büyük harfe çevir
    return device ? device.toUpperCase() : '';
}

function formatIssueType(issueType) {
    const issueTypeMap = {
        'donanim': 'Donanım Arızası',
        'yazilim': 'Yazılım Arızası',
        'ag': 'Ağ Arızası',
        'diger': 'Diğer'
    };
    return issueTypeMap[issueType] || issueType;
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
        'dusuk': 'Düşük',
        'orta': 'Orta',
        'yuksek': 'Yüksek',
        'kritik': 'Kritik'
    };
    return urgencyMap[urgency] || urgency;
}

// Yeni arıza bildirimi kontrolü
function checkNewIssues() {
    const newIssues = JSON.parse(localStorage.getItem('newIssues')) || [];
    const badge = document.getElementById('newIssueCount');
    
    if (newIssues.length > 0) {
        badge.textContent = newIssues.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Bildirimleri temizle
function clearNotifications() {
    localStorage.setItem('newIssues', JSON.stringify([]));
    const badge = document.getElementById('newIssueCount');
    if (badge) {
        badge.style.display = 'none';
    }
}
