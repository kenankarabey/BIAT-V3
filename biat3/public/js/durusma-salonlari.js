// Duruşma salonları verilerini tutacak array
let durusmaSalonlari = [];
let currentStep = 1;
const totalSteps = 7;

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded'); // Debug log
    setupEventListeners();
    loadDurusmaSalonlari();
    setupStepperForm();
    updateStats();
});

// Event listener'ları ayarla
function setupEventListeners() {
    console.log('Setting up event listeners...'); // Debug log

    const addButton = document.getElementById('addDurusmaSalonuBtn');
    const modal = document.getElementById('durusmaSalonuModal');
    const form = document.getElementById('durusmaSalonuForm');
    const closeButtons = document.querySelectorAll('.close-modal');

    console.log('Elements:', { 
        addButton: addButton ? 'Found' : 'Not found', 
        modal: modal ? 'Found' : 'Not found',
        form: form ? 'Found' : 'Not found'
    }); // Debug log

    // Duruşma salonu ekle butonuna tıklandığında
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add button clicked'); // Debug log
            if (modal) {
                modal.classList.add('show');
                currentStep = 1;
                goToStep(1);
                if (form) {
                    form.reset();
                    // Yeni salon için form submit handler'ı
                    form.onsubmit = (e) => {
                        e.preventDefault();
                        if (validateCurrentStep()) {
                            saveDurusmaSalonu();
                        }
                    };
                }
            }
        });
    }

    // Modal kapatma butonlarına tıklandığında
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) {
                modal.classList.remove('show');
                if (form) {
                    form.reset();
                    currentStep = 1;
                    goToStep(1);
                }
            }
        });
    });

    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            if (form) {
                form.reset();
                currentStep = 1;
                goToStep(1);
            }
        }
    });
}

// Stepper form ayarları
function setupStepperForm() {
    console.log('Setting up stepper form...'); // Debug log
    const nextButton = document.getElementById('nextStep');
    const prevButton = document.getElementById('prevStep');
    const saveButton = document.getElementById('saveForm');
    const monitorCountInput = document.querySelector('.monitor-count');

    console.log('Stepper buttons:', { 
        nextButton: nextButton ? 'Found' : 'Not found',
        prevButton: prevButton ? 'Found' : 'Not found',
        saveButton: saveButton ? 'Found' : 'Not found'
    }); // Debug log

    // Monitör sayısı değiştiğinde detay alanlarını güncelle
    if (monitorCountInput) {
        monitorCountInput.addEventListener('change', (e) => {
            const count = parseInt(e.target.value) || 0;
            updateMonitorDetails(count);
        });
    }

    // İleri butonu
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            console.log('Next button clicked, current step:', currentStep); // Debug log
            if (validateCurrentStep()) {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            }
        });
    }

    // Geri butonu
    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission
            console.log('Previous button clicked, current step:', currentStep); // Debug log
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    }
}

// Adım geçişlerini yönet
function goToStep(step) {
    console.log('Going to step:', step); // Debug log

    if (step < 1 || step > totalSteps) {
        console.error('Invalid step number:', step);
        return;
    }

    if (step > currentStep && !validateCurrentStep()) {
        console.error('Validation failed for current step');
        return;
    }

    // Tüm step içeriklerini gizle
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Tüm step göstergelerini pasif yap
    document.querySelectorAll('.step').forEach(indicator => {
        indicator.classList.remove('active');
    });

    // Yeni adımı aktif et
    const nextStepContent = document.querySelector(`.step-content[data-step="${step}"]`);
    const nextStepIndicator = document.querySelector(`.step[data-step="${step}"]`);

    if (!nextStepContent || !nextStepIndicator) {
        console.error('Step elements not found:', {
            content: nextStepContent ? 'Found' : 'Not found',
            indicator: nextStepIndicator ? 'Found' : 'Not found'
        });
        return;
    }

    nextStepContent.classList.add('active');
    nextStepIndicator.classList.add('active');

    currentStep = step;

    // Butonları güncelle
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const saveButton = document.getElementById('saveForm');

    if (prevButton) prevButton.style.display = currentStep === 1 ? 'none' : 'inline-block';
    if (nextButton) nextButton.style.display = currentStep === totalSteps ? 'none' : 'inline-block';
    if (saveButton) saveButton.style.display = currentStep === totalSteps ? 'inline-block' : 'none';

    console.log('Step transition completed to step:', currentStep);
}

