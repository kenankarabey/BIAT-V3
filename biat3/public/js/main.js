// App State
const state2 = {
    // User related
    user: null,
    notifications: [],
    currentTheme: localStorage.getItem('theme') || 'default',
    deviceData: [
        {
            id: 1,
            name: "HP ProDesk 400",
            type: "Bilgisayar",
            serialNo: "HP123456789",
            location: "1. Asliye Hukuk Mahkemesi",
            status: "active",
            lastUpdate: "2024-03-20"
        },
        {
            id: 2,
            name: "Canon MF445dw",
            type: "Yazıcı",
            serialNo: "CN987654321",
            location: "2. Ağır Ceza Mahkemesi",
            status: "repair",
            lastUpdate: "2024-03-19"
        },
        {
            id: 3,
            name: "Epson EB-X06",
            type: "Projeksiyon",
            serialNo: "EP456789123",
            location: "3 Nolu Duruşma Salonu",
            status: "inactive",
            lastUpdate: "2024-03-18"
        }
    ],
    courtOffices: [
        {
            id: 1,
            name: "1. Asliye Hukuk Mahkemesi",
            devices: [
                { type: "Bilgisayar", count: 3, active: 2 },
                { type: "Yazıcı", count: 1, active: 1 },
                { type: "Tarayıcı", count: 1, active: 1 }
            ]
        },
        {
            id: 2,
            name: "2. Ağır Ceza Mahkemesi",
            devices: [
                { type: "Bilgisayar", count: 4, active: 3 },
                { type: "Yazıcı", count: 2, active: 1 },
                { type: "Projeksiyon", count: 1, active: 1 }
            ]
        },
        {
            id: 3,
            name: "İcra Müdürlüğü",
            devices: [
                { type: "Bilgisayar", count: 6, active: 5 },
                { type: "Yazıcı", count: 3, active: 2 },
                { type: "Tarayıcı", count: 2, active: 2 }
            ]
        }
    ],
    judgeChambers: [
        {
            id: 1,
            name: "101 Nolu Oda",
            judge: "Hakim A",
            devices: [
                { type: "Bilgisayar", count: 1, active: 1 },
                { type: "Yazıcı", count: 1, active: 1 }
            ]
        },
        {
            id: 2,
            name: "102 Nolu Oda",
            judge: "Hakim B",
            devices: [
                { type: "Bilgisayar", count: 1, active: 1 },
                { type: "Yazıcı", count: 1, active: 1 },
                { type: "Tarayıcı", count: 1, active: 1 }
            ]
        },
        {
            id: 3,
            name: "103 Nolu Oda",
            judge: "Hakim C",
            devices: [
                { type: "Bilgisayar", count: 1, active: 0 },
                { type: "Yazıcı", count: 1, active: 1 }
            ]
        }
    ],
    courtrooms: [
        {
            id: 1,
            name: "1 Nolu Duruşma Salonu",
            capacity: 50,
            devices: [
                { type: "Bilgisayar", count: 2, active: 2 },
                { type: "Yazıcı", count: 1, active: 1 },
                { type: "Projeksiyon", count: 1, active: 1 },
                { type: "Ses Sistemi", count: 1, active: 1 }
            ]
        },
        {
            id: 2,
            name: "2 Nolu Duruşma Salonu",
            capacity: 75,
            devices: [
                { type: "Bilgisayar", count: 2, active: 1 },
                { type: "Yazıcı", count: 1, active: 1 },
                { type: "Projeksiyon", count: 1, active: 1 },
                { type: "Ses Sistemi", count: 1, active: 0 }
            ]
        },
        {
            id: 3,
            name: "3 Nolu Duruşma Salonu",
            capacity: 100,
            devices: [
                { type: "Bilgisayar", count: 3, active: 3 },
                { type: "Yazıcı", count: 2, active: 2 },
                { type: "Projeksiyon", count: 1, active: 1 },
                { type: "Ses Sistemi", count: 1, active: 1 }
            ]
        }
    ],
    theme: localStorage.getItem('theme') || 'light',
    sidebarActive: false
};

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.toggle-theme');
const submenuItems = document.querySelectorAll('.has-submenu');
const courtOfficesGrid = document.querySelector('.court-offices-grid');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupSidebar();
    setupThemeToggle();
    setupEventListeners();
    loadPageContent();
});

// Theme Toggle
function setupThemeToggle() {
    const themeToggle = document.querySelector('.toggle-theme');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.toggle-theme i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Sidebar Toggle
function setupSidebar() {
    const toggleButton = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const toggleText = toggleButton?.querySelector('span');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggleButton && sidebar && toggleText) {
        // Restore sidebar state from localStorage
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            toggleButton.querySelector('i').classList.add('fa-rotate-180');
            toggleText.style.display = 'none';
        }

        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            toggleButton.querySelector('i').classList.toggle('fa-rotate-180');
            
            // Toggle text visibility
            if (sidebar.classList.contains('collapsed')) {
                toggleText.style.display = 'none';
            } else {
                toggleText.style.display = '';
            }
            
            // Save sidebar state to localStorage
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }

    // Handle submenu toggles
    const submenuItems = document.querySelectorAll('.has-submenu > a');
    submenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = item.parentElement;
            const isCollapsed = sidebar?.classList.contains('collapsed');

            if (isCollapsed && sidebar && toggleButton && toggleText) {
                // If sidebar is collapsed, expand it first
                sidebar.classList.remove('collapsed');
                toggleButton.querySelector('i').classList.remove('fa-rotate-180');
                toggleText.style.display = '';
                localStorage.setItem('sidebarCollapsed', 'false');
                
                // Then toggle submenu after a small delay
                setTimeout(() => {
                    parent.classList.toggle('active');
                }, 300);
            } else {
                parent.classList.toggle('active');
            }
        });
    });

    // Handle overlay click (mobile)
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar?.classList.remove('active');
        });
    }
}

// Event Listeners
function setupEventListeners() {
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            sidebar?.classList.contains('active') && 
            !e.target.closest('.sidebar') && 
            !e.target.closest('.menu-toggle')) {
            sidebar.classList.remove('active');
        }
    });

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth <= 768 && sidebar?.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

// Helper Functions
function loadPageContent() {
    const path = window.location.pathname;
    if (path.includes('mahkeme-kalemleri')) {
        loadCourtOfficesContent();
    } else if (path.includes('hakim-odalari')) {
        loadJudgeChambersContent();
    } else if (path.includes('durusma-salonlari')) {
        loadCourtroomsContent();
    } else {
        loadDashboardContent();
    }
}

// Close modal helper
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Get status text helper
function getStatusText(status) {
    switch (status) {
        case 'active': return 'Aktif';
        case 'repair': return 'Serviste';
        case 'inactive': return 'Pasif';
        default: return 'Bilinmiyor';
    }
}

// Get device icon helper
function getDeviceIcon(type) {
    switch (type.toLowerCase()) {
        case 'bilgisayar': return 'fa-desktop';
        case 'yazıcı': return 'fa-print';
        case 'tarayıcı': return 'fa-scanner';
        case 'projeksiyon': return 'fa-video';
        default: return 'fa-laptop';
    }
}

