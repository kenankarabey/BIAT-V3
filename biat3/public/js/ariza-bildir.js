document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('issueForm');
    const locationSelect = document.getElementById('location');
    const subLocationSelect = document.getElementById('subLocation');
    const deviceTypeSelect = document.getElementById('deviceType');
    const deviceIdSelect = document.getElementById('deviceId');
    const contactPhoneInput = document.getElementById('contactPhone');
    
    // Form submit olayını dinle
    if (form) {
        form.addEventListener('submit', submitIssueForm);
    }
    
    // Location change handler
    locationSelect.addEventListener('change', function() {
        const location = this.value;
        updateSubLocations(location);
    });
    
    // Device selection handlers
    [locationSelect, subLocationSelect, deviceTypeSelect].forEach(select => {
        select.addEventListener('change', function() {
            if (locationSelect.value && subLocationSelect.value && deviceTypeSelect.value) {
                updateDevices(locationSelect.value, subLocationSelect.value, deviceTypeSelect.value);
            }
        });
    });
    
    // Phone number formatter
    contactPhoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 10) {
                value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '0($1) $2 $3 $4');
            }
            e.target.value = value;
        }
    });
    
    // Update sub-locations based on selected location
    function updateSubLocations(location) {
        subLocationSelect.innerHTML = '<option value="">Alt Lokasyon Seçiniz</option>';
        
        if (!location) return;
        
        // Mock data - Replace with API call in production
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
    
    // Update devices based on selected location and device type
    function updateDevices(location, subLocation, deviceType) {
        deviceIdSelect.innerHTML = '<option value="">Cihaz Seçiniz</option>';
        
        // Mock data - Replace with API call in production
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
    
    // File Upload Handling
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileUpload');
    const previewContainer = document.querySelector('.file-upload-preview');
    const maxFiles = 5;
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.classList.add('dragover');
    }
    
    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = Array.from(e.target.files);
        const currentFiles = previewContainer.querySelectorAll('.preview-item').length;
        
        if (currentFiles + files.length > maxFiles) {
            showNotification('error', `En fazla ${maxFiles} dosya yükleyebilirsiniz.`);
            return;
        }
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showNotification('error', `${file.name} bir resim dosyası değil.`);
                return;
            }
            
            if (file.size > maxFileSize) {
                showNotification('error', `${file.name} 5MB'dan büyük.`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = createPreviewItem(e.target.result, file.name);
                previewContainer.appendChild(preview);
                showNotification('success', `${file.name} başarıyla yüklendi.`);
            };
            reader.readAsDataURL(file);
        });
    }
    
    function createPreviewItem(src, fileName) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${src}" alt="${fileName}">
            <button type="button" class="remove-file" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        return div;
    }
    
    // Form Submission
    async function submitIssueForm(event) {
        event.preventDefault();
        
        if (!validateForm()) return;
        
        // Form verilerini al
        const formData = new FormData(event.target);
        const issue = {
            id: generateIssueId(),
            date: new Date().toISOString(),
            location: formData.get('location'),
            subLocation: formData.get('subLocation'),
            deviceType: formData.get('deviceType'),
            device: formData.get('device'),
            issueType: formData.get('issueType'),
            urgency: formData.get('urgency'),
            description: formData.get('description'),
            status: 'beklemede',
            files: [] // Dosya yükleme işlemi eklenecek
        };
        
        // LocalStorage'a kaydet
        let issues = JSON.parse(localStorage.getItem('issues')) || [];
        issues.push(issue);
        localStorage.setItem('issues', JSON.stringify(issues));
        
        // Yeni bildirim olarak işaretle
        let newIssues = JSON.parse(localStorage.getItem('newIssues')) || [];
        newIssues.push(issue.id);
        localStorage.setItem('newIssues', JSON.stringify(newIssues));
        
        const fileUploads = document.querySelectorAll('.preview-item img');
        
        // Add files to form data
        fileUploads.forEach((img, index) => {
            // Convert base64 to blob
            const blob = dataURLtoBlob(img.src);
            formData.append(`file${index}`, blob);
        });
        
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification('success', 'Arıza bildirimi başarıyla gönderildi.');
            event.target.reset();
            previewContainer.innerHTML = '';
            
        } catch (error) {
            showNotification('error', 'Bir hata oluştu. Lütfen tekrar deneyin.');
        }
        
        // Başarılı modalını göster
        showSuccessModal();
    }
    
    // Validate form
    function validateForm() {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                isValid = false;
                showError(input, 'Bu alan zorunludur');
            } else if (input.id === 'contactPhone' && input.value) {
                const phoneRegex = /^0\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    showError(input, 'Geçerli bir telefon numarası giriniz');
                } else {
                    clearError(input);
                }
            } else {
                clearError(input);
            }
        });

        if (!isValid) {
            showNotification('error', 'Lütfen tüm zorunlu alanları doldurunuz');
        }
        
        return isValid;
    }
    
    // Show error message
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const error = formGroup.querySelector('.error-message') || document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        
        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(error);
        }
        
        formGroup.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
    }
    
    // Clear error message
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const error = formGroup.querySelector('.error-message');
        
        if (error) {
            error.remove();
        }
        
        formGroup.classList.remove('error');
        input.removeAttribute('aria-invalid');
    }
    
    function dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }
    
    function showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Preview functionality
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const closeModalBtn = document.getElementById('closeModal');
    const editFormBtn = document.getElementById('editForm');
    const confirmSubmitBtn = document.getElementById('confirmSubmit');

    function showPreview() {
        // Get form values
        const location = document.getElementById('location').value;
        const subLocation = document.getElementById('subLocation').value;
        const deviceType = document.getElementById('deviceType').value;
        const deviceId = document.getElementById('deviceId').value;
        const issueType = document.getElementById('issueType').value;
        const urgencyLevel = document.getElementById('urgencyLevel').value;
        const description = document.getElementById('description').value;
        const contactName = document.getElementById('contactName').value;
        const contactPhone = document.getElementById('contactPhone').value;

        // Update preview content
        document.getElementById('previewLocation').textContent = locationSelect.options[locationSelect.selectedIndex].text;
        document.getElementById('previewSubLocation').textContent = subLocationSelect.options[subLocationSelect.selectedIndex].text;
        document.getElementById('previewDeviceType').textContent = deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text;
        document.getElementById('previewDeviceId').textContent = deviceIdSelect.options[deviceIdSelect.selectedIndex].text;
        document.getElementById('previewIssueType').textContent = document.getElementById('issueType').options[document.getElementById('issueType').selectedIndex].text;
        document.getElementById('previewUrgencyLevel').innerHTML = `<span class="urgency-badge ${urgencyLevel.toLowerCase()}">${document.getElementById('urgencyLevel').options[document.getElementById('urgencyLevel').selectedIndex].text}</span>`;
        document.getElementById('previewDescription').textContent = description;
        document.getElementById('previewContactName').textContent = contactName;
        document.getElementById('previewContactPhone').textContent = contactPhone;

        // Handle file previews
        const previewFiles = document.getElementById('previewFiles');
        previewFiles.innerHTML = '';
        const fileInput = document.getElementById('fileUpload');
        
        if (fileInput.files.length > 0) {
            Array.from(fileInput.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const div = document.createElement('div');
                        div.className = 'preview-file';
                        div.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
                        previewFiles.appendChild(div);
                    };
                    reader.readAsDataURL(file);
                } else {
                    const div = document.createElement('div');
                    div.className = 'preview-file';
                    div.innerHTML = `<div class="file-icon"><i class="fas fa-file"></i></div>
                                    <div class="file-name">${file.name}</div>`;
                    previewFiles.appendChild(div);
                }
            });
        } else {
            previewFiles.innerHTML = '<p>Dosya yüklenmedi</p>';
        }

        // Show modal
        previewModal.classList.add('show');
    }

    function hidePreview() {
        previewModal.classList.remove('show');
    }

    function validateAndSubmit() {
        if (validateForm()) {
            hidePreview();
            document.getElementById('issueForm').submit();
        }
    }

    // Event listeners
    previewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateForm(true)) {
            showPreview();
        }
    });

    closeModalBtn.addEventListener('click', hidePreview);
    editFormBtn.addEventListener('click', hidePreview);
    confirmSubmitBtn.addEventListener('click', validateAndSubmit);

    // Close modal when clicking outside
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            hidePreview();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewModal.classList.contains('show')) {
            hidePreview();
        }
    });
});

// Arıza ID'si oluştur
function generateIssueId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ARZ${year}${month}${day}${random}`;
}

// Başarılı modalını göster
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('show');
    
    // 3 saniye sonra modalı kapat
    setTimeout(() => {
        modal.classList.remove('show');
    }, 3000);
}