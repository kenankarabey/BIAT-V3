// Gemini API ile GoogleGenAI kullanımı (tarayıcıda dinamik import)

// Supabase client'ın tanımlı olduğundan emin ol
function getSupabaseClient() {
    if (window.supabaseClient) return window.supabaseClient;
    alert('Supabase bağlantısı kurulamadı! Lütfen sayfayı yenileyin veya yöneticinize başvurun.');
    throw new Error('Supabase client tanımlı değil!');
}
const supabase = getSupabaseClient();

let ai;
(async () => {
    const module = await import('https://esm.run/@google/genai');
    const GoogleGenAI = module.GoogleGenAI;
    ai = new GoogleGenAI({ apiKey: 'AIzaSyBLBI27ojz-xDqP5DXxccIL-ufClOu8EXo' });
})();

// Marked.js kütüphanesini dinamik olarak yükle
let marked;
(async () => {
    const module = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js');
    marked = module.marked;
    // Markdown ayarlarını yapılandır
    marked.setOptions({
        gfm: true,
        breaks: true
    });
})();

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Yeni sohbet başlat ve chat_id döndür
async function createNewChat(title = '') {
    const user = JSON.parse(localStorage.getItem('user'));
    const { data, error } = await supabase
        .from('chats')
        .insert([{
            user_id: user.id,
            title: title,
            is_active: true
        }])
        .select()
        .single();
    if (error) {
        console.error('Sohbet oluşturulamadı:', error);
        return null;
    }
    return data.id;
}

// Aktif sohbetin id'si
let currentChatId = null;

// Kullanıcının tüm sohbetlerini getir
async function getUserChats() {
    const user = JSON.parse(localStorage.getItem('user'));
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Sohbetler alınamadı:', error);
        return [];
    }
    return data;
}

// Kullanıcı ilk mesajı gönderdiğinde başlık güncelle
async function updateChatTitleIfNeeded(chat_id, title) {
    if (!chat_id || !title) return;
    const { data } = await supabase
        .from('chats')
        .select('title')
        .eq('id', chat_id)
        .single();
    if (data && (!data.title || data.title.trim() === '')) {
        await supabase
            .from('chats')
            .update({ title: title.substring(0, 50) })
            .eq('id', chat_id);
    }
}

// Sohbeti sil
async function deleteChat(chatId) {
    await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
}

// Sohbet geçmişini panelde göster (silme butonlu)
async function renderChatHistory() {
    const chatHistoryList = document.getElementById('chatHistoryList');
    if (!chatHistoryList) return;
    chatHistoryList.innerHTML = '<div style="color: #888; text-align:center;">Yükleniyor...</div>';

    const chats = await getUserChats();
    chatHistoryList.innerHTML = '';

    if (chats.length === 0) {
        chatHistoryList.innerHTML = '<div style="color: #888; text-align:center;">Hiç sohbet geçmişiniz yok.</div>';
        return;
    }

    chats.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'history-item';
        // Başlık
        const titleSpan = document.createElement('span');
        titleSpan.textContent = chat.title || 'Sohbet';
        titleSpan.title = new Date(chat.created_at).toLocaleString('tr-TR');
        titleSpan.style.flex = '1';
        titleSpan.onclick = () => loadChatMessages(chat.id);
        // Sil butonu
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Sohbeti Sil';
        deleteBtn.onclick = async (e) => {
            e.stopPropagation();
            if (confirm('Bu sohbeti silmek istediğinize emin misiniz?')) {
                await deleteChat(chat.id);
                await renderChatHistory();
                if (currentChatId === chat.id && chatMessages) chatMessages.innerHTML = '';
            }
        };
        item.appendChild(titleSpan);
        item.appendChild(deleteBtn);
        chatHistoryList.appendChild(item);
    });
}

// Seçilen sohbetin mesajlarını getir ve ekrana yaz
async function loadChatMessages(chatId) {
    currentChatId = chatId;
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
    if (error) {
        console.error('Mesajlar alınamadı:', error);
        return;
    }
    // Sohbet ekranını temizle
    if (chatMessages) chatMessages.innerHTML = '';
    // Mesajları sırayla ekle
    data.forEach(msg => {
        if (msg.sender === 'user') {
            addUserMessage(msg.content);
        } else {
            addBotMessage(msg.content);
        }
    });
}

// Mesajdan başlık üret
function generateChatTitleFromMessage(message) {
    // İlk 3 cümleyi al
    const sentences = message.split(/[.?!]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
    const combined = sentences.join(' ');
    const lower = combined.toLowerCase();

    // Anahtar kelimeye göre başlıklar (öncelik)
    if (lower.includes('ssd') || lower.includes('disk') || lower.includes('depolama')) {
        return 'SSD Sorunu';
    }
    if (lower.includes('yazıcı') || lower.includes('printer') || lower.includes('print')) {
        return 'Yazıcı Sorunu';
    }
    if (lower.includes('internet') || lower.includes('wifi') || lower.includes('ağ') || lower.includes('ethernet')) {
        return 'Ağ Bağlantı Sorunu';
    }
    if (lower.includes('e-imza') || lower.includes('elektronik imza')) {
        return 'E-imza Problemi';
    }
    if (lower.includes('uyap')) {
        return 'UYAP Sorunu';
    }
    if (lower.includes('monitör') || lower.includes('ekran')) {
        return 'Ekran/Monitör Sorunu';
    }
    if (lower.includes('şifre') || lower.includes('parola')) {
        return 'Şifre Problemi';
    }
    if (lower.includes('klavye') || lower.includes('mouse') || lower.includes('fare')) {
        return 'Klavye/Fare Sorunu';
    }

    // Hiçbiri yoksa, ilk 3 cümleden kısa bir özet başlık oluştur
    let title = combined;
    if (title.length > 50) {
        title = title.split(' ').slice(0, 8).join(' ') + '...';
    }
    // İlk harfi büyük yap
    return title.charAt(0).toUpperCase() + title.slice(1);
}

// Yeni sohbet başlatma fonksiyonu
async function startNewChat() {
    currentChatId = await createNewChat(''); // Başlık boş!
    if (chatMessages) chatMessages.innerHTML = '';
    addBotMessage("Merhaba! Ben teknik destek asistanınızım. Bilgisayar ve UYAP konularında size nasıl yardımcı olabilirim?");
    await renderChatHistory();
}

// Yeni sohbet butonuna tıklama olayı ve sayfa açılışında geçmişi yükle
window.addEventListener('DOMContentLoaded', async () => {
    await startNewChat();
    await renderChatHistory();
    const newChatBtn = document.querySelector('.new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
});

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Bunu ekleyin!
        sendMessage();
    }
});
// Genel sohbet ve selamlaşma kelimeleri
const greetings = [
    'merhaba', 'selam', 'günaydın', 'iyi günler', 'iyi akşamlar', 'nasılsın', 'naber',
    'iyiyim', 'teşekkür', 'teşekkürler', 'sağol', 'hoşça kal', 'görüşürüz'
];

// Teknik destek kelimeleri ve yaygın sorunlar
const technicalKeywords = {
    hardware: [
        'bilgisayar', 'donanım', 'yazıcı', 'monitör', 'ekran', 'ram', 'ssd', 'hdd', 
        'anakart', 'işlemci', 'cpu', 'güç', 'power', 'kasa', 'fan', 'soğutucu', 
        'bios', 'usb', 'port', 'kart', 'okuyucu', 'sürücü', 'driver'
    ],
    software: [
        'yazılım', 'windows', 'linux', 'format', 'uygulama', 'program', 'güncelleme',
        'update', 'kurulum', 'yükleme', 'hata', 'error', 'çalışmıyor', 'açılmıyor'
    ],
    network: [
        'ağ', 'internet', 'network', 'ethernet', 'wifi', 'ip', 'sunucu', 'server',
        'bağlantı', 'connection'
    ],
    security: [
        'e-imza', 'elektronik imza', 'şifre', 'parola', 'güvenlik', 'security',
        'sertifika', 'token', 'akis'
    ],
    systemCommands: [
        'komut', 'command', 'cmd', 'terminal', 'powershell', 'chkdsk', 'sfc', 'diskpart',
        'ipconfig', 'ping', 'tracert', 'netstat', 'tasklist', 'taskkill', 'dir', 'cd',
        'mkdir', 'del', 'copy', 'xcopy', 'robocopy', 'shutdown', 'gpupdate', 'gpedit'
    ]
};

