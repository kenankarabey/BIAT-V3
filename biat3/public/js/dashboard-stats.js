// Supabase client'ı kullan
const supabase = window.supabaseClient;

async function updateDashboardStats() {
    // Tarih aralıklarını hesapla
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = `${year}-${month.toString().padStart(2, '0')}-31`;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevFirstDay = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
    const prevLastDay = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-31`;

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
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', firstDay).lte('tarih', lastDay),
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', prevFirstDay).lte('tarih', prevLastDay),
        supabase.from('cozulen_arizalar').select('id').gte('cozulme_tarihi', firstDay).lte('cozulme_tarihi', lastDay),
        supabase.from('cozulen_arizalar').select('id').gte('cozulme_tarihi', prevFirstDay).lte('cozulme_tarihi', prevLastDay),
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', firstDay).lte('tarih', lastDay).eq('ariza_durumu', 'Beklemede'),
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', prevFirstDay).lte('tarih', prevLastDay).eq('ariza_durumu', 'Beklemede'),
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', firstDay).lte('tarih', lastDay).eq('ariza_durumu', 'İptal Edildi'),
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', prevFirstDay).lte('tarih', prevLastDay).eq('ariza_durumu', 'İptal Edildi'),
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', firstDay).lte('tarih', lastDay).eq('ariza_durumu', 'İşlemde'),
        supabase.from('ariza_bildirimleri').select('id').gte('tarih', prevFirstDay).lte('tarih', prevLastDay).eq('ariza_durumu', 'İşlemde'),
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

    // === Aylık Özet ===
    function calcPercentChange(current, previous) {
      if (!previous) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(1);
    }
    if (document.querySelector('.monthly-stats')) {
      // Toplam Kayıt: Bu ay açılan ariza_bildirimleri + bu ay çözülen cozulen_arizalar
      const totalThisMonth = (thisMonthIssues?.length || 0) + (thisMonthSolved?.length || 0);
      const totalPrevMonth = (prevMonthIssues?.length || 0) + (prevMonthSolved?.length || 0);
      document.querySelector('.monthly-stat-item:nth-child(1) .stat-value').textContent = totalThisMonth;
      // Çözülen
      document.querySelector('.monthly-stat-item:nth-child(2) .stat-value').textContent = thisMonthSolved?.length || 0;
      // Bekleyen
      document.querySelector('.monthly-stat-item:nth-child(3) .stat-value').textContent = thisMonthPending?.length || 0;
      // İşlemde (her iki tablonun toplamı)
      const { data: thisMonthInProgressAriza } = await supabase
        .from('ariza_bildirimleri')
        .select('id')
        .gte('tarih', firstDay)
        .lte('tarih', lastDay)
        .eq('ariza_durumu', 'İşlemde');
      const { data: prevMonthInProgressAriza } = await supabase
        .from('ariza_bildirimleri')
        .select('id')
        .gte('tarih', prevFirstDay)
        .lte('tarih', prevLastDay)
        .eq('ariza_durumu', 'İşlemde');
      const { data: thisMonthInProgressCozulen } = await supabase
        .from('cozulen_arizalar')
        .select('id')
        .gte('cozulme_tarihi', firstDay)
        .lte('cozulme_tarihi', lastDay)
        .eq('ariza_durumu', 'İşlemde');
      const { data: prevMonthInProgressCozulen } = await supabase
        .from('cozulen_arizalar')
        .select('id')
        .gte('cozulme_tarihi', prevFirstDay)
        .lte('cozulme_tarihi', prevLastDay)
        .eq('ariza_durumu', 'İşlemde');
      const totalThisMonthInProgress = (thisMonthInProgressAriza?.length || 0) + (thisMonthInProgressCozulen?.length || 0);
      const totalPrevMonthInProgress = (prevMonthInProgressAriza?.length || 0) + (prevMonthInProgressCozulen?.length || 0);
      document.querySelector('.monthly-stat-item:nth-child(4) .stat-value').textContent = totalThisMonthInProgress;
      // İptal Edilen (her iki tablonun toplamı, alan adı kesin)
      const totalThisMonthCancelled = (thisMonthCancelledAriza?.length || 0) + (thisMonthCancelledCozulen?.length || 0);
      const totalPrevMonthCancelled = (prevMonthCancelledAriza?.length || 0) + (prevMonthCancelledCozulen?.length || 0);
      document.querySelector('.monthly-stat-item:nth-child(5) .stat-value').textContent = totalThisMonthCancelled;
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      document.querySelector('.stat-detail-header .date-range').textContent = `${monthNames[month-1]} ${year}`;
    }
}

document.addEventListener('DOMContentLoaded', updateDashboardStats); 