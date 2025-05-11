;

// DOM elementleri
const chambersContainer = document.getElementById('chambersContainer')
const addChamberModal = document.getElementById('addChamberModal')
const chamberForm = document.getElementById('chamberForm')
const addNewChamberBtn = document.getElementById('addNewChamber')
const closeModalBtn = document.querySelector('.close-modal')
const searchInput = document.getElementById('chamberSearch')
const locationFilter = document.getElementById('locationFilter')
const equipmentFilter = document.getElementById('equipmentFilter')
const resetFiltersBtn = document.getElementById('resetFilters')
const applyFiltersBtn = document.getElementById('applyFilters')
const addJudgeBtn = document.getElementById('addJudgeBtn')

// Odaları yükle
async function loadChambers() {
    try {
        console.log('Odalar yükleniyor...')
        const { data: chambers, error } = await supabase
            .from('hakim_odalari')
            .select('*')
            .order('oda_numarasi', { ascending: true })

        if (error) {
            console.error('Supabase hatası:', error)
            throw error
        }

        console.log('Yüklenen odalar:', chambers)
        displayChambers(chambers)
    } catch (error) {
        console.error('Odalar yüklenirken hata:', error)
        alert('Odalar yüklenirken bir hata oluştu!')
    }
}

// Odaları görüntüle
function displayChambers(chambers) {
    console.log('Odalar görüntüleniyor:', chambers)
    chambersContainer.innerHTML = ''
    
    if (!chambers || chambers.length === 0) {
        console.log('Görüntülenecek oda yok')
        chambersContainer.innerHTML = '<div class="no-data">Henüz oda eklenmemiş</div>'
        return
    }
    
    chambers.forEach(chamber => {
        console.log('Oda kartı oluşturuluyor:', chamber)
        const chamberCard = createChamberCard(chamber)
        chambersContainer.appendChild(chamberCard)
    })
}

// Oda kartı oluştur
function createChamberCard(chamber) {
    console.log('Kart oluşturuluyor:', chamber)
    const card = document.createElement('div')
    card.className = 'oda-karti'
    
    // Kartın içeriğini oluştur
    const cardContent = `
        <div class="oda-karti-header">
            <div class="oda-baslik">
                <h2>${chamber.oda_numarasi} Nolu Oda</h2>
                <div class="oda-konum">
                    <i class="fas fa-location-dot"></i>
                    <span>${chamber.blok}, ${chamber.kat}</span>
                </div>
            </div>
        </div>
        <div class="oda-karti-inner">
            <div class="oda-hakimler">
                ${(createJudgeRow(chamber.hakim1_adisoyadi, chamber.hakim1_birimi, chamber.hakim1_mahkemeno) || '')}
                ${(createJudgeRow(chamber.hakim2_adisoyadi, chamber.hakim2_birimi, chamber.hakim2_mahkemeno) || '')}
                ${(createJudgeRow(chamber.hakim3_adisoyadi, chamber.hakim3_birimi, chamber.hakim3_mahkemeno) || '')}
            </div>
        </div>
        <div class="oda-karti-footer">
            <button class="btn-edit" onclick="event.stopPropagation(); editChamber(${chamber.id})" title="Düzenle">
                <i class="fas fa-pen-to-square"></i>
            </button>
            <button class="btn-delete" onclick="event.stopPropagation(); deleteChamber(${chamber.id})" title="Sil">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `

    card.innerHTML = cardContent

    // Kartın tamamına tıklama olayı ekle
    card.style.cursor = 'pointer'
    card.onclick = () => {
        window.location.href = `hakim-odasi-detay.html?oda=${chamber.oda_numarasi}`
    }
    
    return card
}

