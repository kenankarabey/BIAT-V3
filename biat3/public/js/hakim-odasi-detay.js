;

// URL'den oda numarasını al
function getOdaNumarasi() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('oda')
}

// Oda detaylarını getir
async function getOdaDetaylari() {
    const odaNo = getOdaNumarasi()
    if (!odaNo) {
        console.error('Oda numarası bulunamadı')
        document.querySelector('.page-header h1').textContent = 'Oda Bulunamadı'
        document.querySelector('.oda-konum').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Oda numarası belirtilmemiş'
        return
    }

    try {
        console.log('Oda verisi çekiliyor:', odaNo)
        const { data, error } = await supabase
            .from('hakim_odalari')
            .select('*')
            .eq('oda_numarasi', odaNo)
            .single()

        console.log('Gelen veri:', data)
        console.log('Hata:', error)

        if (error) {
            throw error
        }

        if (data) {
            await displayOdaDetaylari(data)
        } else {
            document.querySelector('.page-header h1').textContent = 'Oda Bulunamadı'
            document.querySelector('.oda-konum').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Belirtilen oda numarasına ait kayıt bulunamadı'
        }
    } catch (error) {
        console.error('Veri çekme hatası:', error)
        document.querySelector('.page-header h1').textContent = 'Hata Oluştu'
        document.querySelector('.oda-konum').innerHTML = '<i class="fas fa-exclamation-circle"></i> Veriler yüklenirken bir hata oluştu'
    }
}

// Hakim detay HTML'ini oluştur
async function createHakimDetayHTML(adSoyad, birim, mahkemeNo) {
    console.log('Hakim detayları oluşturuluyor:', { adSoyad, birim, mahkemeNo });
    let birimText = mahkemeNo ? `${mahkemeNo} ${birim}` : `${birim}`;

    let kartlar = [];
    try {
        // Laptoplar
        const { data: laptops, error: laptopError } = await supabase
            .from('laptops')
            .select('*')
            .eq('adi_soyadi', adSoyad)
            .eq('birim', birim)
            .eq('mahkeme_no', mahkemeNo);
        
        console.log('Laptop verileri:', laptops);
        if (laptopError) console.error('Laptop veri çekme hatası:', laptopError);

        // Laptop kartları veya bulunamadı mesajı
        if (laptops && laptops.length > 0) {
            kartlar = kartlar.concat(laptops.map(laptop => {
                const laptopJson = encodeURIComponent(JSON.stringify(laptop));
                return `
                <div class="cihaz-kart">
                    <div class="cihaz-baslik">
                        <i class="fas fa-laptop"></i> Laptop
                        <i class="fas fa-info-circle cihaz-info" style="cursor:pointer;margin-left:8px;" title="Detay" onclick="showDeviceDetailsModalFromLaptop(decodeURIComponent('${laptopJson}'))"></i>
                    </div>
                    <div><b>Marka:</b> ${laptop.laptop_marka || '-'}</div>
                    <div><b>Model:</b> ${laptop.laptop_model || '-'}</div>
                    <div><b>Seri No:</b> ${laptop.laptop_seri_no || '-'}</div>
                </div>
                `;
            }));
        } else {
            kartlar.push(`
                <div class="cihaz-kart">
                    <div class="cihaz-baslik">
                        <i class="fas fa-laptop"></i> Laptop
                    </div>
                    <div style="padding:16px 0;"><b>Laptop bulunamadı.</b></div>
                </div>
            `);
        }

        // Monitörler
        try {
            console.log('Monitör verisi çekiliyor...');
            console.log('Sorgu parametreleri:', {
                tablo: 'screens',
                adi_soyadi: adSoyad,
                birim: birim,
                mahkeme_no: mahkemeNo
            });

            const { data: monitors, error: monitorError } = await supabase
                .from('screens')
                .select('*')
                .eq('adi_soyadi', adSoyad)
                .eq('birim', birim)
                .eq('mahkeme_no', mahkemeNo);
            
            if (monitorError) {
                console.error('Monitör veri çekme hatası detayı:', {
                    message: monitorError.message,
                    details: monitorError.details,
                    hint: monitorError.hint,
                    code: monitorError.code
                });
            } else {
                console.log('Monitör verileri başarıyla çekildi:', monitors);
            }

            // Monitör kartları veya bulunamadı mesajı
            if (monitors && monitors.length > 0) {
                kartlar = kartlar.concat(monitors.map(monitor => {
                    const monitorJson = encodeURIComponent(JSON.stringify(monitor));
                    return `
                    <div class="cihaz-kart">
                        <div class="cihaz-baslik">
                            <i class="fas fa-desktop"></i> Monitör
                            <i class="fas fa-info-circle cihaz-info" style="cursor:pointer;margin-left:8px;" title="Detay" onclick="showDeviceDetailsModalFromMonitor(decodeURIComponent('${monitorJson}'))"></i>
                        </div>
                        <div><b>Marka:</b> ${monitor.ekran_marka || '-'}</div>
                        <div><b>Model:</b> ${monitor.ekran_model || '-'}</div>
                        <div><b>Seri No:</b> ${monitor.ekran_seri_no || '-'}</div>
                    </div>
                    `;
                }));
            } else {
                kartlar.push(`
                    <div class="cihaz-kart">
                        <div class="cihaz-baslik">
                            <i class="fas fa-desktop"></i> Monitör
                        </div>
                        <div style="padding:16px 0;"><b>Monitör bulunamadı.</b></div>
                    </div>
                `);
            }
        } catch (e) {
            console.error('Monitör verisi çekilirken beklenmeyen hata:', e);
        }

        // Yazıcılar
        const { data: printers, error: printerError } = await supabase
            .from('printers')
            .select('*')
            .eq('adi_soyadi', adSoyad)
            .eq('birim', birim)
            .eq('mahkeme_no', mahkemeNo);
        
        console.log('Yazıcı verileri:', printers);
        if (printerError) console.error('Yazıcı veri çekme hatası:', printerError);

        // Yazıcı kartları veya bulunamadı mesajı
        if (printers && printers.length > 0) {
            kartlar = kartlar.concat(printers.map(printer => {
                const printerJson = encodeURIComponent(JSON.stringify(printer));
                return `
                <div class="cihaz-kart">
                    <div class="cihaz-baslik">
                        <i class="fas fa-print"></i> Yazıcı
                        <i class="fas fa-info-circle cihaz-info" style="cursor:pointer;margin-left:8px;" title="Detay" onclick="showDeviceDetailsModalFromPrinter(decodeURIComponent('${printerJson}'))"></i>
                    </div>
                    <div><b>Marka:</b> ${printer.yazici_marka || '-'}</div>
                    <div><b>Model:</b> ${printer.yazici_model || '-'}</div>
                    <div><b>Seri No:</b> ${printer.yazici_seri_no || '-'}</div>
                </div>
                `;
            }));
        } else {
            kartlar.push(`
                <div class="cihaz-kart">
                    <div class="cihaz-baslik">
                        <i class="fas fa-print"></i> Yazıcı
                    </div>
                    <div style="padding:16px 0;"><b>Yazıcı bulunamadı.</b></div>
                </div>
            `);
        }

        console.log('Toplam kart sayısı:', kartlar.length);
        if (kartlar.length > 0) {
            cihazlarHTML = kartlar.join('');
        } else {
            cihazlarHTML = '<div class="cihaz-kart">Cihaz bulunamadı.</div>';
        }
    } catch (e) {
        console.error('Cihaz verileri çekilirken hata oluştu:', e);
        cihazlarHTML = '<div class="cihaz-kart">Cihaz sorgulanamadı.</div>';
    }

    const hakimKartHTML = `
        <div class="hakim-kart-buyuk">
            <div class="hakim-kart-header">
                <h2>${adSoyad}</h2>
                <div class="hakim-birim">${birimText}</div>
            </div>
            <div class="cihazlar-grid">
                ${cihazlarHTML}
            </div>
        </div>
    `;
    console.log('Oluşturulan hakim kartı HTML:', hakimKartHTML);
    return hakimKartHTML;
}

