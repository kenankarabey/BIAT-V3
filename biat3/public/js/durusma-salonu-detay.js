// Supabase bağlantısı ve ekipman kartlarını dolduracak temel fonksiyonlar buraya gelecek.

const SUPABASE_URL = 'https://vpqcqsiglylfjauzzvuv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWNxc2lnbHlsZmphdXp6dnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNjc5MTUsImV4cCI6MjA2MTg0MzkxNX0.D-o_zWB5GoOfJLBtJ9ueeBCnp5fbr03wqTwrTC09Rmc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

async function loadCourtroomDetailAndEquipments() {
    const id = getQueryParam('id');
    if (!id) return;
    // 1. Duruşma salonu verisini çek
    const { data: salon, error: salonError } = await supabase
        .from('durusma_salonlari')
        .select('*')
        .eq('id', id)
        .single();
    console.log('Salon:', salon); // DEBUG
    const header = document.querySelector('.quick-info h1');
    if (salonError || !salon) {
        if (header) header.textContent = 'Salon bulunamadı';
        return;
    }
    if (header) header.textContent = `${salon.salon_no}. ${salon.mahkeme_turu}`;

    // Durum bilgisini göster
    const statusIndicator = document.querySelector('.quick-info .status-indicator');
    if (statusIndicator) {
        let durumText = salon.durum || '';
        let color = '#2ed573'; // Aktif
        if (durumText === 'Bakımda') color = '#ffe066';
        if (durumText === 'Arızalı') color = '#ff6b6b';
        statusIndicator.innerHTML = `<span class="status-dot" style="background:${color}"></span><span class="status-text">${durumText}</span>`;
    }

    // 2. Tüm ekipmanları çek
    const [computersRes, monitorsRes, printersRes, segbisRes, edurusmaRes, tvsRes, microphonesRes, camerasRes] = await Promise.all([
        supabase.from('computers').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString()),
        supabase.from('screens').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString()),
        supabase.from('printers').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString()),
        supabase.from('segbis').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString()),
        supabase.from('e_durusma').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString()),
        supabase.from('tvs').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString()),
        supabase.from('microphones').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString()),
        supabase.from('cameras').select('*').eq('oda_tipi', 'durusma_salonu').eq('birim', salon.mahkeme_turu).eq('mahkeme_no', salon.salon_no.toString())
    ]);
    const computers = !computersRes.error && Array.isArray(computersRes.data) ? computersRes.data : [];
    const monitors = !monitorsRes.error && Array.isArray(monitorsRes.data) ? monitorsRes.data : [];
    const printers = !printersRes.error && Array.isArray(printersRes.data) ? printersRes.data : [];
    const segbis = !segbisRes.error && Array.isArray(segbisRes.data) ? segbisRes.data : [];
    const edurusma = !edurusmaRes.error && Array.isArray(edurusmaRes.data) ? edurusmaRes.data : [];
    const tvs = !tvsRes.error && Array.isArray(tvsRes.data) ? tvsRes.data : [];
    const microphones = !microphonesRes.error && Array.isArray(microphonesRes.data) ? microphonesRes.data : [];
    const cameras = !camerasRes.error && Array.isArray(camerasRes.data) ? camerasRes.data : [];

    // 3. Ekipmanları hazırla ve render et
    renderEquipmentCards({
        kasa: computers,
        monitor: monitors,
        yazici: printers,
        segbis: segbis,
        edurusma: edurusma,
        tv: tvs,
        mikrofon: microphones,
        kamera: cameras
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadCourtroomDetailAndEquipments();

    // Tema değişikliğinde info ikonlarının rengini güncelle
    document.addEventListener('click', function(e) {
        if (e.target.closest('.toggle-theme')) {
            setTimeout(() => {
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                const infoIconColor = isLight ? '#161a4a' : '#fff';
                document.querySelectorAll('.equipment-info-icon').forEach(icon => {
                    icon.style.color = infoIconColor;
                });
            }, 100);
        }
    });
});