// Windows sistem komutları ve açıklamaları
const windowsCommands = {
    'chkdsk': {
        description: 'Disk kontrolü ve onarımı yapar',
        commonUsage: [
            { command: 'chkdsk', desc: 'Disk durumunu kontrol eder' },
            { command: 'chkdsk /f', desc: 'Bulunan hataları onarır' },
            { command: 'chkdsk /r', desc: 'Bozuk sektörleri bulur ve kurtarır' },
            { command: 'chkdsk /b', desc: 'NTFS sürümünü yeniden değerlendirir' }
        ]
    },
    'sfc': {
        description: 'Sistem dosyalarını kontrol eder ve onarır',
        commonUsage: [
            { command: 'sfc /scannow', desc: 'Sistem dosyalarını tarar ve onarır' }
        ]
    },
    'diskpart': {
        description: 'Disk bölümlendirme aracı',
        commonUsage: [
            { command: 'diskpart', desc: 'Disk yönetim aracını başlatır' },
            { command: 'list disk', desc: 'Diskleri listeler' },
            { command: 'select disk 0', desc: 'Disk seçer' }
        ]
    }
};

// UYAP kelimeleri ve yaygın sorunlar
const uyapKeywords = {
    general: [
        'uyap', 'portal', 'döküman', 'evrak', 'entegrasyon', 'mahkeme', 'duruşma',
        'tevzi', 'dosya', 'karar', 'tebligat', 'harç', 'vezne', 'sorgu'
    ],
    errors: [
        'hata', 'sorun', 'problem', 'çalışmıyor', 'açılmıyor', 'yüklenmiyor',
        'bağlanmıyor', 'erişilemiyor'
    ]
};

function isGreeting(message) {
    const lower = message.toLowerCase();
    return greetings.some(word => lower.includes(word));
}

function isTechnicalQuestion(message) {
    const lower = message.toLowerCase();
    
    // Tüm teknik anahtar kelimeleri düzleştir
    const allTechnicalKeywords = [
        ...Object.values(technicalKeywords).flat(),
        ...Object.values(uyapKeywords).flat()
    ];

    // Hem kelime hem de hata/sorun kombinasyonlarını kontrol et
    const hasKeyword = allTechnicalKeywords.some(word => lower.includes(word));
    const hasErrorWord = lower.includes('hata') || lower.includes('sorun') || 
                        lower.includes('problem') || lower.includes('çalışmıyor');

    return hasKeyword;
}

function identifyProblemType(message) {
    const lower = message.toLowerCase();
    
    // Sorun türünü belirle
    let problemType = '';
    if (lower.includes('e-imza') || lower.includes('elektronik imza')) {
        problemType = 'e-imza';
    } else if (lower.includes('uyap')) {
        problemType = 'uyap';
    } else if (technicalKeywords.systemCommands.some(word => lower.includes(word))) {
        problemType = 'system_command';
    } else if (technicalKeywords.hardware.some(word => lower.includes(word))) {
        problemType = 'donanım';
    } else if (technicalKeywords.software.some(word => lower.includes(word))) {
        problemType = 'yazılım';
    } else if (technicalKeywords.network.some(word => lower.includes(word))) {
        problemType = 'ağ';
    }
    
    return problemType;
}

let conversationContext = {
    greetingDone: false,
    technicalContextStarted: false,
    conversationHistory: [],
    lastPrompt: null,
    maxHistoryLength: 10,
    currentTopic: null,
    lastResponse: null,
    lastContext: null,
    deviceAdd: null,
    waitingForSerialQuery: false,
    waitingForDeviceDeleteSerial: false
};

// Devam isteğini kontrol eden fonksiyon
function isContinueRequest(message) {
    const continuePatterns = [
        'devam et',
        'devam',
        'daha fazla bilgi ver',
        'detay ver',
        'detaylı anlat',
        'başka',
        'diğer',
        'biraz daha',
        'daha'
    ];
    return continuePatterns.some(pattern => message.toLowerCase().includes(pattern));
}

async function handleSystemCommandQuery(message) {
    const lower = message.toLowerCase();
    let commandInfo = null;
    
    // Hangi komut hakkında bilgi istendiğini belirle
    for (const [command, info] of Object.entries(windowsCommands)) {
        if (lower.includes(command)) {
            commandInfo = { command, ...info };
            break;
        }
    }
    
    if (commandInfo) {
        let response = `## ${commandInfo.command.toUpperCase()} Komutu\n\n`;
        response += `**Açıklama:** ${commandInfo.description}\n\n`;
        response += `**Yaygın Kullanımlar:**\n`;
        
        commandInfo.commonUsage.forEach((usage, index) => {
            response += `${index + 1}. \`${usage.command}\` - ${usage.desc}\n`;
        });
        
        response += `\n**Not:** Bu komutu yönetici (Administrator) olarak çalıştırmanız gerekebilir.`;
        return response;
    }
    
    return null;
}

// Mesajı veritabanına kaydet
async function saveMessage(chat_id, sender, content) {
    if (!chat_id) return;
    const { error } = await supabase
        .from('messages')
        .insert([{
            chat_id: chat_id,
            sender: sender,
            content: content
        }]);
    if (error) {
        console.error('Mesaj kaydedilemedi:', error);
    }
}