// Mevcut adımı doğrula
function validateCurrentStep() {
    console.log('Validating step:', currentStep); // Debug log
    const currentStepContent = document.querySelector(`.step-content[data-step="${currentStep}"]`);
    
    if (!currentStepContent) {
        console.error('Current step content not found for step:', currentStep);
        return false;
    }

    // İlk adımda salon numarası ve konum zorunlu
    if (currentStep === 1) {
        const salonNo = document.querySelector('[name="salonNo"]').value.trim();
        const konum = document.querySelector('[name="konum"]').value.trim();
        
        console.log('Step 1 validation - Salon No:', salonNo, 'Konum:', konum);
        
        if (!salonNo || !konum) {
            console.error('Required fields are empty in step 1');
            return false;
        }
        return true;
    }

    // Diğer adımlar için minimum validasyon
    const requiredFields = currentStepContent.querySelectorAll('[required]');
    console.log('Required fields found:', requiredFields.length);
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            console.error('Empty required field:', field.name);
        } else {
            field.classList.remove('error');
        }
    });

    console.log('Step validation result:', isValid);
    return true; // Sadece ilk adım için zorunlu alan kontrolü yapıyoruz
}

// Monitör detaylarını güncelle
function updateMonitorDetails(count) {
    const container = document.getElementById('monitorDetails');
    if (!container) return;

    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        container.innerHTML += `
            <div class="monitor-item">
                <h4>${i}. Monitör</h4>
                <div class="form-group">
                    <label for="monitor${i}Marka">Marka</label>
                    <input type="text" name="monitor${i}Marka" placeholder="Marka giriniz">
                </div>
                <div class="form-group">
                    <label for="monitor${i}Model">Model</label>
                    <input type="text" name="monitor${i}Model" placeholder="Model giriniz">
                </div>
                <div class="form-group">
                    <label for="monitor${i}SeriNo">Seri No</label>
                    <input type="text" name="monitor${i}SeriNo" placeholder="Seri no giriniz">
                </div>
            </div>
        `;
    }
}

// Duruşma salonlarını yükle
function loadDurusmaSalonlari() {
    const savedData = localStorage.getItem('durusmaSalonlari');
    if (savedData) {
        durusmaSalonlari = JSON.parse(savedData);
    }
    renderDurusmaSalonlari();
}