// Format date helper
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize UI elements
function initializeUI() {
    // Add any additional UI initialization here
    setupTooltips();
    setupDropdowns();
}

// Setup tooltips
function setupTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        // Add tooltip functionality if needed
    });
}

// Setup dropdowns
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (trigger && content) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                content.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    content.classList.remove('show');
                }
            });
        }
    });
}

// Sample Data
const courtOffices = [
    {
        id: 1,
        name: 'Ağır Ceza Mahkemesi',
        location: 'A Blok, 1. Kat',
        deviceCount: 25,
        activeIssues: 2
    },
    {
        id: 2,
        name: 'Asliye Ceza Mahkemesi',
        location: 'B Blok, 2. Kat',
        deviceCount: 18,
        activeIssues: 1
    },
    {
        id: 3,
        name: 'Asliye Hukuk Mahkemesi',
        location: 'C Blok, 1. Kat',
        deviceCount: 20,
        activeIssues: 0
    },
    {
        id: 4,
        name: 'İcra Mahkemesi',
        location: 'A Blok, 2. Kat',
        deviceCount: 15,
        activeIssues: 3
    }
];

// Sample Courtrooms Data
const courtrooms = [
    {
        id: 1,
        name: 'Duruşma Salonu 1',
        location: 'A Blok, Zemin Kat',
        capacity: 50,
        deviceCount: 8,
        status: 'active',
        nextHearing: '14:30'
    },
    {
        id: 2,
        name: 'Duruşma Salonu 2',
        location: 'B Blok, 1. Kat',
        capacity: 35,
        deviceCount: 6,
        status: 'maintenance',
        nextHearing: '15:45'
    },
    {
        id: 3,
        name: 'Duruşma Salonu 3',
        location: 'A Blok, 1. Kat',
        capacity: 40,
        deviceCount: 7,
        status: 'active',
        nextHearing: '16:15'
    },
    {
        id: 4,
        name: 'Duruşma Salonu 4',
        location: 'C Blok, Zemin Kat',
        capacity: 30,
        deviceCount: 5,
        status: 'inactive',
        nextHearing: '-'
    }
];

// Sample Judges Chambers Data
const judgesChambers = [
    {
        id: 1,
        judgeName: 'Hakim Ahmet Yılmaz',
        chamberNumber: '101',
        location: 'A Blok, 2. Kat',
        deviceCount: 5,
        activeIssues: 0,
        status: 'available',
        nextHearing: '14:00'
    },
    {
        id: 2,
        judgeName: 'Hakim Ayşe Demir',
        chamberNumber: '102',
        location: 'A Blok, 2. Kat',
        deviceCount: 4,
        activeIssues: 1,
        status: 'busy',
        nextHearing: '15:30'
    },
    {
        id: 3,
        judgeName: 'Hakim Mehmet Kaya',
        chamberNumber: '201',
        location: 'B Blok, 2. Kat',
        deviceCount: 5,
        activeIssues: 2,
        status: 'away',
        nextHearing: '-'
    },
    {
        id: 4,
        judgeName: 'Hakim Zeynep Öz',
        chamberNumber: '202',
        location: 'B Blok, 2. Kat',
        deviceCount: 4,
        activeIssues: 0,
        status: 'available',
        nextHearing: '16:15'
    }
];

// Sample Issues Data
const issues = [
    {
        id: 1,
        title: 'Yazıcı kağıt sıkışması',
        description: 'Ağır Ceza Mahkemesi kalemindeki yazıcıda sürekli kağıt sıkışması yaşanıyor.',
        location: 'Ağır Ceza Mahkemesi Kalemi',
        deviceType: 'Yazıcı',
        priority: 'high',
        status: 'new',
        createdAt: '2024-02-20T10:30:00',
        assignee: {
            name: 'Ahmet Yılmaz',
            avatar: 'img/user-avatar.png'
        }
    },
    {
        id: 2,
        title: 'Bilgisayar açılmıyor',
        description: 'Duruşma Salonu 2\'deki bilgisayar açılmıyor, güç düğmesine basıldığında tepki vermiyor.',
        location: 'Duruşma Salonu 2',
        deviceType: 'Bilgisayar',
        priority: 'high',
        status: 'in-progress',
        createdAt: '2024-02-19T15:45:00',
        assignee: {
            name: 'Mehmet Kaya',
            avatar: 'img/user-avatar.png'
        }
    },
    {
        id: 3,
        title: 'Projeksiyon görüntü sorunu',
        description: 'Duruşma Salonu 1\'deki projeksiyon cihazı bulanık görüntü veriyor.',
        location: 'Duruşma Salonu 1',
        deviceType: 'Projeksiyon',
        priority: 'medium',
        status: 'completed',
        createdAt: '2024-02-18T09:15:00',
        assignee: {
            name: 'Ayşe Demir',
            avatar: 'img/user-avatar.png'
        }
    },
    {
        id: 4,
        title: 'Tarayıcı bağlantı hatası',
        description: 'Hakim odasındaki tarayıcı bilgisayara bağlanmıyor.',
        location: 'Hakim Odası 101',
        deviceType: 'Tarayıcı',
        priority: 'low',
        status: 'new',
        createdAt: '2024-02-17T14:20:00',
        assignee: {
            name: 'Zeynep Öz',
            avatar: 'img/user-avatar.png'
        }
    }
];

// Sample data for reports
const reportData = {
    issues: {
        total: 248,
        resolved: 195,
        avgResolutionTime: 4.2,
        activeDevices: 342,
        trends: {
            daily: [12, 15, 18, 14, 21, 16, 19],
            weekly: [85, 92, 78, 89, 95],
            monthly: [245, 268, 290, 248]
        },
        distribution: {
            location: {
                'Mahkeme Kalemleri': 35,
                'Duruşma Salonları': 45,
                'Hakim Odaları': 20
            },
            device: {
                'Bilgisayar': 40,
                'Yazıcı': 25,
                'Tarayıcı': 15,
                'Diğer': 20
            }
        },
        topDevices: [
            { device: 'HP LaserJet Pro', location: 'Duruşma Salonu 1', count: 15, status: 'Aktif' },
            { device: 'Dell OptiPlex', location: 'Mahkeme Kalemi 2', count: 12, status: 'Bakımda' },
            { device: 'Canon Scanner', location: 'Hakim Odası 3', count: 10, status: 'Aktif' },
            { device: 'Epson Projector', location: 'Duruşma Salonu 4', count: 8, status: 'Arızalı' }
        ],
        recentIssues: [
            { date: '2024-02-15', title: 'Yazıcı Kağıt Sıkışması', location: 'Mahkeme Kalemi 1', status: 'Çözüldü' },
            { date: '2024-02-14', title: 'Bilgisayar Açılmıyor', location: 'Duruşma Salonu 2', status: 'İşlemde' },
            { date: '2024-02-14', title: 'Tarayıcı Bağlantı Hatası', location: 'Hakim Odası 1', status: 'Beklemede' },
            { date: '2024-02-13', title: 'Projeksiyon Görüntü Sorunu', location: 'Duruşma Salonu 3', status: 'Çözüldü' }
        ]
    }
};

