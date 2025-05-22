import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabaseClient';

// Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyBLBI27ojz-xDqP5DXxccIL-ufClOu8EXo');

// Selamlaşma kelimeleri
const greetings = [
  'merhaba', 'selam', 'günaydın', 'iyi günler', 'iyi akşamlar', 'nasılsın', 'naber',
  'iyiyim', 'teşekkür', 'teşekkürler', 'sağol', 'hoşça kal', 'görüşürüz'
];

// Teknik anahtar kelimeler
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

// UYAP anahtar kelimeleri
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
  printers: {
    label: 'yazıcı',
    fields: [
      { key: 'birim', label: 'Birim' },
      { key: 'unvan', label: 'Unvan' },
      { key: 'adi_soyadi', label: 'Adı Soyadı' },
      { key: 'sicil_no', label: 'Sicil No' },
      { key: 'printer_marka', label: 'Yazıcı Marka' },
      { key: 'printer_model', label: 'Yazıcı Model' },
      { key: 'printer_seri_no', label: 'Yazıcı Seri No' },
      { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
      { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
    ]
  },
  screens: {
    label: 'monitör',
    fields: [
      { key: 'birim', label: 'Birim' },
      { key: 'unvan', label: 'Unvan' },
      { key: 'adi_soyadi', label: 'Adı Soyadı' },
      { key: 'sicil_no', label: 'Sicil No' },
      { key: 'screen_marka', label: 'Monitör Marka' },
      { key: 'screen_model', label: 'Monitör Model' },
      { key: 'screen_seri_no', label: 'Monitör Seri No' },
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
      { key: 'scanner_marka', label: 'Tarayıcı Marka' },
      { key: 'scanner_model', label: 'Tarayıcı Model' },
      { key: 'scanner_seri_no', label: 'Tarayıcı Seri No' },
      { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
      { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
    ]
  },
  tvs: {
    label: 'televizyon',
    fields: [
      { key: 'birim', label: 'Birim' },
      { key: 'tv_marka', label: 'Televizyon Marka' },
      { key: 'tv_model', label: 'Televizyon Model' },
      { key: 'tv_seri_no', label: 'Televizyon Seri No' },
      { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
      { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
    ]
  },
  segbis: {
    label: 'segbis',
    fields: [
      { key: 'birim', label: 'Birim' },
      { key: 'segbis_marka', label: 'Segbis Marka' },
      { key: 'segbis_model', label: 'Segbis Model' },
      { key: 'segbis_seri_no', label: 'Segbis Seri No' },
      { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
      { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
    ]
  },
  e_durusma: {
    label: 'e-duruşma',
    fields: [
      { key: 'birim', label: 'Birim' },
      { key: 'edurusma_marka', label: 'E-duruşma Marka' },
      { key: 'edurusma_model', label: 'E-duruşma Model' },
      { key: 'edurusma_seri_no', label: 'E-duruşma Seri No' },
      { key: 'ilk_garanti_tarihi', label: 'İlk Garanti Tarihi' },
      { key: 'son_garanti_tarihi', label: 'Son Garanti Tarihi' }
    ]
  }
};
const deviceTypeLabels = Object.values(deviceTypes).map(d => d.label);

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
function generateDeviceCode(type) {
  const ts = Date.now();
  const rand = Math.floor(100 + Math.random() * 900);
  return `${type}_${ts}_${rand}`;
}
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
const deviceDeleteKeywords = [
  'cihaz sil', 'cihazı sil', 'bir cihaz silmek istiyorum', 'seri numarası ile cihaz sil',
  'seri no ile cihaz sil', 'seri no ile sil', 'serino ile sil', 'serino ile cihaz sil',
  'silmek istiyorum', 'cihazı kaldır', 'kayıt sil', 'kayıt kaldır', 'cihaz kaydını sil', 'cihaz kaydını kaldır'
];
function isDeviceDeleteIntent(message) {
  const lower = message.toLowerCase();
  return deviceDeleteKeywords.some(keyword => lower.includes(keyword));
}
const deviceQueryKeywords = [
  'cihaz sorgula', 'seri numarasından sorgula', 'seri no ile cihaz bul', 'seri no sorgula',
  'seri numarası sorgula', 'cihaz bul', 'seri no ile sorgula', 'serino sorgula',
  'serino ile cihaz bul', 'serino ile sorgula'
];
function isDeviceQueryIntent(message) {
  const lower = message.toLowerCase();
  return deviceQueryKeywords.some(keyword => lower.includes(keyword));
}
const warrantyQueryKeywords = [/* ... doldur ... */];
const cleaningQueryKeywords = [/* ... doldur ... */];
function isWarrantyQueryIntent(message) { /* ... doldur ... */ }
function isCleaningQueryIntent(message) { /* ... doldur ... */ }
const expiredWarrantyKeywords = [/* ... doldur ... */];
function isExpiredWarrantyQueryIntent(message) { /* ... doldur ... */ }
const expiredCleaningKeywords = [/* ... doldur ... */];
function isExpiredCleaningQueryIntent(message) { /* ... doldur ... */ }
function showSelectionMessage(label, options, addBotMessage) {
  if (!options || !Array.isArray(options) || options.length === 0) {
    addBotMessage(label + ': (Seçenek bulunamadı)');
    return;
  }
  addBotMessage(`${label}:
` + options.map(o => `${o.num}- ${o.value || o.label}`).join('\n'));
}
function getSelectedOption(message, options) {
  const msg = message.trim().toLowerCase();
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    if (!opt) continue;
    if (msg === String(opt.num).toLowerCase()) return opt.type || opt.value || opt.label;
    if (typeof opt.value === 'string' && msg === opt.value.toLowerCase()) return opt.type || opt.value;
    if (typeof opt.label === 'string' && msg === opt.label.toLowerCase()) return opt.type || opt.value || opt.label;
  }
  return null;
}

function isGreeting(message) {
  const lower = message.toLowerCase();
  return greetings.some(word => lower.includes(word));
}

function isTechnicalQuestion(message) {
  const lower = message.toLowerCase();
  const allTechnicalKeywords = [
    ...Object.values(technicalKeywords).flat(),
    ...Object.values(uyapKeywords).flat()
  ];
  return allTechnicalKeywords.some(word => lower.includes(word));
}

function generateChatTitleFromMessage(message) {
  const sentences = message.split(/[.?!]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
  const combined = sentences.join(' ');
  const lower = combined.toLowerCase();
  if (lower.includes('ssd') || lower.includes('disk') || lower.includes('depolama')) return 'SSD Sorunu';
  if (lower.includes('yazıcı') || lower.includes('printer') || lower.includes('print')) return 'Yazıcı Sorunu';
  if (lower.includes('internet') || lower.includes('wifi') || lower.includes('ağ') || lower.includes('ethernet')) return 'Ağ Bağlantı Sorunu';
  if (lower.includes('e-imza') || lower.includes('elektronik imza')) return 'E-imza Problemi';
  if (lower.includes('uyap')) return 'UYAP Sorunu';
  if (lower.includes('monitör') || lower.includes('ekran')) return 'Ekran/Monitör Sorunu';
  if (lower.includes('şifre') || lower.includes('parola')) return 'Şifre Problemi';
  if (lower.includes('klavye') || lower.includes('mouse') || lower.includes('fare')) return 'Klavye/Fare Sorunu';
  let title = combined;
  if (title.length > 50) title = title.split(' ').slice(0, 8).join(' ') + '...';
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function identifyProblemType(message) {
  const lower = message.toLowerCase();
  if (lower.includes('e-imza') || lower.includes('elektronik imza')) return 'e-imza';
  if (lower.includes('uyap')) return 'uyap';
  if (technicalKeywords.systemCommands.some(word => lower.includes(word))) return 'system_command';
  if (technicalKeywords.hardware.some(word => lower.includes(word))) return 'donanım';
  if (technicalKeywords.software.some(word => lower.includes(word))) return 'yazılım';
  if (technicalKeywords.network.some(word => lower.includes(word))) return 'ağ';
  return '';
}

function isContinueRequest(message) {
  const continuePatterns = [
    'devam et', 'devam', 'daha fazla bilgi ver', 'detay ver', 'detaylı anlat',
    'başka', 'diğer', 'biraz daha', 'daha'
  ];
  return continuePatterns.some(pattern => message.toLowerCase().includes(pattern));
}

// Yardımcı fonksiyonlar
function getMarkaLabel(deviceType) {
  if (deviceType === 'computers') return 'Kasa Marka';
  if (deviceType === 'laptops') return 'Laptop Marka';
  if (deviceType === 'printers') return 'Yazıcı Marka';
  if (deviceType === 'screens') return 'Monitör Marka';
  if (deviceType === 'scanners') return 'Tarayıcı Marka';
  if (deviceType === 'tvs') return 'Televizyon Marka';
  if (deviceType === 'segbis') return 'Segbis Marka';
  if (deviceType === 'e_durusma') return 'E-duruşma Marka';
  return 'Marka';
}
function getModelLabel(deviceType) {
  if (deviceType === 'computers') return 'Kasa Model';
  if (deviceType === 'laptops') return 'Laptop Model';
  if (deviceType === 'printers') return 'Yazıcı Model';
  if (deviceType === 'screens') return 'Monitör Model';
  if (deviceType === 'scanners') return 'Tarayıcı Model';
  if (deviceType === 'tvs') return 'Televizyon Model';
  if (deviceType === 'segbis') return 'Segbis Model';
  if (deviceType === 'e_durusma') return 'E-duruşma Model';
  return 'Model';
}
function getSeriNoLabel(deviceType) {
  if (deviceType === 'computers') return 'Kasa Seri No';
  if (deviceType === 'laptops') return 'Laptop Seri No';
  if (deviceType === 'printers') return 'Yazıcı Seri No';
  if (deviceType === 'screens') return 'Monitör Seri No';
  if (deviceType === 'scanners') return 'Tarayıcı Seri No';
  if (deviceType === 'tvs') return 'Televizyon Seri No';
  if (deviceType === 'segbis') return 'Segbis Seri No';
  if (deviceType === 'e_durusma') return 'E-duruşma Seri No';
  return 'Seri No';
}

// Tarih formatlama fonksiyonu ekle
function toISODateFromTR(dateStr) {
  // 11-11-2024 → 2024-11-11
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

const ChatbotScreen = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]); // {role, content}
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // [{id, title, ...}]
  const [waitingForSerialQuery, setWaitingForSerialQuery] = useState(false);
  const [waitingForDeviceDeleteSerial, setWaitingForDeviceDeleteSerial] = useState(false);
  const [deviceAddState, setDeviceAddState] = useState(null); // {inProgress, ...}
  const [typing, setTyping] = useState(false);
  const scrollViewRef = useRef();
  const [user, setUser] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // On mount, get user object and start new chat
  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('user');
      let userObj = null;
      try {
        userObj = JSON.parse(userStr);
      } catch (e) {
        userObj = null;
      }
      setUser(userObj);
      if (!userObj || !userObj.id) {
        console.log('Kullanıcı bulunamadı veya id yok:', userObj);
        return;
      }
      await loadChatHistory(userObj.id);
      await startNewChat(userObj.id);
    })();
  }, []);

  // Load chat history
  const loadChatHistory = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setChatHistory(data);
  };

  // Start new chat
  const startNewChat = async (userId = user?.id) => {
    setDeviceAddState(null);
    setWaitingForSerialQuery(false);
    setWaitingForDeviceDeleteSerial(false);
    setMessages([]);
    setTyping(false);
    if (!userId) {
      console.log('startNewChat: userId yok');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([{ user_id: userId, title: '', is_active: true }])
        .select()
        .single();
      console.log('startNewChat: supabase insert', { data, error });
      if (error) {
        Alert.alert('Sohbet başlatılamadı', error.message);
        return;
      }
      setCurrentChatId(data.id);
      setMessages([{ role: 'assistant', content: 'Merhaba! Ben teknik destek asistanınızım. Bilgisayar ve UYAP konularında size nasıl yardımcı olabilirim?' }]);
      await saveMessage(data.id, 'assistant', 'Merhaba! Ben teknik destek asistanınızım. Bilgisayar ve UYAP konularında size nasıl yardımcı olabilirim?');
      await loadChatHistory(userId);
    } catch (e) {
      console.log('startNewChat hata:', e);
      Alert.alert('startNewChat hata', e.message);
    }
  };

  // Save message to Supabase
  const saveMessage = async (chatId, role, content) => {
    if (!chatId) {
      console.log('saveMessage: chatId yok');
      return;
    }
    try {
      const { error } = await supabase.from('messages').insert([{ chat_id: chatId, sender: role, content }]);
      console.log('saveMessage:', { chatId, role, content, error });
      if (error) Alert.alert('Mesaj kaydedilemedi', error.message);
    } catch (e) {
      console.log('saveMessage hata:', e);
      Alert.alert('saveMessage hata', e.message);
    }
  };

  // Load messages for a chat
  const loadChatMessages = async (chatId) => {
    setCurrentChatId(chatId);
    setDeviceAddState(null);
    setWaitingForSerialQuery(false);
    setWaitingForDeviceDeleteSerial(false);
    setTyping(false);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(data.map(m => ({ role: m.sender, content: m.content })));
    }
  };

  // Update chat title if needed
  const updateChatTitleIfNeeded = async (chatId, message) => {
    if (!chatId || !message) return;
    const { data } = await supabase.from('chats').select('title').eq('id', chatId).single();
    if (data && (!data.title || data.title.trim() === '')) {
      const title = generateChatTitleFromMessage(message);
      await supabase.from('chats').update({ title: title }).eq('id', chatId);
      await loadChatHistory(user?.id);
    }
  };

  // --- MESSAGE SEND HANDLER ---
  const handleSend = async () => {
    console.log('handleSend başlıyor', { inputText, currentChatId });
    if (!inputText.trim() || !currentChatId) {
      console.log('handleSend: inputText boş veya currentChatId yok');
      return;
    }
    const message = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    await saveMessage(currentChatId, 'user', message);
    await updateChatTitleIfNeeded(currentChatId, message);
    setTyping(true);

    // --- Cihaz ekleme akışı ---
    if (deviceAddState || isDeviceAddIntent(message)) {
      const addBotMessage = (content) => setMessages(prev => [...prev, { role: 'assistant', content }]);
      // 1. Oda Tipi seçimi
      if (!deviceAddState) {
        setDeviceAddState({ step: 'odaTipi' });
        showSelectionMessage('Oda Tipi Seçiniz', odaTipiOptions, addBotMessage);
        setTyping(false);
        return;
      }
      // 2. Oda Tipi seçildi → Birim seçimi
      if (deviceAddState.step === 'odaTipi') {
        const selectedOda = getSelectedOption(message, odaTipiOptions);
        if (!selectedOda) {
          showSelectionMessage('Lütfen geçerli bir oda tipi seçin', odaTipiOptions, addBotMessage);
          setTyping(false);
          return;
        }
        setDeviceAddState({ step: 'birim', odaTipi: selectedOda });
        showSelectionMessage('Birim Seçiniz', birimOptions[selectedOda].map((b, i) => ({ value: b, num: (i + 1).toString() })), addBotMessage);
        setTyping(false);
        return;
      }
      // 3. Birim seçildi → Mahkeme No (sayı) istenecek
      if (deviceAddState.step === 'birim') {
        const selectedBirim = getSelectedOption(message, birimOptions[deviceAddState.odaTipi].map((b, i) => ({ value: b, num: (i + 1).toString() })));
        if (!selectedBirim) {
          showSelectionMessage('Lütfen geçerli bir birim seçin', birimOptions[deviceAddState.odaTipi].map((b, i) => ({ value: b, num: (i + 1).toString() })), addBotMessage);
          setTyping(false);
          return;
        }
        setDeviceAddState({ ...deviceAddState, step: 'mahkemeNo', birim: selectedBirim });
        addBotMessage('Mahkeme No giriniz (sadece sayı):');
        setTyping(false);
        return;
      }
      // 4. Mahkeme No alındı → Cihaz Tipi seçimi
      if (deviceAddState.step === 'mahkemeNo') {
        const mahkemeNo = message.trim();
        if (!/^[0-9]+$/.test(mahkemeNo)) {
          addBotMessage('Lütfen sadece sayı giriniz. Mahkeme No:');
          setTyping(false);
          return;
        }
        setDeviceAddState({ ...deviceAddState, step: 'cihazTipi', mahkemeNo });
        showSelectionMessage('Cihaz Tipi Seçiniz', odaTipiToDeviceTypes[deviceAddState.odaTipi], addBotMessage);
        setTyping(false);
        return;
      }
      // 5. Cihaz Tipi seçildi → Unvan gerekiyorsa seçenekli, gerekmiyorsa marka/model/seri no
      if (deviceAddState.step === 'cihazTipi') {
        const selectedDeviceType = getSelectedOption(message, odaTipiToDeviceTypes[deviceAddState.odaTipi]);
        let deviceTypeKey = null;
        if (selectedDeviceType && deviceTypes[selectedDeviceType]) {
          deviceTypeKey = selectedDeviceType;
        } else if (selectedDeviceType) {
          const found = Object.entries(deviceTypes).find(([k, v]) => v.label.toLowerCase() === selectedDeviceType.toLowerCase());
          if (found) deviceTypeKey = found[0];
        }
        if (!deviceTypeKey || !deviceTypes[deviceTypeKey]) {
          showSelectionMessage('Lütfen geçerli bir cihaz tipi seçin', odaTipiToDeviceTypes[deviceAddState.odaTipi], addBotMessage);
          setTyping(false);
          return;
        }
        // Unvan gerekip gerekmediğini belirle
        const odaTipi = deviceAddState.odaTipi;
        const unvanGerekli = ['computers', 'laptops', 'printers', 'screens', 'scanners'].includes(deviceTypeKey) && odaTipi !== 'Duruşma Salonu';
        if (unvanGerekli) {
          setDeviceAddState({ ...deviceAddState, step: 'unvan', deviceType: deviceTypeKey });
          const unvanOpts = unvanOptions[odaTipi] || [];
          showSelectionMessage('Unvan Seçiniz', unvanOpts, addBotMessage);
          setTyping(false);
          return;
        } else {
          setDeviceAddState({ ...deviceAddState, step: 'marka', deviceType: deviceTypeKey });
          addBotMessage(`${getMarkaLabel(deviceTypeKey)} giriniz:`);
          setTyping(false);
          return;
        }
      }
      // 6. Unvan seçildi → Adı Soyadı ve Sicil No gerekiyorsa sor
      if (deviceAddState.step === 'unvan') {
        const odaTipi = deviceAddState.odaTipi;
        const unvanOpts = unvanOptions[odaTipi] || [];
        const selectedUnvan = getSelectedOption(message, unvanOpts);
        if (!selectedUnvan) {
          showSelectionMessage('Lütfen geçerli bir unvan seçin', unvanOpts, addBotMessage);
          setTyping(false);
          return;
        }
        setDeviceAddState({ ...deviceAddState, step: 'adiSoyadi', unvan: selectedUnvan });
        addBotMessage('Adı Soyadı giriniz:');
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'adiSoyadi') {
        setDeviceAddState({ ...deviceAddState, step: 'sicilNo', adi_soyadi: message });
        addBotMessage('Sicil No giriniz:');
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'sicilNo') {
        setDeviceAddState({ ...deviceAddState, step: 'marka', sicil_no: message });
        addBotMessage(`${getMarkaLabel(deviceAddState.deviceType)} giriniz:`);
        setTyping(false);
        return;
      }
      // 7. Marka, Model, Seri No
      if (deviceAddState.step === 'marka') {
        setDeviceAddState({ ...deviceAddState, step: 'model', marka: message });
        addBotMessage(`${getModelLabel(deviceAddState.deviceType)} giriniz:`);
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'model') {
        setDeviceAddState({ ...deviceAddState, step: 'seriNo', model: message });
        addBotMessage(`${getSeriNoLabel(deviceAddState.deviceType)} giriniz:`);
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'seriNo') {
        // Temizlik tarihi gerekli mi?
        const temizlikGerekli = deviceAddState.deviceType === 'computers';
        if (temizlikGerekli) {
          setDeviceAddState({ ...deviceAddState, step: 'ilkTemizlik', seri_no: message });
          addBotMessage('İlk Temizlik Tarihi giriniz (örn: 11-11-2024):');
          setTyping(false);
          return;
        } else {
          setDeviceAddState({ ...deviceAddState, step: 'ilkGaranti', seri_no: message });
          addBotMessage('İlk Garanti Tarihi giriniz (örn: 11-11-2024):');
          setTyping(false);
          return;
        }
      }
      // 8. Temizlik ve Garanti Tarihleri
      if (deviceAddState.step === 'ilkTemizlik') {
        setDeviceAddState({ ...deviceAddState, step: 'sonTemizlik', ilk_temizlik_tarihi: message });
        addBotMessage('Son Temizlik Tarihi giriniz (örn: 11-11-2024):');
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'sonTemizlik') {
        setDeviceAddState({ ...deviceAddState, step: 'ilkGaranti', son_temizlik_tarihi: message });
        addBotMessage('İlk Garanti Tarihi giriniz (örn: 11-11-2024):');
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'ilkGaranti') {
        setDeviceAddState({ ...deviceAddState, step: 'sonGaranti', ilk_garanti_tarihi: message });
        addBotMessage('İlk Garanti Tarihi giriniz (örn: 11-11-2024):');
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'sonGaranti') {
        setDeviceAddState({ ...deviceAddState, step: 'confirm', son_garanti_tarihi: message });
        const d = { ...deviceAddState, son_garanti_tarihi: message };
        addBotMessage(`Cihaz bilgileri:\nOda Tipi: ${d.odaTipi}\nBirim: ${d.birim}\nMahkeme No: ${d.mahkemeNo}\nCihaz Tipi: ${deviceTypes[d.deviceType].label}\n${d.unvan ? 'Unvan: ' + d.unvan + '\n' : ''}${d.adi_soyadi ? 'Adı Soyadı: ' + d.adi_soyadi + '\n' : ''}${d.sicil_no ? 'Sicil No: ' + d.sicil_no + '\n' : ''}Marka: ${d.marka}\nModel: ${d.model}\nSeri No: ${d.seri_no}\n${d.ilk_temizlik_tarihi ? 'İlk Temizlik Tarihi: ' + d.ilk_temizlik_tarihi + '\n' : ''}${d.son_temizlik_tarihi ? 'Son Temizlik Tarihi: ' + d.son_temizlik_tarihi + '\n' : ''}İlk Garanti Tarihi: ${d.ilk_garanti_tarihi}\nSon Garanti Tarihi: ${message}\n\nOnaylıyor musunuz? (evet/hayır)`);
        setTyping(false);
        return;
      }
      if (deviceAddState.step === 'confirm') {
        if (message.trim().toLowerCase() === 'evet') {
          const d = deviceAddState;
          // Tablo ve alan eşleştirme
          const tableMap = {
            computers: { table: 'computers', marka: 'kasa_marka', model: 'kasa_model', seri_no: 'kasa_seri_no', ilk_temizlik: 'ilk_temizlik_tarihi', son_temizlik: 'son_temizlik_tarihi', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' },
            laptops: { table: 'laptops', marka: 'laptop_marka', model: 'laptop_model', seri_no: 'laptop_seri_no', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' },
            printers: { table: 'printers', marka: 'yazici_marka', model: 'yazici_model', seri_no: 'yazici_seri_no', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' },
            screens: { table: 'screens', marka: 'ekran_marka', model: 'ekran_model', seri_no: 'ekran_seri_no', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' },
            scanners: { table: 'scanners', marka: 'tarayici_marka', model: 'tarayici_model', seri_no: 'tarayici_seri_no', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' },
            tvs: { table: 'tvs', marka: 'tv_marka', model: 'tv_model', seri_no: 'tv_seri_no', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' },
            segbis: { table: 'segbis', marka: 'segbis_marka', model: 'segbis_model', seri_no: 'segbis_seri_no', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' },
            e_durusma: { table: 'e_durusma', marka: 'edurusma_marka', model: 'edurusma_model', seri_no: 'edurusma_seri_no', ilk_garanti: 'ilk_garanti_tarihi', son_garanti: 'son_garanti_tarihi' }
          };
          const map = tableMap[d.deviceType];
          if (!map) {
            addBotMessage('Bu cihaz tipi için tablo bulunamadı.');
            setDeviceAddState(null);
            setTyping(false);
            return;
          }
          // QR ve barkod üretimi
          const now = Date.now();
          const rand = Math.floor(100 + Math.random() * 900);
          const codeStr = `${map.table}_${now}_${rand}`;
          // Alanları hazırla
          let insertObj = {
            oda_tipi: d.odaTipi,
            birim: d.birim,
            mahkeme_no: d.mahkemeNo,
            unvan: d.unvan,
            adi_soyadi: d.adi_soyadi
          };
          if (map.table === 'printers') {
            insertObj['sicilno'] = d.sicil_no;
          } else {
            insertObj['sicil_no'] = d.sicil_no;
          }
          insertObj['qr_kod'] = codeStr;
          insertObj['barkod'] = codeStr;
          insertObj[map.marka] = d.marka;
          insertObj[map.model] = d.model;
          insertObj[map.seri_no] = d.seri_no;
          if (map.ilk_temizlik && d.ilk_temizlik_tarihi) insertObj[map.ilk_temizlik] = toISODateFromTR(d.ilk_temizlik_tarihi);
          if (map.son_temizlik && d.son_temizlik_tarihi) insertObj[map.son_temizlik] = toISODateFromTR(d.son_temizlik_tarihi);
          if (map.ilk_garanti && d.ilk_garanti_tarihi) insertObj[map.ilk_garanti] = toISODateFromTR(d.ilk_garanti_tarihi);
          if (map.son_garanti && d.son_garanti_tarihi) insertObj[map.son_garanti] = toISODateFromTR(d.son_garanti_tarihi);
          try {
            const { data, error } = await supabase.from(map.table).insert([insertObj]);
            console.log('Supabase insert:', { data, error, insertObj });
            if (error) {
              addBotMessage('Cihaz kaydedilirken hata oluştu: ' + error.message);
            } else {
              addBotMessage('Cihaz başarıyla kaydedildi!');
            }
          } catch (e) {
            addBotMessage('Cihaz kaydedilirken beklenmeyen bir hata oluştu: ' + (e.message || e.toString()));
          }
          setDeviceAddState(null);
          setTyping(false);
          return;
        } else if (message.trim().toLowerCase() === 'hayır') {
          addBotMessage('Cihaz ekleme işlemi iptal edildi.');
          setDeviceAddState(null);
          setTyping(false);
          return;
        } else {
          addBotMessage('Lütfen "evet" veya "hayır" şeklinde yanıt verin.');
          setTyping(false);
          return;
        }
      }
      setTyping(false);
      return;
    }
    // 2. Cihaz silme akışı
    if (waitingForDeviceDeleteSerial || isDeviceDeleteIntent(message)) {
      const addBotMessage = (content) => setMessages(prev => [...prev, { role: 'assistant', content }]);
      // Seri no bekleniyor mu?
      if (!waitingForDeviceDeleteSerial) {
        setWaitingForDeviceDeleteSerial(true);
        addBotMessage('Silmek istediğiniz cihazın seri numarasını giriniz:');
        setTyping(false);
        return;
      }
      // Seri no geldi, sil
      const serial = message.trim();
      try {
        const { error } = await supabase.from('devices').delete().eq('kasa_seri_no', serial);
        if (!error) {
          addBotMessage('Cihaz başarıyla silindi.');
        } else {
          addBotMessage('Cihaz silinirken hata oluştu veya cihaz bulunamadı.');
        }
      } catch (e) {
        addBotMessage('Cihaz silinirken hata oluştu.');
      }
      setWaitingForDeviceDeleteSerial(false);
      setTyping(false);
      return;
    }
    // 3. Cihaz sorgulama akışı
    if (waitingForSerialQuery || isDeviceQueryIntent(message)) {
      const addBotMessage = (content) => setMessages(prev => [...prev, { role: 'assistant', content }]);
      // Seri no bekleniyor mu?
      if (!waitingForSerialQuery) {
        setWaitingForSerialQuery(true);
        addBotMessage('Sorgulamak istediğiniz cihazın seri numarasını giriniz:');
        setTyping(false);
        return;
      }
      // Seri no geldi, sorgula
      const serial = message.trim();
      try {
        const { data, error } = await supabase.from('devices')
          .select('*')
          .eq('kasa_seri_no', serial)
          .single();
        if (!error && data) {
          const info = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
          addBotMessage('Cihaz Bilgileri:\n' + info);
        } else {
          addBotMessage('Cihaz bulunamadı.');
        }
      } catch (e) {
        addBotMessage('Cihaz sorgulanırken hata oluştu.');
      }
      setWaitingForSerialQuery(false);
      setTyping(false);
      return;
    }
    // 4. Garanti/temizlik/bitmiş garanti/temizlik sorguları
    if (isWarrantyQueryIntent(message)) {
      const addBotMessage = (content) => setMessages(prev => [...prev, { role: 'assistant', content }]);
      // Garanti bitişi yaklaşan cihazlar (ör: 30 gün içinde bitecek)
      try {
        const now = new Date();
        const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const { data, error } = await supabase.from('devices')
          .select('*')
          .gte('son_garanti_tarihi', now.toISOString().slice(0, 10))
          .lte('son_garanti_tarihi', future.toISOString().slice(0, 10));
        if (!error && data && data.length > 0) {
          const list = data.map(d => `${d.kasa_marka || ''} ${d.kasa_model || ''} - Seri No: ${d.kasa_seri_no || ''} - Garanti Bitiş: ${d.son_garanti_tarihi || ''}`).join('\n');
          addBotMessage('Garanti bitişi yaklaşan cihazlar:\n' + list);
        } else {
          addBotMessage('Garanti bitişi yaklaşan cihaz bulunamadı.');
        }
      } catch (e) {
        addBotMessage('Garanti sorgulanırken hata oluştu.');
      }
      setTyping(false);
      return;
    }
    if (isCleaningQueryIntent(message)) {
      const addBotMessage = (content) => setMessages(prev => [...prev, { role: 'assistant', content }]);
      // Temizlik tarihi yaklaşan cihazlar (ör: 30 gün içinde)
      try {
        const now = new Date();
        const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const { data, error } = await supabase.from('devices')
          .select('*')
          .gte('son_temizlik_tarihi', now.toISOString().slice(0, 10))
          .lte('son_temizlik_tarihi', future.toISOString().slice(0, 10));
        if (!error && data && data.length > 0) {
          const list = data.map(d => `${d.kasa_marka || ''} ${d.kasa_model || ''} - Seri No: ${d.kasa_seri_no || ''} - Temizlik Tarihi: ${d.son_temizlik_tarihi || ''}`).join('\n');
          addBotMessage('Temizlik tarihi yaklaşan cihazlar:\n' + list);
        } else {
          addBotMessage('Temizlik tarihi yaklaşan cihaz bulunamadı.');
        }
      } catch (e) {
        addBotMessage('Temizlik sorgulanırken hata oluştu.');
      }
      setTyping(false);
      return;
    }
    if (isExpiredWarrantyQueryIntent(message)) {
      const addBotMessage = (content) => setMessages(prev => [...prev, { role: 'assistant', content }]);
      // Garantisi bitmiş cihazlar
      try {
        const now = new Date();
        const { data, error } = await supabase.from('devices')
          .select('*')
          .lt('son_garanti_tarihi', now.toISOString().slice(0, 10));
        if (!error && data && data.length > 0) {
          const list = data.map(d => `${d.kasa_marka || ''} ${d.kasa_model || ''} - Seri No: ${d.kasa_seri_no || ''} - Garanti Bitiş: ${d.son_garanti_tarihi || ''}`).join('\n');
          addBotMessage('Garantisi bitmiş cihazlar:\n' + list);
        } else {
          addBotMessage('Garantisi bitmiş cihaz bulunamadı.');
        }
      } catch (e) {
        addBotMessage('Garanti sorgulanırken hata oluştu.');
      }
      setTyping(false);
      return;
    }
    if (isExpiredCleaningQueryIntent(message)) {
      const addBotMessage = (content) => setMessages(prev => [...prev, { role: 'assistant', content }]);
      // Temizlik tarihi geçmiş cihazlar
      try {
        const now = new Date();
        const { data, error } = await supabase.from('devices')
          .select('*')
          .lt('son_temizlik_tarihi', now.toISOString().slice(0, 10));
        if (!error && data && data.length > 0) {
          const list = data.map(d => `${d.kasa_marka || ''} ${d.kasa_model || ''} - Seri No: ${d.kasa_seri_no || ''} - Temizlik Tarihi: ${d.son_temizlik_tarihi || ''}`).join('\n');
          addBotMessage('Temizlik tarihi geçmiş cihazlar:\n' + list);
        } else {
          addBotMessage('Temizlik tarihi geçmiş cihaz bulunamadı.');
        }
      } catch (e) {
        addBotMessage('Temizlik sorgulanırken hata oluştu.');
      }
      setTyping(false);
      return;
    }
    // 5. Teknik destek dışı mesajlar
    if (!isTechnicalQuestion(message) && !isGreeting(message)) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sadece teknik konularda yardımcı olabilirim. Lütfen bilgisayar, yazıcı, ağ, UYAP veya benzeri teknik bir soru sorun.' }]);
      await saveMessage(currentChatId, 'assistant', 'Sadece teknik konularda yardımcı olabilirim. Lütfen bilgisayar, yazıcı, ağ, UYAP veya benzeri teknik bir soru sorun.');
      setTyping(false);
      return;
    }
    // 6. Teknik destek intenti (Gemini API)
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Sen bir teknik destek asistanısın. Şu kuralları takip et:\n\n1. Önce sorunu kısaca özetle (1-2 cümle)\n2. Sonra çözüm adımlarını detaylı açıkla\n3. Her başlık için uygun bir emoji kullan (🔍, 🔧, ⚡️, 💻, 🛠️, ⚠️, 💡, ✅ gibi)\n4. Her adımı numaralandır ve alt maddeleri varsa bullet point kullan\n5. Teknik terimleri basit dille açıkla\n6. Cevabın sonunda kullanıcıya yardımcı olmak istediğini belirt ve soru sormaya teşvik et\n\nFormatı şu şekilde olmalı:\n[Kısa sorun özeti]\n\n[Emoji] 1. [Başlık]\n• [Detay 1]\n• [Detay 2]\n\n[Emoji] 2. [Başlık]\n[Detaylar...]\n\n💡 Ekstra İpuçları:\n• [İpucu 1]\n• [İpucu 2]\n\n[Yardım teklifi ve soru teşviki]\n\nKullanıcının mesajı: "${message}"`;
      console.log('Gemini prompt:', prompt);
      const result = await model.generateContent(prompt);
      console.log('Gemini result:', result);
      const response = result.response.text();
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      await saveMessage(currentChatId, 'assistant', response);
      setTyping(false);
      await loadChatHistory(user?.id);
    } catch (error) {
      console.log('Gemini API hata:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' }]);
      await saveMessage(currentChatId, 'assistant', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
      setTyping(false);
      Alert.alert('Gemini API hata', error.message);
    }
  };

  // --- UI ---
  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
          isUser ? { backgroundColor: theme.primary } : { backgroundColor: theme.card },
          { borderColor: theme.border }
        ]}
      >
        <Markdown style={{ body: { color: isUser ? '#fff' : theme.text, fontSize: 16 } }}>{message.content}</Markdown>
      </View>
    );
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => {
        setHistoryModalVisible(false);
        loadChatMessages(item.id);
      }}
    >
      <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.title || 'Sohbet'}</Text>
      <TouchableOpacity
        onPress={async () => {
          Alert.alert('Sohbeti sil', 'Bu sohbeti silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Sil', style: 'destructive', onPress: async () => {
                await supabase.from('chats').delete().eq('id', item.id);
                if (currentChatId === item.id) setMessages([]);
                await loadChatHistory(user?.id);
              }
            }
          ]);
        }}
      >
        <Ionicons name="trash" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>  
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 140}
      >
        <View style={{ flex: 1 }}>
          {/* Chat History Modal */}
          <Modal
            visible={historyModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setHistoryModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.historyModal, { backgroundColor: theme.card, borderColor: theme.border }]}> 
                <View style={styles.historyHeader}>
                  <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Sohbet Geçmişi</Text>
                  <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                    <Ionicons name="close" size={28} color={theme.primary} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={chatHistory}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderHistoryItem}
                  contentContainerStyle={{ padding: 8 }}
                  ListEmptyComponent={<Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>Hiç sohbet geçmişiniz yok.</Text>}
                />
                <TouchableOpacity style={styles.newChatModalButton} onPress={() => { setHistoryModalVisible(false); startNewChat(); }}>
                  <Ionicons name="add-circle" size={24} color={theme.primary} />
                  <Text style={{ color: theme.primary, marginLeft: 8, fontWeight: 'bold' }}>Yeni Sohbet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* Main Chat Area */}
          <View style={styles.mainChat}>
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}> 
              <Text style={[styles.headerTitle, { color: theme.text }]}>Teknik Destek Asistanı</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={styles.historyButton} onPress={() => setHistoryModalVisible(true)}>
                  <Ionicons name="time" size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.newChatButton} onPress={() => startNewChat()}>
                  <Ionicons name="add" size={24} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((message, index) => renderMessage(message, index))}
                {typing && (
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>Asistan yazıyor...</Text>
                  </View>
                )}
              </ScrollView>
              <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}> 
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                  placeholder="Mesajınızı yazın..."
                  placeholderTextColor={theme.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxHeight={100}
                  onFocus={() => setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300)}
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: theme.primary }]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || typing}
                >
                  <Ionicons name="send" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainChat: { flex: 1, flexDirection: 'column' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  newChatButton: { marginLeft: 8 },
  historyButton: { marginRight: 8 },
  keyboardAvoidingView: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16 },
  messageContainer: { maxWidth: '80%', marginVertical: 8, padding: 12, borderRadius: 16, borderWidth: 1 },
  userMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1 },
  input: { flex: 1, marginRight: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, fontSize: 16, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  historyModal: { width: '90%', maxHeight: '80%', borderRadius: 16, borderWidth: 1, paddingBottom: 16 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  historyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  newChatModalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, padding: 10 },
});

export default ChatbotScreen; 