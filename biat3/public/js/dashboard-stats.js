// Supabase client'ı kullan
var supabase = window.supabaseClient;

async function updateDashboardStats() {
    // Tarih aralıklarını hesapla
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
    // Son günü dinamik bul:
    const lastDayDate = new Date(year, month, 0); // 0. gün = önceki ayın son günü
    const lastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDayDate.getDate().toString().padStart(2, '0')}`;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevFirstDay = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
    const prevLastDayDate = new Date(prevYear, prevMonth, 0);
    const prevLastDay = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${prevLastDayDate.getDate().toString().padStart(2, '0')}`;

    // Cihaz tabloları
    const deviceTables = ['computers', 'segbis', 'screens', 'printers', 'scanners', 'tvs', 'cameras', 'microphones', 'e_durusma'];
    const devicePromises = deviceTables.map(table =>
        supabase.from(table).select('*').order('created_at', { ascending: false }).limit(3)
    );

    // Diğer tüm sorguları Promise olarak hazırla
    const promises = [
        supabase.from('mahkeme_kalemleri').select('id'),
        supabase.from('durusma_salonlari').select('id'),
        supabase.from('ariza_bildirimleri').select('ariza_no, ariza_durumu, tarih'),
        supabase.from('cozulen_arizalar').select('ariza_no, arizayi_cozen_personel, cozulme_tarihi'),
        // Bu ay ve geçen ay için arıza bildirimleri
        supabase.from('ariza_bildirimleri').select('id').filter('tarih', 'gte', firstDay).filter('tarih', 'lte', lastDay),
        supabase.from('ariza_bildirimleri').select('id').filter('tarih', 'gte', prevFirstDay).filter('tarih', 'lte', prevLastDay),
        // Bu ay ve geçen ay için çözülen arızalar
        supabase.from('cozulen_arizalar').select('id').filter('cozulme_tarihi', 'gte', firstDay).filter('cozulme_tarihi', 'lte', lastDay),
        supabase.from('cozulen_arizalar').select('id').filter('cozulme_tarihi', 'gte', prevFirstDay).filter('cozulme_tarihi', 'lte', prevLastDay),
        // Bekleyen arızalar
        supabase.from('ariza_bildirimleri')
            .select('id')
            .filter('tarih', 'gte', firstDay)
            .filter('tarih', 'lte', lastDay)
            .eq('ariza_durumu', 'Beklemede'),
        supabase.from('ariza_bildirimleri')
            .select('id')
            .filter('tarih', 'gte', prevFirstDay)
            .filter('tarih', 'lte', prevLastDay)
            .eq('ariza_durumu', 'Beklemede'),
        // İptal edilen arızalar
        supabase.from('ariza_bildirimleri')
            .select('id')
            .filter('tarih', 'gte', firstDay)
            .filter('tarih', 'lte', lastDay)
            .eq('ariza_durumu', 'İptal Edildi'),
        supabase.from('ariza_bildirimleri')
            .select('id')
            .filter('tarih', 'gte', prevFirstDay)
            .filter('tarih', 'lte', prevLastDay)
            .eq('ariza_durumu', 'İptal Edildi'),
        // İşlemde olan arızalar
        supabase.from('ariza_bildirimleri')
            .select('id')
            .filter('tarih', 'gte', firstDay)
            .filter('tarih', 'lte', lastDay)
            .eq('ariza_durumu', 'İşlemde'),
        supabase.from('ariza_bildirimleri')
            .select('id')
            .filter('tarih', 'gte', prevFirstDay)
            .filter('tarih', 'lte', prevLastDay)
            .eq('ariza_durumu', 'İşlemde'),
    ];

    // Hepsini paralel başlat
    const [
        { data: courts },
        { data: courtrooms },
        { data: arizalar },
        { data: cozulenArizalar },
        { data: thisMonthIssues },
        { data: prevMonthIssues },
        { data: thisMonthSolved },
        { data: prevMonthSolved },
        { data: thisMonthPending },
        { data: prevMonthPending },
        { data: thisMonthCancelledAriza },
        { data: prevMonthCancelledAriza },
        { data: thisMonthCancelledCozulen },
        { data: prevMonthCancelledCozulen },
        ...deviceResults
    ] = await Promise.all([...promises, ...devicePromises]);

    // Toplam Mahkeme
    document.getElementById('totalCourt').textContent = courts ? courts.length : 0;
    // Toplam Duruşma Salonu
    document.getElementById('totalCourtroom').textContent = courtrooms ? courtrooms.length : 0;
    // Aktif Arıza (Beklemede veya İşlemde)
    let activeCount = 0;
    if (arizalar) {
        activeCount = arizalar.filter(a => a.ariza_durumu === 'Beklemede' || a.ariza_durumu === 'İşlemde').length;
    }
    document.getElementById('activeIssue').textContent = activeCount;
    // Çözülen Arıza
    document.getElementById('solvedIssue').textContent = cozulenArizalar ? cozulenArizalar.length : 0;

    // Ayın Elemanı
    let mostPerson = null;
    if (cozulenArizalar && cozulenArizalar.length > 0) {
        const countMap = {};
        cozulenArizalar.forEach(row => {
            const name = row.arizayi_cozen_personel;
            if (name) countMap[name] = (countMap[name] || 0) + 1;
        });
        mostPerson = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    }
    if (mostPerson) {
        const { data: userList } = await supabase
            .from('users')
            .select('ad_soyad, sicil_no, foto_url')
            .ilike('ad_soyad', `%${mostPerson}%`);
        if (userList && userList.length > 0) {
            const user = userList[0];
            document.getElementById('employeeName').textContent = user.ad_soyad;
            document.getElementById('employeeSicil').textContent = user.sicil_no;
            document.getElementById('employeePhoto').src = user.foto_url || 'img/user.jpg';
        }
    }

    // Son Eklenen Cihazlar (tüm tablolardan topla)
    let allDevices = [];
    deviceResults.forEach(({ data }) => {
        if (data) allDevices.push(...data);
    });
    allDevices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const recentDevicesList = document.getElementById('recentDevicesList');
    recentDevicesList.innerHTML = '';
    const recentDevices = allDevices.slice(0, 3);
    recentDevices.forEach(device => {
        let marka = device.marka || device.kasa_marka || device.laptop_marka || device.monitor_marka || device.yazici_marka || device.tarayici_marka || device.tv_marka || device.kamera_marka || device.segbis_marka || device.mikrofon_marka || device.e_durusma_marka || '-';
        let model = device.model || device.kasa_model || device.laptop_model || device.monitor_model || device.yazici_model || device.tarayici_model || device.tv_model || device.kamera_model || device.segbis_model || device.mikrofon_model || device.e_durusma_model || '-';
        let seriNo = device.seri_no || device.kasa_seri_no || device.laptop_seri_no || device.monitor_seri_no || device.yazici_seri_no || device.tarayici_seri_no || device.tv_seri_no || device.kamera_seri_no || device.segbis_seri_no || device.mikrofon_seri_no || device.e_durusma_seri_no || '-';
        let createdAt = device.created_at ? new Date(device.created_at).toLocaleString('tr-TR') : '';
        let type = '-';
        if (device.kasa_marka || device.kasa_model) type = 'Bilgisayar';
        else if (device.laptop_marka || device.laptop_model) type = 'Laptop';
        else if (device.monitor_marka || device.monitor_model) type = 'Monitör';
        else if (device.yazici_marka || device.yazici_model) type = 'Yazıcı';
        else if (device.tarayici_marka || device.tarayici_model) type = 'Tarayıcı';
        else if (device.tv_marka || device.tv_model) type = 'Televizyon';
        else if (device.kamera_marka || device.kamera_model) type = 'Kamera';
        else if (device.segbis_marka || device.segbis_model) type = 'SEGBIS';
        else if (device.mikrofon_marka || device.mikrofon_model) type = 'Mikrofon';
        else if (device.e_durusma_marka || device.e_durusma_model) type = 'E-Duruşma';
        const card = document.createElement('div');
        card.className = 'last-device-card';
        card.innerHTML = `
            <div class="device-type">${type}</div>
            <div class="device-name">${marka} ${model}</div>
            <div class="device-serial">Seri No: ${seriNo}</div>
            <div class="device-date">${createdAt}</div>
        `;
        recentDevicesList.appendChild(card);
    });

    // === Ana Kartlar ===
    // Çözülen Arıza (ana kart): cozulen_arizalar tablosunda ariza_durumu == 'Çözüldü'
    const { data: solvedIssuesCard } = await supabase.from('cozulen_arizalar').select('id').eq('ariza_durumu', 'Çözüldü');
    const solvedCountCard = solvedIssuesCard?.length || 0;
    if (document.getElementById('solvedIssueCard')) {
        document.getElementById('solvedIssueCard').textContent = solvedCountCard;
    }
    // İşlemde (ana kart): ariza_bildirimleri tablosunda ariza_durumu == 'İşlemde'
    const { data: inProgressIssuesCard } = await supabase.from('ariza_bildirimleri').select('id').eq('ariza_durumu', 'İşlemde');
    const inProgressCountCard = inProgressIssuesCard?.length || 0;
    if (document.getElementById('inProgressIssueCard')) {
        document.getElementById('inProgressIssueCard').textContent = inProgressCountCard;
    }

    // === Aylık Özet (ÖZELLEŞTİRİLMİŞ) ===
    if (document.querySelector('.monthly-stats')) {
        // Çözülen: cozulen_arizalar tablosunda ariza_durumu == 'Çözüldü'
        const { data: solvedIssues } = await supabase.from('cozulen_arizalar').select('id').eq('ariza_durumu', 'Çözüldü');
        document.getElementById('solvedIssue').textContent = solvedIssues?.length || 0;

        // İptal Edilen: cozulen_arizalar tablosunda ariza_durumu == 'İptal Edildi' (büyük noktalı İ)
        const { data: canceledIssues } = await supabase.from('cozulen_arizalar').select('id').eq('ariza_durumu', 'İptal Edildi');
        document.getElementById('canceledIssue').textContent = canceledIssues?.length || 0;

        // Toplam Kayıt: cozulen_arizalar (ariza_durumu == 'Çözüldü' veya 'İptal Edildi') + ariza_bildirimleri (tüm kayıtlar)
        const { data: allArizaBildirimi } = await supabase.from('ariza_bildirimleri').select('id');
        const { data: solvedOrCanceled } = await supabase.from('cozulen_arizalar').select('id, ariza_durumu');
        const totalCozenOrCanceled = solvedOrCanceled?.filter(row => row.ariza_durumu === 'Çözüldü' || row.ariza_durumu === 'İptal Edildi').length || 0;
        const totalRecord = (allArizaBildirimi?.length || 0) + totalCozenOrCanceled;
        document.getElementById('totalRecord').textContent = totalRecord;

        // Bekleyen: ariza_bildirimleri tablosunda ariza_durumu == 'Beklemede'
        const { data: pendingIssues } = await supabase.from('ariza_bildirimleri').select('id').eq('ariza_durumu', 'Beklemede');
        document.getElementById('pendingIssue').textContent = pendingIssues?.length || 0;

        // İşlemde: ariza_bildirimleri tablosunda ariza_durumu == 'İşlemde'
        const { data: inProgressIssues } = await supabase.from('ariza_bildirimleri').select('id').eq('ariza_durumu', 'İşlemde');
        document.getElementById('inProgressIssue').textContent = inProgressIssues?.length || 0;
    }
}

document.addEventListener('DOMContentLoaded', updateDashboardStats); 