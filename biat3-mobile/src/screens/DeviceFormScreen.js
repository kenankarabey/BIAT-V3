import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withThemedScreen from '../components/withThemedScreen';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from 'react-native-modal-selector';
import { supabase } from '../supabaseClient';

const ODA_TIPLERI = {
  MAHKEME_KALEMI: 'Mahkeme Kalemi',
  HAKIM_ODALARI: 'Hakim Odaları',
  DURUSMA_SALONU: 'Duruşma Salonu'
};

const UNVANLAR = {
  [ODA_TIPLERI.MAHKEME_KALEMI]: [
    'zabıt katibi',
    'mübaşir',
    'icra katibi',
    'icra müdürü',
    'icra memuru',
    'icra müdür yardımcısı',
    'yazı işleri müdürü',
    'veznedar',
    'hizmetli',
    'tarama memuru',
    'memur',
    'teknisyen',
    'tekniker',
    'bilgi işlem müdürü',
    'uzman'
  ],
  [ODA_TIPLERI.HAKIM_ODALARI]: [
    'hakim',
    'savcı'
  ]
};

const TABLE_MAP = {
  kasa: { table: 'computers', prefix: 'kasa' },
  laptop: { table: 'laptops', prefix: 'laptop' },
  monitör: { table: 'screens', prefix: 'ekran' },
  yazıcı: { table: 'printers', prefix: 'yazici' },
  tarayıcı: { table: 'scanners', prefix: 'tarayici' },
  segbis: { table: 'segbis', prefix: 'segbis' },
  tv: { table: 'tvs', prefix: 'tv' },
  mikrofon: { table: 'microphones', prefix: 'mikrofon' },
  kamera: { table: 'cameras', prefix: 'kamera' },
  edurusma: { table: 'e_durusmas', prefix: 'e_durusma' },
};

// Hangi cihaz hangi odalara eklenebilir?
const DEVICE_ROOM_RULES = {
  kasa: [ODA_TIPLERI.MAHKEME_KALEMI, ODA_TIPLERI.DURUSMA_SALONU],
  laptop: [ODA_TIPLERI.MAHKEME_KALEMI, ODA_TIPLERI.HAKIM_ODALARI],
  monitör: [ODA_TIPLERI.MAHKEME_KALEMI, ODA_TIPLERI.HAKIM_ODALARI, ODA_TIPLERI.DURUSMA_SALONU],
  yazıcı: [ODA_TIPLERI.MAHKEME_KALEMI, ODA_TIPLERI.HAKIM_ODALARI, ODA_TIPLERI.DURUSMA_SALONU],
  tarayıcı: [ODA_TIPLERI.MAHKEME_KALEMI],
  segbis: [ODA_TIPLERI.DURUSMA_SALONU],
  tv: [ODA_TIPLERI.DURUSMA_SALONU],
  mikrofon: [ODA_TIPLERI.DURUSMA_SALONU],
  kamera: [ODA_TIPLERI.DURUSMA_SALONU],
  edurusma: [ODA_TIPLERI.DURUSMA_SALONU],
};

// Hangi cihazda kullanıcı bilgisi gösterilecek? (KURAL:)
// - Kasa, Laptop, Monitör: Sadece oda tipi Duruşma Salonu DEĞİLSE göster
// - Yazıcı: Sadece oda tipi Hakim Odaları ise göster
// - Diğer cihazlarda gösterme
const shouldShowUserInfo = (cihazTipi, odaTipi) => {
  if (!cihazTipi || !odaTipi) return false;
  const id = cihazTipi.id;
  if (['kasa', 'laptop', 'monitör'].includes(id)) {
    return odaTipi !== ODA_TIPLERI.DURUSMA_SALONU;
  }
  if (id === 'yazıcı') {
    return odaTipi === ODA_TIPLERI.HAKIM_ODALARI;
  }
  // Diğer cihazlarda kullanıcı bilgisi gösterilmez
  return false;
};