// Sample data for dashboard
const dashboardData = {
    stats: [
        { icon: 'fa-building', title: 'Toplam Mahkeme Kalemi', value: '12', trend: '+2 son ayda' },
        { icon: 'fa-gavel', title: 'Toplam Duruşma Salonu', value: '8', trend: '+1 son ayda' },
        { icon: 'fa-user-tie', title: 'Toplam Hakim Odası', value: '15', trend: '+3 son ayda' },
        { icon: 'fa-laptop', title: 'Toplam Cihaz', value: '156', trend: '+12 son ayda' }
    ],
    deviceStats: [
        { type: 'Masaüstü Bilgisayar', count: 85, percentage: 55 },
        { type: 'Yazıcı', count: 45, percentage: 29 },
        { type: 'Tarayıcı', count: 26, percentage: 16 }
    ],
    recentIssues: [
        { id: 1, title: 'Yazıcı Arızası', location: '2. Ağır Ceza Mahkemesi', status: 'Çözüldü', date: '2024-02-15' },
        { id: 2, title: 'Bilgisayar Açılmıyor', location: '5. Asliye Hukuk Mahkemesi', status: 'Beklemede', date: '2024-02-14' },
        { id: 3, title: 'İnternet Bağlantısı Yok', location: '3. İcra Dairesi', status: 'İşlemde', date: '2024-02-13' }
    ]
};

// View Management
let currentView = 'table'; // 'table' or 'card'

function setupViewToggle() {
    const viewToggleBtn = document.getElementById('viewToggle');
    const tableView = document.getElementById('tableView');
    const cardView = document.getElementById('cardView');

    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', () => {
            currentView = currentView === 'table' ? 'card' : 'table';
            
            // Update button icon
            viewToggleBtn.classList.toggle('card-view');
            
            // Toggle views
            tableView.style.display = currentView === 'table' ? 'block' : 'none';
            cardView.style.display = currentView === 'card' ? 'grid' : 'none';
            
            // Render appropriate view
            if (currentView === 'card') {
                renderCardView();
            } else {
                renderTableView();
            }
        });
    }
}

function createInventoryCard(item) {
    const card = document.createElement('div');
    card.className = 'inventory-card';
    
    card.innerHTML = `
        <div class="inventory-card-header">
            <div class="inventory-card-icon">
                <i class="fas fa-building"></i>
            </div>
            <div class="inventory-card-title">
                <h3>${item.birim}</h3>
                <p>${item.unvan}</p>
            </div>
        </div>
        <div class="inventory-card-content">
            <div class="device-info">
                <h4>Kasa Bilgileri</h4>
                <p>${item.kasaMarka} ${item.kasaModel}</p>
                <small>Seri No: ${item.kasaSeriNo}</small>
            </div>
            <div class="device-info">
                <h4>Ekran Bilgileri</h4>
                <p>${item.ekranMarka} ${item.ekranModel}</p>
                <small>Seri No: ${item.ekranSeriNo}</small>
            </div>
            <div class="device-info">
                <h4>Yazıcı Bilgileri</h4>
                <p>${item.yaziciMarka} ${item.yaziciModel}</p>
                <small>Seri No: ${item.yaziciSeriNo}</small>
            </div>
            <div class="device-info">
                <h4>Tarayıcı Bilgileri</h4>
                <p>${item.tarayiciMarka} ${item.tarayiciModel}</p>
                <small>Seri No: ${item.tarayiciSeriNo}</small>
            </div>
        </div>
        <div class="inventory-card-footer">
            <button class="btn btn-secondary" onclick="showDetailModal(${item.id})">
                <i class="fas fa-eye"></i>
                Detay
            </button>
        </div>
    `;
    
    return card;
}

function renderCardView() {
    const cardView = document.getElementById('cardView');
    if (!cardView) return;
    
    cardView.innerHTML = ''; // Clear existing cards

    // Get filtered data
    const filteredData = getFilteredData();

    // Create cards for each item
    filteredData.forEach(item => {
        const card = createInventoryCard(item);
        cardView.appendChild(card);
    });
}

function renderTableView() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    const filteredData = getFilteredData();
    
    tableBody.innerHTML = filteredData.map(item => `
        <tr>
            <td>${item.birim}</td>
            <td>${item.unvan}</td>
            <td>${item.adSoyad}</td>
            <td>${item.sicilNo}</td>
            <td class="expandable-cell">
                <div>${item.kasaMarka}</div>
                <div>${item.kasaModel}</div>
                <div>${item.kasaSeriNo}</div>
            </td>
            <td class="expandable-cell">
                <div>${item.ekranMarka}</div>
                <div>${item.ekranModel}</div>
                <div>${item.ekranSeriNo}</div>
            </td>
            <td class="expandable-cell">
                <div>${item.yaziciMarka}</div>
                <div>${item.yaziciModel}</div>
                <div>${item.yaziciSeriNo}</div>
            </td>
            <td class="expandable-cell">
                <div>${item.tarayiciMarka}</div>
                <div>${item.tarayiciModel}</div>
                <div>${item.tarayiciSeriNo}</div>
            </td>
            <td>
                <button class="btn btn-secondary" onclick="showDetailModal(${item.id})">
                    <i class="fas fa-eye"></i>
                    Detay
                </button>
            </td>
        </tr>
    `).join('');
}

function getFilteredData() {
    // Return data from state
    return state.courtOffices || [];
}