// Hakim satırı oluştur
function createJudgeRow(adSoyad, birim, mahkemeNo) {
    if (!adSoyad) return '';
    let birimText = '';
    if (mahkemeNo && birim) {
        birimText = `${mahkemeNo} ${birim} Mahkemesi`;
    } else if (birim) {
        birimText = `${birim} Mahkemesi`;
    }
    return `
        <div class="hakim-row">
            <div class="hakim-bilgi">
                <div class="hakim-isim">
                    <i class="fas fa-user"></i>
                    <span>${adSoyad}</span>
                </div>
                <div class="hakim-mahkeme">
                    <i class="fas fa-gavel"></i>
                    <span>${birimText}</span>
                </div>
            </div>
        </div>
    `;
}

// Hakim alanlarını oluştur (düzenleme ve ekleme için)
function createJudgeFields(judges = []) {
    const container = document.getElementById('judges-container')
    container.innerHTML = ''

    // Kaç hakim varsa o kadar alan oluştur
    judges.forEach((judge, i) => {
        const judgeEntry = document.createElement('div')
        judgeEntry.className = 'judge-entry'
        judgeEntry.innerHTML = `
            <div class="form-row">
                <div class="form-column">
                    <label for="judgeName${i}">Hakim Adı</label>
                    <input type="text" id="judgeName${i}" name="judgeName${i}" class="judge-name">
                </div>
                <div class="form-column">
                    <label for="judgeCourt${i}">Mahkeme</label>
                    <select id="judgeCourt${i}" name="judgeCourt${i}" class="judge-court">
                        <option value="">Seçiniz</option>
                        <option value="Sulh Hukuk Mahkemesi">Sulh Hukuk Mahkemesi</option>
                        <option value="Asliye Hukuk Mahkemesi">Asliye Hukuk Mahkemesi</option>
                        <option value="Tüketici Mahkemesi">Tüketici Mahkemesi</option>
                        <option value="Kadastro Mahkemesi">Kadastro Mahkemesi</option>
                        <option value="İş Mahkemesi">İş Mahkemesi</option>
                        <option value="Aile Mahkemesi">Aile Mahkemesi</option>
                        <option value="Ağır Ceza Mahkemesi">Ağır Ceza Mahkemesi</option>
                        <option value="Adalet Komisyonu Başkanlığı">Adalet Komisyonu Başkanlığı</option>
                        <option value="Sulh Ceza Hakimliği">Sulh Ceza Hakimliği</option>
                        <option value="İnfaz Hakimliği">İnfaz Hakimliği</option>
                        <option value="Çocuk Mahkemesi">Çocuk Mahkemesi</option>
                        <option value="Asliye Ceza Mahkemesi">Asliye Ceza Mahkemesi</option>
                        <option value="Nöbetçi Sulh Ceza Hakimliği">Nöbetçi Sulh Ceza Hakimliği</option>
                        <option value="Cumhuriyet Başsavcılığı">Cumhuriyet Başsavcılığı</option>
                        <option value="Bakanlık Muhabere Bürosu">Bakanlık Muhabere Bürosu</option>
                        <option value="İcra Hukuk Mahkemesi">İcra Hukuk Mahkemesi</option>
                        <option value="İcra Ceza Mahkemesi">İcra Ceza Mahkemesi</option>
                    </select>
                </div>
                <div class="form-column">
                    <label for="judgeCourtNumber${i}">Mahkeme No</label>
                    <input type="number" id="judgeCourtNumber${i}" name="judgeCourtNumber${i}" class="judge-court-number" min="1">
                </div>
            </div>
        `
        container.appendChild(judgeEntry)
        // DOM üzerinden value'ları set et
        const nameInput = judgeEntry.querySelector(`#judgeName${i}`);
        if (nameInput) nameInput.value = judge.name || '';
        const courtSelect = judgeEntry.querySelector(`#judgeCourt${i}`);
        if (courtSelect) courtSelect.value = judge.court || '';
        const numberInput = judgeEntry.querySelector(`#judgeCourtNumber${i}`);
        if (numberInput) numberInput.value = judge.number || '';
    })

    // Eğer 3'ten az hakim varsa, Hakim Ekle butonunu göster
    let addBtn = document.getElementById('addJudgeBtn')
    if (judges.length < 3) {
        addBtn.style.display = 'inline-flex'
        addBtn.onclick = function() {
            if (container.children.length < 3) {
                judges.push({ name: '', court: '', number: '' })
                createJudgeFields(judges)
            }
        }
    } else {
        addBtn.style.display = 'none'
    }
}

