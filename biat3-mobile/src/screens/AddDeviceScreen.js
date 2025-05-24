import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withThemedScreen from '../components/withThemedScreen';

const ODA_TIPLERI = {
  MAHKEME_KALEMLERI: 'Mahkeme Kalemi',
  HAKIM_ODALARI: 'Hakim Odaları',
  DURUSMA_SALONU: 'Duruşma Salonu'
};

const CIHAZ_KISITLAMALARI = {
  kasa: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.DURUSMA_SALONU],
  laptop: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.HAKIM_ODALARI],
  monitör: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.HAKIM_ODALARI, ODA_TIPLERI.DURUSMA_SALONU],
  yazıcı: [ODA_TIPLERI.MAHKEME_KALEMLERI, ODA_TIPLERI.HAKIM_ODALARI, ODA_TIPLERI.DURUSMA_SALONU],
  tarayıcı: [ODA_TIPLERI.MAHKEME_KALEMLERI],
  segbis: [ODA_TIPLERI.DURUSMA_SALONU],
  tv: [ODA_TIPLERI.DURUSMA_SALONU],
  kamera: [ODA_TIPLERI.DURUSMA_SALONU],
  mikrofon: [ODA_TIPLERI.DURUSMA_SALONU],
  edurusma: [ODA_TIPLERI.DURUSMA_SALONU]
};

const AddDeviceScreen = ({ navigation, route, theme }) => {
  const { odaTipi, birim, mahkemeNo } = route.params || {};

  useEffect(() => {
    if (!odaTipi || !birim || !mahkemeNo) {
      navigation.replace('RoomTypeSelection');
    }
  }, [odaTipi, birim, mahkemeNo]);

  const cihazTipleri = [
    {
      id: 'kasa',
      name: 'Kasa',
      icon: 'desktop-outline',
      color: '#4f46e5',
      description: 'Masa üstü bilgisayar kasası',
      isUserDevice: true,
    },
    {
      id: 'laptop',
      name: 'Laptop',
      icon: 'laptop-outline',
      color: '#0891b2',
      description: 'Dizüstü bilgisayar',
      isUserDevice: true,
    },
    {
      id: 'monitör',
      name: 'Monitör',
      icon: 'tv-outline',
      color: '#10b981',
      description: 'Bilgisayar monitörü',
      isUserDevice: true,
    },
    {
      id: 'yazıcı',
      name: 'Yazıcı',
      icon: 'print-outline',
      color: '#f59e0b',
      description: 'Yazıcı veya çok fonksiyonlu yazıcı',
      isUserDevice: false,
    },
    {
      id: 'tarayıcı',
      name: 'Tarayıcı',
      icon: 'scan-outline',
      color: '#ef4444',
      description: 'Doküman tarayıcı',
      isUserDevice: false,
    },
    {
      id: 'segbis',
      name: 'SEGBİS',
      icon: 'videocam-outline',
      color: '#8b5cf6',
      description: 'Ses ve Görüntü Bilişim Sistemi',
      isUserDevice: false,
    },
    {
      id: 'edurusma',
      name: 'E-Duruşma',
      icon: 'people-outline',
      color: '#f97316',
      description: 'E-Duruşma sistemi',
      isUserDevice: false,
    },
    {
      id: 'mikrofon',
      name: 'Mikrofon',
      icon: 'mic-outline',
      color: '#14b8a6',
      description: 'Mikrofon sistemleri',
      isUserDevice: false,
    },
    {
      id: 'tv',
      name: 'TV',
      icon: 'tv-outline',
      color: '#6366f1',
      description: 'Televizyon',
      isUserDevice: false,
    },
    {
      id: 'kamera',
      name: 'Kamera',
      icon: 'camera-outline',
      color: '#6366f1',
      description: 'Güvenlik kamerası',
      isUserDevice: false,
    }
  ];

  const handleCihazSecimi = (cihazTipi) => {
    if (!CIHAZ_KISITLAMALARI[cihazTipi.id].includes(odaTipi)) {
      // Hata mesajı göster
      return;
    }

    navigation.navigate('DeviceForm', {
      cihazTipi,
      odaTipi,
      birim,
      mahkemeNo,
      kullaniciBilgileriGoster: kullaniciBilgileriGoster(cihazTipi.id, odaTipi)
    });
  };

  const kullaniciBilgileriGoster = (cihazId, odaTipi) => {
    if (odaTipi === ODA_TIPLERI.DURUSMA_SALONU) {
      return false;
    }
    return ['kasa', 'laptop', 'monitör'].includes(cihazId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cihaz Türü Seçin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Eklemek istediğiniz cihaz türünü seçin
        </Text>

        <View style={styles.typesContainer}>
          {cihazTipleri.map((cihazTipi) => (
            <TouchableOpacity
              key={cihazTipi.id}
              style={[
                styles.typeCard, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                  borderWidth: 1,
                  elevation: 0,
                  opacity: !CIHAZ_KISITLAMALARI[cihazTipi.id].includes(odaTipi) ? 0.5 : 1
                }
              ]}
              onPress={() => handleCihazSecimi(cihazTipi)}
              disabled={!CIHAZ_KISITLAMALARI[cihazTipi.id].includes(odaTipi)}
            >
              <View style={[styles.iconContainer, { backgroundColor: cihazTipi.color }]}>
                <Ionicons name={cihazTipi.icon} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.typeName, { color: theme.text }]}>{cihazTipi.name}</Text>
              <Text style={[styles.typeDescription, { color: theme.textSecondary }]}>{cihazTipi.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default withThemedScreen(AddDeviceScreen); 