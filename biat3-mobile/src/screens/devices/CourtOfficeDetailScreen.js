import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';

const CourtOfficeDetailScreen = ({ route, navigation, theme, themedStyles }) => {
  const { office } = route.params;
  
  // Personel ve cihaz verileri (Supabase'dan çekilecek)
  const [personnel, setPersonnel] = useState([]);
  const [sharedDevices, setSharedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tüm cihazlar sadece sharedDevices olacak
  const allDevices = sharedDevices || [];
  
  // Durum renklerini belirle
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif':
        return '#10b981';
      case 'Arıza':
        return '#ef4444';
      case 'Bakım':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };
  
  // Cihaz tipine göre icon ve renk belirle
  const getDeviceIcon = (device) => {
    switch (device.sourceTable) {
      case 'computers':
        return 'desktop-outline';
      case 'screens':
        return 'tv-outline';
      case 'printers':
        return 'print-outline';
      case 'scanners':
        return 'scan-outline';
      default:
        return 'hardware-chip-outline';
    }
  };
  const getDeviceTypeLabel = (device) => {
    switch (device.sourceTable) {
      case 'computers':
        return 'Kasa';
      case 'screens':
        return 'Monitör';
      case 'printers':
        return 'Yazıcı';
      case 'scanners':
        return 'Tarayıcı';
      default:
        return 'Cihaz';
    }
  };
  const getDeviceColor = (device) => {
    switch (device.sourceTable) {
      case 'computers':
        return '#4f46e5';
      case 'screens':
        return '#10b981';
      case 'printers':
        return '#f59e0b';
      case 'scanners':
        return '#ef4444';
      default:
        return theme.primary;
    }
  };
  
  // Personel ekleme sayfasına git
  const handleAddPersonnel = () => {
    navigation.navigate('CourtOfficePersonnelForm', { officeId: office.id, officeName: office.name });
  };
  
  // Personel kartı (sadece personel bilgisi)
  const PersonnelCard = ({ item }) => (
    <View style={[styles.personnelCard, themedStyles.card, themedStyles.shadow, { flexDirection: 'row', alignItems: 'center' }]}> 
      <Ionicons name="person-circle-outline" size={32} color={theme.primary} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
      <View style={styles.personnelHeader}>
        <View style={styles.personnelInfo}>
            <Text style={[styles.personnelName, themedStyles.text]}>{item.adi_soyadi}</Text>
            <Text style={[styles.personnelTitle, themedStyles.textSecondary]}>{item.unvan}</Text>
        </View>
        </View>
        <Text style={[styles.registrationNumber, themedStyles.textSecondary]}>Sicil No: {item.sicil_no}</Text>
      </View>
    </View>
  );
  
  // Ortak cihaz kartı
  const SharedDeviceCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sharedDeviceCard, themedStyles.card, themedStyles.shadow]}
      onPress={() => navigation.navigate('DeviceDetail', { 
        device: {
          ...item,
          serialNumber: item.serial,
          type: item.type
        } 
      })}
    >
      <View style={styles.sharedDeviceHeader}>
        <View style={[styles.sharedDeviceIconContainer, { backgroundColor: theme.inputBg }]}>
          <Ionicons name={getDeviceIcon(item)} size={22} color={theme.primary} />
        </View>
        <View style={styles.sharedDeviceInfo}>
          <Text style={[styles.sharedDeviceType, themedStyles.text]}>
            {getDeviceTypeLabel(item)}
          </Text>
          <Text style={[styles.sharedDeviceDetails, themedStyles.textSecondary]}>
            {item.brand} {item.model}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={[styles.serialContainer, { borderTopColor: theme.border }]}>
        <Text style={[styles.serialText, themedStyles.textSecondary]}>Seri No: {item.serial}</Text>
      </View>
    </TouchableOpacity>
  );
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Mahkeme birimi (örn: "Sulh Hukuk Mahkemesi")
      const mahkemeBirim = office.birim || office.mahkeme_turu;
      const mahkemeNo = office.mahkeme_no;

      // Personel verileri (tüm cihaz tablolarından personel bilgisi)
      const [personnelComputers, personnelScreens, personnelScanners, personnelPrinters] = await Promise.all([
        supabase.from('computers').select('*, adi_soyadi, sicil_no, unvan').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo),
        supabase.from('screens').select('*, adi_soyadi, sicil_no, unvan').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo),
        supabase.from('scanners').select('adi_soyadi, sicil_no, unvan').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo),
        supabase.from('printers').select('adi_soyadi, sicil_no, unvan').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo)
      ]);
      // Tüm personel verilerini birleştir ve tekrarları kaldır
      const allPersonnel = [
        ...(personnelComputers.data || []),
        ...(personnelScreens.data || []),
        ...(personnelScanners.data || []),
        ...(personnelPrinters.data || [])
      ].filter((person, index, self) =>
        index === self.findIndex((p) => 
          p.sicil_no === person.sicil_no && 
          p.adi_soyadi === person.adi_soyadi
        )
      );
      setPersonnel(allPersonnel);

      // Cihazlar (sadece computers, screens, printers, scanners)
      const [computersRes, screensRes, scannersRes, printersRes] = await Promise.all([
        supabase.from('computers').select('*, adi_soyadi, sicil_no, unvan').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo),
        supabase.from('screens').select('*, adi_soyadi, sicil_no, unvan').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo),
        supabase.from('scanners').select('*').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo),
        supabase.from('printers').select('*').eq('birim', mahkemeBirim).eq('oda_tipi', 'Mahkeme Kalemi').eq('mahkeme_no', mahkemeNo)
      ]);
      // Her cihaz objesine sourceTable ekle
      const computers = (computersRes.data || []).map(d => ({ ...d, sourceTable: 'computers' }));
      const screens = (screensRes.data || []).map(d => ({ ...d, sourceTable: 'screens' }));
      const scanners = (scannersRes.data || []).map(d => ({ ...d, sourceTable: 'scanners' }));
      const printers = (printersRes.data || []).map(d => ({ ...d, sourceTable: 'printers' }));
      const allDevices = [
        ...computers,
        ...screens,
        ...scanners,
        ...printers
      ];
      setSharedDevices(allDevices);
      setLoading(false);
    };
    fetchData();
  }, [office]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, themedStyles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themedStyles.text]}>Mahkeme Detayı</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CourtOfficeForm', { office, editMode: true })}>
          <Ionicons name="create-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Bilgi Kartı */}
      <View style={[styles.infoCard, themedStyles.card, themedStyles.shadow]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="briefcase-outline" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <Text style={[styles.infoTitle, themedStyles.text]}>{office.mahkeme_no}. {office.mahkeme_turu}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="person-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <Text style={[styles.infoText, themedStyles.textSecondary]}>{office.mahkeme_hakimi}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="location-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <Text style={[styles.infoText, themedStyles.textSecondary]}>{office.blok}, {office.kat}</Text>
          </View>
        </View>
        
      <ScrollView style={styles.scrollView}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, themedStyles.text]}>Personel ({(personnel || []).length})</Text>
        </View>
        {(personnel || []).map((person, idx) => (
          <PersonnelCard key={person.sicil_no + '-' + idx} item={person} />
        ))}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, themedStyles.text]}>Cihazlar ({(allDevices || []).length})</Text>
        </View>
        {(allDevices || []).map((device, idx) => {
          let marka = '';
          let model = '';
          let seri_no = '';
          let adi_soyadi = '';
          let sicil_no = '';
          let unvan = '';
          let ilk_temizlik_tarihi = '';
          if (device.sourceTable === 'computers') {
            marka = device.kasa_marka;
            model = device.kasa_model;
            seri_no = device.kasa_seri_no;
            adi_soyadi = device.adi_soyadi;
            sicil_no = device.sicil_no;
            unvan = device.unvan;
            ilk_temizlik_tarihi = device.ilk_temizlik_tarihi;
          } else if (device.sourceTable === 'screens') {
            marka = device.ekran_marka;
            model = device.ekran_model;
            seri_no = device.ekran_seri_no;
            adi_soyadi = device.adi_soyadi;
            sicil_no = device.sicil_no;
            unvan = device.unvan;
          } else if (device.sourceTable === 'printers') {
            marka = device.yazici_marka;
            model = device.yazici_model;
            seri_no = device.yazici_seri_no;
          } else if (device.sourceTable === 'scanners') {
            marka = device.tarayici_marka;
            model = device.tarayici_model;
            seri_no = device.tarayici_seri_no;
          }
          return (
            <TouchableOpacity
              key={device.id || idx}
              style={[styles.sharedDeviceCard, themedStyles.card, themedStyles.shadow]}
              onPress={() => {
                navigation.navigate('DeviceDetail', { 
                  device: { 
                    ...device, 
                    marka, 
                    model, 
                    seri_no, 
                    adi_soyadi, 
                    sicil_no, 
                    unvan, 
                    ilk_temizlik_tarihi, 
                    sourceTable: device.sourceTable,
                    icon: getDeviceIcon(device),
                    color: getDeviceColor(device)
                  } 
                });
              }}
            >
              <View style={styles.sharedDeviceHeader}>
                <View style={[styles.sharedDeviceIconContainer, { backgroundColor: (getDeviceColor(device) + '20') }]}> 
                  <Ionicons name={getDeviceIcon(device)} size={22} color={getDeviceColor(device)} />
                </View>
                <View style={styles.sharedDeviceInfo}>
                  <Text style={[styles.sharedDeviceType, themedStyles.text, { color: getDeviceColor(device), fontWeight: 'bold', marginBottom: 2 }]}> 
                    {getDeviceTypeLabel(device)}
                  </Text>
                  <Text style={[styles.sharedDeviceDetails, themedStyles.textSecondary]}>
                    {marka || ''} {model || ''}
                  </Text>
                  <Text style={[styles.serialText, themedStyles.textSecondary]}>
                    Seri No: {seri_no || ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  courtName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FFFFFF',
  },
  personnelCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  personnelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  personnelInfo: {
    flex: 1,
  },
  personnelName: {
    fontSize: 16,
    fontWeight: '600',
  },
  personnelTitle: {
    fontSize: 14,
  },
  registrationNumber: {
    fontSize: 14,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  devicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceIcon: {
    marginRight: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceType: {
    fontSize: 14,
    fontWeight: '500',
  },
  deviceDetails: {
    fontSize: 13,
  },
  sharedDeviceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sharedDeviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sharedDeviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sharedDeviceInfo: {
    flex: 1,
  },
  sharedDeviceType: {
    fontSize: 16,
    fontWeight: '600',
  },
  sharedDeviceDetails: {
    fontSize: 14,
  },
  serialContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  serialText: {
    fontSize: 13,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default withThemedScreen(CourtOfficeDetailScreen); 