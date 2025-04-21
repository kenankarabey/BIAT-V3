// Chamber Modal Functions
document.addEventListener('DOMContentLoaded', function() {
    // Add Chamber Button Click
    const addNewChamberBtn = document.getElementById('addNewChamber');
    if (addNewChamberBtn) {
        addNewChamberBtn.addEventListener('click', openChamberModal);
    }

    // Add Judge Button Click
    const addJudgeBtn = document.getElementById('addJudgeBtn');
    if (addJudgeBtn) {
        addJudgeBtn.addEventListener('click', addJudgeField);
    }
    
    // Initialize delete button listeners
    initDeleteButtons();
    
    // Setup filters
    setupChamberFilters();
});

// Initialize delete buttons
function initDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-judge');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const judgeEntry = btn.closest('.judge-entry');
            if (judgeEntry) {
                removeJudgeField(judgeEntry);
            }
        });
    });
}

// Open Chamber Modal
function openChamberModal() {
    const modal = document.getElementById('addChamberModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Close Chamber Modal
function closeChamberModal() {
    const modal = document.getElementById('addChamberModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('chamberForm').reset();
        resetJudgesContainer();
    }
}

// Reset Judges Container
function resetJudgesContainer() {
    const container = document.getElementById('judges-container');
    container.innerHTML = `
        <div class="judge-entry">
            <div class="form-row">
                <div class="form-column">
                    <label for="judgeName0">Hakim Adı</label>
                    <input type="text" id="judgeName0" class="judge-name" required>
                </div>
                <div class="form-column">
                    <label for="judgeCourt0">Mahkeme</label>
                    <select id="judgeCourt0" class="judge-court" required>
                        <option value="">Seçiniz</option>
                        <option value="Ağır Ceza">Ağır Ceza</option>
                        <option value="Asliye Ceza">Asliye Ceza</option>
                        <option value="Asliye Hukuk">Asliye Hukuk</option>
                        <option value="Sulh Ceza">Sulh Ceza</option>
                        <option value="Sulh Hukuk">Sulh Hukuk</option>
                        <option value="İcra">İcra</option>
                        <option value="İş">İş</option>
                        <option value="Ticaret">Ticaret</option>
                        <option value="Çocuk">Çocuk</option>
                        <option value="Tüketici">Tüketici</option>
                    </select>
                </div>
                <div class="form-column">
                    <label for="judgeCourtNumber0">Mahkeme No</label>
                    <input type="number" id="judgeCourtNumber0" class="judge-court-number" min="1" required>
                </div>
                <div class="form-action">
                    <button type="button" class="btn-icon delete-judge" style="visibility: hidden;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Add Judge Field
function addJudgeField() {
    const container = document.getElementById('judges-container');
    const judgeEntries = container.querySelectorAll('.judge-entry');
    const index = judgeEntries.length;
    
    // Enable delete button on all entries
    judgeEntries.forEach(entry => {
        const deleteBtn = entry.querySelector('.delete-judge');
        if (deleteBtn) {
            deleteBtn.style.visibility = 'visible';
        }
    });
    
    // Create new judge entry
    const newEntry = document.createElement('div');
    newEntry.className = 'judge-entry';
    newEntry.innerHTML = `
        <div class="form-row">
            <div class="form-column">
                <label for="judgeName${index}">Hakim Adı</label>
                <input type="text" id="judgeName${index}" class="judge-name" required>
            </div>
            <div class="form-column">
                <label for="judgeCourt${index}">Mahkeme</label>
                <select id="judgeCourt${index}" class="judge-court" required>
                    <option value="">Seçiniz</option>
                    <option value="Ağır Ceza">Ağır Ceza</option>
                    <option value="Asliye Ceza">Asliye Ceza</option>
                    <option value="Asliye Hukuk">Asliye Hukuk</option>
                    <option value="Sulh Ceza">Sulh Ceza</option>
                    <option value="Sulh Hukuk">Sulh Hukuk</option>
                    <option value="İcra">İcra</option>
                    <option value="İş">İş</option>
                    <option value="Ticaret">Ticaret</option>
                    <option value="Çocuk">Çocuk</option>
                    <option value="Tüketici">Tüketici</option>
                </select>
            </div>
            <div class="form-column">
                <label for="judgeCourtNumber${index}">Mahkeme No</label>
                <input type="number" id="judgeCourtNumber${index}" class="judge-court-number" min="1" required>
            </div>
            <div class="form-action">
                <button type="button" class="btn-icon delete-judge">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(newEntry);
    
    // Add event listener for delete button
    const deleteBtn = newEntry.querySelector('.delete-judge');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            removeJudgeField(newEntry);
        });
    }
}

