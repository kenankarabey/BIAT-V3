import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState('qr'); // 'qr' or 'barcode'

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    if (scanMode === 'qr' && type !== 256) {
      Alert.alert('Hata', 'Lütfen bir QR kod okutun');
      return;
    }
    if (scanMode === 'barcode' && type === 256) {
      Alert.alert('Hata', 'Lütfen bir barkod okutun');
      return;
    }
    Alert.alert('Tarama Başarılı', `Taranan ${scanMode === 'qr' ? 'QR Kod' : 'Barkod'}: ${data}`);
  };

  if (hasPermission === null) {
    return <Text>Kamera izni isteniyor...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Kamera erişimi reddedildi</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="QR Kod Tara"
          onPress={() => {
            setScanMode('qr');
            setScanned(false);
          }}
          color={scanMode === 'qr' ? '#2196F3' : '#666'}
        />
        <Button
          title="Barkod Tara"
          onPress={() => {
            setScanMode('barcode');
            setScanned(false);
          }}
          color={scanMode === 'barcode' ? '#2196F3' : '#666'}
        />
      </View>
      
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            {scanMode === 'qr' ? 'QR Kodu' : 'Barkodu'} tarayıcının ortasına yerleştirin
          </Text>
        </View>
      </View>

      {scanned && (
        <Button
          title="Tekrar Tara"
          onPress={() => setScanned(false)}
          color="#2196F3"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    borderRadius: 8,
  },
}); 