function openChamberModal(judges, isEdit = false) {
    if (!addChamberModal) return;
    addChamberModal.classList.add('show');

    // Eğer düzenleme modunda değilse formu sıfırla
    if (!isEdit && chamberForm) {
        chamberForm.reset();
    }

    // Modal başlığını ve butonunu ayarla
    const modalTitle = document.querySelector('.modal-header h2');
    const saveButton = document.querySelector('.modal-footer .btn-primary');
    
    if (!isEdit) {
        if (modalTitle) modalTitle.textContent = 'Yeni Hakim Odası Ekle';
        if (saveButton) {
            saveButton.textContent = 'Kaydet';
            saveButton.onclick = saveChamber;
        }
    }

    if (judges) {
        createJudgeFields(judges);
    } else {
        createJudgeFields([{ name: '', court: '', number: '' }]);
    }
}

// Oda düzenle
async function editChamber(id) {
    try {
        const { data: chamber, error } = await supabase
            .from('hakim_odalari')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!chamber) throw new Error('Oda bulunamadı');

        // Konsola oda verisini yazdır
        console.log('Supabase oda verisi:', chamber);

        // Modal başlığını güncelle
        const modalTitle = document.querySelector('.modal-header h2');
        if (modalTitle) modalTitle.textContent = 'Hakim Odası Düzenle';

        // Kaydet butonunu güncelle
        const saveButton = document.querySelector('.modal-footer .btn-primary');
        if (saveButton) {
            saveButton.textContent = 'Güncelle';
            saveButton.onclick = () => updateChamber(id);
        }

        // Modalı aç (düzenleme modu)
        openChamberModal(null, true);

        // Temel form alanlarını doldur
        document.getElementById('roomNumber').value = chamber.oda_numarasi || '';
        document.getElementById('block').value = chamber.blok || '';
        document.getElementById('floor').value = chamber.kat || '';

        // Hakim bilgilerini diziye aktar
        const judges = [];
        if (chamber.hakim1_adisoyadi) judges.push({ name: chamber.hakim1_adisoyadi, court: chamber.hakim1_birimi, number: chamber.hakim1_mahkemeno });
        if (chamber.hakim2_adisoyadi) judges.push({ name: chamber.hakim2_adisoyadi, court: chamber.hakim2_birimi, number: chamber.hakim2_mahkemeno });
        if (chamber.hakim3_adisoyadi) judges.push({ name: chamber.hakim3_adisoyadi, court: chamber.hakim3_birimi, number: chamber.hakim3_mahkemeno });

        // Hakim alanlarını oluştur ve doldur
        createJudgeFields(judges);

    } catch (error) {
        alert(`Oda bilgileri yüklenirken bir hata oluştu: ${error.message}`);
    }
}

// Oda güncelle
async function updateChamber(id) {
    try {
        console.log('Güncellenecek oda ID:', id)
        const formData = new FormData(chamberForm)
        
        const chamberData = {
            oda_numarasi: formData.get('roomNumber'),
            blok: formData.get('block'),
            kat: formData.get('floor'),
            hakim1_adisoyadi: formData.get('judgeName0'),
            hakim1_birimi: formData.get('judgeCourt0'),
            hakim1_mahkemeno: formData.get('judgeCourtNumber0'),
            hakim2_adisoyadi: formData.get('judgeName1'),
            hakim2_birimi: formData.get('judgeCourt1'),
            hakim2_mahkemeno: formData.get('judgeCourtNumber1'),
            hakim3_adisoyadi: formData.get('judgeName2'),
            hakim3_birimi: formData.get('judgeCourt2'),
            hakim3_mahkemeno: formData.get('judgeCourtNumber2')
        }

        console.log('Güncellenecek veri:', chamberData)

        const { error } = await supabase
            .from('hakim_odalari')
            .update(chamberData)
            .eq('id', id)

        if (error) {
            console.error('Güncelleme hatası:', error)
            throw error
        }

        closeChamberModal()
        loadChambers()
        resetModal()
    } catch (error) {
        console.error('Oda güncellenirken detaylı hata:', error)
        alert(`Oda bilgileri güncellenirken bir hata oluştu: ${error.message}`)
    }
}