// Remove Judge Field
function removeJudgeField(entry) {
    const container = document.getElementById('judges-container');
    container.removeChild(entry);
    
    // If only one entry left, hide its delete button
    const judgeEntries = container.querySelectorAll('.judge-entry');
    if (judgeEntries.length === 1) {
        const deleteBtn = judgeEntries[0].querySelector('.delete-judge');
        if (deleteBtn) {
            deleteBtn.style.visibility = 'hidden';
        }
    }
}

// Save Chamber
function saveChamber() {
    const form = document.getElementById('chamberForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const roomNumber = document.getElementById('roomNumber').value;
    const block = document.getElementById('block').value;
    const floor = document.getElementById('floor').value;
    const status = document.getElementById('status').value;
    
    // Get all judges
    const judgeEntries = document.querySelectorAll('.judge-entry');
    const judges = [];
    
    judgeEntries.forEach(entry => {
        const nameInput = entry.querySelector('.judge-name');
        const courtSelect = entry.querySelector('.judge-court');
        const courtNumberInput = entry.querySelector('.judge-court-number');
        
        if (nameInput && nameInput.value && 
            courtSelect && courtSelect.value && 
            courtNumberInput && courtNumberInput.value) {
            judges.push({
                name: nameInput.value,
                court: courtSelect.value,
                courtNumber: courtNumberInput.value
            });
        }
    });
    
    // Create the card
    const chambersContainer = document.getElementById('chambersContainer');
    
    // Use first judge as primary for the card display
    const primaryJudge = judges[0];
    
    // Create a new card element
    const newCard = document.createElement('a');
    newCard.className = 'chamber-card';
    newCard.href = `hakim-odasi-detay.html?id=new`;
    
    // Status class
    let statusClass = 'active';
    let statusText = 'Aktif';
    
    if (status === 'maintenance') {
        statusClass = 'maintenance';
        statusText = 'Bakımda';
    } else if (status === 'issue') {
        statusClass = 'issue';
        statusText = 'Arıza Var';
    }
    
    // Display the court name with number
    const judgeCourt = `${primaryJudge.courtNumber}. ${primaryJudge.court} ${primaryJudge.court === 'Ağır Ceza' ? 'Başkanlığı' : 'Mahkemesi'}`;
    
    // Fill card with info
    newCard.innerHTML = `
        <div class="chamber-header">
            <div class="chamber-title">
                <div class="chamber-icon">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="chamber-info">
                    <h2>${primaryJudge.name}</h2>
                    <p class="judge-meta">
                        <span class="judge-title"><i class="fas fa-gavel"></i> ${judgeCourt}</span>
                    </p>
                    <p>Oda ${roomNumber} - ${block}, ${floor}</p>
                </div>
            </div>
            <span class="chamber-status ${statusClass}">${statusText}</span>
        </div>
        <div class="chamber-content">
            <div class="hardware-status-grid">
                <div class="hardware-status-item inactive">
                    <i class="fas fa-laptop"></i>
                    <span>Dizüstü PC</span>
                </div>
                <div class="hardware-status-item inactive">
                    <i class="fas fa-print"></i>
                    <span>Yazıcı</span>
                </div>
                <div class="hardware-status-item inactive">
                    <i class="fas fa-desktop"></i>
                    <span>Monitör</span>
                </div>
            </div>
        </div>
    `;
    
    // Add multiple judge indicator if more than one judge
    if (judges.length > 1) {
        const chamberInfo = newCard.querySelector('.chamber-info');
        const judgeCount = document.createElement('div');
        judgeCount.className = 'judge-count';
        judgeCount.innerHTML = `<i class="fas fa-users"></i> ${judges.length} Hakim`;
        chamberInfo.appendChild(judgeCount);
    }
    
    // Insert the new card at the beginning of the container
    if (chambersContainer.firstChild) {
        chambersContainer.insertBefore(newCard, chambersContainer.firstChild);
    } else {
        chambersContainer.appendChild(newCard);
    }
    
    // Update stats
    updateChamberStats();
    
    // Close the modal
    closeChamberModal();
    
    // Show success notification
    showNotification('Yeni hakim odası başarıyla eklendi', 'success');
}

// Update Chamber Stats
function updateChamberStats() {
    const totalRooms = document.querySelectorAll('.chamber-card').length;
    const roomStat = document.querySelector('.stat-card:nth-child(1) .stat-info p');
    if (roomStat) {
        roomStat.textContent = totalRooms;
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideNotification(notification);
        });
    }
}

