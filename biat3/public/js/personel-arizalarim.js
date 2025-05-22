// Supabase client'ı başta oluştur
console.log('personel-arizalarim.js loaded');
var supabase = window.supabaseClient;

// Pagination değişkenleri
let myIssuesCurrentPage = 1;
const ROWS_PER_PAGE = 5;
let _myArizaRows = [];

// Arızalarımı yükle
async function loadMyIssues(forceFetch = false) {
    // Kullanıcı bilgilerini al
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        console.error('Kullanıcı bilgisi bulunamadı!');
        return;
    }
    const user = JSON.parse(userStr);

    // Verileri bir kez çek ve bellekte tut
    if (forceFetch || _myArizaRows.length === 0) {
        // Üst tablodan arızaları çek
        const { data: arizalar } = await supabase
            .from('ariza_bildirimleri')
            .select('*')
            .eq('sicil_no', user.sicil_no);

        // Alt tablodan çözülen arızaları çek
        const { data: cozulenArizalar } = await supabase
            .from('cozulen_arizalar')
            .select('*')
            .eq('sicil_no', user.sicil_no);

        // Admin personelleri çek
        const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('yetki', 'admin');
        const adminler = users || [];

        // Arızaları birleştir ve formatla
        const arizaRows = [];
        
        // Üst tablodaki arızaları ekle
        if (arizalar) {
            arizalar.forEach(ariza => {
                let gpersonel = '-';
                if (adminler.length > 0) {
                    const randomAdmin = adminler[Math.floor(Math.random() * adminler.length)];
                    gpersonel = randomAdmin.ad_soyad || '-';
                }
                arizaRows.push({
                    ...ariza,
                    gpersonel,
                    bildirenAd: user.ad_soyad || user.sicil_no
                });
            });
        }

        // Alt tablodaki arızaları ekle
        if (cozulenArizalar) {
            cozulenArizalar.forEach(ariza => {
                arizaRows.push({
                    ...ariza,
                    gpersonel: ariza.arizayi_cozen_personel || '-',
                    bildirenAd: user.ad_soyad || user.sicil_no,
                    tarih: ariza.cozulme_tarihi
                });
            });
        }

        // Tarihe göre sırala (en yeni üstte)
        _myArizaRows = arizaRows.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    }

    // Tabloyu doldur
    const tbody = document.getElementById('myIssuesTableBody');
    tbody.innerHTML = '';

    const totalRows = _myArizaRows.length;
    const startIdx = (myIssuesCurrentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageRows = _myArizaRows.slice(startIdx, endIdx);

    pageRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #dee2e6';
        tr.innerHTML = `
            <td style="padding: 12px 15px;">${row.ariza_no}</td>
            <td style="padding: 12px 15px;">${new Date(row.tarih).toLocaleString('tr-TR')}</td>
            <td style="padding: 12px 15px;">${row.gpersonel}</td>
            <td style="padding: 12px 15px;">${row.bildirenAd}</td>
            <td style="padding: 12px 15px;">${row.telefon || '-'}</td>
            <td style="padding: 12px 15px;">${row.ariza_durumu || '-'}</td>
            <td style="padding: 12px 15px; text-align: center;">
                <button class="action-btn view" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; margin: 0 4px; cursor: pointer;" onclick="viewMyIssueDetail(${startIdx + idx})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Sayfalama kontrollerini oluştur
    renderMyPaginationControls(totalRows, myIssuesCurrentPage);
}

// Sayfalama kontrolleri
function renderMyPaginationControls(totalRows, currentPage) {
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
    const container = document.getElementById('myIssuesPagination');
    container.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Önceki';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        myIssuesCurrentPage--;
        loadMyIssues();
    };
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        if (i === currentPage) pageBtn.classList.add('active');
        pageBtn.onclick = () => {
            myIssuesCurrentPage = i;
            loadMyIssues();
        };
        container.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Sonraki';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        myIssuesCurrentPage++;
        loadMyIssues();
    };
    container.appendChild(nextBtn);
}

// Detay modalı fonksiyonları
function viewMyIssueDetail(idx) {
    const row = _myArizaRows[idx];
    if (!row) return;

    document.getElementById('myDetailArizaNo').textContent = row.ariza_no || '-';
    document.getElementById('myDetailTarih').textContent = new Date(row.tarih).toLocaleString('tr-TR');
    document.getElementById('myDetailGorevli').textContent = row.gpersonel || '-';
    document.getElementById('myDetailBildiren').textContent = row.bildirenAd || '-';
    document.getElementById('myDetailTelefon').textContent = row.telefon || '-';
    document.getElementById('myDetailDurum').textContent = row.ariza_durumu || '-';

    const fotoDiv = document.getElementById('myDetailFoto');
    if (row.foto_url) {
        fotoDiv.innerHTML = `<img src="${row.foto_url}" alt="Fotoğraf" class="modal-img-preview">`;
    } else {
        fotoDiv.textContent = '-';
    }

    // Açıklama kartı
    const descDiv = document.getElementById('myDetailDescription');
    const aciklama = row.ariza_aciklamasi || '-';
    const maxLen = 60;
    if (aciklama.length > maxLen) {
        descDiv.textContent = aciklama.substring(0, maxLen) + '...';
        descDiv.title = 'Tümünü görmek için tıklayın';
        descDiv.classList.add('truncated');
    } else {
        descDiv.textContent = aciklama;
        descDiv.title = '';
        descDiv.classList.remove('truncated');
    }
    descDiv.onclick = function() {
        if (aciklama.length > maxLen) {
            showMyDescriptionModal(aciklama);
        }
    };

    document.getElementById('myIssueDetailsModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMyIssueDetailModal() {
    document.getElementById('myIssueDetailsModal').classList.remove('show');
    document.body.style.overflow = '';
}

function showMyDescriptionModal(text) {
    document.getElementById('myFullDescriptionText').textContent = text;
    document.getElementById('myDescriptionModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMyDescriptionModal() {
    document.getElementById('myDescriptionModal').classList.remove('show');
    document.body.style.overflow = '';
}

function closeMyPhotoModal() {
    document.getElementById('myPhotoModal').classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('myPhotoModalImg').src = '';
}

// Fotoğraf modalı için event listener
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-img-preview')) {
        const src = e.target.getAttribute('src');
        document.getElementById('myPhotoModalImg').src = src;
        document.getElementById('myPhotoModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }
});

// Sayfa yüklendiğinde arızaları yükle
document.addEventListener('DOMContentLoaded', function() {
    loadMyIssues();
}); 