function renderEquipmentCards(equipments) {
    const grid = document.getElementById('hardwareEquipmentsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const types = [
        { key: 'kasa', label: 'Kasa', icon: 'fa-desktop', marka: 'kasa_marka', model: 'kasa_model', seri: 'kasa_seri_no' },
        { key: 'monitor', label: 'Monitör', icon: 'fa-tv', marka: 'ekran_marka', model: 'ekran_model', seri: 'ekran_seri_no' },
        { key: 'yazici', label: 'Yazıcı', icon: 'fa-print', marka: 'yazici_marka', model: 'yazici_model', seri: 'yazici_seri_no' },
        { key: 'segbis', label: 'SEGBİS', icon: 'fa-video', marka: 'segbis_marka', model: 'segbis_model', seri: 'segbis_seri_no' },
        { key: 'edurusma', label: 'E-Duruşma', icon: 'fa-globe', marka: 'edurusma_marka', model: 'edurusma_model', seri: 'edurusma_seri_no' },
        { key: 'tv', label: 'TV', icon: 'fa-tv', marka: 'tv_marka', model: 'tv_model', seri: 'tv_seri_no' },
        { key: 'mikrofon', label: 'Mikrofon', icon: 'fa-microphone', marka: 'mikrofon_marka', model: 'mikrofon_model', seri: 'mikrofon_seri_no' },
        { key: 'kamera', label: 'Kamera', icon: 'fa-camera', marka: 'kamera_marka', model: 'kamera_model', seri: 'kamera_seri_no' }
    ];
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const infoIconColor = isLight ? '#161a4a' : '#fff';
    types.forEach(type => {
        const items = equipments[type.key] || [];
        const card = document.createElement('div');
        card.className = 'equipment-card';
        card.innerHTML = `
            <div class="equipment-header">
                <i class="fas ${type.icon}"></i>
                <span>${type.label}</span>
            </div>
            <div class="equipment-list">
                ${items.length === 0 ? `<div class="equipment-item empty">Kayıt yok</div>` : items.map((eq, idx) => `
                    <div class="equipment-item" style="position:relative;">
                        <strong>${eq[type.marka] || ''} ${eq[type.model] || ''}</strong>
                        ${eq[type.seri] ? `<div class=\"equipment-detail\">Seri No: ${eq[type.seri]}</div>` : ''}
                        <i class=\"fas fa-info-circle equipment-info-icon\" style=\"position:absolute;top:8px;right:12px;cursor:pointer;color:${infoIconColor};z-index:2;\" data-index='${idx}'></i>
                    </div>
                `).join('')}
            </div>
        `;
        grid.appendChild(card);
        // Info ikonlarına event ekle (tüm türler için)
        setTimeout(() => {
            card.querySelectorAll('.equipment-info-icon').forEach((icon, idx) => {
                icon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const eq = items[idx];
                    showDeviceDetailsModal(eq);
                });
            });
        }, 0);
    });
}

function showDeviceDetailsModal(device) {
    // Ortak alanlar
    document.getElementById('detailUnit').textContent = device.birim || '-';
    document.getElementById('detailMahkemeNo').textContent = device.mahkeme_no || '-';
    document.getElementById('detailOdaTipi').textContent = device.oda_tipi || '-';
    // Marka, model, seri no (tüm türler için)
    document.getElementById('detailBrand').textContent = device.kasa_marka || device.ekran_marka || device.yazici_marka || device.segbis_marka || device.edurusma_marka || device.tv_marka || device.mikrofon_marka || device.kamera_marka || '-';
    document.getElementById('detailModel').textContent = device.kasa_model || device.ekran_model || device.yazici_model || device.segbis_model || device.edurusma_model || device.tv_model || device.mikrofon_model || device.kamera_model || '-';
    document.getElementById('detailSerial').textContent = device.kasa_seri_no || device.ekran_seri_no || device.yazici_seri_no || device.segbis_seri_no || device.edurusma_seri_no || device.tv_seri_no || device.mikrofon_seri_no || device.kamera_seri_no || '-';
    document.getElementById('detailIlkGaranti').textContent = device.ilk_garanti_tarihi ? new Date(device.ilk_garanti_tarihi).toLocaleDateString('tr-TR') : '-';
    document.getElementById('detailSonGaranti').textContent = device.son_garanti_tarihi ? new Date(device.son_garanti_tarihi).toLocaleDateString('tr-TR') : '-';
    // Personel bilgileri (varsa)
    document.getElementById('detailUnvan').textContent = device.unvan || '-';
    document.getElementById('detailAdSoyad').textContent = device.adi_soyadi || '-';
    document.getElementById('detailSicilNo').textContent = device.sicil_no || '-';
    document.getElementById('detailUnvanRow').style.display = device.unvan ? '' : 'none';
    document.getElementById('detailAdSoyadRow').style.display = device.adi_soyadi ? '' : 'none';
    document.getElementById('detailSicilNoRow').style.display = device.sicil_no ? '' : 'none';
    // Temizlik tarihleri (varsa)
    document.getElementById('detailIlkTemizlik').textContent = device.ilk_temizlik_tarihi ? new Date(device.ilk_temizlik_tarihi).toLocaleDateString('tr-TR') : '-';
    document.getElementById('detailSonTemizlik').textContent = device.son_temizlik_tarihi ? new Date(device.son_temizlik_tarihi).toLocaleDateString('tr-TR') : '-';
    document.getElementById('detailIlkTemizlikRow').style.display = device.ilk_temizlik_tarihi ? '' : 'none';
    document.getElementById('detailSonTemizlikRow').style.display = device.son_temizlik_tarihi ? '' : 'none';
    // QR ve barkod
    document.getElementById('qrCode').innerHTML = '';
    document.getElementById('barcode').innerHTML = '';
    if (device.qr_kod && window.QRCode) {
        new window.QRCode(document.getElementById('qrCode'), {
            text: device.qr_kod,
            width: 128,
            height: 128
        });
    }
    if (device.barkod && window.JsBarcode) {
        document.getElementById('barcode').innerHTML = '<svg id="barcodeSvg"></svg>';
        window.JsBarcode("#barcodeSvg", device.barkod, {format: "CODE128"});
    }
    // Modalı aç
    document.getElementById('deviceDetailsModal').classList.add('show');
}

function closeDetailsModal() {
    document.getElementById('deviceDetailsModal').classList.remove('show');
} 