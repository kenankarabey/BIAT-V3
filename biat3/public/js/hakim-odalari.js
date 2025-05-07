// Supabase bağlantısı
const supabaseUrl = 'https://vpqcqsiglylfjauzzvuv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWNxc2lnbHlsZmphdXp6dnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNjc5MTUsImV4cCI6MjA2MTg0MzkxNX0.D-o_zWB5GoOfJLBtJ9ueeBCnp5fbr03wqTwrTC09Rmc'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

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
    
    card.innerHTML = `
        <div class="oda-karti-header">
            <span class="oda-baslik">${chamber.oda_numarasi}</span>
        </div>
        <div class="oda-karti-inner">
            <div class="oda-detay">
                <i class="fas fa-location-dot"></i>
                <span>${chamber.blok}, ${chamber.kat}</span>
            </div>
            <div class="oda-hakimler">
                ${createJudgeRow(chamber.hakim1_adisoyadi, chamber.hakim1_birimi)}
                ${createJudgeRow(chamber.hakim2_adisoyadi, chamber.hakim2_birimi)}
                ${createJudgeRow(chamber.hakim3_adisoyadi, chamber.hakim3_birimi)}
            </div>
            </div>
        <div class="oda-karti-footer">
            <button class="btn-edit" onclick="editChamber(${chamber.id})">
                <i class="fas fa-pen-to-square"></i>
            </button>
            <button class="btn-delete" onclick="deleteChamber(${chamber.id})">
                    <i class="fas fa-trash"></i>
                </button>
        </div>
    `
    
    return card
}

// Hakim satırı oluştur
function createJudgeRow(adSoyad, birim) {
    if (!adSoyad) return '<div class="hakim-row empty"></div>'
    
    return `
        <div class="hakim-row">
            <span class="hakim-isim">${adSoyad}</span>
            <span class="hakim-birim">${birim}</span>
        </div>
    `
}

// Hakim alanlarını oluştur
function createJudgeFields() {
    const container = document.getElementById('judges-container')
    container.innerHTML = '' // Mevcut alanları temizle

    // 3 hakim için alan oluştur
    for (let i = 0; i < 3; i++) {
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
                    <label for="judgeCourtNumber${i}">Mahkeme No</label>
                    <input type="number" id="judgeCourtNumber${i}" name="judgeCourtNumber${i}" class="judge-court-number" min="1">
                </div>
            </div>
        `
        container.appendChild(judgeEntry)
    }
}

// Oda düzenle
async function editChamber(id) {
    try {
        console.log('Düzenlenecek oda ID:', id)
        
        const { data: chamber, error } = await supabase
            .from('hakim_odalari')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Supabase hatası:', error)
            throw error
        }

        if (!chamber) {
            console.error('Oda bulunamadı')
            throw new Error('Oda bulunamadı')
        }

        console.log('Yüklenen oda verisi:', chamber)

        // Önce hakim alanlarını oluştur
        createJudgeFields()

        // Temel form alanlarını doldur
        const roomNumberField = document.getElementById('roomNumber')
        const blockField = document.getElementById('block')
        const floorField = document.getElementById('floor')

        if (!roomNumberField || !blockField || !floorField) {
            throw new Error('Form alanları bulunamadı!')
        }

        roomNumberField.value = chamber.oda_numarasi || ''
        blockField.value = chamber.blok || ''
        floorField.value = chamber.kat || ''

        // Hakim bilgilerini doldur
        const judgeData = [
            {
                name: chamber.hakim1_adisoyadi,
                court: chamber.hakim1_birimi,
                number: chamber.hakim1_mahkemeno
            },
            {
                name: chamber.hakim2_adisoyadi,
                court: chamber.hakim2_birimi,
                number: chamber.hakim2_mahkemeno
            },
            {
                name: chamber.hakim3_adisoyadi,
                court: chamber.hakim3_birimi,
                number: chamber.hakim3_mahkemeno
            }
        ]

        judgeData.forEach((judge, index) => {
            const nameField = document.getElementById(`judgeName${index}`)
            const courtField = document.getElementById(`judgeCourt${index}`)
            const numberField = document.getElementById(`judgeCourtNumber${index}`)

            if (nameField) nameField.value = judge.name || ''
            if (courtField) courtField.value = judge.court || ''
            if (numberField) numberField.value = judge.number || ''
        })

        // Modal başlığını güncelle
        const modalTitle = document.querySelector('.modal-header h2')
        if (modalTitle) {
            modalTitle.textContent = 'Hakim Odası Düzenle'
        }
        
        // Kaydet butonunu güncelle
        const saveButton = document.querySelector('.modal-footer .btn-primary')
        if (saveButton) {
            saveButton.textContent = 'Güncelle'
            saveButton.onclick = () => updateChamber(id)
        }

        // Modal'ı aç
        openChamberModal()
    } catch (error) {
        console.error('Oda bilgileri yüklenirken detaylı hata:', error)
        alert(`Oda bilgileri yüklenirken bir hata oluştu: ${error.message}`)
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
        alert(`Oda güncellenirken bir hata oluştu: ${error.message}`)
    }
}

// Modal'ı sıfırla
function resetModal() {
    document.querySelector('.modal-header h2').textContent = 'Yeni Hakim Odası Ekle'
    const saveButton = document.querySelector('.modal-footer .btn-primary')
    saveButton.textContent = 'Kaydet'
    saveButton.onclick = saveChamber
    chamberForm.reset()
}

// Oda sil
async function deleteChamber(id) {
    if (!confirm('Bu odayı silmek istediğinizden emin misiniz?')) return

    try {
        const { error } = await supabase
            .from('hakim_odalari')
            .delete()
            .eq('id', id)

        if (error) throw error

        loadChambers()
    } catch (error) {
        console.error('Oda silinirken hata:', error)
        alert('Oda silinirken bir hata oluştu!')
    }
}

// Modal işlemleri
function openChamberModal() {
    const modal = document.getElementById('addChamberModal')
    if (!modal) {
        console.error('Modal elementi bulunamadı!')
        return
    }
    
    // Modal'ı görünür yap
    modal.style.display = 'flex'
    modal.style.opacity = '1'
    modal.style.visibility = 'visible'
    
    // Modal içeriğini görünür yap
    const modalContent = modal.querySelector('.modal-content')
    if (modalContent) {
        modalContent.style.display = 'block'
        modalContent.style.opacity = '1'
        modalContent.style.transform = 'translateY(0)'
    }
    
    console.log('Modal açıldı ve görünür yapıldı')
}

function closeChamberModal() {
    const modal = document.getElementById('addChamberModal')
    if (!modal) {
        console.error('Modal elementi bulunamadı!')
        return
    }
    
    // Modal'ı gizle
    modal.style.display = 'none'
    modal.style.opacity = '0'
    modal.style.visibility = 'hidden'
    
    // Modal içeriğini gizle
    const modalContent = modal.querySelector('.modal-content')
    if (modalContent) {
        modalContent.style.display = 'none'
        modalContent.style.opacity = '0'
        modalContent.style.transform = 'translateY(-20px)'
    }
    
    resetModal()
    console.log('Modal kapatıldı ve gizlendi')
}

// Event Listeners
addNewChamberBtn.addEventListener('click', openChamberModal)
closeModalBtn.addEventListener('click', closeChamberModal)

// Arama ve filtreleme
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase()
    filterChambers(searchTerm)
})

function filterChambers(searchTerm) {
    const cards = document.querySelectorAll('.oda-karti')
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase()
        card.style.display = text.includes(searchTerm) ? 'block' : 'none'
    })
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadChambers()
}) 