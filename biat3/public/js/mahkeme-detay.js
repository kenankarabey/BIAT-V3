// mahkeme-detay.js

document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    // Mahkeme kaydını çek
    const { data, error } = await supabase
        .from('mahkeme_kalemleri')
        .select('*')
        .eq('id', id)
        .single();
    if (error || !data) return;

    // Info kartlarını doldur
    const infoCardsRow = document.querySelector('.info-cards-row');
    if (infoCardsRow) {
        infoCardsRow.innerHTML = `
            <div class="info-mini-card"><i class="fas fa-gavel"></i><div class="info-label">Mahkeme Türü</div><div class="info-value">${data.mahkeme_turu || '-'}</div></div>
            <div class="info-mini-card"><i class="fas fa-hashtag"></i><div class="info-label">Mahkeme No</div><div class="info-value">${data.mahkeme_no || '-'}</div></div>
            <div class="info-mini-card"><i class="fas fa-user-tie"></i><div class="info-label">Hakim</div><div class="info-value">${data.mahkeme_hakimi || '-'}</div></div>
            <div class="info-mini-card"><i class="fas fa-building"></i><div class="info-label">Blok</div><div class="info-value">${data.blok || '-'}</div></div>
            <div class="info-mini-card"><i class="fas fa-layer-group"></i><div class="info-label">Kat</div><div class="info-value">${data.kat || '-'}</div></div>
        `;
    }

    // Mahkeme adını başlığa yaz
    const mahkemeAdi = document.getElementById('mahkemeAdi');
    if (mahkemeAdi) {
        mahkemeAdi.textContent = `${data.mahkeme_no || ''}. ${data.mahkeme_turu || ''} Mahkemesi`;
    }

    // Genel bilgiler bölümünü doldur
    const genelBilgi = document.querySelector('.section-content');
    if (genelBilgi) {
        genelBilgi.innerHTML = `
            <ul class="detail-list">
                <li><b>Mahkeme Türü:</b> ${data.mahkeme_turu || '-'}</li>
                <li><b>Mahkeme No:</b> ${data.mahkeme_no || '-'}</li>
                <li><b>Hakim:</b> ${data.mahkeme_hakimi || '-'}</li>
                <li><b>Blok:</b> ${data.blok || '-'}</li>
                <li><b>Kat:</b> ${data.kat || '-'}</li>
            </ul>
        `;
    }

    // Genel bilgiler düzenleme butonuna tıklama olayı ekle
    const editButton = document.querySelector('.section-actions .btn-icon');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // Düzenleme modalını aç
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Genel Bilgileri Düzenle</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editGeneralInfoForm">
                            <div class="form-group">
                                <label for="editMahkemeTuru">Mahkeme Türü</label>
                                <input type="text" id="editMahkemeTuru" value="${data.mahkeme_turu || ''}" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="editMahkemeNo">Mahkeme No</label>
                                <input type="text" id="editMahkemeNo" value="${data.mahkeme_no || ''}" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="editHakim">Hakim</label>
                                <input type="text" id="editHakim" value="${data.mahkeme_hakimi || ''}" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="editBlok">Blok</label>
                                <input type="text" id="editBlok" value="${data.blok || ''}" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="editKat">Kat</label>
                                <input type="text" id="editKat" value="${data.kat || ''}" class="form-control">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary close-modal">İptal</button>
                        <button class="btn btn-primary" id="saveGeneralInfo">Kaydet</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.classList.add('show');

            // Modal kapatma işlemleri
            const closeButtons = modal.querySelectorAll('.close-modal');
            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    modal.remove();
                });
            });

            // Kaydet butonuna tıklama olayı
            const saveButton = modal.querySelector('#saveGeneralInfo');
            saveButton.addEventListener('click', async function() {
                const updatedData = {
                    mahkeme_turu: document.getElementById('editMahkemeTuru').value,
                    mahkeme_no: document.getElementById('editMahkemeNo').value,
                    mahkeme_hakimi: document.getElementById('editHakim').value,
                    blok: document.getElementById('editBlok').value,
                    kat: document.getElementById('editKat').value
                };

                // Supabase'de güncelleme yap
                const { error } = await supabase
                    .from('mahkeme_kalemleri')
                    .update(updatedData)
                    .eq('id', id);

                if (error) {
                    console.error('Güncelleme hatası:', error);
                    alert('Güncelleme sırasında bir hata oluştu!');
                    return;
                }

                // Başarılı güncelleme sonrası sayfayı yenile
                location.reload();
            });
        });
    }

    // === Personel ===
    // Tüm tablolardan personel verilerini çek
    const [personnelComputers, personnelScreens, personnelScanners, personnelPrinters] = await Promise.all([
        supabase.from('computers').select('adi_soyadi, sicil_no, unvan').eq('birim', data.birim || data.mahkeme_turu).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no),
        supabase.from('screens').select('adi_soyadi, sicil_no, unvan').eq('birim', data.birim || data.mahkeme_turu).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no),
        supabase.from('scanners').select('adi_soyadi, sicil_no, unvan').eq('birim', data.birim || data.mahkeme_turu).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no),
        supabase.from('printers').select('adi_soyadi, sicil_no, unvan').eq('birim', data.birim || data.mahkeme_turu).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no)
    ]);

    // Tüm personel verilerini birleştir ve tekrarları kaldır
    const allPersonnel = [
        ...(personnelComputers.data || []),
        ...(personnelScreens.data || []),
        ...(personnelScanners.data || []),
        ...(personnelPrinters.data || [])
    ].filter((person, index, self) =>
        index === self.findIndex((p) => 
            p.sicil_no === person.sicil_no && 
            p.adi_soyadi === person.adi_soyadi
        )
    );

    // Personel gridini doldur
    const personnelGrid = document.querySelector('.personnel-grid');
    if (personnelGrid) {
        if (allPersonnel.length === 0) {
            personnelGrid.innerHTML = '<div style="color: #888;">Bu mahkemede personel bulunamadı.</div>';
        } else {
            personnelGrid.innerHTML = allPersonnel.map(person => `
                <div class="personnel-card">
                    <div><b>Adı Soyadı:</b> ${person.adi_soyadi || '-'}</div>
                    <div><b>Sicil No:</b> ${person.sicil_no || '-'}</div>
                    <div><b>Unvan:</b> ${person.unvan || '-'}</div>
                </div>
            `).join('');
        }
    }

    // === Cihazlar ===
    // Mahkemenin birimi (ör: "Sulh Hukuk Mahkemesi")
    const mahkemeBirim = data.birim || data.mahkeme_turu;
    // Cihazları çek
    const [computersRes, screensRes, scannersRes, printersRes] = await Promise.all([
        supabase.from('computers').select('*').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no),
        supabase.from('screens').select('*').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no),
        supabase.from('scanners').select('*').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no),
        supabase.from('printers').select('*').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', data.mahkeme_no)
    ]);
    console.log('Mahkeme birim:', mahkemeBirim, 'Mahkeme no:', data.mahkeme_no);
    console.log('Computers:', computersRes.data);
    console.log('Screens:', screensRes.data);
    console.log('Scanners:', scannersRes.data);
    console.log('Printers:', printersRes.data);
    const allDevices = [
        ...(computersRes.data || []),
        ...(screensRes.data || []),
        ...(scannersRes.data || []),
        ...(printersRes.data || [])
    ];
    // Cihazlar gridini doldur
    const devicesGrid = document.querySelector('.devices-grid');
    if (devicesGrid) {
        if (allDevices.length === 0) {
            devicesGrid.innerHTML = '<div style="color: #888;">Bu mahkemeye ait cihaz bulunamadı.</div>';
        } else {
            devicesGrid.innerHTML = allDevices.map((device, idx) => `
                <div class="device-card" style="position:relative;">
                    <span class="device-info-icon" data-device-idx="${idx}">
                        <i class="fas fa-info-circle"></i>
                    </span>
                    <div><b>Marka:</b> ${device.kasa_marka || device.laptop_marka || device.ekran_marka || device.tarayici_marka || device.yazici_marka || '-'}</div>
                    <div><b>Model:</b> ${device.kasa_model || device.laptop_model || device.ekran_model || device.tarayici_model || device.yazici_model || '-'}</div>
                    <div><b>Seri No:</b> ${device.kasa_seri_no || device.laptop_seri_no || device.ekran_seri_no || device.tarayici_seri_no || device.yazici_seri_no || '-'}</div>
                </div>
            `).join('');
            // Info ikonlarına tıklama eventi ekle
            devicesGrid.querySelectorAll('.device-info-icon').forEach(icon => {
                icon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const idx = this.getAttribute('data-device-idx');
                    showDeviceDetailsModal(allDevices[idx]);
                });
            });
        }
    }
});