// Oda detaylarını görüntüle
async function displayOdaDetaylari(oda) {
    console.log('Oda detayları görüntüleniyor:', oda);
    // Başlığı güncelle
    document.querySelector('.page-header h1').textContent = `${oda.oda_numarasi} Nolu Oda`;
    // Konum bilgisini güncelle
    document.querySelector('.oda-konum').innerHTML = `
        <i class="fas fa-map-marker-alt"></i>
        ${oda.blok} Blok, ${oda.kat}. Kat, ${oda.oda_numarasi} Nolu Oda
    `;
    // Hakim bilgilerini görüntüle
    const hakimlerContainer = document.querySelector('.hakimler-container');
    hakimlerContainer.innerHTML = '';
    
    // Hakim 1
    if (oda.hakim1_adisoyadi) {
        console.log('Hakim 1 için kart oluşturuluyor:', oda.hakim1_adisoyadi);
        hakimlerContainer.innerHTML += await createHakimDetayHTML(
            oda.hakim1_adisoyadi,
            oda.hakim1_birimi,
            oda.hakim1_mahkemeno
        );
    }
    // Hakim 2
    if (oda.hakim2_adisoyadi) {
        console.log('Hakim 2 için kart oluşturuluyor:', oda.hakim2_adisoyadi);
        hakimlerContainer.innerHTML += await createHakimDetayHTML(
            oda.hakim2_adisoyadi,
            oda.hakim2_birimi,
            oda.hakim2_mahkemeno
        );
    }
    // Hakim 3
    if (oda.hakim3_adisoyadi) {
        console.log('Hakim 3 için kart oluşturuluyor:', oda.hakim3_adisoyadi);
        hakimlerContainer.innerHTML += await createHakimDetayHTML(
            oda.hakim3_adisoyadi,
            oda.hakim3_birimi,
            oda.hakim3_mahkemeno
        );
    }
    // Eğer hiç hakim yoksa
    if (!oda.hakim1_adisoyadi && !oda.hakim2_adisoyadi && !oda.hakim3_adisoyadi) {
        hakimlerContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <p>Bu odaya henüz hakim atanmamış.</p>
            </div>
        `;
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sayfa yüklendi, veri çekme başlıyor...')
    getOdaDetaylari()
})

// Modal açma fonksiyonu (window'a ekle)
window.showDeviceDetailsModalFromLaptop = function(laptopStr) {
    let laptop;
    try {
        laptop = typeof laptopStr === 'string' ? JSON.parse(laptopStr) : laptopStr;
    } catch (e) {
        showNotification('Cihaz verisi okunamadı!', 'error');
        return;
    }
    fillDeviceDetailsModal({
        birim: laptop.birim,
        mahkeme_no: laptop.mahkeme_no,
        oda_tipi: laptop.oda_tipi,
        unvan: laptop.unvan,
        adi_soyadi: laptop.adi_soyadi,
        sicil_no: laptop.sicil_no,
        marka: laptop.laptop_marka,
        model: laptop.laptop_model,
        seri_no: laptop.laptop_seri_no,
        ilk_garanti_tarihi: laptop.ilk_garanti_tarihi,
        son_garanti_tarihi: laptop.son_garanti_tarihi,
        qr_kod: laptop.qr_kod,
        barkod: laptop.barkod
    });
};

window.showDeviceDetailsModalFromMonitor = function(monitorStr) {
    let monitor;
    try {
        monitor = typeof monitorStr === 'string' ? JSON.parse(monitorStr) : monitorStr;
    } catch (e) {
        showNotification('Cihaz verisi okunamadı!', 'error');
        return;
    }
    fillDeviceDetailsModal({
        birim: monitor.birim,
        mahkeme_no: monitor.mahkeme_no,
        oda_tipi: monitor.oda_tipi,
        unvan: monitor.unvan,
        adi_soyadi: monitor.adi_soyadi,
        sicil_no: monitor.sicil_no,
        marka: monitor.ekran_marka,
        model: monitor.ekran_model,
        seri_no: monitor.ekran_seri_no,
        ilk_garanti_tarihi: monitor.ilk_garanti_tarihi,
        son_garanti_tarihi: monitor.son_garanti_tarihi,
        qr_kod: monitor.qr_kod,
        barkod: monitor.barkod
    });
};

window.showDeviceDetailsModalFromPrinter = function(printerStr) {
    let printer;
    try {
        printer = typeof printerStr === 'string' ? JSON.parse(printerStr) : printerStr;
    } catch (e) {
        showNotification('Cihaz verisi okunamadı!', 'error');
        return;
    }
    fillDeviceDetailsModal({
        birim: printer.birim,
        mahkeme_no: printer.mahkeme_no,
        oda_tipi: printer.oda_tipi,
        unvan: printer.unvan,
        adi_soyadi: printer.adi_soyadi,
        sicil_no: printer.sicilno,
        marka: printer.yazici_marka,
        model: printer.yazici_model,
        seri_no: printer.yazici_seri_no,
        ilk_garanti_tarihi: printer.ilk_garanti_tarihi,
        son_garanti_tarihi: printer.son_garanti_tarihi,
        qr_kod: printer.qr_kod,
        barkod: printer.barkod
    });
};

function fillDeviceDetailsModal(details) {
    const modal = document.getElementById('deviceDetailsModal');
    if (!modal) {
        alert('Detay modalı bulunamadı!');
        return;
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    document.getElementById('detailUnit').textContent = details.birim || '';
    document.getElementById('detailMahkemeNo').textContent = details.mahkeme_no || '';
    document.getElementById('detailOdaTipi').textContent = details.oda_tipi || '';
    document.getElementById('detailUnvan').textContent = details.unvan || '';
    document.getElementById('detailAdSoyad').textContent = details.adi_soyadi || '';
    document.getElementById('detailSicilNo').textContent = details.sicil_no || '';
    document.getElementById('detailBrand').textContent = details.marka || '';
    document.getElementById('detailModel').textContent = details.model || '';
    document.getElementById('detailSerial').textContent = details.seri_no || '';
    document.getElementById('detailIlkGaranti').textContent = details.ilk_garanti_tarihi || '-';
    document.getElementById('detailSonGaranti').textContent = details.son_garanti_tarihi || '-';
    setTimeout(() => {
        // QR kodu
        if (window.qrcode && details.qr_kod) {
            document.getElementById('qrCode').innerHTML = '';
            const qr = window.qrcode(4, 'L');
            qr.addData(details.qr_kod);
            qr.make();
            document.getElementById('qrCode').innerHTML = qr.createImgTag(4);
        } else {
            document.getElementById('qrCode').innerHTML = '';
        }
        // Barkod
        if (window.JsBarcode && details.barkod) {
            document.getElementById('barcode').innerHTML = '<svg id="barcodeSvg"></svg>';
            JsBarcode("#barcodeSvg", details.barkod, {format: "CODE128"});
        } else {
            document.getElementById('barcode').innerHTML = '';
        }
    }, 50);
}