// Oda ekle
async function saveChamber() {
    try {
        const formData = new FormData(chamberForm);
        const chamberData = {
            id: Math.floor(Math.random() * 1000000) + 1, // Rastgele sayısal ID
            oda_numarasi: formData.get('roomNumber'),
            blok: formData.get('block'),
            kat: formData.get('floor'),
            hakim1_adisoyadi: formData.get('judgeName0'),
            hakim1_birimi: formData.get('judgeCourt0'),
            hakim1_mahkemeno: formData.get('judgeCourtNumber0'),
            hakim2_adisoyadi: formData.get('judgeName1'),
            hakim2_birimi: formData.get('judgeCourt1'),
            hakim2_mahkemeno: formData.get('judgeCourtNumber1'),
            hakim3_adisoyadi: formData.get('judgeName2'),
            hakim3_birimi: formData.get('judgeCourt2'),
            hakim3_mahkemeno: formData.get('judgeCourtNumber2')
        };

        // Boş olan hakimleri temizle (id hariç)
        Object.keys(chamberData).forEach(key => {
            if (key !== 'id' && (chamberData[key] === "" || chamberData[key] === null)) {
                chamberData[key] = null;
            }
        });

        console.log('Eklenecek veri:', chamberData); // Veriyi kontrol et

        // Yeni kayıt ekle
        const { error } = await supabase
            .from('hakim_odalari')
            .insert([chamberData]);

        if (error) {
            console.error('Ekleme hatası:', error);
            throw error;
        }

        closeChamberModal();
        loadChambers();
        resetModal();
    } catch (error) {
        console.error('Oda ekleme hatası:', error);
        alert(`Oda eklenirken bir hata oluştu: ${error.message}`);
    }
}

// Oda sil
async function deleteChamber(id) {
    try {
        console.log('Oda siliniyor:', id)
        const { error } = await supabase
            .from('hakim_odalari')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase hatası:', error)
            throw error
        }

        closeChamberModal()
        loadChambers()
    } catch (error) {
        console.error('Oda silinirken hata:', error)
        alert('Oda silinirken bir hata oluştu!')
    }
}

// Modal kapat
function closeChamberModal() {
    if (addChamberModal) {
        addChamberModal.classList.remove('show')
    }
}

// Form resetle
function resetModal() {
    if (chamberForm) {
        chamberForm.reset()
    }
}

// Filtreleri uygula
function applyFilters() {
    // Filtre işlemleri burada yapılabilir
    console.log('Filtreler uygulanıyor...')
    loadChambers()
}

// Filtreleri sıfırla
function resetFilters() {
    // Filtre işlemleri burada sıfırlanabilir
    console.log('Filtreler sıfırlandı')
    loadChambers()
}

// Event listeners
if (addNewChamberBtn) {
    addNewChamberBtn.addEventListener('click', () => {
        resetModal(); // Formu temizle
        openChamberModal();
    })
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        closeChamberModal()
    })
}

if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        resetFilters()
    })
}

if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
        applyFilters()
    })
}

if (addJudgeBtn) {
    addJudgeBtn.addEventListener('click', () => {
        // Hakim ekleme işlemi burada yapılabilir
        console.log('Hakim ekleme işlemi')
    })
}

// İlk yükleme işlemi
loadChambers()