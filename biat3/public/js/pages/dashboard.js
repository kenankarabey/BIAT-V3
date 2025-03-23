import { state } from '../main.js';

// Dashboard sayfasının HTML içeriğini oluştur
export default async function render() {
    const stats = await fetchDashboardStats();
    
    return `
        <div class="dashboard">
            <h1>Hoş Geldiniz, ${state.user?.ad || 'Kullanıcı'}</h1>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-laptop"></i>
                    <div class="stat-info">
                        <h3>Toplam Cihaz</h3>
                        <p>${stats.totalDevices}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-exclamation-circle"></i>
                    <div class="stat-info">
                        <h3>Aktif Arızalar</h3>
                        <p>${stats.activeTickets}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tools"></i>
                    <div class="stat-info">
                        <h3>Servisteki Cihazlar</h3>
                        <p>${stats.devicesInService}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-check-circle"></i>
                    <div class="stat-info">
                        <h3>Çözülen Arızalar</h3>
                        <p>${stats.resolvedTickets}</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h2>Son Arızalar</h2>
                    <div class="recent-tickets">
                        ${renderRecentTickets(stats.recentTickets)}
                    </div>
                </div>
                <div class="dashboard-card">
                    <h2>Garanti Durumu</h2>
                    <div class="warranty-status">
                        ${renderWarrantyStatus(stats.warrantyStatus)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Sayfa yüklendiğinde çalışacak başlatma fonksiyonu
export function init() {
    // Event listener'ları ekle
    document.querySelectorAll('.recent-tickets .ticket').forEach(ticket => {
        ticket.addEventListener('click', () => {
            window.location.href = `/tickets/${ticket.dataset.id}`;
        });
    });
}

// Dashboard istatistiklerini getir
async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Stats fetch failed');

        return await response.json();
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return {
            totalDevices: 0,
            activeTickets: 0,
            devicesInService: 0,
            resolvedTickets: 0,
            recentTickets: [],
            warrantyStatus: []
        };
    }
}

// Son arızaları render et
function renderRecentTickets(tickets) {
    if (!tickets.length) {
        return '<p class="no-data">Henüz arıza kaydı bulunmuyor</p>';
    }

    return tickets.map(ticket => `
        <div class="ticket" data-id="${ticket._id}">
            <div class="ticket-header">
                <span class="ticket-title">${ticket.baslik}</span>
                <span class="ticket-status ${ticket.durum.toLowerCase()}">${ticket.durum}</span>
            </div>
            <div class="ticket-info">
                <span><i class="fas fa-user"></i> ${ticket.bildiren.ad} ${ticket.bildiren.soyad}</span>
                <span><i class="fas fa-clock"></i> ${new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
        </div>
    `).join('');
}

// Garanti durumunu render et
function renderWarrantyStatus(devices) {
    if (!devices.length) {
        return '<p class="no-data">Garanti bilgisi bulunamadı</p>';
    }

    return `
        <div class="warranty-list">
            ${devices.map(device => {
                const warrantyEnd = new Date(device.garantiBitis);
                const daysLeft = Math.ceil((warrantyEnd - new Date()) / (1000 * 60 * 60 * 24));
                const status = daysLeft <= 0 ? 'expired' : daysLeft <= 30 ? 'warning' : 'active';
                
                return `
                    <div class="warranty-item ${status}">
                        <div class="device-info">
                            <span class="device-name">${device.tip} - ${device.marka} ${device.model}</span>
                            <span class="device-serial">SN: ${device.seriNo}</span>
                        </div>
                        <div class="warranty-info">
                            <span class="days-left">${daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Süresi doldu'}</span>
                            <span class="end-date">${warrantyEnd.toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
} 