// Dashboard Functions
function loadDashboardContent() {
    const contentArea = document.getElementById('content');
    if (!contentArea || !contentArea.classList.contains('dashboard')) return;

    const totalDevices = state.deviceData.length;
    const activeDevices = state.deviceData.filter(d => d.status === 'active').length;
    const repairDevices = state.deviceData.filter(d => d.status === 'repair').length;
    const inactiveDevices = state.deviceData.filter(d => d.status === 'inactive').length;

    contentArea.innerHTML = `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>Hoş Geldiniz, ${state.user?.ad || 'Kullanıcı'}</h1>
                <p class="dashboard-date">${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-laptop"></i>
                    <div class="stat-info">
                        <h3>Toplam Cihaz</h3>
                        <p>${totalDevices}</p>
                        <small>Envanterdeki tüm cihazlar</small>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-check-circle"></i>
                    <div class="stat-info">
                        <h3>Aktif Cihazlar</h3>
                        <p>${activeDevices}</p>
                        <small>Çalışır durumda</small>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tools"></i>
                    <div class="stat-info">
                        <h3>Servisteki Cihazlar</h3>
                        <p>${repairDevices}</p>
                        <small>Onarım sürecinde</small>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-exclamation-circle"></i>
                    <div class="stat-info">
                        <h3>Pasif Cihazlar</h3>
                        <p>${inactiveDevices}</p>
                        <small>Kullanım dışı</small>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h2>Son Eklenen Cihazlar</h2>
                        <a href="mahkeme-kalemleri.html" class="btn-link">Tümünü Gör</a>
                    </div>
                    <div class="card-content">
                        <table class="mini-table">
                            <thead>
                                <tr>
                                    <th>Cihaz Adı</th>
                                    <th>Konum</th>
                                    <th>Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${state.deviceData
                                    .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
                                    .slice(0, 5)
                                    .map(device => `
                                        <tr>
                                            <td>${device.name}</td>
                                            <td>${device.location}</td>
                                            <td><span class="device-status status-${device.status}">${getStatusText(device.status)}</span></td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="card-header">
                        <h2>Cihaz Türü Dağılımı</h2>
                    </div>
                    <div class="card-content">
                        <div class="device-stats">
                            ${Object.entries(state.deviceData.reduce((acc, device) => {
                                acc[device.type] = (acc[device.type] || 0) + 1;
                                return acc;
                            }, {})).map(([type, count]) => `
                                <div class="device-stat-item">
                                    <span class="device-type">${type}</span>
                                    <div class="device-count-bar">
                                        <div class="bar" style="width: ${(count / totalDevices * 100)}%"></div>
                                        <span class="count">${count}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Court Offices Functions
function loadCourtOfficesContent() {
    const contentArea = document.getElementById('content');
    if (!contentArea || !contentArea.classList.contains('court-offices')) return;

    contentArea.innerHTML = `
        <div class="page-header">
            <h1>Mahkeme Kalemleri</h1>
            <button class="btn-primary" onclick="showAddOfficeModal()">
                <i class="fas fa-plus"></i>
                Yeni Kalem Ekle
            </button>
        </div>

        <div class="court-offices-grid">
            ${state.courtOffices.map(office => `
                <div class="court-office-card" data-id="${office.id}">
                    <div class="card-actions">
                        <button class="btn-icon" onclick="editOffice(${office.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteOffice(${office.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="office-header">
                        <h2>${office.name}</h2>
                        <div class="device-count">
                            <span class="active">${office.devices.reduce((sum, dev) => sum + dev.active, 0)}</span>
                            /
                            <span class="total">${office.devices.reduce((sum, dev) => sum + dev.count, 0)}</span>
                            Cihaz
                        </div>
                    </div>
                    <div class="device-summary">
                        ${office.devices.map(device => `
                            <div class="device-type">
                                <i class="fas ${getDeviceIcon(device.type)}"></i>
                                <span>${device.type}</span>
                                <small>${device.active}/${device.count}</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="device-list">
                        ${state.deviceData
                            .filter(device => device.location === office.name)
                            .map(device => `
                                <div class="device-item">
                                    <i class="fas ${getDeviceIcon(device.type)}"></i>
                                    <div class="device-info">
                                        <span class="device-name">${device.name}</span>
                                        <span class="device-serial">${device.serialNo}</span>
                                    </div>
                                    <span class="device-status status-${device.status}">${getStatusText(device.status)}</span>
                                </div>
                            `).join('')}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-secondary" onclick="showAddDeviceModal(${office.id})">
                            <i class="fas fa-plus"></i>
                            Cihaz Ekle
                        </button>
                        <button class="btn btn-primary" onclick="viewOfficeDetails(${office.id})">
                            <i class="fas fa-eye"></i>
                            Detaylar
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Initialize tooltips and other UI elements
    initializeUI();
}

// Add new office modal
function showAddOfficeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Yeni Mahkeme Kalemi Ekle</h3>
                <button class="btn-close" onclick="closeModal(this.closest('.modal'))">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addOfficeForm">
                    <div class="form-group">
                        <label>Mahkeme Kalemi Adı</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Konum</label>
                        <input type="text" class="form-input" name="location" required>
                    </div>
                    <div class="form-group">
                        <label>Tür</label>
                        <select class="form-input" name="type" required>
                            <option value="">Seçiniz</option>
                            <option value="Ağır Ceza">Ağır Ceza Mahkemesi</option>
                            <option value="Asliye Ceza">Asliye Ceza Mahkemesi</option>
                            <option value="Asliye Hukuk">Asliye Hukuk Mahkemesi</option>
                            <option value="İcra">İcra Dairesi</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this.closest('.modal'))">İptal</button>
                <button class="btn btn-primary" onclick="saveNewOffice()">Kaydet</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Save new office
function saveNewOffice() {
    const form = document.getElementById('addOfficeForm');
    const formData = new FormData(form);

    const newOffice = {
        id: state.courtOffices.length + 1,
        name: formData.get('name'),
        location: formData.get('location'),
        type: formData.get('type'),
        devices: [],
    };

    // Add to state
    state.courtOffices.push(newOffice);

    // Close modal and refresh content
    closeModal(form.closest('.modal'));
    loadCourtOfficesContent();

    // Show success message
    showNotification('Mahkeme kalemi başarıyla eklendi', 'success');
}

// Add device to office modal
function showAddDeviceModal(officeId) {
    const office = state.courtOffices.find(o => o.id === officeId);
    if (!office) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Yeni Cihaz Ekle - ${office.name}</h3>
                <button class="btn-close" onclick="closeModal(this.closest('.modal'))">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addDeviceForm" data-office-id="${officeId}">
                    <div class="form-group">
                        <label>Cihaz Türü</label>
                        <select class="form-input" name="type" required>
                            <option value="">Seçiniz</option>
                            <option value="Bilgisayar">Bilgisayar</option>
                            <option value="Yazıcı">Yazıcı</option>
                            <option value="Tarayıcı">Tarayıcı</option>
                            <option value="Projeksiyon">Projeksiyon</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cihaz Adı/Modeli</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Seri Numarası</label>
                        <input type="text" class="form-input" name="serialNo" required>
                    </div>
                    <div class="form-group">
                        <label>Durum</label>
                        <select class="form-input" name="status" required>
                            <option value="active">Aktif</option>
                            <option value="repair">Serviste</option>
                            <option value="inactive">Pasif</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this.closest('.modal'))">İptal</button>
                <button class="btn btn-primary" onclick="saveNewDevice()">Kaydet</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Save new device
function saveNewDevice() {
    const form = document.getElementById('addDeviceForm');
    const formData = new FormData(form);
    const officeId = parseInt(form.dataset.officeId);
    const office = state.courtOffices.find(o => o.id === officeId);

    if (!office) return;

    const newDevice = {
        id: state.deviceData.length + 1,
        type: formData.get('type'),
        name: formData.get('name'),
        serialNo: formData.get('serialNo'),
        location: office.name,
        status: formData.get('status'),
        lastUpdate: new Date().toISOString().split('T')[0]
    };

    // Add to state
    state.deviceData.push(newDevice);

    // Update office device counts
    const deviceType = office.devices.find(d => d.type === newDevice.type);
    if (deviceType) {
        deviceType.count++;
        if (newDevice.status === 'active') deviceType.active++;
    } else {
        office.devices.push({
            type: newDevice.type,
            count: 1,
            active: newDevice.status === 'active' ? 1 : 0
        });
    }

    // Close modal and refresh content
    closeModal(form.closest('.modal'));
    loadCourtOfficesContent();

    // Show success message
    showNotification('Cihaz başarıyla eklendi', 'success');
}

// Edit office
function editOffice(officeId) {
    const office = state.courtOffices.find(o => o.id === officeId);
    if (!office) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Mahkeme Kalemi Düzenle</h3>
                <button class="btn-close" onclick="closeModal(this.closest('.modal'))">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editOfficeForm" data-office-id="${officeId}">
                    <div class="form-group">
                        <label>Mahkeme Kalemi Adı</label>
                        <input type="text" class="form-input" name="name" value="${office.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Konum</label>
                        <input type="text" class="form-input" name="location" value="${office.location || ''}" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this.closest('.modal'))">İptal</button>
                <button class="btn btn-primary" onclick="saveOfficeEdit()">Kaydet</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Save office edit
function saveOfficeEdit() {
    const form = document.getElementById('editOfficeForm');
    const formData = new FormData(form);
    const officeId = parseInt(form.dataset.officeId);
    const office = state.courtOffices.find(o => o.id === officeId);

    if (!office) return;

    // Update office data
    office.name = formData.get('name');
    office.location = formData.get('location');

    // Close modal and refresh content
    closeModal(form.closest('.modal'));
    loadCourtOfficesContent();

    // Show success message
    showNotification('Mahkeme kalemi başarıyla güncellendi', 'success');
}

// Delete office
function deleteOffice(officeId) {
    if (!confirm('Bu mahkeme kalemini silmek istediğinize emin misiniz?')) return;

    const officeIndex = state.courtOffices.findIndex(o => o.id === officeId);
    if (officeIndex === -1) return;

    // Remove office from state
    state.courtOffices.splice(officeIndex, 1);

    // Remove associated devices
    state.deviceData = state.deviceData.filter(device => 
        device.location !== state.courtOffices[officeIndex].name
    );

    // Refresh content
    loadCourtOfficesContent();

    // Show success message
    showNotification('Mahkeme kalemi başarıyla silindi', 'success');
}

// View office details
function viewOfficeDetails(officeId) {
    const office = state.courtOffices.find(o => o.id === officeId);
    if (!office) return;

    const devices = state.deviceData.filter(device => device.location === office.name);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${office.name} - Detaylar</h3>
                <button class="btn-close" onclick="closeModal(this.closest('.modal'))">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="office-details">
                    <div class="detail-section">
                        <h4>Genel Bilgiler</h4>
                        <p><strong>Konum:</strong> ${office.location || 'Belirtilmemiş'}</p>
                        <p><strong>Toplam Cihaz:</strong> ${office.devices.reduce((sum, dev) => sum + dev.count, 0)}</p>
                        <p><strong>Aktif Cihaz:</strong> ${office.devices.reduce((sum, dev) => sum + dev.active, 0)}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Cihaz Listesi</h4>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Cihaz Adı</th>
                                        <th>Tür</th>
                                        <th>Seri No</th>
                                        <th>Durum</th>
                                        <th>Son Güncelleme</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${devices.map(device => `
                                        <tr>
                                            <td>${device.name}</td>
                                            <td>${device.type}</td>
                                            <td>${device.serialNo}</td>
                                            <td><span class="status-badge ${device.status}">${getStatusText(device.status)}</span></td>
                                            <td>${formatDate(device.lastUpdate)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this.closest('.modal'))">Kapat</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Judge Chambers Functions
function loadJudgeChambersContent() {
    const contentArea = document.getElementById('content');
    if (!contentArea || !contentArea.classList.contains('judge-chambers')) return;

    contentArea.innerHTML = `
        <div class="page-header">
            <h1>Hakim Odaları</h1>
            <button class="btn-primary">
                <i class="fas fa-plus"></i>
                Yeni Cihaz Ekle
            </button>
        </div>

        <div class="judge-chambers-grid">
            ${state.judgeChambers.map(chamber => `
                <div class="judge-chamber-card">
                    <div class="chamber-header">
                        <div class="chamber-info">
                            <h2>${chamber.name}</h2>
                            <span class="judge-name">${chamber.judge}</span>
                        </div>
                        <div class="device-count">
                            <span class="active">${chamber.devices.reduce((sum, dev) => sum + dev.active, 0)}</span>
                            /
                            <span class="total">${chamber.devices.reduce((sum, dev) => sum + dev.count, 0)}</span>
                            Cihaz
                        </div>
                    </div>
                    <div class="device-summary">
                        ${chamber.devices.map(device => `
                            <div class="device-type">
                                <i class="fas ${getDeviceIcon(device.type)}"></i>
                                <span>${device.type}</span>
                                <small>${device.active}/${device.count}</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="device-list">
                        ${state.deviceData
                            .filter(device => device.location === chamber.name)
                            .map(device => `
                                <div class="device-item">
                                    <i class="fas ${getDeviceIcon(device.type)}"></i>
                                    <div class="device-info">
                                        <span class="device-name">${device.name}</span>
                                        <span class="device-serial">${device.serialNo}</span>
                                    </div>
                                    <span class="device-status status-${device.status}">${getStatusText(device.status)}</span>
                                </div>
                            `).join('')}
                    </div>
                    <a href="#" class="view-all-link">
                        Tüm Cihazları Görüntüle
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// Courtrooms Functions
function loadCourtroomsContent() {
    const contentArea = document.getElementById('content');
    if (!contentArea || !contentArea.classList.contains('courtrooms')) return;

    contentArea.innerHTML = `
        <div class="page-header">
            <h1>Duruşma Salonları</h1>
            <button class="btn-primary">
                <i class="fas fa-plus"></i>
                Yeni Cihaz Ekle
            </button>
        </div>

        <div class="courtrooms-grid">
            ${state.courtrooms.map(room => `
                <div class="courtroom-card">
                    <div class="courtroom-header">
                        <div class="courtroom-info">
                            <h2>${room.name}</h2>
                            <span class="capacity">
                                <i class="fas fa-users"></i>
                                ${room.capacity} Kişilik
                            </span>
                        </div>
                        <div class="device-count">
                            <span class="active">${room.devices.reduce((sum, dev) => sum + dev.active, 0)}</span>
                            /
                            <span class="total">${room.devices.reduce((sum, dev) => sum + dev.count, 0)}</span>
                            Cihaz
                        </div>
                    </div>
                    <div class="device-summary">
                        ${room.devices.map(device => `
                            <div class="device-type">
                                <i class="fas ${getDeviceIcon(device.type)}"></i>
                                <span>${device.type}</span>
                                <small>${device.active}/${device.count}</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="device-list">
                        ${state.deviceData
                            .filter(device => device.location === room.name)
                            .map(device => `
                                <div class="device-item">
                                    <i class="fas ${getDeviceIcon(device.type)}"></i>
                                    <div class="device-info">
                                        <span class="device-name">${device.name}</span>
                                        <span class="device-serial">${device.serialNo}</span>
                                    </div>
                                    <span class="device-status status-${device.status}">${getStatusText(device.status)}</span>
                                </div>
                            `).join('')}
                    </div>
                    <a href="#" class="view-all-link">
                        Tüm Cihazları Görüntüle
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// Helper Functions
function getStatusText(status) {
    switch (status) {
        case 'active': return 'Aktif';
        case 'repair': return 'Serviste';
        case 'inactive': return 'Pasif';
        default: return 'Bilinmiyor';
    }
}

function getDeviceIcon(type) {
    switch (type.toLowerCase()) {
        case 'bilgisayar': return 'fa-desktop';
        case 'yazıcı': return 'fa-print';
        case 'tarayıcı': return 'fa-scanner';
        case 'projeksiyon': return 'fa-video';
        default: return 'fa-laptop';
    }
}

// Search Functionality
const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        // Court Offices Search
        if (courtOfficesGrid) {
            const filteredOffices = courtOffices.filter(office => 
                office.name.toLowerCase().includes(searchTerm) || 
                office.location.toLowerCase().includes(searchTerm)
            );
            renderFilteredOffices(filteredOffices);
        }

        // Courtrooms Search
        const courtroomsGrid = document.querySelector('.courtrooms-grid');
        if (courtroomsGrid) {
            const filteredRooms = courtrooms.filter(room => 
                room.name.toLowerCase().includes(searchTerm) || 
                room.location.toLowerCase().includes(searchTerm)
            );
            renderFilteredCourtrooms(filteredRooms);
        }

        // Judges Chambers Search
        const judgesChambersGrid = document.querySelector('.judges-chambers-grid');
        if (judgesChambersGrid) {
            const filteredChambers = judgesChambers.filter(chamber => 
                chamber.judgeName.toLowerCase().includes(searchTerm) || 
                chamber.location.toLowerCase().includes(searchTerm) ||
                chamber.chamberNumber.toLowerCase().includes(searchTerm)
            );
            renderFilteredJudgesChambers(filteredChambers);
        }
    });
}

function renderFilteredOffices(offices) {
    if (offices.length === 0) {
        courtOfficesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Sonuç bulunamadı</p>
            </div>
        `;
    } else {
        renderCourtOffices(offices);
    }
}

function renderFilteredCourtrooms(rooms) {
    const courtroomsGrid = document.querySelector('.courtrooms-grid');
    if (rooms.length === 0) {
        courtroomsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Sonuç bulunamadı</p>
            </div>
        `;
    } else {
        courtroomsGrid.innerHTML = rooms.map(room => `
            <div class="courtroom-card">
                <div class="courtroom-header">
                    <div class="courtroom-icon">
                        <i class="fas fa-gavel"></i>
                    </div>
                    <div class="courtroom-title">
                        <h2>${room.name}</h2>
                        <p>${room.location}</p>
                    </div>
                </div>
                <div class="courtroom-info">
                    <div class="info-item">
                        <h3>${room.capacity}</h3>
                        <p>Kapasite</p>
                    </div>
                    <div class="info-item">
                        <h3>${room.deviceCount}</h3>
                        <p>Cihaz</p>
                    </div>
                </div>
                <div class="courtroom-status">
                    <span class="status-indicator status-${room.status}"></span>
                    <span class="status-text">
                        ${getStatusText(room.status)}
                        ${room.nextHearing !== '-' ? `• Sıradaki Duruşma: ${room.nextHearing}` : ''}
                    </span>
                </div>
                <div class="courtroom-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-info-circle"></i>
                        Detaylar
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-tools"></i>
                        Arıza Bildir
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Judges Chambers Functions
function renderJudgesChambers() {
    const judgesChambersGrid = document.querySelector('.judges-chambers-grid');
    judgesChambersGrid.innerHTML = judgesChambers.map(chamber => `
        <div class="judge-chamber-card">
            <div class="judge-chamber-header">
                <div class="judge-chamber-icon">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="judge-chamber-title">
                    <h2>${chamber.judgeName}</h2>
                    <p>Oda ${chamber.chamberNumber} • ${chamber.location}</p>
                </div>
            </div>
            <div class="judge-chamber-info">
                <div class="judge-info-item">
                    <h3>${chamber.deviceCount}</h3>
                    <p>Cihaz</p>
                </div>
                <div class="judge-info-item">
                    <h3>${chamber.activeIssues}</h3>
                    <p>Aktif Arıza</p>
                </div>
            </div>
            <div class="judge-chamber-status">
                <span class="judge-status-indicator judge-status-${chamber.status}"></span>
                <span class="judge-status-text">
                    ${getJudgeStatusText(chamber.status)}
                    ${chamber.nextHearing !== '-' ? `• Sıradaki Duruşma: ${chamber.nextHearing}` : ''}
                </span>
            </div>
            <div class="judge-chamber-actions">
                <button class="btn btn-primary">
                    <i class="fas fa-info-circle"></i>
                    Detaylar
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-tools"></i>
                    Arıza Bildir
                </button>
            </div>
        </div>
    `).join('');
}

function getJudgeStatusText(status) {
    switch (status) {
        case 'available':
            return 'Müsait';
        case 'busy':
            return 'Meşgul';
        case 'away':
            return 'Dışarıda';
        default:
            return 'Bilinmiyor';
    }
}

function renderFilteredJudgesChambers(chambers) {
    const judgesChambersGrid = document.querySelector('.judges-chambers-grid');
    if (chambers.length === 0) {
        judgesChambersGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Sonuç bulunamadı</p>
            </div>
        `;
    } else {
        judgesChambersGrid.innerHTML = chambers.map(chamber => `
            <div class="judge-chamber-card">
                <div class="judge-chamber-header">
                    <div class="judge-chamber-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="judge-chamber-title">
                        <h2>${chamber.judgeName}</h2>
                        <p>Oda ${chamber.chamberNumber} • ${chamber.location}</p>
                    </div>
                </div>
                <div class="judge-chamber-info">
                    <div class="judge-info-item">
                        <h3>${chamber.deviceCount}</h3>
                        <p>Cihaz</p>
                    </div>
                    <div class="judge-info-item">
                        <h3>${chamber.activeIssues}</h3>
                        <p>Aktif Arıza</p>
                    </div>
                </div>
                <div class="judge-chamber-status">
                    <span class="judge-status-indicator judge-status-${chamber.status}"></span>
                    <span class="judge-status-text">
                        ${getJudgeStatusText(chamber.status)}
                        ${chamber.nextHearing !== '-' ? `• Sıradaki Duruşma: ${chamber.nextHearing}` : ''}
                    </span>
                </div>
                <div class="judge-chamber-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-info-circle"></i>
                        Detaylar
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-tools"></i>
                        Arıza Bildir
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Issue List Functions
function setupIssueList() {
    renderIssues(issues);
    setupIssueFilters();
    setupIssueSearch();
}

function renderIssues(issuesToRender) {
    const issueList = document.querySelector('.issue-list');
    issueList.innerHTML = issuesToRender.map(issue => `
        <div class="issue-item">
            <div class="issue-status status-${issue.status}">
                ${getStatusText(issue.status)}
            </div>
            <div class="issue-content">
                <div class="issue-header">
                    <div>
                        <h3 class="issue-title">${issue.title}</h3>
                        <div class="issue-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${issue.location}</span>
                            <span><i class="fas fa-laptop"></i> ${issue.deviceType}</span>
                            <span><i class="fas fa-clock"></i> ${formatDate(issue.createdAt)}</span>
                        </div>
                    </div>
                    <div class="issue-priority priority-${issue.priority}">
                        ${getPriorityText(issue.priority)}
                    </div>
                </div>
                <p class="issue-description">${issue.description}</p>
                <div class="issue-footer">
                    <div class="issue-assignee">
                        <img src="${issue.assignee.avatar}" alt="${issue.assignee.name}">
                        <span>Atanan: ${issue.assignee.name}</span>
                    </div>
                    <div class="issue-actions">
                        <button class="btn btn-primary">
                            <i class="fas fa-edit"></i>
                            Düzenle
                        </button>
                        <button class="btn btn-secondary">
                            <i class="fas fa-comment"></i>
                            Yorum Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function setupIssueFilters() {
    const filters = ['status', 'priority', 'location', 'date'];
    filters.forEach(filter => {
        const select = document.getElementById(`${filter}Filter`);
        if (select) {
            select.addEventListener('change', () => {
                applyFilters();
            });
        }
    });
}

function setupIssueSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredIssues = issues.filter(issue => 
                issue.title.toLowerCase().includes(searchTerm) ||
                issue.description.toLowerCase().includes(searchTerm) ||
                issue.location.toLowerCase().includes(searchTerm)
            );
            renderIssues(filteredIssues);
        });
    }
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filteredIssues = issues.filter(issue => {
        const matchStatus = !statusFilter || issue.status === statusFilter;
        const matchPriority = !priorityFilter || issue.priority === priorityFilter;
        const matchLocation = !locationFilter || issue.location.toLowerCase().includes(locationFilter);
        const matchDate = !dateFilter || isDateInRange(issue.createdAt, dateFilter);
        
        return matchStatus && matchPriority && matchLocation && matchDate;
    });

    renderIssues(filteredIssues);
}

function getPriorityText(priority) {
    switch (priority) {
        case 'high':
            return 'Yüksek';
        case 'medium':
            return 'Orta';
        case 'low':
            return 'Düşük';
        default:
            return 'Bilinmiyor';
    }
}

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

function isDateInRange(dateString, range) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
        case 'bugun':
            return date >= today;
        case 'hafta':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return date >= weekAgo;
        case 'ay':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return date >= monthAgo;
        default:
            return true;
    }
}

// Initialize reports page
function setupReportsPage() {
    if (!document.querySelector('.reports-grid')) return;

    // Initialize charts
    setupIssuesTrendChart();
    setupIssuesDistributionChart();

    // Initialize tables
    renderTopDevicesTable();
    renderRecentIssuesTable();

    // Setup date range buttons
    setupDateRangeButtons();
}

// Setup issues trend chart
function setupIssuesTrendChart() {
    const ctx = document.getElementById('issuesTrendChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
            datasets: [{
                label: 'Arıza Sayısı',
                data: reportData.issues.trends.daily,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Setup trend period buttons
    const trendButtons = document.querySelectorAll('.chart-actions button');
    trendButtons.forEach(button => {
        button.addEventListener('click', () => {
            const period = button.textContent.toLowerCase();
            let labels, data;

            switch (period) {
                case 'haftalık':
                    labels = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta'];
                    data = reportData.issues.trends.weekly;
                    break;
                case 'aylık':
                    labels = ['Ocak', 'Şubat', 'Mart', 'Nisan'];
                    data = reportData.issues.trends.monthly;
                    break;
                default:
                    labels = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
                    data = reportData.issues.trends.daily;
            }

            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();

            // Update active button
            trendButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// Setup issues distribution chart
function setupIssuesDistributionChart() {
    const ctx = document.getElementById('issuesDistributionChart');
    if (!ctx) return;

    const locationData = reportData.issues.distribution.location;
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(locationData),
            datasets: [{
                data: Object.values(locationData),
                backgroundColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--primary'),
                    getComputedStyle(document.documentElement).getPropertyValue('--success'),
                    getComputedStyle(document.documentElement).getPropertyValue('--warning')
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Setup distribution type buttons
    const distributionButtons = document.querySelectorAll('.chart-card:nth-child(2) .chart-actions button');
    distributionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.textContent.toLowerCase();
            let data;

            if (type === 'cihaz') {
                data = reportData.issues.distribution.device;
            } else {
                data = reportData.issues.distribution.location;
            }

            chart.data.labels = Object.keys(data);
            chart.data.datasets[0].data = Object.values(data);
            chart.update();

            // Update active button
            distributionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// Render top devices table
function renderTopDevicesTable() {
    const tbody = document.querySelector('.table-card:first-child tbody');
    if (!tbody) return;

    tbody.innerHTML = reportData.issues.topDevices.map(device => `
        <tr>
            <td>${device.device}</td>
            <td>${device.location}</td>
            <td>${device.count}</td>
            <td>
                <span class="status-badge ${device.status.toLowerCase()}">
                    ${device.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Render recent issues table
function renderRecentIssuesTable() {
    const tbody = document.querySelector('.table-card:last-child tbody');
    if (!tbody) return;

    tbody.innerHTML = reportData.issues.recentIssues.map(issue => `
        <tr>
            <td>${formatDate(issue.date)}</td>
            <td>${issue.title}</td>
            <td>${issue.location}</td>
            <td>
                <span class="status-badge ${getStatusClass(issue.status)}">
                    ${issue.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Setup date range buttons
function setupDateRangeButtons() {
    const dateRangeButtons = document.querySelectorAll('.date-range button');
    dateRangeButtons.forEach(button => {
        button.addEventListener('click', () => {
            dateRangeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Here you would typically update all the reports data based on the selected date range
        });
    });
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Helper function to get status class
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'çözüldü':
            return 'success';
        case 'işlemde':
            return 'warning';
        case 'beklemede':
            return 'info';
        default:
            return 'danger';
    }
}

// Profile Page Functions
function setupProfilePage() {
    const profileContainer = document.querySelector('.profile-container');
    if (!profileContainer) return;

    // Handle avatar change
    setupAvatarChange();

    // Handle personal information edit
    setupPersonalInfoEdit();

    // Handle settings changes
    setupSettingsChanges();

    // Handle activity filters
    setupActivityFilters();
}

function setupAvatarChange() {
    const btnChangeAvatar = document.querySelector('.btn-change-avatar');
    if (!btnChangeAvatar) return;

    btnChangeAvatar.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const profileAvatar = document.querySelector('.profile-avatar img');
                    const sidebarAvatar = document.querySelector('.user-profile img');
                    
                    // Update both profile and sidebar avatars
                    if (profileAvatar) profileAvatar.src = e.target.result;
                    if (sidebarAvatar) sidebarAvatar.src = e.target.result;

                    // Here you would typically upload the image to a server
                    // and update the user's profile picture in the database
                };
                reader.readAsDataURL(file);
            }
        };

        input.click();
    });
}

function setupPersonalInfoEdit() {
    const btnEdit = document.querySelector('.btn-edit');
    if (!btnEdit) return;

    btnEdit.addEventListener('click', () => {
        const infoGroups = document.querySelectorAll('.info-group');
        const isEditing = btnEdit.classList.contains('active');

        if (isEditing) {
            // Save changes
            const updatedInfo = {};
            infoGroups.forEach(group => {
                const input = group.querySelector('input');
                if (input) {
                    const label = group.querySelector('label').textContent;
                    updatedInfo[label] = input.value;
                    
                    // Convert input back to text
                    const p = document.createElement('p');
                    p.textContent = input.value;
                    input.replaceWith(p);
                }
            });

            // Here you would typically send the updated info to a server
            console.log('Updated info:', updatedInfo);

            btnEdit.innerHTML = '<i class="fas fa-edit"></i> Düzenle';
            btnEdit.classList.remove('active');
        } else {
            // Enable editing
            infoGroups.forEach(group => {
                const p = group.querySelector('p');
                if (p) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-input';
                    input.value = p.textContent;
                    p.replaceWith(input);
                }
            });

            btnEdit.innerHTML = '<i class="fas fa-save"></i> Kaydet';
            btnEdit.classList.add('active');
        }
    });
}

function setupSettingsChanges() {
    // Handle language change
    const languageSelect = document.querySelector('.settings-group select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const selectedLanguage = e.target.value;
            // Here you would typically update the user's language preference
            console.log('Language changed to:', selectedLanguage);
        });
    }

    // Handle notification toggles
    const notificationToggles = document.querySelectorAll('.notification-settings input[type="checkbox"]');
    notificationToggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const notificationType = e.target.closest('.setting-item').querySelector('span').textContent;
            const isEnabled = e.target.checked;
            // Here you would typically update the user's notification preferences
            console.log(`${notificationType} notifications ${isEnabled ? 'enabled' : 'disabled'}`);
        });
    });

    // Handle password change
    const btnChangePassword = document.querySelector('.settings-group .btn-secondary');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', () => {
            // Here you would typically show a password change modal
            showPasswordChangeModal();
        });
    }
}

function setupActivityFilters() {
    const filterButtons = document.querySelectorAll('.activity-filters button');
    if (!filterButtons.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');

            // Filter activities based on selected type
            const filterType = button.textContent.toLowerCase();
            filterActivities(filterType);
        });
    });
}

function filterActivities(type) {
    const activities = document.querySelectorAll('.activity-item');
    
    activities.forEach(activity => {
        const title = activity.querySelector('h4').textContent.toLowerCase();
        
        if (type === 'tümü') {
            activity.style.display = '';
        } else if (type === 'arıza kayıtları' && title.includes('arıza')) {
            activity.style.display = '';
        } else if (type === 'çözülen arızalar' && title.includes('çözüldü')) {
            activity.style.display = '';
        } else if (type === 'sistem güncellemeleri' && title.includes('güncelleme')) {
            activity.style.display = '';
        } else {
            activity.style.display = 'none';
        }
    });
}

function showPasswordChangeModal() {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Şifre Değiştir</h3>
                <button class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Mevcut Şifre</label>
                    <input type="password" class="form-input" id="currentPassword">
                </div>
                <div class="form-group">
                    <label>Yeni Şifre</label>
                    <input type="password" class="form-input" id="newPassword">
                </div>
                <div class="form-group">
                    <label>Yeni Şifre (Tekrar)</label>
                    <input type="password" class="form-input" id="confirmPassword">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-action="cancel">İptal</button>
                <button class="btn btn-primary" data-action="save">Kaydet</button>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);

    // Handle close button
    const btnClose = modal.querySelector('.btn-close');
    btnClose.addEventListener('click', () => closeModal(modal));

    // Handle action buttons
    const btnCancel = modal.querySelector('[data-action="cancel"]');
    const btnSave = modal.querySelector('[data-action="save"]');

    btnCancel.addEventListener('click', () => closeModal(modal));
    btnSave.addEventListener('click', () => {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Yeni şifreler eşleşmiyor.');
            return;
        }

        // Here you would typically send the password change request to a server
        console.log('Password change requested');
        
        closeModal(modal);
    });
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupDashboard();
});

// Setup dashboard content
function setupDashboard() {
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (!dashboardGrid) return;

    // Create and append stats cards
    const statsSection = createStatsSection();
    dashboardGrid.appendChild(statsSection);

    // Create and append device stats card
    const deviceStatsCard = createDeviceStatsCard();
    dashboardGrid.appendChild(deviceStatsCard);

    // Create and append recent issues card
    const recentIssuesCard = createRecentIssuesCard();
    dashboardGrid.appendChild(recentIssuesCard);
}

// Create stats section
function createStatsSection() {
    const statsSection = document.createElement('div');
    statsSection.className = 'stats-grid';

    dashboardData.stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-icon">
                <i class="fas ${stat.icon}"></i>
            </div>
            <div class="stat-info">
                <h3>${stat.title}</h3>
                <p>${stat.value}</p>
                <small>${stat.trend}</small>
            </div>
        `;
        statsSection.appendChild(statCard);
    });

    return statsSection;
}

// Create device stats card
function createDeviceStatsCard() {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    
    const deviceStats = dashboardData.deviceStats.map(device => `
        <div class="device-stat-item">
            <span class="device-type">${device.type}</span>
            <div class="device-count-bar">
                <div class="bar" style="width: ${device.percentage}%"></div>
                <span class="count">${device.count}</span>
            </div>
        </div>
    `).join('');

    card.innerHTML = `
        <div class="card-header">
            <h2>Cihaz Dağılımı</h2>
        </div>
        <div class="card-content">
            <div class="device-stats">
                ${deviceStats}
            </div>
        </div>
    `;

    return card;
}

// Create recent issues card
function createRecentIssuesCard() {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    
    const issues = dashboardData.recentIssues.map(issue => `
        <tr>
            <td>${issue.title}</td>
            <td>${issue.location}</td>
            <td><span class="status-badge ${issue.status.toLowerCase()}">${issue.status}</span></td>
            <td>${formatDate(issue.date)}</td>
        </tr>
    `).join('');

    card.innerHTML = `
        <div class="card-header">
            <h2>Son Arıza Kayıtları</h2>
        </div>
        <div class="card-content">
            <div class="table-responsive">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>Başlık</th>
                            <th>Konum</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${issues}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return card;
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Initialize other pages
document.addEventListener('DOMContentLoaded', function() {
    setupDashboard();
    setupCourtOfficesGrid();
    setupJudgesChambersGrid();
    setupCourtroomsGrid();
});

// Setup court offices grid
function setupCourtOfficesGrid() {
    const grid = document.querySelector('.court-offices-grid');
    if (!grid) return;

    const offices = [
        { title: '1. Ağır Ceza Mahkemesi', type: 'Ceza Mahkemesi', deviceCount: 12, issueCount: 2 },
        { title: '2. Asliye Hukuk Mahkemesi', type: 'Hukuk Mahkemesi', deviceCount: 8, issueCount: 1 },
        { title: '1. İcra Dairesi', type: 'İcra Dairesi', deviceCount: 10, issueCount: 0 },
        { title: '3. Sulh Hukuk Mahkemesi', type: 'Hukuk Mahkemesi', deviceCount: 9, issueCount: 3 }
    ];

    offices.forEach(office => {
        const card = document.createElement('div');
        card.className = 'court-office-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">
                    <i class="fas fa-building"></i>
                </div>
                <div class="card-title">
                    <h2>${office.title}</h2>
                    <p>${office.type}</p>
                </div>
            </div>
            <div class="card-stats">
                <div class="stat-item">
                    <h3>${office.deviceCount}</h3>
                    <p>Cihaz</p>
                </div>
                <div class="stat-item">
                    <h3>${office.issueCount}</h3>
                    <p>Aktif Arıza</p>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
} 
 