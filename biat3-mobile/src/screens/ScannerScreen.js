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
import withThemedScreen from '../components/withThemedScreen';

function ScannerScreen({ theme }) {
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

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    // QR kod için type 256, diğer barkodlar için farklı değerler
    const isQRCode = type === 256;
    
    if (scanMode === 'qr' && !isQRCode) {
      alert('Lütfen bir QR kod okutun');
      setScanned(false);
      return;
    }
    
    if (scanMode === 'barcode' && isQRCode) {
      alert('Lütfen bir barkod okutun');
      setScanned(false);
      return;
    }
    
    alert(`Taranan ${scanMode === 'qr' ? 'QR Kod' : 'Barkod'}: ${data}`);
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
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.card} />
      
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Tarayıcı</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.contentTitle, { color: theme.textSecondary }]}>Tarama Türünü Seçin</Text>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => openScanner('qr')}
        >
          <View style={[styles.cardIcon, { backgroundColor: theme.dark ? '#1e3a8a30' : '#e0f2fe' }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={32} color="#0284c7" />
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
          <View style={[styles.cardIcon, { backgroundColor: theme.dark ? '#78350f30' : '#fef3c7' }]}>
            <MaterialCommunityIcons name="barcode-scan" size={32} color="#d97706" />
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
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scannerContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default withThemedScreen(ScannerScreen); 