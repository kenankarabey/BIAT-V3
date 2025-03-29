document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('issueForm');
    const locationSelect = document.getElementById('location');
    const subLocationSelect = document.getElementById('subLocation');
    const deviceTypeSelect = document.getElementById('deviceType');
    const deviceIdSelect = document.getElementById('deviceId');
    const contactPhoneInput = document.getElementById('contactPhone');
    const fileUpload = document.getElementById('fileUpload');
    const filePreview = document.querySelector('.file-upload-preview');
    const previewModal = document.getElementById('previewModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const selectedFiles = new Set();

    // Lokasyon değiştiğinde alt lokasyonları güncelle
    locationSelect.addEventListener('change', function() {
        const location = this.value;
        updateSubLocations(location);
    });

    // Lokasyon ve cihaz türü değiştiğinde cihaz listesini güncelle
    [locationSelect, subLocationSelect, deviceTypeSelect].forEach(select => {
        select.addEventListener('change', function() {
            if (locationSelect.value && subLocationSelect.value && deviceTypeSelect.value) {
                updateDevices(locationSelect.value, subLocationSelect.value, deviceTypeSelect.value);
            }
        });
    });

    // Telefon numarası formatını düzenle
    contactPhoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 10) {
                value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '0($1) $2 $3 $4');
            }
            e.target.value = value;
        }
    });

    // Dosya yükleme işlemi
    fileUpload.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        if (selectedFiles.size + files.length > 5) {
            showErrorMessage('En fazla 5 dosya yükleyebilirsiniz.');
            return;
        }

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                showErrorMessage(`${file.name} dosyası 5MB'dan büyük.`);
                return;
            }

            if (!file.type.startsWith('image/')) {
                showErrorMessage(`${file.name} bir resim dosyası değil.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button type="button" class="remove-file" data-name="${file.name}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                filePreview.appendChild(previewItem);
                selectedFiles.add(file);
            };
            reader.readAsDataURL(file);
        });
    });

    // Dosya kaldırma işlemi
    filePreview.addEventListener('click', function(e) {
        if (e.target.closest('.remove-file')) {
            const fileName = e.target.closest('.remove-file').dataset.name;
            e.target.closest('.preview-item').remove();
            selectedFiles.forEach(file => {
                if (file.name === fileName) {
                    selectedFiles.delete(file);
                }
            });
        }
    });

    // Modal kapatma
    closeModalBtn.addEventListener('click', closePreview);

    // Önizleme modalını kapat
    function closePreview() {
        previewModal.classList.remove('show');
    }

    // Form önizleme
    window.previewForm = function() {
        if (!validateForm()) return;

        const formData = new FormData(form);
        const previewContent = document.getElementById('previewContent');
        
        const urgencyLabels = {
            'low': 'Düşük',
            'medium': 'Orta',
            'high': 'Yüksek',
            'critical': 'Kritik'
        };

        let previewHTML = '<div class="preview-content">';
        
        // Lokasyon bilgileri
        previewHTML += `
            <div class="preview-group">
                <div class="preview-label">Lokasyon</div>
                <div class="preview-value">${locationSelect.options[locationSelect.selectedIndex].text}</div>
            </div>
            <div class="preview-group">
                <div class="preview-label">Alt Lokasyon</div>
                <div class="preview-value">${subLocationSelect.options[subLocationSelect.selectedIndex].text}</div>
            </div>
        `;

        // Cihaz bilgileri
        previewHTML += `
            <div class="preview-group">
                <div class="preview-label">Cihaz Türü</div>
                <div class="preview-value">${deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text}</div>
            </div>
            <div class="preview-group">
                <div class="preview-label">Cihaz No</div>
                <div class="preview-value">${deviceIdSelect.options[deviceIdSelect.selectedIndex].text}</div>
            </div>
        `;

        // Arıza bilgileri
        const urgencyLevel = formData.get('urgencyLevel');
        previewHTML += `
            <div class="preview-group">
                <div class="preview-label">Arıza Türü</div>
                <div class="preview-value">${document.getElementById('issueType').options[document.getElementById('issueType').selectedIndex].text}</div>
            </div>
            <div class="preview-group">
                <div class="preview-label">Aciliyet Seviyesi</div>
                <div class="preview-value">
                    <span class="urgency-badge ${urgencyLevel}">${urgencyLabels[urgencyLevel]}</span>
                </div>
            </div>
        `;

        // Tahmini süre
        const estimatedTime = formData.get('estimatedTime');
        if (estimatedTime) {
            const hours = Math.floor(estimatedTime / 60);
            const minutes = estimatedTime % 60;
            const timeText = hours > 0 ? 
                `${hours} saat${minutes > 0 ? ` ${minutes} dakika` : ''}` : 
                `${minutes} dakika`;
            
            previewHTML += `
                <div class="preview-group">
                    <div class="preview-label">Tahmini Süre</div>
                    <div class="preview-value">${timeText}</div>
                </div>
            `;
        }

        // Açıklama
        previewHTML += `
            <div class="preview-group">
                <div class="preview-label">Arıza Açıklaması</div>
                <div class="preview-value">${formData.get('description')}</div>
            </div>
        `;

        // Dosyalar
        if (selectedFiles.size > 0) {
            previewHTML += `
                <div class="preview-group">
                    <div class="preview-label">Ekli Dosyalar</div>
                    <div class="preview-files">
                        ${Array.from(selectedFiles).map(file => `
                            <div class="preview-file">
                                <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // İletişim bilgileri
        previewHTML += `
            <div class="preview-group">
                <div class="preview-label">İletişim Bilgileri</div>
                <div class="preview-value">
                    ${formData.get('contactName')} - ${formData.get('contactPhone')}
                </div>
            </div>
        `;

        previewHTML += '</div>';
        previewContent.innerHTML = previewHTML;
        previewModal.classList.add('show');
    };

    // Form gönderme
    window.submitForm = async function() {
        const formData = new FormData(form);
        selectedFiles.forEach(file => {
            formData.append('files[]', file);
        });

        try {
            // API çağrısı yapılacak
            console.log('Form data:', Object.fromEntries(formData.entries()));
            showSuccessMessage('Arıza bildirimi başarıyla oluşturuldu.');
            form.reset();
            filePreview.innerHTML = '';
            selectedFiles.clear();
            closePreview();
        } catch (error) {
            showErrorMessage('Arıza bildirimi oluşturulurken bir hata oluştu.');
        }
    };

    // Form validasyonu
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, 'Bu alan zorunludur');
                isValid = false;
            } else {
                removeFieldError(field);
            }
        });

        return isValid;
    }

    // Alt lokasyonları güncelle
    function updateSubLocations(location) {
        subLocationSelect.innerHTML = '<option value="">Alt Lokasyon Seçiniz</option>';
        
        if (!location) return;

        // Örnek veri - API'den gelecek
        const subLocations = {
            'mahkeme-kalemi': ['1. Asliye Hukuk Mahkemesi', '2. Asliye Hukuk Mahkemesi', '3. Asliye Hukuk Mahkemesi'],
            'durusma-salonu': ['Duruşma Salonu 1', 'Duruşma Salonu 2', 'Duruşma Salonu 3'],
            'hakim-odasi': ['Hakim Odası 1', 'Hakim Odası 2', 'Hakim Odası 3']
        };

        subLocations[location].forEach(subLoc => {
            const option = document.createElement('option');
            option.value = subLoc.toLowerCase().replace(/\s+/g, '-');
            option.textContent = subLoc;
            subLocationSelect.appendChild(option);
        });
    }

    // Cihazları güncelle
    function updateDevices(location, subLocation, deviceType) {
        deviceIdSelect.innerHTML = '<option value="">Cihaz Seçiniz</option>';
        
        // Örnek veri - API'den gelecek
        const devices = [
            { id: 'PC001', name: 'Bilgisayar 001' },
            { id: 'PC002', name: 'Bilgisayar 002' },
            { id: 'PR001', name: 'Yazıcı 001' }
        ];

        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            deviceIdSelect.appendChild(option);
        });
    }

    // Hata mesajı göster
    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        
        let errorMessage = formGroup.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            formGroup.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
    }

    // Hata mesajını kaldır
    function removeFieldError(field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Başarı mesajı göster
    function showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `<i class="fas fa-check-circle"></i>${message}`;
        
        form.insertBefore(successMessage, form.firstChild);
        
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }

    // Hata mesajı göster
    function showErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.padding = '1rem';
        errorMessage.style.marginBottom = '1rem';
        errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        
        form.insertBefore(errorMessage, form.firstChild);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }
}); 