// Sadece kasa için temizlik tarihleri göster
const shouldShowCleaningDates = (cihazTipi) => cihazTipi?.id === 'kasa';

// Oda ve cihaz tipi uyumlu mu?
const isRoomAllowedForDevice = (cihazTipi, odaTipi) => {
  if (!cihazTipi || !odaTipi) return false;
  return DEVICE_ROOM_RULES[cihazTipi.id]?.includes(odaTipi);
};

const DeviceFormScreen = ({ navigation, route, theme }) => {
  let { cihazTipi, deviceType, odaTipi: initialOdaTipi, birim: initialBirim, mahkemeNo: initialMahkemeNo, device } = route.params || {};
  if (!cihazTipi && deviceType) {
    cihazTipi = deviceType;
  }

  // Her durumda cihazTipi'ni insan okunur hale getir
  const typeMap = {
    kasa: { id: 'kasa', name: 'Kasa' },
    computers: { id: 'kasa', name: 'Kasa' },
    laptop: { id: 'laptop', name: 'Laptop' },
    laptops: { id: 'laptop', name: 'Laptop' },
    monitör: { id: 'monitör', name: 'Monitör' },
    screens: { id: 'monitör', name: 'Monitör' },
    yazıcı: { id: 'yazıcı', name: 'Yazıcı' },
    printers: { id: 'yazıcı', name: 'Yazıcı' },
    tarayıcı: { id: 'tarayıcı', name: 'Tarayıcı' },
    scanners: { id: 'tarayıcı', name: 'Tarayıcı' },
    segbis: { id: 'segbis', name: 'SEGBİS' },
    tv: { id: 'tv', name: 'TV' },
    mikrofon: { id: 'mikrofon', name: 'Mikrofon' },
    kamera: { id: 'kamera', name: 'Kamera' },
    cameras: { id: 'kamera', name: 'Kamera' },
    edurusma: { id: 'edurusma', name: 'E-Duruşma' },
    e_durusmas: { id: 'edurusma', name: 'E-Duruşma' },
  };
  if (cihazTipi && (!cihazTipi.name || cihazTipi.name === 'Cihaz')) {
    const tipKey = (cihazTipi.id || cihazTipi.type || cihazTipi.tip || '').toLowerCase();
    cihazTipi = typeMap[tipKey] || { id: tipKey, name: cihazTipi.id || cihazTipi.type || cihazTipi.tip || '-' };
  }

  if (cihazTipi && initialOdaTipi && !isRoomAllowedForDevice(cihazTipi, initialOdaTipi)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
        <View style={styles.formContainer}>
          <Text style={{ color: 'red', fontSize: 16, margin: 24 }}>
            Bu cihaz tipi bu oda tipine eklenemez!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [unvan, setUnvan] = useState('');
  const [sicilNo, setSicilNo] = useState('');
  const [isimSoyisim, setIsimSoyisim] = useState('');
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');
  const [seriNo, setSeriNo] = useState('');
  const [ilkGarantiTarihi, setIlkGarantiTarihi] = useState(new Date());
  const [sonGarantiTarihi, setSonGarantiTarihi] = useState(new Date());
  const [ilkTemizlikTarihi, setIlkTemizlikTarihi] = useState(new Date());
  const [sonTemizlikTarihi, setSonTemizlikTarihi] = useState(new Date());

  const [showIlkGarantiPicker, setShowIlkGarantiPicker] = useState(false);
  const [showSonGarantiPicker, setShowSonGarantiPicker] = useState(false);
  const [showIlkTemizlikPicker, setShowIlkTemizlikPicker] = useState(false);
  const [showSonTemizlikPicker, setShowSonTemizlikPicker] = useState(false);

  const isDark = theme?.isDark;
  const boxStyle = {
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: isDark ? '#60a5fa' : '#161a4a',
    paddingHorizontal: 12,
    paddingVertical: 0,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  };
  const inputCustom = {
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  };
  const modalOptionContainer = {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
  };
  const modalOptionText = {
    color: isDark ? '#fff' : theme.text,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  };
  const modalCancelText = {
    color: isDark ? '#fff' : theme.text,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  };
  const modalOverlay = {
    backgroundColor: 'rgba(22,26,74,0.7)',
  };

  // Düzenlenebilir alanlar için state
  const [odaTipi, setOdaTipi] = useState(initialOdaTipi || device?.oda_tipi || '');
  const [birim, setBirim] = useState(initialBirim || device?.birim || '');
  const [mahkemeNo, setMahkemeNo] = useState(initialMahkemeNo || device?.mahkeme_no || '');

  const aktifOdaTipi = odaTipi;
  // Unvanların baş harfini büyüt (ör: İcra Müdürü)
  function capitalizeTurkish(str) {
    return str.split(' ').map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')).join(' ');
  }
  const unvanData = aktifOdaTipi && UNVANLAR[aktifOdaTipi]
    ? UNVANLAR[aktifOdaTipi].map((u) => ({ key: u, label: capitalizeTurkish(u) }))
    : [];
  const [unvanModalVisible, setUnvanModalVisible] = useState(false);

  // Oda Tipi ModalSelector için state
  const [odaTipiModalVisible, setOdaTipiModalVisible] = useState(false);

  // Birim ModalSelector için state
  const [birimModalVisible, setBirimModalVisible] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  // Düzenleme modunda, sadece device'da olan alanları doldur
  useEffect(() => {
    if (device) {
      setMarka(device.marka || '');
      setModel(device.model || '');
      setSeriNo(device.seri_no || '');
      setUnvan(device.unvan || '');
      setIsimSoyisim(device.adi_soyadi || '');
      setSicilNo(device.sicil_no || device.sicilno || '');
      if (device.ilk_garanti_tarihi) setIlkGarantiTarihi(new Date(device.ilk_garanti_tarihi));
      if (device.son_garanti_tarihi) setSonGarantiTarihi(new Date(device.son_garanti_tarihi));
      if (device.ilk_temizlik_tarihi) setIlkTemizlikTarihi(new Date(device.ilk_temizlik_tarihi));
      if (device.son_temizlik_tarihi) setSonTemizlikTarihi(new Date(device.son_temizlik_tarihi));
      if (device.oda_tipi) setOdaTipi(device.oda_tipi);
      if (device.birim) setBirim(device.birim);
      if (device.mahkeme_no) setMahkemeNo(device.mahkeme_no);
    }
  }, [device]);

  // DEBUG: odaTipi ve unvanData'yı logla
  useEffect(() => {
    console.log('ODA_TIPI:', odaTipi);
    console.log('UNVANLAR anahtarları:', Object.keys(UNVANLAR));
    console.log('unvanData:', unvanData);
  }, [odaTipi, unvanData]);

  useEffect(() => {
    console.log('DeviceFormScreen device param:', device);
  }, []);

  const handleKaydet = async () => {
    const tableConfig = TABLE_MAP[cihazTipi.id];
    if (!tableConfig) {
      alert('Geçersiz cihaz tipi!');
      return;
    }

    const qrPrefix = tableConfig.prefix;
    const timestamp = Date.now();
    const randomId = Math.floor(100 + Math.random() * 900); // 100-999 arası
    const qr_kod = `${qrPrefix}_${timestamp}_${randomId}`;
    const barkod = `${qrPrefix}_${timestamp}_${randomId}`;

    const baseFields = {
      [`${tableConfig.prefix}_marka`]: marka,
      [`${tableConfig.prefix}_model`]: model,
      [`${tableConfig.prefix}_seri_no`]: seriNo,
      qr_kod,
      barkod,
      ilk_garanti_tarihi: formatDate(ilkGarantiTarihi),
      son_garanti_tarihi: formatDate(sonGarantiTarihi),
      mahkeme_no: mahkemeNo,
      oda_tipi: odaTipi,
      birim,
    };

    // Kullanıcı bilgileri gerekliyse ekle
    if (shouldShowUserInfo(cihazTipi, odaTipi)) {
      if (cihazTipi.id === 'yazıcı') {
        Object.assign(baseFields, {
          adi_soyadi: isimSoyisim,
          unvan: unvan,
          sicilno: sicilNo,
        });
      } else {
        Object.assign(baseFields, {
          adi_soyadi: isimSoyisim,
          unvan: unvan,
          sicil_no: sicilNo,
        });
      }
    }

    // Kasa için temizlik tarihlerini ekle
    if (cihazTipi.id === 'kasa') {
      Object.assign(baseFields, {
        ilk_temizlik_tarihi: formatDate(ilkTemizlikTarihi),
        son_temizlik_tarihi: formatDate(sonTemizlikTarihi),
      });
    }

    console.log('Kayıt gönderiliyor:', baseFields);

    let data, error;
    if (device && device.id) {
      console.log('UPDATE branch, id:', device.id);
      ({ data, error } = await supabase
        .from(tableConfig.table)
        .update(baseFields)
        .eq('id', device.id));
    } else {
      console.log('INSERT branch');
      ({ data, error } = await supabase
        .from(tableConfig.table)
        .insert([baseFields]));
    }

    console.log('Supabase yanıtı:', { data, error });

    if (error) {
      alert('Kayıt başarısız: ' + error.message);
    } else {
      if (device && device.id) {
        alert('Cihaz güncellendi!');
      } else {
        alert('Yeni cihaz eklendi!');
      }
      navigation.goBack();
    }
  };

  // Form alanlarının görünürlüğünü kontrol et
  const showUserInfo = shouldShowUserInfo(cihazTipi, odaTipi);
  const showCleaningDates = shouldShowCleaningDates(cihazTipi);

  const inputBgColor = isDark ? '#23272e' : theme.inputBg;
  const inputTextColor = isDark ? '#111' : theme.text;

  // Tüm gösterim kutuları için de aynı renkler
  const displayBgColor = isDark ? '#23272e' : theme.cardBackground;
  const displayTextColor = isDark ? '#111' : theme.text;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{cihazTipi?.name} Bilgileri</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Oda Tipi alanı */}
          <Text style={[styles.label, { color: theme.text }]}>Oda Tipi</Text>
          <TouchableOpacity style={[boxStyle, { backgroundColor: theme.inputBg }]} onPress={() => setOdaTipiModalVisible(true)}>
            <Text style={inputCustom}>{odaTipi || 'Seçiniz'}</Text>
          </TouchableOpacity>
          {odaTipiModalVisible && (
            <ModalSelector
              data={
                cihazTipi && DEVICE_ROOM_RULES[cihazTipi.id]
                  ? DEVICE_ROOM_RULES[cihazTipi.id].map((tip) => ({ key: tip, label: tip }))
                  : Object.values(ODA_TIPLERI).map((tip) => ({ key: tip, label: tip }))
              }
              visible={odaTipiModalVisible}
              onModalClose={() => setOdaTipiModalVisible(false)}
              onChange={option => {
                setOdaTipi(option.key);
                setUnvan("");
                setUnvanModalVisible(false);
                setOdaTipiModalVisible(false);
              }}
              selectedKey={odaTipi}
              initValue={odaTipi || 'Seçiniz'}
              optionContainerStyle={modalOptionContainer}
              optionTextStyle={modalOptionText}
              cancelText="İptal"
              cancelTextStyle={modalCancelText}
              overlayStyle={modalOverlay}
            />
          )}

          {/* Mahkeme No */}
          <Text style={[styles.label, { color: theme.text }]}>Mahkeme No</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgColor, borderColor: inputBgColor, borderWidth: 1 }]}> 
            <TextInput
              value={mahkemeNo}
              onChangeText={setMahkemeNo}
              placeholder="Mahkeme no giriniz"
              placeholderTextColor={isDark ? '#888' : theme.textSecondary}
              style={[styles.input, { color: inputTextColor }]}
              editable={true}
            />
          </View>
          {/* Birim */}
          <Text style={[styles.label, { color: theme.text }]}>Birim</Text>
          <TouchableOpacity
            style={[boxStyle, { backgroundColor: theme.inputBg }]}
            onPress={() => odaTipi && setBirimModalVisible(true)}
            disabled={!odaTipi}
          >
            <Text style={[inputCustom, { color: odaTipi ? (isDark ? '#fff' : '#222') : '#888' }]}>{birim || 'Seçiniz'}</Text>
          </TouchableOpacity>
          <ModalSelector
            data={(() => {
              const BIRIMLER = {
                [ODA_TIPLERI.MAHKEME_KALEMI]: [
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
                [ODA_TIPLERI.HAKIM_ODALARI]: [
                  'Sulh Hukuk Mahkemesi', 'Asliye Hukuk Mahkemesi', 'Tüketici Mahkemesi', 'Kadastro Mahkemesi',
                  'İş Mahkemesi', 'Aile Mahkemesi', 'Ağır Ceza Mahkemesi', 'Adalet Komisyonu Başkanlığı',
                  'Sulh Ceza Hakimliği', 'İnfaz Hakimliği', 'Çocuk Mahkemesi', 'Asliye Ceza Mahkemesi',
                  'Nöbetçi Sulh Ceza Hakimliği', 'Cumhuriyet Başsavcılığı', 'İcra Hukuk Mahkemesi', 'İcra Ceza Mahkemesi'
                ],
                [ODA_TIPLERI.DURUSMA_SALONU]: [
                  'Sulh Hukuk Mahkemesi', 'Asliye Hukuk Mahkemesi', 'Tüketici Mahkemesi', 'Kadastro Mahkemesi',
                  'İş Mahkemesi', 'Aile Mahkemesi', 'Ağır Ceza Mahkemesi', 'Sulh Ceza Hakimliği',
                  'İnfaz Hakimliği', 'Çocuk Mahkemesi', 'Asliye Ceza Mahkemesi', 'İdari İşler Müdürlüğü',
                  'Nöbetçi Sulh Ceza Hakimliği', 'İcra Hukuk Mahkemesi', 'İcra Ceza Mahkemesi'
                ]
              };
              return odaTipi && BIRIMLER[odaTipi]
                ? BIRIMLER[odaTipi].map((birim) => ({ key: birim, label: birim }))
                : [];
            })()}
            visible={typeof birimModalVisible !== 'undefined' ? birimModalVisible : false}
            onChange={option => {
              setBirim(option.key);
              setBirimModalVisible(false);
            }}
            onModalClose={() => setBirimModalVisible(false)}
            optionContainerStyle={modalOptionContainer}
            optionTextStyle={modalOptionText}
            cancelTextStyle={modalCancelText}
            overlayStyle={modalOverlay}
            cancelText="Vazgeç"
            selectedKey={birim}
            value={birim}
            style={{ borderWidth: 0, borderColor: 'transparent' }}
            customSelector={<View />}
          />
          {/* Cihaz Tipi (değiştirilemez, sadece gösterim) */}
          <Text style={[styles.label, { color: theme.text }]}>Cihaz Tipi</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgColor, opacity: 0.7 }]}> 
            <Text style={[styles.input, { color: inputTextColor }]}>{cihazTipi?.name || cihazTipi?.id || '-'}</Text>
          </View>
          {/* Unvan alanı sadece oda tipi seçiliyse ve kullanıcı bilgisi gerekiyorsa gösterilsin */}
          {odaTipi && showUserInfo && (
            <>
              <Text style={[styles.label, { color: theme.text }]}>Unvan</Text>
              <TouchableOpacity style={[boxStyle, { backgroundColor: theme.inputBg }]} onPress={() => setUnvanModalVisible(true)}>
                <Text style={inputCustom}>{unvan || 'Seçiniz'}</Text>
              </TouchableOpacity>
              {unvanModalVisible && (
                <ModalSelector
                  data={unvanData}
                  visible={unvanModalVisible}
                  onModalClose={() => setUnvanModalVisible(false)}
                  onChange={option => {
                    setUnvan(option.label);
                    setUnvanModalVisible(false);
                  }}
                  selectedKey={unvan}
                  initValue={unvan || 'Seçiniz'}
                  optionContainerStyle={modalOptionContainer}
                  optionTextStyle={modalOptionText}
                  cancelText="İptal"
                  cancelTextStyle={modalCancelText}
                  overlayStyle={modalOverlay}
                />
              )}

              {/* Adı Soyadı inputu */}
              <Text style={[styles.label, { color: theme.text }]}>Adı Soyadı</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBgColor }]}> 
                <TextInput
                  value={isimSoyisim}
                  onChangeText={setIsimSoyisim}
                  placeholder="Adı Soyadı giriniz"
                  placeholderTextColor={isDark ? '#888' : theme.textSecondary}
                  style={[styles.input, { color: inputTextColor }]}
                />
              </View>

              {/* Sicil No inputu */}
              <Text style={[styles.label, { color: theme.text }]}>Sicil No</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBgColor }]}> 
                <TextInput
                  value={sicilNo}
                  onChangeText={setSicilNo}
                  placeholder="Sicil no giriniz"
                  placeholderTextColor={isDark ? '#888' : theme.textSecondary}
                  style={[styles.input, { color: inputTextColor }]}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          <Text style={[styles.label, { color: theme.text }]}>Marka</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgColor }]}> 
            <TextInput
              value={marka}
              onChangeText={setMarka}
              placeholder="Marka giriniz"
              placeholderTextColor={isDark ? '#888' : theme.textSecondary}
              style={[styles.input, { color: inputTextColor }]}
            />
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Model</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgColor }]}> 
            <TextInput
              value={model}
              onChangeText={setModel}
              placeholder="Model giriniz"
              placeholderTextColor={isDark ? '#888' : theme.textSecondary}
              style={[styles.input, { color: inputTextColor }]}
            />
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Seri No</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgColor }]}> 
            <TextInput
              value={seriNo}
              onChangeText={setSeriNo}
              placeholder="Seri no giriniz"
              placeholderTextColor={isDark ? '#888' : theme.textSecondary}
              style={[styles.input, { color: inputTextColor }]}
            />
          </View>

          <Text style={[styles.label, { color: theme.text }]}>İlk Garanti Tarihi</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: inputBgColor }]}
            onPress={() => setShowIlkGarantiPicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: inputTextColor }]}>{formatDate(ilkGarantiTarihi)}</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: theme.text }]}>Son Garanti Tarihi</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: inputBgColor }]}
            onPress={() => setShowSonGarantiPicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: inputTextColor }]}>{formatDate(sonGarantiTarihi)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kaydetButton, { backgroundColor: theme.primary }]}
            onPress={handleKaydet}
          >
            <Text style={styles.kaydetButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showIlkGarantiPicker && (
        <DateTimePicker
          value={ilkGarantiTarihi}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowIlkGarantiPicker(false);
            if (selectedDate) {
              setIlkGarantiTarihi(selectedDate);
            }
          }}
        />
      )}

      {showSonGarantiPicker && (
        <DateTimePicker
          value={sonGarantiTarihi}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowSonGarantiPicker(false);
            if (selectedDate) {
              setSonGarantiTarihi(selectedDate);
            }
          }}
        />
      )}

      {showIlkTemizlikPicker && (
        <DateTimePicker
          value={ilkTemizlikTarihi}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowIlkTemizlikPicker(false);
            if (selectedDate) {
              setIlkTemizlikTarihi(selectedDate);
            }
          }}
        />
      )}

      {showSonTemizlikPicker && (
        <DateTimePicker
          value={sonTemizlikTarihi}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowSonTemizlikPicker(false);
            if (selectedDate) {
              setSonTemizlikTarihi(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    padding: 12,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
  },
  kaydetButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  kaydetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default withThemedScreen(DeviceFormScreen); 