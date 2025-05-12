import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withThemedScreen from '../components/withThemedScreen';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelector from 'react-native-modal-selector';
import { supabase } from '../supabaseClient';

const ODA_TIPLERI = {
  MAHKEME_KALEMLERI: 'Mahkeme Kalemleri',
  HAKIM_ODALARI: 'Hakim Odaları',
  DURUSMA_SALONU: 'Duruşma Salonu'
};

const UNVANLAR = {
  [ODA_TIPLERI.MAHKEME_KALEMLERI]: [
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
  kasa: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.DURUSMA_SALONU],
  laptop: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.HAKIM_ODALARI],
  monitör: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.HAKIM_ODALARI, ODA_TIPLERI.DURUSMA_SALONU],
  yazıcı: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.HAKIM_ODALARI, ODA_TIPLERI.DURUSMA_SALONU],
  tarayıcı: [ODA_TIPLERI.MAHKEME_KALEMLERI],
  segbis: [ODA_TIPLERI.DURUSMA_SALONU],
  tv: [ODA_TIPLERI.DURUSMA_SALONU],
  mikrofon: [ODA_TIPLERI.DURUSMA_SALONU],
  kamera: [ODA_TIPLERI.DURUSMA_SALONU],
  edurusma: [ODA_TIPLERI.DURUSMA_SALONU],
};

// Hangi cihazda kullanıcı bilgisi gösterilecek?
const shouldShowUserInfo = (cihazTipi, odaTipi) => {
  if (!cihazTipi || !odaTipi) return false;
  const id = cihazTipi.id;
  if ((id === 'kasa' || id === 'monitör') && odaTipi === ODA_TIPLERI.DURUSMA_SALONU) return false;
  if (['kasa', 'laptop', 'monitör'].includes(id)) return true;
  if (id === 'yazıcı' && odaTipi === ODA_TIPLERI.HAKIM_ODALARI) return true;
  // Tarayıcı, mikrofon, kamera ve diğer cihazlarda kullanıcı bilgisi gösterilmez
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
  const { cihazTipi, odaTipi, birim, mahkemeNo } = route.params || {};

  if (cihazTipi && odaTipi && !isRoomAllowedForDevice(cihazTipi, odaTipi)) {
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
    backgroundColor: isDark ? '#161a4a' : '#fff',
    borderRadius: 12,
  };
  const modalOptionText = {
    color: isDark ? '#fff' : '#222',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  };
  const modalCancelText = {
    color: isDark ? '#fff' : '#222',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  };
  const modalOverlay = {
    backgroundColor: isDark ? 'rgba(22,26,74,0.7)' : 'rgba(0,0,0,0.3)',
  };
  const unvanData = odaTipi && UNVANLAR[odaTipi] ? UNVANLAR[odaTipi].map((u) => ({ key: u, label: u })) : [];
  const [unvanModalVisible, setUnvanModalVisible] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

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
      Object.assign(baseFields, {
        [`${tableConfig.prefix}_adi_soyadi`]: isimSoyisim,
        [`${tableConfig.prefix}_sicilno`]: sicilNo,
        [`${tableConfig.prefix}_unvan`]: unvan,
      });
    }

    // Kasa için temizlik tarihlerini ekle
    if (cihazTipi.id === 'kasa') {
      Object.assign(baseFields, {
        [`${tableConfig.prefix}_ilk_temizlik_tarihi`]: formatDate(ilkTemizlikTarihi),
        [`${tableConfig.prefix}_son_temizlik_tarihi`]: formatDate(sonTemizlikTarihi),
      });
    }

    console.log('Kayıt gönderiliyor:', baseFields);

    const { data, error } = await supabase
      .from(tableConfig.table)
      .insert([baseFields]);

    console.log('Supabase yanıtı:', { data, error });

    if (error) {
      alert('Kayıt başarısız: ' + error.message);
    } else {
      alert(`${cihazTipi.name} başarıyla eklendi!`);
      navigation.goBack();
    }
  };

  // Form alanlarının görünürlüğünü kontrol et
  const showUserInfo = shouldShowUserInfo(cihazTipi, odaTipi);
  const showCleaningDates = shouldShowCleaningDates(cihazTipi);

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
          {showUserInfo && (
            <>
              <Text style={[styles.label, { color: theme.text }]}>Unvan</Text>
              <TouchableOpacity style={boxStyle} onPress={() => setUnvanModalVisible(true)}>
                <Text style={inputCustom}>{unvan || 'Seçiniz'}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.text }]}>Sicil No</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
                <TextInput
                  value={sicilNo}
                  onChangeText={setSicilNo}
                  placeholder="Sicil numarasını giriniz"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>

              <Text style={[styles.label, { color: theme.text }]}>İsim Soyisim</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
                <TextInput
                  value={isimSoyisim}
                  onChangeText={setIsimSoyisim}
                  placeholder="İsim soyisim giriniz"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </>
          )}

          <Text style={[styles.label, { color: theme.text }]}>Marka</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
            <TextInput
              value={marka}
              onChangeText={setMarka}
              placeholder="Marka giriniz"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Model</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
            <TextInput
              value={model}
              onChangeText={setModel}
              placeholder="Model giriniz"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Seri No</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>
            <TextInput
              value={seriNo}
              onChangeText={setSeriNo}
              placeholder="Seri no giriniz"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
            />
          </View>

          <Text style={[styles.label, { color: theme.text }]}>İlk Garanti Tarihi</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.cardBackground }]}
            onPress={() => setShowIlkGarantiPicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: theme.text }]}>{formatDate(ilkGarantiTarihi)}</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: theme.text }]}>Son Garanti Tarihi</Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.cardBackground }]}
            onPress={() => setShowSonGarantiPicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: theme.text }]}>{formatDate(sonGarantiTarihi)}</Text>
          </TouchableOpacity>

          {showCleaningDates && (
            <>
              <Text style={[styles.label, { color: theme.text }]}>İlk Temizlik Tarihi</Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.cardBackground }]}
                onPress={() => setShowIlkTemizlikPicker(true)}
              >
                <Text style={[styles.dateButtonText, { color: theme.text }]}>{formatDate(ilkTemizlikTarihi)}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.text }]}>Son Temizlik Tarihi</Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.cardBackground }]}
                onPress={() => setShowSonTemizlikPicker(true)}
              >
                <Text style={[styles.dateButtonText, { color: theme.text }]}>{formatDate(sonTemizlikTarihi)}</Text>
              </TouchableOpacity>
            </>
          )}

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