// Duruşma salonunu kaydet
function saveDurusmaSalonu() {
    const form = document.getElementById('durusmaSalonuForm');
    if (!form) return;

    // Monitör detaylarını topla
    const monitorCount = parseInt(form.querySelector('[name="monitorCount"]').value) || 0;
    const monitors = [];
    for (let i = 1; i <= monitorCount; i++) {
        monitors.push({
            marka: form.querySelector(`[name="monitor${i}Marka"]`)?.value || '',
            model: form.querySelector(`[name="monitor${i}Model"]`)?.value || '',
            seriNo: form.querySelector(`[name="monitor${i}SeriNo"]`)?.value || ''
        });
    }

    const yeniSalon = {
        id: Date.now().toString(),
        salonNo: form.querySelector('[name="salonNo"]').value,
        mahkemeTuru: form.querySelector('[name="mahkemeTuru"]').value,
        displayName: `${form.querySelector('[name="salonNo"]').value}. ${form.querySelector('[name="mahkemeTuru"]').value}`,
        konum: form.querySelector('[name="konum"]').value,
        status: form.querySelector('[name="status"]').value || 'active',
        devices: {
            monitors: monitors,
            segbis: {
                marka: form.querySelector('[name="segbisMarka"]').value,
                model: form.querySelector('[name="segbisModel"]').value,
                seriNo: form.querySelector('[name="segbisSeriNo"]').value
            },
            camera: {
                marka: form.querySelector('[name="kameraMarka"]').value,
                model: form.querySelector('[name="kameraModel"]').value,
                seriNo: form.querySelector('[name="kameraSeriNo"]').value
            },
            tv: {
                marka: form.querySelector('[name="tvMarka"]').value,
                model: form.querySelector('[name="tvModel"]').value,
                seriNo: form.querySelector('[name="tvSeriNo"]').value
            },
            mikrofon: {
                marka: form.querySelector('[name="mikrofonMarka"]').value,
                model: form.querySelector('[name="mikrofonModel"]').value,
                seriNo: form.querySelector('[name="mikrofonSeriNo"]').value
            },
            pc: {
                marka: form.querySelector('[name="pcMarka"]').value,
                model: form.querySelector('[name="pcModel"]').value,
                seriNo: form.querySelector('[name="pcSeriNo"]').value
            }
        },
        createdAt: new Date().toISOString()
    };

    durusmaSalonlari.push(yeniSalon);
    localStorage.setItem('durusmaSalonlari', JSON.stringify(durusmaSalonlari));
    
    renderDurusmaSalonlari();
    updateStats();
    const modal = document.getElementById('durusmaSalonuModal');
    if (modal) {
        modal.classList.remove('show');
    }
    form.reset();
    currentStep = 1;
    goToStep(1);
}

// Duruşma salonunu sil
function deleteDurusmaSalonu(id) {
    if (confirm('Bu duruşma salonunu silmek istediğinize emin misiniz?')) {
        durusmaSalonlari = durusmaSalonlari.filter(salon => salon.id !== id);
        localStorage.setItem('durusmaSalonlari', JSON.stringify(durusmaSalonlari));
        renderDurusmaSalonlari();
    }
}

