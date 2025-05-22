import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  StatusBar
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

const DEVICE_TABLES = [
  'cameras',
  'computers',
  'e_durusma',
  'laptops',
  'microphones',
  'printers',
  'scanners',
  'screens',
  'segbis',
  'tvs',
];

export default function ScannerScreen() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState(null); // 'qr' or 'barcode'
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const findDeviceByQr = async (value) => {
    for (const table of DEVICE_TABLES) {
      // Önce qr_kod'da ara
      let { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('qr_kod', value)
        .maybeSingle();
      if (data) {
        return { device: data, table };
      }
      // Sonra barkod'da ara
      ({ data, error } = await supabase
        .from(table)
        .select('*')
        .eq('barkod', value)
        .maybeSingle());
      if (data) {
        return { device: data, table };
      }
    }
    return null;
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    console.log('Scanned type:', type, 'data:', data, 'scanMode:', scanMode);
    // Barkod modunda QR kod okutulursa hiçbir şey yapma
    if (scanMode === 'barcode' && type === 256) {
      setScanned(false);
      return;
    }
    const isQRCode = type === 256;
    if (scanMode === 'qr' && !isQRCode) {
      alert('Lütfen bir QR kod okutun');
      setScanned(false);
      return;
    }
    if (scanMode === 'barcode' && !isQRCode) {
      // Barkoddan sadece değer gelecek (ör: "123456789")
      const barcodeValue = data;
      setModalVisible(false);
      // Supabase'de ara
      const result = await findDeviceByQr(barcodeValue);
      if (result) {
        const { device, table } = result;
        // Alanları tamamla (her tabloya özel)
        const fieldMap = {
          computers: { marka: 'kasa_marka', model: 'kasa_model', seri_no: 'kasa_seri_no' },
          printers: { marka: 'yazici_marka', model: 'yazici_model', seri_no: 'yazici_seri_no' },
          screens: { marka: 'ekran_marka', model: 'ekran_model', seri_no: 'ekran_seri_no' },
          scanners: { marka: 'tarayici_marka', model: 'tarayici_model', seri_no: 'tarayici_seri_no' },
          laptops: { marka: 'laptop_marka', model: 'laptop_model', seri_no: 'laptop_seri_no' },
          microphones: { marka: 'mikrofon_marka', model: 'mikrofon_model', seri_no: 'mikrofon_seri_no' },
          cameras: { marka: 'kamera_marka', model: 'kamera_model', seri_no: 'kamera_seri_no' },
          segbis: { marka: 'segbis_marka', model: 'segbis_model', seri_no: 'segbis_seri_no' },
          tvs: { marka: 'tv_marka', model: 'tv_model', seri_no: 'tv_seri_no' },
          e_durusma: { marka: 'e_durusma_marka', model: 'e_durusma_model', seri_no: 'e_durusma_seri_no' },
        };
        const fields = fieldMap[table] || {};
        let marka = device[fields.marka] || device.marka || '';
        let model = device[fields.model] || device.model || '';
        let seri_no = device[fields.seri_no] || device.seri_no || '';
        // Icon ve color eşlemesi
        const iconMap = {
          computers: 'desktop-outline',
          screens: 'tv-outline',
          printers: 'print-outline',
          scanners: 'scan-outline',
          segbis: 'videocam-outline',
          microphones: 'mic-outline',
          cameras: 'camera-outline',
          tvs: 'tv-outline',
          e_durusma: 'people-outline',
          laptops: 'laptop-outline',
        };
        const colorMap = {
          computers: '#4f46e5',
          screens: '#10b981',
          printers: '#f59e0b',
          scanners: '#ef4444',
          segbis: '#6366f1',
          microphones: '#ec4899',
          cameras: '#f472b6',
          tvs: '#14b8a6',
          e_durusma: '#8b5cf6',
          laptops: '#6366f1',
        };
        navigation.navigate('DeviceDetail', {
          device: {
            ...device,
            marka,
            model,
            seri_no,
            icon: iconMap[table],
            color: colorMap[table],
            type: table,
            sourceTable: table,
          },
          table,
        });
      } else {
        alert('Bu barkoda sahip cihaz bulunamadı.');
      }
      setScanned(false);
      return;
    }
    // QR kod modunda, QR kod ise devam et
    if (scanMode === 'qr' && isQRCode) {
      // QR koddan sadece değer gelecek (ör: "123456789")
      const qrValue = data;
      setModalVisible(false);
      // Supabase'de ara
      const result = await findDeviceByQr(qrValue);
      if (result) {
        const { device, table } = result;
        // Alanları tamamla (her tabloya özel)
        const fieldMap = {
          computers: { marka: 'kasa_marka', model: 'kasa_model', seri_no: 'kasa_seri_no' },
          printers: { marka: 'yazici_marka', model: 'yazici_model', seri_no: 'yazici_seri_no' },
          screens: { marka: 'ekran_marka', model: 'ekran_model', seri_no: 'ekran_seri_no' },
          scanners: { marka: 'tarayici_marka', model: 'tarayici_model', seri_no: 'tarayici_seri_no' },
          laptops: { marka: 'laptop_marka', model: 'laptop_model', seri_no: 'laptop_seri_no' },
          microphones: { marka: 'mikrofon_marka', model: 'mikrofon_model', seri_no: 'mikrofon_seri_no' },
          cameras: { marka: 'kamera_marka', model: 'kamera_model', seri_no: 'kamera_seri_no' },
          segbis: { marka: 'segbis_marka', model: 'segbis_model', seri_no: 'segbis_seri_no' },
          tvs: { marka: 'tv_marka', model: 'tv_model', seri_no: 'tv_seri_no' },
          e_durusma: { marka: 'e_durusma_marka', model: 'e_durusma_model', seri_no: 'e_durusma_seri_no' },
        };
        const fields = fieldMap[table] || {};
        let marka = device[fields.marka] || device.marka || '';
        let model = device[fields.model] || device.model || '';
        let seri_no = device[fields.seri_no] || device.seri_no || '';
        // Icon ve color eşlemesi
        const iconMap = {
          computers: 'desktop-outline',
          screens: 'tv-outline',
          printers: 'print-outline',
          scanners: 'scan-outline',
          segbis: 'videocam-outline',
          microphones: 'mic-outline',
          cameras: 'camera-outline',
          tvs: 'tv-outline',
          e_durusma: 'people-outline',
          laptops: 'laptop-outline',
        };
        const colorMap = {
          computers: '#4f46e5',
          screens: '#10b981',
          printers: '#f59e0b',
          scanners: '#ef4444',
          segbis: '#6366f1',
          microphones: '#ec4899',
          cameras: '#f472b6',
          tvs: '#14b8a6',
          e_durusma: '#8b5cf6',
          laptops: '#6366f1',
        };
        navigation.navigate('DeviceDetail', {
          device: {
            ...device,
            marka,
            model,
            seri_no,
            icon: iconMap[table],
            color: colorMap[table],
            type: table,
            sourceTable: table,
          },
          table,
        });
      } else {
        alert('Bu QR koda sahip cihaz bulunamadı.');
      }
      setScanned(false);
      return;
    }
    // Diğer durumlar için fallback
    alert(`Taranan Kod: ${data}`);
    setModalVisible(false);
    setScanned(false);
  };

  const openScanner = (mode) => {
    setScanMode(mode);
    setModalVisible(true);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.messageContainer}>
          <Text style={[styles.message, { color: theme.text }]}>Kamera izni isteniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.messageContainer}>
          <Text style={[styles.message, { color: theme.text }]}>Kamera erişimi reddedildi</Text>
          <Text style={[styles.messageDetail, { color: theme.textSecondary }]}>
            Tarayıcıyı kullanabilmek için kamera izni gereklidir. Lütfen ayarlardan uygulamanın kamera iznini etkinleştirin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.navBackground} />
      
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Tarayıcı</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.contentTitle, { color: theme.textSecondary }]}>Tarama Türünü Seçin</Text>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => openScanner('qr')}
        >
          <View style={[styles.cardIcon, { backgroundColor: isDarkMode ? '#164e63' : '#e0f2fe' }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={32} color={isDarkMode ? '#60a5fa' : '#0284c7'} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>QR Kod Tarama</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Cihazlara ait QR kodları tarayarak hızlı bilgi görüntüleyin</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => openScanner('barcode')}
        >
          <View style={[styles.cardIcon, { backgroundColor: isDarkMode ? '#422006' : '#fef3c7' }]}>
            <MaterialCommunityIcons name="barcode-scan" size={32} color={isDarkMode ? '#fbbf24' : '#d97706'} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Barkod Tarama</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Cihazlara ait barkodları tarayarak detayları görüntüleyin</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Tarayıcı Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{scanMode === 'qr' ? 'QR Kod' : 'Barkod'} Tarayıcı</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.scannerContainer}>
            <BarCodeScanner
  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
  barCodeTypes={Object.values(BarCodeScanner.Constants.BarCodeType)}
  style={StyleSheet.absoluteFillObject}
/>
            
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.overlayText}>
                {scanMode === 'qr' ? 'QR Kodu' : 'Barkodu'} çerçeve içine yerleştirin
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageDetail: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
}); 