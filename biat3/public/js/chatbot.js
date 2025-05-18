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
    const lower = message.toLowerCase();

    // Anahtar kelimeye göre başlıklar
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
    // ... başka anahtar kelimeler eklenebilir ...

    // Hiçbiri yoksa, ilk 6-7 kelimeyi başlık yap
    let title = message.split(/[.?!]/)[0];
    if (title.length > 40) {
        title = title.split(' ').slice(0, 7).join(' ') + '...';
    }
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
    lastContext: null
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

// sendMessage fonksiyonunu güncelle
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    conversationContext.conversationHistory.push({
        role: 'user',
        message: message,
        timestamp: new Date().toISOString()
    });

    addUserMessage(message);
    userInput.value = '';
    showTypingIndicator();

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