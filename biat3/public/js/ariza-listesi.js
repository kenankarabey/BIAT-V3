// Arıza listesi için JavaScript kodları
// Sadece modal işlemleri ve modal event listener'ları bırakıldı

// Supabase client'ı başta oluştur
console.log('ariza-listesi.js loaded');
var supabase = window.supabaseClient;

// Pagination değişkenleri
let issuesCurrentPage = 1;
let solvedIssuesCurrentPage = 1;
const ROWS_PER_PAGE = 5;
let _allArizaRows = [];
let _allCozulenArizaRows = [];
let _allDeviceData = [];
let _allDeviceDataLoaded = false;

function renderPaginationControls(totalRows, currentPage, onPageChange, containerId) {
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
    const container = document.getElementById(containerId);
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

async function fetchAllDeviceData() {
    if (_allDeviceDataLoaded) return _allDeviceData;
    const tables = ['computers', 'laptops', 'screens', 'printers', 'scanners', 'segbis', 'tvs', 'microphones', 'cameras', 'e_durusma'];
    let allDeviceData = [];
    for (const table of tables) {
        const { data } = await supabase.from(table).select('*');
        if (data) allDeviceData.push(...data);
    }
    _allDeviceData = allDeviceData;
    _allDeviceDataLoaded = true;
    return _allDeviceData;
}

async function fetchArizaData() {
    // 1. Üst tabloyu çek
    const { data: arizalar } = await supabase
        .from('ariza_bildirimleri')
        .select('*');
    // 2. Alt tabloyu çek
    const { data: cozulenArizalar } = await supabase
        .from('cozulen_arizalar')
        .select('*');
    return { arizalar, cozulenArizalar };
}

async function loadArizaListesi(forceFetch = false) {
    // Verileri bir kez çek ve bellekte tut
    if (forceFetch || _allArizaRows.length === 0 || _allCozulenArizaRows.length === 0) {
        const { arizalar, cozulenArizalar } = await fetchArizaData();
        const allDeviceData = await fetchAllDeviceData();
        // 4. Admin personelleri çek (ad_soyad kullanılacak)
        const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('yetki', 'admin');
        const adminler = users || [];
        let adminIndex = 0;
        // 5. Arızaları eski->yeni sırada adminlere sırayla ata
        const arizaRows = arizalar ? arizalar.map((ariza, i) => {
            let gpersonel = '-';
            if (adminler.length > 0) {
                gpersonel = adminler[adminIndex % adminler.length].ad_soyad || '-';
                adminIndex++;
            }
            let bildirenAd = ariza.sicil_no;
            const cihazKaydi = allDeviceData.find(c => String(c.sicil_no) === String(ariza.sicil_no));
            if (cihazKaydi) {
                bildirenAd =
                    cihazKaydi.adi_soyadi ||
                    cihazKaydi.ad_soyad ||
                    cihazKaydi.personel_ad_soyad ||
                    cihazKaydi.personel_adi_soyadi ||
                    ariza.sicil_no;
            }
            return {
                ...ariza,
                gpersonel,
                bildirenAd
            };
        }) : [];
        _allArizaRows = [...arizaRows].reverse();
        _allCozulenArizaRows = cozulenArizalar ? [...cozulenArizalar] : [];
    }
    // Kart sayılarını güncelle
    const arizalar = _allArizaRows;
    const cozulenArizalar = _allCozulenArizaRows;
    const bekleyen = arizalar ? arizalar.filter(a => a.ariza_durumu === 'Beklemede').length : 0;
    const islemde = arizalar ? arizalar.filter(a => a.ariza_durumu === 'İşlemde').length : 0;
    const cozuldu = cozulenArizalar ? cozulenArizalar.filter(a => a.ariza_durumu === 'Çözüldü').length : 0;
    const iptalUst = arizalar ? arizalar.filter(a => a.ariza_durumu === 'İptal Edildi').length : 0;
    const iptalAlt = cozulenArizalar ? cozulenArizalar.filter(a => a.ariza_durumu === 'İptal Edildi').length : 0;
    const iptal = iptalUst + iptalAlt;
    document.getElementById('pendingCount').textContent = bekleyen;
    document.getElementById('inProgressCount').textContent = islemde;
    document.getElementById('completedCount').textContent = cozuldu;
    document.getElementById('canceledCount').textContent = iptal;
    // Tabloyu en yeni arıza üstte olacak şekilde ters çevirerek ekrana bas
    const tbody = document.getElementById('issuesTableBody');
    tbody.innerHTML = '';
    const reversedRows = _allArizaRows;
    const totalRows = reversedRows.length;
    const startIdx = (issuesCurrentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageRows = reversedRows.slice(startIdx, endIdx);
    pageRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.ariza_no}</td>
            <td>${new Date(row.tarih).toLocaleString('tr-TR')}</td>
            <td>${row.gpersonel}</td>
            <td>${row.bildirenAd}</td>
            <td>${row.telefon || '-'}</td>
            <td>${row.ariza_durumu || '-'}</td>
            <td>
                <button class="action-btn view" onclick="viewIssueDetail(${startIdx + idx})"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" onclick="deleteIssue(${startIdx + idx})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    window._arizaRows = reversedRows;
    renderPaginationControls(totalRows, issuesCurrentPage, (page) => { issuesCurrentPage = page; loadArizaListesi(); }, 'issuesPagination');
    loadCozulenArizalar();
}

async function loadCozulenArizalar() {
    const allDeviceData = await fetchAllDeviceData();
    const tbody = document.getElementById('solvedIssuesTableBody');
    tbody.innerHTML = '';
    const cozulenArizalar = _allCozulenArizaRows;
    if (cozulenArizalar) {
        window._cozulenArizaRows = cozulenArizalar;
        const totalRows = cozulenArizalar.length;
        const startIdx = (solvedIssuesCurrentPage - 1) * ROWS_PER_PAGE;
        const endIdx = startIdx + ROWS_PER_PAGE;
        const pageRows = cozulenArizalar.slice(startIdx, endIdx);
        pageRows.forEach((row, idx) => {
            let bildirenAd = row.sicil_no;
            const cihazKaydi = allDeviceData.find(c => String(c.sicil_no) === String(row.sicil_no));
            if (cihazKaydi) {
                bildirenAd =
                    cihazKaydi.adi_soyadi ||
                    cihazKaydi.ad_soyad ||
                    cihazKaydi.personel_ad_soyad ||
                    cihazKaydi.personel_adi_soyadi ||
                    row.sicil_no;
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.ariza_no}</td>
                <td>${row.cozulme_tarihi ? new Date(row.cozulme_tarihi).toLocaleString('tr-TR') : '-'}</td>
                <td>${row.arizayi_cozen_personel || '-'}</td>
                <td>${bildirenAd}</td>
                <td>${row.telefon || '-'}</td>
                <td>${row.ariza_durumu || '-'}</td>
                <td>
                    <button class="action-btn view" onclick="viewSolvedIssueDetail(${startIdx + idx})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" onclick="deleteSolvedIssue(${startIdx + idx})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        renderPaginationControls(totalRows, solvedIssuesCurrentPage, (page) => { solvedIssuesCurrentPage = page; loadCozulenArizalar(); }, 'solvedIssuesPagination');
    }
}

document.addEventListener('DOMContentLoaded', function() {
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

    // Her iki fonksiyonu da çağır
    loadArizaListesi();
    loadCozulenArizalar();
});

// Detay modalını kapat
function closeIssueDetailModal() {
    const modal = document.getElementById('issueDetailsModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Düzenleme modalını kapat
function closeIssueEditModal() {
    const modal = document.getElementById('issueEditModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
}

let currentIssueIdx = null;
let currentEditIdx = null;

function viewIssueDetail(idx) {
    currentIssueIdx = idx;
    const row = window._arizaRows[idx];
    if (!row) return;
    document.getElementById('detailArizaNo').textContent = row.ariza_no || '-';
    document.getElementById('detailTarih').textContent = new Date(row.tarih).toLocaleString('tr-TR');
    document.getElementById('detailGorevliLabel').textContent = 'Görevli Personel';
    document.getElementById('detailGorevli').textContent = row.gpersonel || '-';
    document.getElementById('detailBildiren').textContent = row.bildirenAd || '-';
    document.getElementById('detailTelefon').textContent = row.telefon || '-';
    document.getElementById('detailDurum').textContent = row.ariza_durumu || '-';
    const fotoDiv = document.getElementById('detailFoto');
    if (row.foto_url) {
        fotoDiv.innerHTML = `<img src="${row.foto_url}" alt="Fotoğraf" class="modal-img-preview">`;
    } else {
        fotoDiv.textContent = '-';
    }
    // Açıklama kartı
    const descDiv = document.getElementById('detailDescription');
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
            showDescriptionModal(aciklama);
        }
    };

    // Düzenle butonunu güncel arıza için ayarla (üst tablo için eski hali)
    const resolveBtn = document.getElementById('resolveIssueBtn');
    if (resolveBtn) {
        resolveBtn.onclick = function() {
            currentEditIdx = idx;
            // Tüm durum seçeneklerini ekle
            const select = document.getElementById('editStatusSelect');
            select.innerHTML = `
                <option value="Beklemede">Beklemede</option>
                <option value="İşlemde">İşlemde</option>
                <option value="Çözüldü">Çözüldü</option>
                <option value="İptal Edildi">İptal Edildi</option>
            `;
            select.value = row.ariza_durumu || 'Beklemede';
            document.getElementById('editStatusModal').classList.add('show');
            document.body.style.overflow = 'hidden';

            // Kaydet butonunu bu satır için ayarla
            const saveStatusBtn = document.getElementById('saveStatusBtn');
            saveStatusBtn.onclick = async function() {
                if (currentEditIdx === null) return;
                const editRow = window._arizaRows[currentEditIdx];
                const newStatus = select.value;
                let currentUserName = 'Bilinmeyen Kullanıcı';
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const userObj = JSON.parse(userStr);
                        if (userObj.ad_soyad) {
                            currentUserName = userObj.ad_soyad;
                        }
                    }
                } catch (e) {}
                if (newStatus === 'Çözüldü') {
                    const result = await markAsResolvedOrCancelledAndRemove(editRow.ariza_no, currentUserName, newStatus);
                    if (result) {
                        showNotification('Arıza ' + newStatus + ' olarak kaydedildi ve üst tablodan silindi!', 'success');
                        setTimeout(() => { location.reload(); }, 100);
                        return;
                    }
                } else if (newStatus === 'İptal Edildi') {
                    // 1. Alt tabloya ekle
                    const { error: insertError } = await supabase
                        .from('cozulen_arizalar')
                        .insert([{
                            ariza_no: editRow.ariza_no,
                            sicil_no: editRow.sicil_no,
                            arizayi_cozen_personel: currentUserName,
                            telefon: editRow.telefon,
                            ariza_aciklamasi: editRow.ariza_aciklamasi,
                            foto_url: editRow.foto_url,
                            ariza_durumu: newStatus,
                            cozulme_tarihi: new Date().toISOString()
                        }]);
                    // 2. Üst tablodaki kaydı sadece güncelle
                    const { error: updateError } = await supabase
                        .from('ariza_bildirimleri')
                        .update({ ariza_durumu: newStatus })
                        .eq('ariza_no', editRow.ariza_no);
                    if (!insertError && !updateError) {
                        showNotification('Arıza ' + newStatus + ' olarak kaydedildi!', 'success');
                        setTimeout(() => { location.reload(); }, 100);
                        return;
                    } else {
                        if (insertError) showNotification('Çözülen arızalar tablosuna eklenemedi: ' + insertError.message, 'error');
                        if (updateError) showNotification('Arıza üst tabloda güncellenemedi: ' + updateError.message, 'error');
                    }
                }
                const { error } = await supabase
                    .from('ariza_bildirimleri')
                    .update({ ariza_durumu: newStatus })
                    .eq('ariza_no', editRow.ariza_no);
                if (!error) {
                    showNotification('Arıza durumu güncellendi!', 'success');
                    setTimeout(() => { location.reload(); }, 100);
                } else {
                    showNotification('Bir hata oluştu: ' + error.message, 'error');
                }
            };
        };
    }

    document.getElementById('issueDetailsModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function showDescriptionModal(text) {
    document.getElementById('fullDescriptionText').textContent = text;
    document.getElementById('descriptionModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeDescriptionModal() {
    document.getElementById('descriptionModal').classList.remove('show');
    document.body.style.overflow = '';
}

// Fotoğraf kutusuna tıklama ile büyük modal açma
// (Event delegation ile çalışır)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-img-preview')) {
        const src = e.target.getAttribute('src');
        document.getElementById('photoModalImg').src = src;
        document.getElementById('photoModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }
});

function closePhotoModal() {
    document.getElementById('photoModal').classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('photoModalImg').src = '';
}

// Modalı kapatma fonksiyonu
function closeEditStatusModal() {
    document.getElementById('editStatusModal').classList.remove('show');
    document.body.style.overflow = '';
    currentEditIdx = null;
}

// Arızayı çözüldü veya iptal edildi olarak işaretle ve üst tablodan sil
async function markAsResolvedOrCancelledAndRemove(arizaNo, currentUserName, newStatus) {
    // 1. Arızayı bul
    const { data: ariza, error } = await supabase
        .from('ariza_bildirimleri')
        .select('*')
        .eq('ariza_no', arizaNo)
        .single();

    if (error || !ariza) {
        showNotification('Arıza bulunamadı!', 'error');
        return false;
    }

    // 2. cozulen_arizalar tablosuna ekle
    const { error: insertError } = await supabase
        .from('cozulen_arizalar')
        .insert([{
            ariza_no: ariza.ariza_no,
            sicil_no: ariza.sicil_no,
            arizayi_cozen_personel: currentUserName,
            telefon: ariza.telefon,
            ariza_aciklamasi: ariza.ariza_aciklamasi,
            foto_url: ariza.foto_url,
            ariza_durumu: newStatus,
            cozulme_tarihi: new Date().toISOString()
        }]);

    if (insertError) {
        showNotification('Çözülen arızalar tablosuna eklenemedi: ' + insertError.message, 'error');
        return false;
    }

    // 3. ariza_bildirimleri tablosundan sil
    const { error: deleteError } = await supabase
        .from('ariza_bildirimleri')
        .delete()
        .eq('ariza_no', arizaNo);

    if (deleteError) {
        showNotification('Arıza üst tablodan silinemedi: ' + deleteError.message, 'error');
        return false;
    }

    showNotification('Arıza ' + newStatus + ' olarak kaydedildi ve üst tablodan silindi!', 'success');
    setTimeout(() => { location.reload(); }, 100);
    return true;
}

// Çözülen arıza detay modalı aç
function viewSolvedIssueDetail(idx) {
    const row = window._cozulenArizaRows[idx];
    if (!row) return;
    document.getElementById('detailArizaNo').textContent = row.ariza_no || '-';
    document.getElementById('detailTarih').textContent = row.cozulme_tarihi ? new Date(row.cozulme_tarihi).toLocaleString('tr-TR') : '-';
    document.getElementById('detailGorevliLabel').textContent = 'Arızayı Çözen Personel';
    document.getElementById('detailGorevli').textContent = row.arizayi_cozen_personel || '-';
    document.getElementById('detailBildiren').textContent = row.sicil_no || '-';
    document.getElementById('detailTelefon').textContent = row.telefon || '-';
    document.getElementById('detailDurum').textContent = row.ariza_durumu || '-';
    const fotoDiv = document.getElementById('detailFoto');
    if (row.foto_url) {
        fotoDiv.innerHTML = `<img src="${row.foto_url}" alt="Fotoğraf" class="modal-img-preview">`;
    } else {
        fotoDiv.textContent = '-';
    }
    // Açıklama kartı
    const descDiv = document.getElementById('detailDescription');
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
            showDescriptionModal(aciklama);
        }
    };

    // Düzenle butonunu güncel arıza için ayarla (alt tablo için)
    const resolveBtn = document.getElementById('resolveIssueBtn');
    if (resolveBtn) {
        resolveBtn.onclick = function() {
            // Sadece 'Çözüldü' ve 'İptal Edildi' seçenekleri olacak şekilde select'i doldur
            const select = document.getElementById('editStatusSelect');
            select.innerHTML = `
                <option value="Çözüldü">Çözüldü</option>
                <option value="İptal Edildi">İptal Edildi</option>
            `;
            select.value = row.ariza_durumu || 'Çözüldü';
            document.getElementById('editStatusModal').classList.add('show');
            document.body.style.overflow = 'hidden';

            // Kaydet butonunu bu satır için ayarla
            const saveStatusBtn = document.getElementById('saveStatusBtn');
            saveStatusBtn.onclick = async function() {
                const newStatus = select.value;
                const { error } = await supabase
                    .from('cozulen_arizalar')
                    .update({ ariza_durumu: newStatus })
                    .eq('ariza_no', row.ariza_no);
                if (!error) {
                    showNotification('Arıza durumu güncellendi!', 'success');
                    setTimeout(() => { location.reload(); }, 100);
                } else {
                    showNotification('Bir hata oluştu: ' + error.message, 'error');
                }
            };
        };
    }

    document.getElementById('issueDetailsModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Çözülen arıza silme fonksiyonu
async function deleteSolvedIssue(idx) {
    const row = window._cozulenArizaRows[idx];
    if (!row) return;
    if (!confirm('Bu çözülen arızayı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase
        .from('cozulen_arizalar')
        .delete()
        .eq('ariza_no', row.ariza_no);
    if (!error) {
        showNotification('Çözülen arıza silindi!', 'success');
        setTimeout(() => { location.reload(); }, 100);
    } else {
        showNotification('Bir hata oluştu: ' + error.message, 'error');
    }
}

// Üst tablodan arıza silme fonksiyonu
function deleteIssue(idx) {
    const row = window._arizaRows[idx];
    if (!row) return;
    if (!confirm('Bu arızayı silmek istediğinize emin misiniz?')) return;
    supabase
        .from('ariza_bildirimleri')
        .delete()
        .eq('ariza_no', row.ariza_no)
        .then(({ error }) => {
            if (!error) {
                showNotification('Arıza silindi!', 'success');
                loadArizaListesi();
            } else {
                showNotification('Bir hata oluştu: ' + (error.message || JSON.stringify(error)), 'error');
            }
        });
}