// Duruşma salonunu düzenle
function editDurusmaSalonu(id) {
    const salon = durusmaSalonlari.find(s => s.id === id);
    if (!salon) return;

    const form = document.getElementById('durusmaSalonuForm');
    const modal = document.getElementById('durusmaSalonuModal');
    
    if (!form || !modal) {
        console.error('Form or modal not found');
        return;
    }

    // Safely set form values
    const setFieldValue = (name, value) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field) field.value = value;
    };

    // Set basic information (Step 1)
    setFieldValue('salonNo', salon.salonNo);
    setFieldValue('mahkemeTuru', salon.mahkemeTuru);
    setFieldValue('konum', salon.konum);
    setFieldValue('status', salon.status || 'active');

    // Set monitor count and trigger detail fields (Step 2)
    const monitorCount = salon.devices?.monitors?.length || 0;
    setFieldValue('monitorCount', monitorCount);
    updateMonitorDetails(monitorCount);

    // After monitor details are created, set their values
    if (monitorCount > 0 && salon.devices?.monitors) {
        salon.devices.monitors.forEach((monitor, index) => {
            setFieldValue(`monitor${index + 1}Marka`, monitor.marka);
            setFieldValue(`monitor${index + 1}Model`, monitor.model);
            setFieldValue(`monitor${index + 1}SeriNo`, monitor.seriNo);
        });
    }

    // Set other device details (Steps 3-7)
    if (salon.devices?.segbis) {
        setFieldValue('segbisMarka', salon.devices.segbis.marka);
        setFieldValue('segbisModel', salon.devices.segbis.model);
        setFieldValue('segbisSeriNo', salon.devices.segbis.seriNo);
    }

    if (salon.devices?.camera) {
        setFieldValue('kameraMarka', salon.devices.camera.marka);
        setFieldValue('kameraModel', salon.devices.camera.model);
        setFieldValue('kameraSeriNo', salon.devices.camera.seriNo);
    }

    if (salon.devices?.tv) {
        setFieldValue('tvMarka', salon.devices.tv.marka);
        setFieldValue('tvModel', salon.devices.tv.model);
        setFieldValue('tvSeriNo', salon.devices.tv.seriNo);
    }

    if (salon.devices?.mikrofon) {
        setFieldValue('mikrofonMarka', salon.devices.mikrofon.marka);
        setFieldValue('mikrofonModel', salon.devices.mikrofon.model);
        setFieldValue('mikrofonSeriNo', salon.devices.mikrofon.seriNo);
    }

    if (salon.devices?.pc) {
        setFieldValue('pcMarka', salon.devices.pc.marka);
        setFieldValue('pcModel', salon.devices.pc.model);
        setFieldValue('pcSeriNo', salon.devices.pc.seriNo);
    }

    // Reset to first step
    currentStep = 1;
    goToStep(1);

    // Düzenleme için form submit handler'ı
    form.onsubmit = (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) return;

        // Update salon object with new values
        const updatedSalon = {
            ...salon,
            salonNo: form.querySelector('[name="salonNo"]')?.value || salon.salonNo,
            mahkemeTuru: form.querySelector('[name="mahkemeTuru"]')?.value || salon.mahkemeTuru,
            displayName: `${form.querySelector('[name="salonNo"]')?.value || salon.salonNo}. ${form.querySelector('[name="mahkemeTuru"]')?.value || salon.mahkemeTuru}`,
            konum: form.querySelector('[name="konum"]')?.value || salon.konum,
            status: form.querySelector('[name="status"]')?.value || 'active',
            devices: {
                monitors: [],
                segbis: {
                    marka: form.querySelector('[name="segbisMarka"]')?.value || '',
                    model: form.querySelector('[name="segbisModel"]')?.value || '',
                    seriNo: form.querySelector('[name="segbisSeriNo"]')?.value || ''
                },
                camera: {
                    marka: form.querySelector('[name="kameraMarka"]')?.value || '',
                    model: form.querySelector('[name="kameraModel"]')?.value || '',
                    seriNo: form.querySelector('[name="kameraSeriNo"]')?.value || ''
                },
                tv: {
                    marka: form.querySelector('[name="tvMarka"]')?.value || '',
                    model: form.querySelector('[name="tvModel"]')?.value || '',
                    seriNo: form.querySelector('[name="tvSeriNo"]')?.value || ''
                },
                mikrofon: {
                    marka: form.querySelector('[name="mikrofonMarka"]')?.value || '',
                    model: form.querySelector('[name="mikrofonModel"]')?.value || '',
                    seriNo: form.querySelector('[name="mikrofonSeriNo"]')?.value || ''
                },
                pc: {
                    marka: form.querySelector('[name="pcMarka"]')?.value || '',
                    model: form.querySelector('[name="pcModel"]')?.value || '',
                    seriNo: form.querySelector('[name="pcSeriNo"]')?.value || ''
                }
            }
        };

        // Update monitors array
        const monitorCount = parseInt(form.querySelector('[name="monitorCount"]')?.value) || 0;
        for (let i = 1; i <= monitorCount; i++) {
            updatedSalon.devices.monitors.push({
                marka: form.querySelector(`[name="monitor${i}Marka"]`)?.value || '',
                model: form.querySelector(`[name="monitor${i}Model"]`)?.value || '',
                seriNo: form.querySelector(`[name="monitor${i}SeriNo"]`)?.value || ''
            });
        }

        // Güncellenen salonu dizide bul ve güncelle
        const index = durusmaSalonlari.findIndex(s => s.id === salon.id);
        if (index !== -1) {
            durusmaSalonlari[index] = updatedSalon;
            localStorage.setItem('durusmaSalonlari', JSON.stringify(durusmaSalonlari));
            renderDurusmaSalonlari();
            updateStats();
        }

        modal.classList.remove('show');
        form.reset();
        currentStep = 1;
        goToStep(1);
    };

    modal.classList.add('show');
}

