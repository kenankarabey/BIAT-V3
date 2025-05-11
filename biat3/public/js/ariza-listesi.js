// Arıza listesi için JavaScript kodları
// Sadece modal işlemleri ve modal event listener'ları bırakıldı

// Supabase client'ı başta oluştur
console.log('ariza-listesi.js loaded');
var supabase = window.supabaseClient;

async function loadArizaListesi() {
    // 1. Üst tabloyu çek
    const { data: arizalar, error: arizaError } = await supabase
        .from('ariza_bildirimleri')
        .select('*');
    // 2. Alt tabloyu çek
    const { data: cozulenArizalar, error: cozulenError } = await supabase
        .from('cozulen_arizalar')
        .select('*');

    // Kart sayılarını güncelle
    // Beklemede ve İşlemde sadece üst tablodan
    const bekleyen = arizalar ? arizalar.filter(a => a.ariza_durumu === 'Beklemede').length : 0;
    const islemde = arizalar ? arizalar.filter(a => a.ariza_durumu === 'İşlemde').length : 0;
    // Çözüldü sadece alt tablodan
    const cozuldu = cozulenArizalar ? cozulenArizalar.filter(a => a.ariza_durumu === 'Çözüldü').length : 0;
    // İptal Edildi hem üst hem alt tablodan
    const iptalUst = arizalar ? arizalar.filter(a => a.ariza_durumu === 'İptal Edildi').length : 0;
    const iptalAlt = cozulenArizalar ? cozulenArizalar.filter(a => a.ariza_durumu === 'İptal Edildi').length : 0;
    const iptal = iptalUst + iptalAlt;

    document.getElementById('pendingCount').textContent = bekleyen;
    document.getElementById('inProgressCount').textContent = islemde;
    document.getElementById('completedCount').textContent = cozuldu;
    document.getElementById('canceledCount').textContent = iptal;

    // 3. Tüm cihaz tablolarını çek
    const tables = ['computers', 'laptops', 'screens', 'printers', 'scanners', 'segbis', 'tvs', 'microphones', 'cameras', 'e_durusma'];
    const allDeviceData = [];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (data) allDeviceData.push(...data);
    }

    // 4. Admin personelleri çek (ad_soyad kullanılacak)
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('yetki', 'admin');

    const adminler = users || [];
    let adminIndex = 0;

    // 5. Arızaları eski->yeni sırada adminlere sırayla ata
    const arizaRows = arizalar ? arizalar.map((ariza, i) => {
        // Görevli Personel: adminler sırayla (ad_soyad)
        let gpersonel = '-';
        if (adminler.length > 0) {
            gpersonel = adminler[adminIndex % adminler.length].ad_soyad || '-';
            adminIndex++;
        }
        // Arızayı Bildiren Personel: cihaz tablosunda sicil_no eşleşirse adi_soyadi veya ad_soyad, yoksa sicil_no
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

    // Tabloyu en yeni arıza üstte olacak şekilde ters çevirerek ekrana bas
    const tbody = document.getElementById('issuesTableBody');
    tbody.innerHTML = '';
    const reversedRows = [...arizaRows].reverse();
    reversedRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.ariza_no}</td>
            <td>${new Date(row.tarih).toLocaleString('tr-TR')}</td>
            <td>${row.gpersonel}</td>
            <td>${row.bildirenAd}</td>
            <td>${row.telefon || '-'}</td>
            <td>${row.ariza_durumu || '-'}</td>
            <td>
                <button class="action-btn view" onclick="viewIssueDetail(${idx})"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" onclick="deleteIssue(${idx})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Detay modalı için arıza satırlarını globalde tut
    window._arizaRows = reversedRows;

    // Sayfa yüklenirken ve işlem sonrası çağır
    loadCozulenArizalar();
}

async function loadCozulenArizalar() {
    const { data: cozulenArizalar, error } = await supabase
        .from('cozulen_arizalar')
        .select('*')
        .order('cozulme_tarihi', { ascending: false });

    // Tüm cihaz tablolarını çek
    const tables = ['computers', 'laptops', 'screens', 'printers', 'scanners', 'segbis', 'tvs', 'microphones', 'cameras', 'e_durusma'];
    const allDeviceData = [];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (data) allDeviceData.push(...data);
    }

    const tbody = document.getElementById('solvedIssuesTableBody');
    tbody.innerHTML = '';
    if (cozulenArizalar) {
        window._cozulenArizaRows = cozulenArizalar;
        cozulenArizalar.forEach((row, idx) => {
            // Arızayı Bildiren Personel: cihaz tablosunda sicil_no eşleşirse adi_soyadi veya ad_soyad, yoksa sicil_no
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
                    <button class="action-btn view" onclick="viewSolvedIssueDetail(${idx})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" onclick="deleteSolvedIssue(${idx})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
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
                if (newStatus === 'Çözüldü') {
                    // localStorage'dan kullanıcı adını çek
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
                    await markAsResolvedAndRemove(editRow.ariza_no, currentUserName);
                    closeEditStatusModal();
                    closeIssueDetailModal();
                    return;
                }
                const { error } = await supabase
                    .from('ariza_bildirimleri')
                    .update({ ariza_durumu: newStatus })
                    .eq('ariza_no', editRow.ariza_no);
                if (!error) {
                    alert('Arıza durumu güncellendi!');
                    closeEditStatusModal();
                    closeIssueDetailModal();
                    loadArizaListesi();
                } else {
                    alert('Bir hata oluştu: ' + error.message);
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

// Arızayı çözüldü olarak işaretle ve üst tablodan sil
async function markAsResolvedAndRemove(arizaNo, currentUserName) {
    // 1. Arızayı bul
    const { data: ariza, error } = await supabase
        .from('ariza_bildirimleri')
        .select('*')
        .eq('ariza_no', arizaNo)
        .single();

    if (error || !ariza) {
        alert('Arıza bulunamadı!');
        return;
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
            ariza_durumu: 'Çözüldü',
            cozulme_tarihi: new Date().toISOString()
        }]);

    if (insertError) {
        alert('Çözülen arızalar tablosuna eklenemedi: ' + insertError.message);
        return;
    }

    // 3. ariza_bildirimleri tablosundan sil
    const { error: deleteError } = await supabase
        .from('ariza_bildirimleri')
        .delete()
        .eq('ariza_no', arizaNo);

    if (deleteError) {
        alert('Arıza üst tablodan silinemedi: ' + deleteError.message);
        return;
    }

    alert('Arıza çözüldü olarak kaydedildi ve üst tablodan silindi!');
    loadArizaListesi();
    loadCozulenArizalar();
}

// Çözülen arıza detay modalı aç
function viewSolvedIssueDetail(idx) {
    const row = window._cozulenArizaRows[idx];
    if (!row) return;
    document.getElementById('detailArizaNo').textContent = row.ariza_no || '-';
    document.getElementById('detailTarih').textContent = row.cozulme_tarihi ? new Date(row.cozulme_tarihi).toLocaleString('tr-TR') : '-';
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
                    alert('Arıza durumu güncellendi!');
                    closeEditStatusModal();
                    loadCozulenArizalar();
                } else {
                    alert('Bir hata oluştu: ' + error.message);
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
        alert('Çözülen arıza silindi!');
        loadCozulenArizalar();
    } else {
        alert('Bir hata oluştu: ' + error.message);
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
                alert('Arıza silindi!');
                loadArizaListesi();
            } else {
                alert('Bir hata oluştu: ' + (error.message || JSON.stringify(error)));
            }
        });
}