// Desteklenen cihaz tipleri ve alanları
const deviceTypes = {
    computers: {
        label: 'bilgisayar',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'unvan', label: 'Unvan' },
            { key: 'adi_soyadi', label: 'Adı Soyadı' },
            { key: 'sicil_no', label: 'Sicil No' },
            { key: 'kasa_marka', label: 'Kasa Marka' },
            { key: 'kasa_model', label: 'Kasa Model' },
            { key: 'kasa_seri_no', label: 'Kasa Seri No' },
            { key: 'ilk_temizlik_tarihi', label: 'İlk Temizlik Tarihi' },
            { key: 'son_temizlik_tarihi', label: 'Son Temizlik Tarihi' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    laptops: {
        label: 'laptop',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'unvan', label: 'Unvan' },
            { key: 'adi_soyadi', label: 'Adı Soyadı' },
            { key: 'sicil_no', label: 'Sicil No' },
            { key: 'laptop_marka', label: 'Laptop Marka' },
            { key: 'laptop_model', label: 'Laptop Model' },
            { key: 'laptop_seri_no', label: 'Laptop Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    screens: {
        label: 'ekran',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'unvan', label: 'Unvan' },
            { key: 'adi_soyadi', label: 'Adı Soyadı' },
            { key: 'sicil_no', label: 'Sicil No' },
            { key: 'ekran_marka', label: 'Ekran Marka' },
            { key: 'ekran_model', label: 'Ekran Model' },
            { key: 'ekran_seri_no', label: 'Ekran Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    printers: {
        label: 'yazıcı',
        fields: [
            { key: 'birim', label: 'Birim' },

            { key: 'unvan', label: 'Unvan' },
            { key: 'adi_soyadi', label: 'Adı Soyadı' },
            { key: 'sicilno', label: 'Sicil No' },
            { key: 'yazici_marka', label: 'Yazıcı Marka' },
            { key: 'yazici_model', label: 'Yazıcı Model' },
            { key: 'yazici_seri_no', label: 'Yazıcı Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    scanners: {
        label: 'tarayıcı',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'unvan', label: 'Unvan' },
            { key: 'adi_soyadi', label: 'Adı Soyadı' },
            { key: 'sicil_no', label: 'Sicil No' },
            { key: 'tarayici_marka', label: 'Tarayıcı Marka' },
            { key: 'tarayici_model', label: 'Tarayıcı Model' },
            { key: 'tarayici_seri_no', label: 'Tarayıcı Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    segbis: {
        label: 'segbis',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'segbis_marka', label: 'SEGBİS Marka' },
            { key: 'segbis_model', label: 'SEGBİS Model' },
            { key: 'segbis_seri_no', label: 'SEGBİS Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    tvs: {
        label: 'tv',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'tv_marka', label: 'TV Marka' },
            { key: 'tv_model', label: 'TV Model' },
            { key: 'tv_seri_no', label: 'TV Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    microphones: {
        label: 'mikrofon',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'mikrofon_marka', label: 'Mikrofon Marka' },
            { key: 'mikrofon_model', label: 'Mikrofon Model' },
            { key: 'mikrofon_seri_no', label: 'Mikrofon Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    cameras: {
        label: 'kamera',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'kamera_marka', label: 'Kamera Marka' },
            { key: 'kamera_model', label: 'Kamera Model' },
            { key: 'kamera_seri_no', label: 'Kamera Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    },
    e_durusma: {
        label: 'e-duruşma',
        fields: [
            { key: 'birim', label: 'Birim' },
            { key: 'edurusma_marka', label: 'E-Duruşma Marka' },
            { key: 'edurusma_model', label: 'E-Duruşma Model' },
            { key: 'edurusma_seri_no', label: 'E-Duruşma Seri No' },
            { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
            { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
        ]
    }
};
const deviceTypeLabels = Object.values(deviceTypes).map(d => d.label);

// Cihaz ekleme state'i
function isDeviceAddIntent(message) {
    const lower = message.toLowerCase();
    return (
        lower.includes('cihaz ekle') || lower.includes('cihaz kaydet') || lower.includes('yeni cihaz') ||
        deviceTypeLabels.some(label => lower.includes(label + ' ekle') || lower.includes(label + ' kaydet') || lower.includes(label + ' eklemek') || lower.includes(label + ' kaydetmek'))
    );
}
function extractDeviceType(message) {
    const lower = message.toLowerCase();
    for (const [type, def] of Object.entries(deviceTypes)) {
        if (lower.includes(def.label)) return type;
    }
    return null;
}

// QR kod ve barkod üretici
function generateDeviceCode(type) {
    const ts = Date.now();
    const rand = Math.floor(100 + Math.random() * 900);
    return `${type}_${ts}_${rand}`;
}

// Oda tipi ve cihaz tipi seçenekleri
const odaTipiOptions = [
    { value: 'Mahkeme Kalemi', label: 'Mahkeme Kalemi', num: '1' },
    { value: 'Duruşma Salonu', label: 'Duruşma Salonu', num: '2' },
    { value: 'Hakim Odaları', label: 'Hakim Odaları', num: '3' }
];
const odaTipiToDeviceTypes = {
    'Mahkeme Kalemi': [
        { type: 'computers', label: 'Kasa', num: '1' },
        { type: 'screens', label: 'Monitör', num: '2' },
        { type: 'laptops', label: 'Laptop', num: '3' },
        { type: 'printers', label: 'Yazıcı', num: '4' },
        { type: 'scanners', label: 'Tarayıcı', num: '5' }
    ],
    'Hakim Odaları': [
        { type: 'laptops', label: 'Laptop', num: '1' },
        { type: 'screens', label: 'Monitör', num: '2' },
        { type: 'printers', label: 'Yazıcı', num: '3' }
    ],
    'Duruşma Salonu': [
        { type: 'computers', label: 'Kasa', num: '1' },
        { type: 'screens', label: 'Monitör', num: '2' },
        { type: 'printers', label: 'Yazıcı', num: '3' },
        { type: 'tvs', label: 'Televizyon', num: '4' },
        { type: 'segbis', label: 'Segbis', num: '5' },
        { type: 'e_durusma', label: 'E-duruşma', num: '6' },
        { type: 'microphones', label: 'Mikrofon', num: '7' }
    ]
};

// Unvan seçenekleri
const unvanOptions = {
    'Mahkeme Kalemi': [
        { value: 'Zabıt Katibi', num: '1' },
        { value: 'Mübaşir', num: '2' },
        { value: 'İcra Katibi', num: '3' },
        { value: 'İcra Müdürü', num: '4' },
        { value: 'İcra Memuru', num: '5' },
        { value: 'İcra Müdür Yardımcısı', num: '6' },
        { value: 'Yazı İşleri Müdürü', num: '7' },
        { value: 'Veznedar', num: '8' },
        { value: 'Hizmetli', num: '9' },
        { value: 'Tarama Memuru', num: '10' },
        { value: 'Memur', num: '11' },
        { value: 'Teknisyen', num: '12' },
        { value: 'Tekniker', num: '13' },
        { value: 'Bilgi işlem müdürü', num: '14' },
        { value: 'Uzman', num: '15' }
    ],
    'Hakim Odaları': [
        { value: 'Hakim', num: '1' },
        { value: 'Savcı', num: '2' }
    ]
};

// Oda tipine göre birim seçenekleri
const birimOptions = {
    'Mahkeme Kalemi': [
        'Sulh Hukuk Mahkemesi', 'Hukuk Ön Büro', 'Hukuk Vezne', 'Asliye Hukuk Mahkemesi',
        'Tüketici Mahkemesi', 'Kadastro Mahkemesi', 'İş Mahkemesi', 'Aile Mahkemesi',
        'Ağır Ceza Mahkemesi', 'Adalet Komisyonu Başkanlığı', 'Sulh Ceza Hakimliği',
        'İnfaz Hakimliği', 'Çocuk Mahkemesi', 'Savcılık İnfaz Bürosu', 'Asliye Ceza Mahkemesi',
        'Adli Destek ve Mağdur Hizmetleri Müdürlüğü ve Görüşme Odaları', 'Ceza Ön Büro',
        'Ceza Vezne', 'Soruşturma Bürosu', 'İdari İşler Müdürlüğü', 'Müracaat Bürosu',
        'Muhabere Bürosu', 'Talimat Bürosu', 'Emanet Bürosu', 'Nöbetçi Sulh Ceza Hakimliği',
        'Cumhuriyet Başsavcılığı', 'Bakanlık Muhabere Bürosu', 'CMK', 'Maaş',
        'İcra Müdürlüğü', 'Adli Sicil Şefliği', 'İcra Hukuk Mahkemesi', 'İcra Ceza Mahkemesi'
    ],
    'Hakim Odaları': [
        'Sulh Hukuk Mahkemesi', 'Asliye Hukuk Mahkemesi', 'Tüketici Mahkemesi', 'Kadastro Mahkemesi',
        'İş Mahkemesi', 'Aile Mahkemesi', 'Ağır Ceza Mahkemesi', 'Adalet Komisyonu Başkanlığı',
        'Sulh Ceza Hakimliği', 'İnfaz Hakimliği', 'Çocuk Mahkemesi', 'Asliye Ceza Mahkemesi',
        'Nöbetçi Sulh Ceza Hakimliği', 'Cumhuriyet Başsavcılığı', 'İcra Hukuk Mahkemesi', 'İcra Ceza Mahkemesi'
    ],
    'Duruşma Salonu': [
        'Sulh Hukuk Mahkemesi', 'Asliye Hukuk Mahkemesi', 'Tüketici Mahkemesi', 'Kadastro Mahkemesi',
        'İş Mahkemesi', 'Aile Mahkemesi', 'Ağır Ceza Mahkemesi', 'Sulh Ceza Hakimliği',
        'İnfaz Hakimliği', 'Çocuk Mahkemesi', 'Asliye Ceza Mahkemesi', 'İdari İşler Müdürlüğü',
        'Nöbetçi Sulh Ceza Hakimliği', 'İcra Hukuk Mahkemesi', 'İcra Ceza Mahkemesi'
    ]
};

// Seçim mesajı gösteren yardımcı fonksiyon
function showSelectionMessage(label, options) {
    if (!options || !Array.isArray(options) || options.length === 0) {
        addBotMessage(label + ': (Seçenek bulunamadı)');
        return;
    }
    addBotMessage(`${label}:\n` + options.map(o => `${o.num}- ${o.value || o.label}`).join('\n'));
}

// Seçim doğrulayan yardımcı fonksiyon
function getSelectedOption(message, options) {
    for (let i = 0; i < options.length; i++) {
        if (message.trim() === options[i].num || message.trim().toLowerCase() === options[i].value.toLowerCase()) {
            return options[i].value;
        }
    }
    return null;
}

// Seri numarasından cihaz sorgulama anahtar kelimeleri
const deviceQueryKeywords = [
    'cihaz sorgula',
    'seri numarasından sorgula',
    'seri no ile cihaz bul',
    'seri no sorgula',
    'seri numarası sorgula',
    'cihaz bul',
    'seri no ile sorgula',
    'serino sorgula',
    'serino ile cihaz bul',
    'serino ile sorgula'
];

function isDeviceQueryIntent(message) {
    const lower = message.toLowerCase();
    return deviceQueryKeywords.some(keyword => lower.includes(keyword));
}

// Yaklaşan garanti ve temizlik sorgulama anahtar kelimeleri
const warrantyQueryKeywords = [
    'yaklaşan garanti',
    'garantisi bitmek üzere',
    'garanti takibi',
    'garantisi dolacak',
    'garanti süresi bitiyor',
    'garanti bitiş',
    'garanti bitiyor',
    'garantisi yaklaşan',
    'garantisi yaklaşan cihaz',
    'garantisi yaklaşan cihazlar',
    'garantisi yaklaşan var mı',
    'garantisi yaklaşan cihaz var mı',
    'garantisi yaklaşan cihazlar var mı'
];
const cleaningQueryKeywords = [
    'yaklaşan temizlik',
    'temizlik takibi',
    'temizlik zamanı gelen',
    'temizlik zamanı yaklaşan',
    'temizlik bitiş',
    'temizlik bitiyor',
    'temizliği yaklaşan',
    'temizliği yaklaşan cihaz',
    'temizliği yaklaşan cihazlar',
    'temizliği yaklaşan var mı',
    'temizliği yaklaşan cihaz var mı',
    'temizliği yaklaşan cihazlar var mı'
];

function isWarrantyQueryIntent(message) {
    const lower = message.toLowerCase();
    return warrantyQueryKeywords.some(keyword => lower.includes(keyword));
}
function isCleaningQueryIntent(message) {
    const lower = message.toLowerCase();
    return cleaningQueryKeywords.some(keyword => lower.includes(keyword));
}

const expiredWarrantyKeywords = [
    'garantisi geçen',
    'garantisi bitmiş',
    'garantisi biten',
    'garantisi dolmuş',
    'garantisi sona eren',
    'garantisi geçmiş',
    'garantisi geçen cihaz',
    'garantisi geçen cihazlar',
    'garantisi bitmiş cihaz',
    'garantisi bitmiş cihazlar',
    'garantisi biten cihaz',
    'garantisi biten cihazlar',
    'garantisi dolmuş cihaz',
    'garantisi dolmuş cihazlar',
    'garantisi sona eren cihaz',
    'garantisi sona eren cihazlar',
    'garantisi geçmiş cihaz',
    'garantisi geçmiş cihazlar'
];
function isExpiredWarrantyQueryIntent(message) {
    const lower = message.toLowerCase();
    return expiredWarrantyKeywords.some(keyword => lower.includes(keyword));
}

// Temizlik tarihi geçmiş/bitmiş cihazlar için anahtar kelimeler
const expiredCleaningKeywords = [
    'temizlik tarihi geçen',
    'temizlik tarihi geçmiş',
    'temizlik tarihi bitmiş',
    'temizlik tarihi dolmuş',
    'temizlik tarihi sona eren',
    'temizlik tarihi biten',
    'temizlik tarihi geçmiş cihaz',
    'temizlik tarihi geçen cihaz',
    'temizlik tarihi bitmiş cihaz',
    'temizlik tarihi dolmuş cihaz',
    'temizlik tarihi sona eren cihaz',
    'temizlik tarihi biten cihaz',
    'temizlik tarihi geçmiş cihazlar',
    'temizlik tarihi geçen cihazlar',
    'temizlik tarihi bitmiş cihazlar',
    'temizlik tarihi dolmuş cihazlar',
    'temizlik tarihi sona eren cihazlar',
    'temizlik tarihi biten cihazlar',
    'temizliği geçmiş',
    'temizliği geçen',
    'temizliği bitmiş',
    'temizliği dolmuş',
    'temizliği sona eren',
    'temizliği biten',
    'temizliği geçmiş cihaz',
    'temizliği geçen cihaz',
    'temizliği bitmiş cihaz',
    'temizliği dolmuş cihaz',
    'temizliği sona eren cihaz',
    'temizliği biten cihaz',
    'temizliği geçmiş cihazlar',
    'temizliği geçen cihazlar',
    'temizliği bitmiş cihazlar',
    'temizliği dolmuş cihazlar',
    'temizliği sona eren cihazlar',
    'temizliği biten cihazlar'
];

// Tüm cihaz tablolarında yaklaşan garanti/temizlik tarihli cihazları bul
async function queryDevicesWithUpcomingDate(dateKey, days = 30) {
    const tables = [
        { table: 'computers', label: 'Bilgisayar' },
        { table: 'laptops', label: 'Laptop' },
        { table: 'screens', label: 'Monitör' },
        { table: 'printers', label: 'Yazıcı' },
        { table: 'scanners', label: 'Tarayıcı' },
        { table: 'segbis', label: 'SEGBİS' },
        { table: 'tvs', label: 'TV' },
        { table: 'microphones', label: 'Mikrofon' },
        { table: 'cameras', label: 'Kamera' },
        { table: 'e_durusma', label: 'E-Duruşma' }
    ];
    const now = new Date();
    const soon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    let results = [];
    for (const t of tables) {
        const { data, error } = await supabase
            .from(t.table)
            .select('*')
            .not(dateKey, 'is', null);
        if (!error && data && data.length > 0) {
            for (const row of data) {
                const dt = new Date(row[dateKey]);
                if (!isNaN(dt) && dt >= now && dt <= soon) {
                    results.push({
                        ...row,
                        table: t.table,
                        typeLabel: t.label,
                        date: row[dateKey]
                    });
                }
            }
        }
    }
    // Tarihe göre sırala
    results.sort((a, b) => new Date(a.date) - new Date(b.date));
    return results;
}

// Yeni fonksiyon: Son 1 yıl içinde garantisi biten cihazları bul
async function queryDevicesWithExpiredWarranty(dateKey, startDate, endDate) {
    const tables = [
        { table: 'computers', label: 'Bilgisayar' },
        { table: 'laptops', label: 'Laptop' },
        { table: 'screens', label: 'Monitör' },
        { table: 'printers', label: 'Yazıcı' },
        { table: 'scanners', label: 'Tarayıcı' },
        { table: 'segbis', label: 'SEGBİS' },
        { table: 'tvs', label: 'TV' },
        { table: 'microphones', label: 'Mikrofon' },
        { table: 'cameras', label: 'Kamera' },
        { table: 'e_durusma', label: 'E-Duruşma' }
    ];
    let results = [];
    for (const t of tables) {
        const { data, error } = await supabase
            .from(t.table)
            .select('*')
            .not(dateKey, 'is', null);
        if (!error && data && data.length > 0) {
            for (const row of data) {
                const dt = new Date(row[dateKey]);
                if (!isNaN(dt) && dt < endDate && dt >= startDate) {
                    results.push({
                        ...row,
                        table: t.table,
                        typeLabel: t.label,
                        date: row[dateKey]
                    });
                }
            }
        }
    }
    // Tarihe göre sırala (en yeni biten en üstte)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    return results;
}

// Cihaz silme anahtar kelimeleri
const deviceDeleteKeywords = [
    'cihaz sil',
    'cihazı sil',
    'bir cihaz silmek istiyorum',
    'seri numarası ile cihaz sil',
    'seri no ile cihaz sil',
    'seri no ile sil',
    'serino ile sil',
    'serino ile cihaz sil',
    'silmek istiyorum',
    'cihazı kaldır',
    'kayıt sil',
    'kayıt kaldır',
    'cihaz kaydını sil',
    'cihaz kaydını kaldır'
];
function isDeviceDeleteIntent(message) {
    const lower = message.toLowerCase();
    return deviceDeleteKeywords.some(keyword => lower.includes(keyword));
}

// Seri numarasından cihazı bulup silen yardımcı fonksiyon
enumSerialFields = [
    'kasa_seri_no', 'laptop_seri_no', 'ekran_seri_no', 'yazici_seri_no',
    'tarayici_seri_no', 'segbis_seri_no', 'tv_seri_no', 'mikrofon_seri_no',
    'kamera_seri_no', 'edurusma_seri_no'
];
async function deleteDeviceBySerial(serial) {
    const tables = [
        { table: 'computers', serialField: 'kasa_seri_no' },
        { table: 'laptops', serialField: 'laptop_seri_no' },
        { table: 'screens', serialField: 'ekran_seri_no' },
        { table: 'printers', serialField: 'yazici_seri_no' },
        { table: 'scanners', serialField: 'tarayici_seri_no' },
        { table: 'segbis', serialField: 'segbis_seri_no' },
        { table: 'tvs', serialField: 'tv_seri_no' },
        { table: 'microphones', serialField: 'mikrofon_seri_no' },
        { table: 'cameras', serialField: 'kamera_seri_no' },
        { table: 'e_durusma', serialField: 'edurusma_seri_no' }
    ];
    for (const t of tables) {
        const { data, error } = await supabase
            .from(t.table)
            .select('*')
            .eq(t.serialField, serial)
            .order('created_at', { ascending: false })
            .limit(1);
        if (!error && data && data.length > 0) {
            // Cihaz bulundu, sil
            const id = data[0].id;
            const { error: delError } = await supabase
                .from(t.table)
                .delete()
                .eq('id', id);
            if (!delError) {
                return { success: true, table: t.table, serialField: t.serialField, deleted: data[0] };
            } else {
                return { success: false, error: delError.message };
            }
        }
    }
    return { success: false, error: 'Cihaz bulunamadı.' };
}

// sendMessage fonksiyonunu güncelle
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // --- Cihaz silme akışı (ilk kontrol!) ---
    if (conversationContext.waitingForDeviceDeleteSerial) {
        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        const result = await deleteDeviceBySerial(message.trim());
        removeTypingIndicator();
        if (result.success) {
            addBotMessage(`Cihaz başarıyla silindi! (Tablo: ${result.table})\nSeri No: ${message.trim()}`);
        } else {
            addBotMessage('Cihaz silinemedi: ' + result.error);
        }
        conversationContext.waitingForDeviceDeleteSerial = false;
        return;
    }
    if (isDeviceDeleteIntent(message)) {
        addUserMessage(message);
        userInput.value = '';
        removeTypingIndicator();
        conversationContext.waitingForDeviceDeleteSerial = true;
        addBotMessage('Lütfen silmek istediğiniz cihazın seri numarasını giriniz:');
        return;
    }

    // --- Temizlik tarihi geçen cihazlar sorgulama (son 3 ay) ---
    if (isExpiredCleaningQueryIntent(message)) {
        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        const now = new Date();
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const results = await queryDevicesWithExpiredWarranty('son_temizlik_tarihi', threeMonthsAgo, now);
        removeTypingIndicator();
        if (results.length > 0) {
            const list = results.map(r =>
                `• **${r.typeLabel}** | Birim: ${r.birim || '-'} | Seri No: ${r.kasa_seri_no || r.laptop_seri_no || r.ekran_seri_no || r.yazici_seri_no || r.tarayici_seri_no || r.segbis_seri_no || r.tv_seri_no || r.mikrofon_seri_no || r.kamera_seri_no || r.edurusma_seri_no || '-'} | Son Temizlik: ${r.son_temizlik_tarihi}`
            ).join('\n');
            addBotMessage(`Son 3 ayda temizlik tarihi geçen cihazlar:\n${list}`);
        } else {
            addBotMessage('Son 3 ayda temizlik tarihi geçen cihaz bulunamadı.');
        }
        return;
    }

    // --- Garantisi geçen cihazlar sorgulama ---
    if (isExpiredWarrantyQueryIntent(message)) {
        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        // Son 1 yıl içinde garantisi bitmiş cihazlar
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const results = await queryDevicesWithExpiredWarranty('son_garanti_tarihi', oneYearAgo, now);
        removeTypingIndicator();
        if (results.length > 0) {
            const list = results.map(r =>
                `• **${r.typeLabel}** | Birim: ${r.birim || '-'} | Seri No: ${r.kasa_seri_no || r.laptop_seri_no || r.ekran_seri_no || r.yazici_seri_no || r.tarayici_seri_no || r.segbis_seri_no || r.tv_seri_no || r.mikrofon_seri_no || r.kamera_seri_no || r.edurusma_seri_no || '-'} | Son Garanti: ${r.son_garanti_tarihi}`
            ).join('\n');
            addBotMessage(`Son 1 yıl içinde garantisi biten cihazlar:\n${list}`);
        } else {
            addBotMessage('Son 1 yıl içinde garantisi biten cihaz bulunamadı.');
        }
        return;
    }
    // --- Yaklaşan garanti sorgulama (artık 1 yıl) ---
    if (isWarrantyQueryIntent(message)) {
        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        const results = await queryDevicesWithUpcomingDate('son_garanti_tarihi', 365); // 1 yıl
        removeTypingIndicator();
        if (results.length > 0) {
            const list = results.map(r =>
                `• **${r.typeLabel}** | Birim: ${r.birim || '-'} | Seri No: ${r.kasa_seri_no || r.laptop_seri_no || r.ekran_seri_no || r.yazici_seri_no || r.tarayici_seri_no || r.segbis_seri_no || r.tv_seri_no || r.mikrofon_seri_no || r.kamera_seri_no || r.edurusma_seri_no || '-'} | Son Garanti: ${r.son_garanti_tarihi}`
            ).join('\n');
            addBotMessage(`Yaklaşan garanti bitiş tarihli cihazlar (1 yıl içinde):\n${list}`);
        } else {
            addBotMessage('Önümüzdeki 1 yıl içinde garantisi bitecek cihaz bulunamadı.');
        }
        return;
    }
    // --- Yaklaşan temizlik sorgulama (30 gün) ---
    if (isCleaningQueryIntent(message)) {
        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        const results = await queryDevicesWithUpcomingDate('son_temizlik_tarihi', 30);
        removeTypingIndicator();
        if (results.length > 0) {
            const list = results.map(r =>
                `• **${r.typeLabel}** | Birim: ${r.birim || '-'} | Seri No: ${r.kasa_seri_no || r.laptop_seri_no || r.ekran_seri_no || r.yazici_seri_no || r.tarayici_seri_no || r.segbis_seri_no || r.tv_seri_no || r.mikrofon_seri_no || r.kamera_seri_no || r.edurusma_seri_no || '-'} | Son Temizlik: ${r.son_temizlik_tarihi}`
            ).join('\n');
            addBotMessage(`Yaklaşan temizlik tarihi olan cihazlar (30 gün içinde):\n${list}`);
        } else {
            addBotMessage('Önümüzdeki 30 gün içinde temizlik zamanı gelen cihaz bulunamadı.');
        }
        return;
    }

    // --- Seri numarasından cihaz sorgulama akışı ---
    if (conversationContext.waitingForSerialQuery) {
        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        // Sorgula
        const found = await queryDeviceBySerial(message.trim());
        removeTypingIndicator();
        if (found) {
            // Tüm alanları göster
            const details = Object.entries(found)
                .filter(([k]) => k !== 'table' && k !== 'id')
                .map(([k, v]) => `**${k.replace(/_/g, ' ').toUpperCase()}**: ${v}`)
                .join('\n');
            addBotMessage(`Cihaz bulundu! (Tablo: ${found.table})\n${details}`);
        } else {
            addBotMessage('Bu seri numarasına ait cihaz bulunamadı.');
        }
        conversationContext.waitingForSerialQuery = false;
        return;
    }
    if (isDeviceQueryIntent(message)) {
        addUserMessage(message);
        userInput.value = '';
        removeTypingIndicator();
        conversationContext.waitingForSerialQuery = true;
        addBotMessage('Lütfen sorgulamak istediğiniz cihazın seri numarasını giriniz:');
        return;
    }

    // Unvan seçim akışı (her şeyden önce kontrol edilmeli)
    if (conversationContext.deviceAdd && conversationContext.deviceAdd.waitingForUnvan) {
        const oda_tipi = conversationContext.deviceAdd.oda_tipi;
        let opts = oda_tipi === 'Hakim Odaları'
            ? [ { value: 'Hakim', num: '1' }, { value: 'Savcı', num: '2' } ]
            : unvanOptions[oda_tipi];
        let selected = getSelectedOption(message, opts);
        if (!selected) {
            removeTypingIndicator();
            addBotMessage('Hatalı seçim yaptınız. Lütfen aşağıdaki unvanlardan birini seçin:');
            showSelectionMessage('Lütfen unvan seçin', opts);
            userInput.value = '';
            return;
        }
        addUserMessage(message);
        userInput.value = '';
        conversationContext.deviceAdd.fieldValues['unvan'] = selected;
        conversationContext.deviceAdd.waitingForUnvan = false;
        conversationContext.deviceAdd.currentFieldIndex += 1;
        removeTypingIndicator();
        // Sonraki alanı sor
        const { deviceType, currentFieldIndex } = conversationContext.deviceAdd;
        const fields = deviceTypes[deviceType].fields;
        if (currentFieldIndex < fields.length) {
            addBotMessage(`${fields[currentFieldIndex].label}:`);
        }
        return;
    }

    addUserMessage(message);
    userInput.value = '';
    showTypingIndicator();

    if (!conversationContext.deviceAdd) conversationContext.deviceAdd = null;

    // Oda tipi seçim akışı
    if (conversationContext.deviceAdd && conversationContext.deviceAdd.waitingForOdaTipi) {
        let selected = null;
        for (let i = 0; i < odaTipiOptions.length; i++) {
            if (
                message.trim() === odaTipiOptions[i].num ||
                message.trim().toLowerCase() === odaTipiOptions[i].label.toLowerCase()
            ) {
                selected = odaTipiOptions[i].label;
                break;
            }
        }
        if (!selected) {
            removeTypingIndicator();
            addBotMessage('Yanlış seçim, lütfen aşağıdaki oda tiplerinden birini seçin:\n' + odaTipiOptions.map(o => `${o.num}- ${o.label}`).join('\n'));
            return;
        }
        conversationContext.deviceAdd.oda_tipi = selected;
        conversationContext.deviceAdd.waitingForOdaTipi = false;
        conversationContext.deviceAdd.waitingForBirim = true;
        removeTypingIndicator();
        const birimler = birimOptions[selected];
        addBotMessage('Birim seçin:\n' + birimler.map((b, i) => `${i + 1}- ${b}`).join('\n') + '\nAçıklama: Cihazın bağlı olduğu mahkeme veya birimin tam adını seçiniz.');
        return;
    }
    // Mahkeme No bekleniyorsa, kullanıcıdan gelen mesajı kontrol et
    if (conversationContext.deviceAdd && conversationContext.deviceAdd.waitingForMahkemeNo) {
        if (!/^[0-9]+$/.test(message.trim())) {
            removeTypingIndicator();
            addBotMessage('Mahkeme No alanı sadece rakamlardan oluşmalıdır. Lütfen tekrar giriniz (örn: 12):');
            return;
        }
        conversationContext.deviceAdd.mahkeme_no = message.trim();
        conversationContext.deviceAdd.waitingForMahkemeNo = false;
        conversationContext.deviceAdd.waitingForDeviceType = true;
        removeTypingIndicator();
        const devOpts = odaTipiToDeviceTypes[conversationContext.deviceAdd.oda_tipi];
        addBotMessage('Lütfen cihaz tipini seçin:\n' + devOpts.map(d => `${d.num}- ${d.label}`).join('\n'));
        return;
    }
    // Birim seçim akışı
    if (conversationContext.deviceAdd && conversationContext.deviceAdd.waitingForBirim) {
        const birimler = birimOptions[conversationContext.deviceAdd.oda_tipi];
        let selected = null;
        for (let i = 0; i < birimler.length; i++) {
            if (message.trim() === String(i + 1) || message.trim().toLowerCase() === birimler[i].toLowerCase()) {
                selected = birimler[i];
                break;
            }
        }
        if (!selected) {
            removeTypingIndicator();
            addBotMessage('Yanlış seçim, lütfen aşağıdaki birimlerden birini seçin:\n' + birimler.map((b, i) => `${i + 1}- ${b}`).join('\n') + '\nAçıklama: Cihazın bağlı olduğu mahkeme veya birimin tam adını seçiniz.');
            return;
        }
        conversationContext.deviceAdd.birim = selected;
        conversationContext.deviceAdd.waitingForBirim = false;
        conversationContext.deviceAdd.waitingForMahkemeNo = true;
        removeTypingIndicator();
        addBotMessage('Mahkeme No giriniz: (Sadece rakam giriniz, örn: 12)');
        return;
    }
    // Mahkeme No giriş akışı
    if (conversationContext.deviceAdd && conversationContext.deviceAdd.waitingForMahkemeNo) {
        if (!/^[0-9]+$/.test(message.trim())) {
            removeTypingIndicator();
            addBotMessage('Mahkeme No sadece rakamlardan oluşmalıdır. Lütfen tekrar giriniz (örn: 12):');
            return;
        }
        conversationContext.deviceAdd.mahkeme_no = message.trim();
        conversationContext.deviceAdd.waitingForMahkemeNo = false;
        conversationContext.deviceAdd.waitingForDeviceType = true;
        removeTypingIndicator();
        const devOpts = odaTipiToDeviceTypes[conversationContext.deviceAdd.oda_tipi];
        addBotMessage('Lütfen cihaz tipini seçin:\n' + devOpts.map(d => `${d.num}- ${d.label}`).join('\n'));
        return;
    }
    // Cihaz tipi seçim akışı
    if (conversationContext.deviceAdd && conversationContext.deviceAdd.waitingForDeviceType) {
        const oda_tipi = conversationContext.deviceAdd.oda_tipi;
        const devOpts = odaTipiToDeviceTypes[oda_tipi];
        if (!devOpts) {
            showSelectionMessage('Cihaz tipi seçenekleri bulunamadı', []);
            return;
        }
        let selected = null;
        for (const opt of devOpts) {
            if (message.trim() === opt.num || message.trim().toLowerCase() === (opt.label || opt.value).toLowerCase()) {
                selected = opt;
                break;
            }
        }
        if (!selected) {
            removeTypingIndicator();
            showSelectionMessage('Lütfen cihaz tipini seçin', devOpts);
            return;
        }
        // Cihaz tipi seçildi, alanları sormaya başla
        conversationContext.deviceAdd.waitingForDeviceType = false;
        conversationContext.deviceAdd.deviceType = selected.type;
        conversationContext.deviceAdd.currentFieldIndex = 0;
        conversationContext.deviceAdd.fieldValues = { 
            oda_tipi: oda_tipi, 
            birim: conversationContext.deviceAdd.birim,
            mahkeme_no: conversationContext.deviceAdd.mahkeme_no 
        };

        // Duruşma Salonu için özel alan filtresi
        let fields = [...deviceTypes[selected.type].fields];
        if (oda_tipi === 'Duruşma Salonu') {
            fields = fields.filter(field => 
                !['unvan', 'adi_soyadi', 'sicil_no', 'sicilno'].includes(field.key)
            );
        }

        conversationContext.deviceAdd.fields = fields;
        removeTypingIndicator();

        // Eğer ilk alan birim ise ve zaten seçiliyse, bir sonraki alana geç
        let startIndex = 0;
        if (
            (fields[0].key && fields[0].key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'birim') ||
            (fields[0].label && fields[0].label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().includes('birim'))
        ) {
            startIndex = 1;
        }

        conversationContext.deviceAdd.inProgress = true;
        conversationContext.deviceAdd.currentFieldIndex = startIndex;

        if (startIndex < fields.length) {
            if (fields[startIndex].key === 'unvan') {
                conversationContext.deviceAdd.waitingForUnvan = true;
                const opts = oda_tipi === 'Hakim Odaları'
                    ? [ { value: 'Hakim', num: '1' }, { value: 'Savcı', num: '2' } ]
                    : unvanOptions[oda_tipi];
                showSelectionMessage('Lütfen unvan seçin', opts);
            } else {
                addBotMessage(`${fields[startIndex].label}:`);
            }
        }
        return;
    }
    // Mahkeme No kontrolü için özel kontrol bloğu
    if (
        conversationContext.deviceAdd &&
        conversationContext.deviceAdd.inProgress &&
        !conversationContext.deviceAdd.waitingForBirim &&
        !conversationContext.deviceAdd.waitingForUnvan &&
        !conversationContext.deviceAdd.waitingForDate
    ) {
        const { currentFieldIndex, fields } = conversationContext.deviceAdd;
        if (fields[currentFieldIndex].key === 'mahkeme_no') {
            if (!/^[0-9]+$/.test(message.trim())) {
                removeTypingIndicator();
                addBotMessage('Mahkeme No alanı sadece rakamlardan oluşmalıdır. Lütfen tekrar giriniz (örn: 12):');
                return;
            }
        }
    }

    if (conversationContext.deviceAdd && conversationContext.deviceAdd.inProgress) {
        const { currentFieldIndex, deviceType, fieldValues, oda_tipi, fields } = conversationContext.deviceAdd;
        let nextIndex = currentFieldIndex;

        // Mevcut alanı kaydet
        if (fields[currentFieldIndex].key === 'mahkeme_no') {
            if (!/^[0-9]+$/.test(message.trim())) {
                removeTypingIndicator();
                addBotMessage('Mahkeme No alanı sadece rakamlardan oluşmalıdır. Lütfen tekrar giriniz (örn: 12):');
                return;
            }
            fieldValues['mahkeme_no'] = message.trim();
            nextIndex++;
        } else {
            fieldValues[fields[currentFieldIndex].key] = message;
            nextIndex++;
        }
        // Alanları sırayla sorarken oda_tipi'yi kullanıcıya tekrar sorma
        do {
            if (nextIndex < fields.length && fields[nextIndex].key === 'oda_tipi') {
                fieldValues['oda_tipi'] = oda_tipi;
                nextIndex++;
                continue;
            }
            // Unvan alanı için seçimli akış
            if (nextIndex < fields.length && fields[nextIndex].key === 'unvan') {
                if (oda_tipi === 'Duruşma Salonu') {
                    // Duruşma Salonu ise unvanı atla
                    nextIndex++;
                    continue;
                }
                if (!conversationContext.deviceAdd.waitingForUnvan) {
                    conversationContext.deviceAdd.waitingForUnvan = true;
                    removeTypingIndicator();
                    // Hakim Odaları için sadece 1-hakim, 2-savcı sun
                    const opts = oda_tipi === 'Hakim Odaları'
                        ? [ { value: 'Hakim', num: '1' }, { value: 'Savcı', num: '2' } ]
                        : unvanOptions[oda_tipi];
                    showSelectionMessage('Lütfen unvan seçin', opts);
                    return;
                }
            }
        } while (nextIndex < fields.length && (fields[nextIndex].key === 'qr_kod' || fields[nextIndex].key === 'barkod' || fields[nextIndex].key === 'oda_tipi' || (fields[nextIndex].key === 'unvan' && oda_tipi === 'Duruşma Salonu')));
        if (nextIndex < fields.length) {
            conversationContext.deviceAdd.currentFieldIndex = nextIndex;
            removeTypingIndicator();
            const isBirimField =
                (fields[nextIndex].key && fields[nextIndex].key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'birim') ||
                (fields[nextIndex].label && fields[nextIndex].label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().includes('birim'));
            const isDateField =
                (fields[nextIndex].key && fields[nextIndex].key.toLowerCase().includes('tarih')) ||
                (fields[nextIndex].label && fields[nextIndex].label.toLowerCase().includes('tarih'));
            // Tarih alanı için açıklama ve format kontrolü
            if (isDateField) {
                addBotMessage(`${fields[nextIndex].label}: (Ör: 11-08-2003)\nAçıklama: Lütfen tarihi GG-AA-YYYY formatında giriniz.`);
                conversationContext.deviceAdd.waitingForDate = true;
                conversationContext.deviceAdd.dateFieldIndex = nextIndex;
                return;
            }
            // Birim alanı için oda tipine göre seçimli akış
            if (isBirimField) {
                const birimler = birimOptions[oda_tipi];
                if (!conversationContext.deviceAdd.waitingForBirim) {
                    conversationContext.deviceAdd.waitingForBirim = true;
                    addBotMessage('Birim seçin:\n' + birimler.map((b, i) => `${i + 1}- ${b}`).join('\n') + '\nAçıklama: Cihazın bağlı olduğu mahkeme veya birimin tam adını seçiniz.');
                    return;
                } else {
                    // Kullanıcıdan gelen mesajı kontrol et
                    let selected = null;
                    for (let i = 0; i < birimler.length; i++) {
                        if (message.trim() === String(i + 1) || message.trim().toLowerCase() === birimler[i].toLowerCase()) {
                            selected = birimler[i];
                            break;
                        }
                    }
                    if (!selected) {
                        addBotMessage('Yanlış seçim, lütfen aşağıdaki birimlerden birini seçin:\n' + birimler.map((b, i) => `${i + 1}- ${b}`).join('\n') + '\nAçıklama: Cihazın bağlı olduğu mahkeme veya birimin tam adını seçiniz.');
                        return;
                    }
                    conversationContext.deviceAdd.fieldValues['birim'] = selected;
                    conversationContext.deviceAdd.waitingForBirim = false;
                    nextIndex++;
                }
            }
            if (conversationContext.deviceAdd.waitingForBirim) return;
            if (isBirimField && !conversationContext.deviceAdd.waitingForBirim) {
                // Birim seçildiyse bir sonraki alana geç
                if (nextIndex < fields.length) {
                    conversationContext.deviceAdd.currentFieldIndex = nextIndex;
                    removeTypingIndicator();
                    // Sonraki alanı sor
                    const isDateField2 =
                        (fields[nextIndex].key && fields[nextIndex].key.toLowerCase().includes('tarih')) ||
                        (fields[nextIndex].label && fields[nextIndex].label.toLowerCase().includes('tarih'));
                    if (isDateField2) {
                        addBotMessage(`${fields[nextIndex].label}: (Ör: 11-08-2003)\nAçıklama: Lütfen tarihi GG-AA-YYYY formatında giriniz.`);
                        conversationContext.deviceAdd.waitingForDate = true;
                        conversationContext.deviceAdd.dateFieldIndex = nextIndex;
                        return;
                    }
                    addBotMessage(`${fields[nextIndex].label}:`);
                    return;
                }
            }
            if (!isBirimField) {
                addBotMessage(`${fields[nextIndex].label}:`);
            }
            return;
        } else {
            conversationContext.deviceAdd.inProgress = false;
            fieldValues.qr_kod = generateDeviceCode(deviceType);
            fieldValues.barkod = generateDeviceCode(deviceType);
            fieldValues.created_at = new Date().toISOString();
            try {
                const { error } = await supabase
                    .from(deviceType)
                    .insert([fieldValues]);
                removeTypingIndicator();
                if (!error) {
                    addBotMessage('Cihaz başarıyla veritabanına kaydedildi!\n' +
                        Object.entries(fieldValues).map(([k, v]) => `**${fields.find(f => f.key === k)?.label || k}:** ${v}`).join('\n'));
                } else {
                    addBotMessage('Cihaz kaydedilirken hata oluştu: ' + error.message);
                }
            } catch (e) {
                removeTypingIndicator();
                addBotMessage('Cihaz kaydedilirken beklenmeyen bir hata oluştu.');
            }
            return;
        }
    }
    // Eğer cihaz ekleme niyeti varsa (ilk başlatma)
    if (isDeviceAddIntent(message)) {
        // Eğer zaten bir oda tipi seçimi bekleniyorsa tekrar başlatma
        if (!conversationContext.deviceAdd || (!conversationContext.deviceAdd.waitingForOdaTipi && !conversationContext.deviceAdd.waitingForDeviceType && !conversationContext.deviceAdd.inProgress)) {
            conversationContext.deviceAdd = { inProgress: false, waitingForOdaTipi: true, waitingForDeviceType: false };
            removeTypingIndicator();
            addBotMessage('Lütfen oda tipini seçin:\n' + odaTipiOptions.map(o => `${o.num}- ${o.label}`).join('\n'));
        }
        return;
    }

    function isExpiredCleaningQueryIntent(message) {
        const lower = message.toLowerCase();
        return expiredCleaningKeywords.some(keyword => lower.includes(keyword));
    }

    conversationContext.conversationHistory.push({
        role: 'user',
        message: message,
        timestamp: new Date().toISOString()
    });

    // Kullanıcı mesajını veritabanına kaydet
    await saveMessage(currentChatId, 'user', message);
    // Eğer başlık yoksa, ilk mesajdan başlık üret ve güncelle
    const title = generateChatTitleFromMessage(message);
    await updateChatTitleIfNeeded(currentChatId, title);

    try {
        if (isTechnicalQuestion(message)) {
            const problemType = identifyProblemType(message);
            const context = `Kullanıcının son sorusu: "${message}"
Sorun türü: ${problemType}
\nKullanıcının önceki mesajları:\n${conversationContext.conversationHistory.slice(-3).map(h => `${h.role}: ${h.message}`).join('\n')}`;
            const prompt = `Sen bir teknik destek asistanısın. Şu kuralları takip et:\n\n1. Önce sorunu kısaca özetle (1-2 cümle)\n2. Sonra çözüm adımlarını detaylı açıkla\n3. Her başlık için uygun bir emoji kullan (🔍, 🔧, ⚡️, 💻, 🛠️, ⚠️, 💡, ✅ gibi)\n4. Her adımı numaralandır ve alt maddeleri varsa bullet point kullan\n5. Teknik terimleri basit dille açıkla\n6. Cevabın sonunda kullanıcıya yardımcı olmak istediğini belirt ve soru sormaya teşvik et\n\nFormatı şu şekilde olmalı:\n[Kısa sorun özeti]\n\n[Emoji] 1. [Başlık]\n• [Detay 1]\n• [Detay 2]\n\n[Emoji] 2. [Başlık]\n[Detaylar...]\n\n💡 Ekstra İpuçları:\n• [İpucu 1]\n• [İpucu 2]\n\n[Yardım teklifi ve soru teşviki]\n\n${context}`;
            conversationContext.lastPrompt = prompt;
            conversationContext.lastContext = context;
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            });
            conversationContext.lastResponse = response.text;
            conversationContext.conversationHistory.push({
                role: 'assistant',
                message: response.text,
                timestamp: new Date().toISOString()
            });
            removeTypingIndicator();
            addBotMessage(response.text);
            await saveMessage(currentChatId, 'assistant', response.text);
            await renderChatHistory();
            return;
        }
        if (isContinueRequest(message)) {
            if (conversationContext.lastContext && conversationContext.lastResponse) {
                const continuePrompt = `${conversationContext.lastContext}\n\nKullanıcı konuyla ilgili daha fazla bilgi istiyor. Son cevabın: "${conversationContext.lastResponse}"\n\nBu konuyla ilgili farklı açılardan veya daha detaylı bilgi ver. Önceki bilgileri tekrar etme, yeni bilgiler ekle. Aynı emoji ve formatlama stilini kullan.`;
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [{
                        role: "user",
                        parts: [{ text: continuePrompt }]
                    }]
                });
                conversationContext.lastResponse = response.text;
                removeTypingIndicator();
                addBotMessage(response.text);
                await saveMessage(currentChatId, 'assistant', response.text);
                await renderChatHistory();
                return;
            }
        }
        if (isGreeting(message)) {
            conversationContext.greetingDone = true;
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{
                    role: "user",
                    parts: [{
                        text: `Sen bir teknik destek asistanısın. Selamlaşmaya kısa ve öz cevap ver (maksimum 2 cümle) ve kullanıcıyı teknik konulara yönlendir. Mesaj: ${message}`
                    }]
                }]
            });
            conversationContext.conversationHistory.push({
                role: 'assistant',
                message: response.text,
                timestamp: new Date().toISOString()
            });
            removeTypingIndicator();
            addBotMessage(response.text);
            await saveMessage(currentChatId, 'assistant', response.text);
            await renderChatHistory();
            return;
        }
        removeTypingIndicator();
        addBotMessage("Bilgisayar, UYAP veya e-imza ile ilgili teknik bir sorun yaşıyorsanız, lütfen sorununuzu açıkça belirtin. Size yardımcı olmaktan memnuniyet duyarım.");
        await saveMessage(currentChatId, 'assistant', "Bilgisayar, UYAP veya e-imza ile ilgili teknik bir sorun yaşıyorsanız, lütfen sorununuzu açıkça belirtin. Size yardımcı olmaktan memnuniyet duyarım.");
        await renderChatHistory();
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addBotMessage("Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.");
        await saveMessage(currentChatId, 'assistant', "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.");
        await renderChatHistory();
    }

    // --- Cihaz silme akışı ---
    if (conversationContext.waitingForDeviceDeleteSerial) {
        addUserMessage(message);
        userInput.value = '';
        showTypingIndicator();
        const result = await deleteDeviceBySerial(message.trim());
        removeTypingIndicator();
        if (result.success) {
            addBotMessage(`Cihaz başarıyla silindi! (Tablo: ${result.table})\nSeri No: ${message.trim()}`);
        } else {
            addBotMessage('Cihaz silinemedi: ' + result.error);
        }
        conversationContext.waitingForDeviceDeleteSerial = false;
        return;
    }
    // Cihaz silme niyeti kontrolü teknik destekten önce olmalı
    if (isDeviceDeleteIntent(message)) {
        addUserMessage(message);
        userInput.value = '';
        removeTypingIndicator();
        conversationContext.waitingForDeviceDeleteSerial = true;
        addBotMessage('Lütfen silmek istediğiniz cihazın seri numarasını giriniz:');
        return;
    }
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    // Markdown'ı HTML'e dönüştür
    try {
        if (marked) {
            messageDiv.innerHTML = marked.parse(message);
        } else {
            messageDiv.textContent = message;
        }
    } catch (error) {
        messageDiv.textContent = message;
    }

    // Link ve kod bloklarını düzgün görüntüle
    const links = messageDiv.getElementsByTagName('a');
    for (let link of links) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }

    const codes = messageDiv.getElementsByTagName('code');
    for (let code of codes) {
        code.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        code.style.padding = '2px 4px';
        code.style.borderRadius = '3px';
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
} 