// Duruşma salonlarını görüntüle
function renderDurusmaSalonlari() {
    console.log('Rendering courtrooms:', durusmaSalonlari);
    const container = document.getElementById('durusmaSalonlariGrid');
    if (!container) return;
    
    container.innerHTML = '';

    if (!durusmaSalonlari || durusmaSalonlari.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>Henüz duruşma salonu eklenmemiş.</p>
            </div>
        `;
        updateStats();
        return;
    }

    durusmaSalonlari.forEach(salon => {
        // Null check for devices and monitors
        const monitorCount = salon.devices?.monitors?.length || 0;
        const card = document.createElement('div');
        card.className = `court-office-card ${salon.status || 'active'}`;
        card.innerHTML = `
            <div class="card-header">
                <h3>${salon.displayName || `${salon.salonNo} Nolu Duruşma Salonu`}</h3>
                <div class="status-badge ${salon.status || 'active'}">
                    ${getStatusText(salon.status)}
                </div>
                <div class="card-actions">
                    <button class="btn-icon edit" onclick="editDurusmaSalonu('${salon.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteDurusmaSalonu('${salon.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="info-row">
                <i class="fas fa-map-marker-alt"></i>
                ${salon.konum}
            </div>
            <div class="device-stats">
                <div class="device-stat">
                    <i class="fas fa-desktop"></i>
                    <span>${monitorCount}</span>
                    <small>Monitör</small>
                </div>
                <div class="device-stat">
                    <i class="fas fa-video"></i>
                    <span>${salon.devices?.segbis?.marka ? '1' : '0'}</span>
                    <small>SEGBİS</small>
                </div>
                <div class="device-stat">
                    <i class="fas fa-camera"></i>
                    <span>${salon.devices?.camera?.marka ? '1' : '0'}</span>
                    <small>Kamera</small>
                </div>
                <div class="device-stat">
                    <i class="fas fa-tv"></i>
                    <span>${salon.devices?.tv?.marka ? '1' : '0'}</span>
                    <small>TV</small>
                </div>
                <div class="device-stat">
                    <i class="fas fa-microphone"></i>
                    <span>${salon.devices?.mikrofon?.marka ? '1' : '0'}</span>
                    <small>Mikrofon</small>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    updateStats();
}

// İstatistikleri güncelle
function updateStats() {
    const stats = {
        active: 0,
        issue: 0,
        maintenance: 0,
        totalDevices: 0
    };

    durusmaSalonlari.forEach(salon => {
        // Durum sayılarını güncelle
        if (salon.status === 'active') stats.active++;
        if (salon.status === 'issue') stats.issue++;
        if (salon.status === 'maintenance') stats.maintenance++;

        // Toplam cihaz sayısını hesapla
        const devices = salon.devices;
        stats.totalDevices += devices.monitors?.length || 0;  // Monitörler
        if (devices.segbis?.marka) stats.totalDevices++;     // SEGBİS
        if (devices.camera?.marka) stats.totalDevices++;     // Kamera
        if (devices.tv?.marka) stats.totalDevices++;         // TV
        if (devices.mikrofon?.marka) stats.totalDevices++;   // Mikrofon
        if (devices.pc?.marka) stats.totalDevices++;         // Bilgisayar
    });

    // İstatistikleri DOM'a yaz
    document.getElementById('activeCourtroomsCount').textContent = stats.active;
    document.getElementById('issuesCourtroomsCount').textContent = stats.issue;
    document.getElementById('maintenanceCourtroomsCount').textContent = stats.maintenance;
    document.getElementById('totalDevicesCount').textContent = stats.totalDevices;
}

// Durum metnini getir
function getStatusText(status) {
    switch (status) {
        case 'active':
            return 'Aktif';
        case 'issue':
            return 'Arızalı';
        case 'maintenance':
            return 'Bakımda';
        default:
            return 'Belirsiz';
    }
} 