// Modalı doldurup açan fonksiyon
function showDeviceDetailsModal(device) {
    // Cihaz tipini belirle
    const deviceType = device.kasa_marka ? 'computer' : 
                      device.laptop_marka ? 'laptop' : 
                      device.ekran_marka ? 'screen' : 
                      device.tarayici_marka ? 'scanner' : 
                      device.yazici_marka ? 'printer' : 'unknown';

    // Modal içeriğine cihaz tipi sınıfını ekle
    const modalBody = document.querySelector('.modal-body');
    modalBody.className = 'modal-body device-type-' + deviceType;

    // Sadece bilgisayar ve ekran için personel bilgilerini göster
    if (deviceType === 'computer' || deviceType === 'laptop' || deviceType === 'screen') {
        document.getElementById('detailUnvan').textContent = device.unvan || '-';
        document.getElementById('detailAdSoyad').textContent = device.adi_soyadi || '-';
        document.getElementById('detailSicilNo').textContent = device.sicil_no || '-';
        document.getElementById('detailIlkTemizlik').textContent = device.ilk_temizlik_tarihi || '-';
        document.getElementById('detailSonTemizlik').textContent = device.son_temizlik_tarihi || '-';
    } else {
        // Yazıcı ve tarayıcı için bu alanları gizle
        document.getElementById('detailUnvan').textContent = '-';
        document.getElementById('detailAdSoyad').textContent = '-';
        document.getElementById('detailSicilNo').textContent = '-';
        document.getElementById('detailIlkTemizlik').textContent = '-';
        document.getElementById('detailSonTemizlik').textContent = '-';
    }

    document.getElementById('detailMahkemeNo').textContent = device.mahkeme_no || '-';
    document.getElementById('detailUnit').textContent = device.birim || '-';
    document.getElementById('detailOdaTipi').textContent = device.oda_tipi || '-';
    document.getElementById('detailIlkGaranti').textContent = device.ilk_garanti_tarihi || '-';
    document.getElementById('detailSonGaranti').textContent = device.son_garanti_tarihi || '-';
    document.getElementById('detailBrand').textContent = device.kasa_marka || device.laptop_marka || device.ekran_marka || device.tarayici_marka || device.yazici_marka || '-';
    document.getElementById('detailModel').textContent = device.kasa_model || device.laptop_model || device.ekran_model || device.tarayici_model || device.yazici_model || '-';
    document.getElementById('detailSerial').textContent = device.kasa_seri_no || device.laptop_seri_no || device.ekran_seri_no || device.tarayici_seri_no || device.yazici_seri_no || '-';
    
    // QR ve Barkod alanlarını temizle
    document.getElementById('qrCode').innerHTML = '';
    document.getElementById('barcode').innerHTML = '';
    
    // QR Kod oluştur
    if (device.qr_kod) {
        new QRCode(document.getElementById('qrCode'), {
            text: device.qr_kod,
            width: 128,
            height: 128
        });
    }
    
    // Barkod oluştur
    if (device.barkod) {
        console.log('Barkod değeri:', device.barkod);
        const barcodeContainer = document.getElementById('barcode');
        barcodeContainer.innerHTML = '';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'barcode-svg');
        barcodeContainer.appendChild(svg);
        
        console.log('SVG oluşturuldu:', svg);
        
        try {
            JsBarcode(svg, device.barkod, {
                format: 'CODE128',
                width: 2,
                height: 40,
                displayValue: true,
                margin: 10
            });
            console.log('Barkod oluşturuldu');
        } catch (error) {
            console.error('Barkod oluşturma hatası:', error);
        }
    }
    
    document.getElementById('deviceDetailsModal').classList.add('show');
}

// Modalı kapatan fonksiyon
function closeDetailsModal() {
    document.getElementById('deviceDetailsModal').classList.remove('show');
} 