// Hide Notification
function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Setup Chamber Filters
function setupChamberFilters() {
    const searchInput = document.querySelector('#chamberSearch');
    const locationFilter = document.querySelector('#locationFilter');
    const equipmentFilter = document.querySelector('#equipmentFilter');
    const resetFiltersBtn = document.querySelector('#resetFilters');
    const applyFiltersBtn = document.querySelector('#applyFilters');
    const viewButtons = document.querySelectorAll('.btn-view');

    if (searchInput) {
        searchInput.addEventListener('input', filterChambers);
    }

    if (locationFilter) {
        locationFilter.addEventListener('change', filterChambers);
    }

    if (equipmentFilter) {
        equipmentFilter.addEventListener('change', filterChambers);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', filterChambers);
    }
    
    // View toggle (Grid/List)
    if (viewButtons.length) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.getAttribute('data-view');
                const chambersContainer = document.getElementById('chambersContainer');
                
                // Toggle active class on buttons
                viewButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Toggle view class on container
                if (view === 'list') {
                    chambersContainer.classList.add('list-view');
                } else {
                    chambersContainer.classList.remove('list-view');
                }
            });
        });
    }
}

// Filter Chambers
function filterChambers() {
    const searchTerm = document.querySelector('#chamberSearch')?.value.toLowerCase() || '';
    const location = document.querySelector('#locationFilter')?.value || '';
    const equipment = document.querySelector('#equipmentFilter')?.value || '';

    const chambers = document.querySelectorAll('.chamber-card');
    let visibleCount = 0;
    
    chambers.forEach(chamber => {
        const chamberName = chamber.querySelector('.chamber-info h2').textContent.toLowerCase();
        const chamberLocation = chamber.querySelector('.chamber-info p:last-child').textContent.toLowerCase();
        const hasEquipment = equipment === '' || chamber.querySelector(`.hardware-status-item i.fa-${equipment}`);

        const matchesSearch = chamberName.includes(searchTerm) || chamberLocation.includes(searchTerm);
        const matchesLocation = location === '' || chamberLocation.includes(location.toLowerCase());
        const matchesEquipment = equipment === '' || hasEquipment;
        
        const isVisible = matchesSearch && matchesLocation && matchesEquipment;
        chamber.style.display = isVisible ? 'block' : 'none';
        
        if (isVisible) {
            visibleCount++;
        }
    });
    
    // Update active filters display
    updateActiveFilters(searchTerm, location, equipment, visibleCount);
}

// Update Active Filters Display
function updateActiveFilters(searchTerm, location, equipment, count) {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;
    
    let filterHTML = '';
    let hasFilters = false;
    
    if (searchTerm) {
        filterHTML += `<span class="filter-tag">Arama: "${searchTerm}" <i class="fas fa-times"></i></span>`;
        hasFilters = true;
    }
    
    if (location) {
        filterHTML += `<span class="filter-tag">Konum: ${location} <i class="fas fa-times"></i></span>`;
        hasFilters = true;
    }
    
    if (equipment) {
        const equipmentNames = {
            'laptop': 'Dizüstü PC',
            'print': 'Yazıcı',
            'desktop': 'Monitör'
        };
        const equipmentName = equipmentNames[equipment] || equipment;
        filterHTML += `<span class="filter-tag">Donanım: ${equipmentName} <i class="fas fa-times"></i></span>`;
        hasFilters = true;
    }
    
    if (hasFilters) {
        filterHTML += `<span class="filter-result">${count} sonuç bulundu</span>`;
        activeFiltersContainer.innerHTML = filterHTML;
        activeFiltersContainer.style.display = 'flex';
        
        // Add event listeners for removing filters
        const filterTags = activeFiltersContainer.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => {
            tag.querySelector('i').addEventListener('click', function() {
                const filterText = tag.textContent.trim();
                
                if (filterText.includes('Arama:')) {
                    const searchInput = document.querySelector('#chamberSearch');
                    if (searchInput) searchInput.value = '';
                } else if (filterText.includes('Konum:')) {
                    const locationFilter = document.querySelector('#locationFilter');
                    if (locationFilter) locationFilter.value = '';
                } else if (filterText.includes('Donanım:')) {
                    const equipmentFilter = document.querySelector('#equipmentFilter');
                    if (equipmentFilter) equipmentFilter.value = '';
                }
                
                filterChambers();
            });
        });
    } else {
        activeFiltersContainer.style.display = 'none';
    }
}

// Reset Filters
function resetFilters() {
    const searchInput = document.querySelector('#chamberSearch');
    const locationFilter = document.querySelector('#locationFilter');
    const equipmentFilter = document.querySelector('#equipmentFilter');
    
    if (searchInput) searchInput.value = '';
    if (locationFilter) locationFilter.value = '';
    if (equipmentFilter) equipmentFilter.value = '';
    
    filterChambers();
} 