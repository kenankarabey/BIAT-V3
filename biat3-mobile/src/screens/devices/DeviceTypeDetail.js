import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Örnek cihaz verileri
const MOCK_DEVICES = {
  kasa: [
    { id: '1', name: 'Dell OptiPlex 7090', serialNumber: 'DELL45691237', status: 'Aktif', lastCheck: '05.06.2023', specs: 'i7-11700, 16GB RAM, 512GB SSD' },
    { id: '2', name: 'HP EliteDesk 800', serialNumber: 'HP78965432', status: 'Aktif', lastCheck: '10.06.2023', specs: 'i5-10500, 8GB RAM, 256GB SSD' },
    { id: '3', name: 'Lenovo ThinkCentre', serialNumber: 'LEN15975364', status: 'Arıza', lastCheck: '01.05.2023', specs: 'i5-9500, 8GB RAM, 1TB HDD' }
  ],
  monitor: [
    { id: '1', name: 'Dell P2419H', serialNumber: 'DELLMON123456', status: 'Aktif', lastCheck: '05.06.2023', specs: '24 inç, Full HD (1920x1080)' },
    { id: '2', name: 'Samsung S24R350', serialNumber: 'SAMMON789102', status: 'Aktif', lastCheck: '10.06.2023', specs: '24 inç, Full HD (1920x1080), IPS' }
  ],
  segbis: [
    { id: '1', name: 'SEGBİS Ünitesi', serialNumber: 'SEGBIS123456', status: 'Aktif', lastCheck: '15.06.2023', specs: 'Ulusal Yargı Ağı SEGBİS Cihazı v2.1' }
  ],
  kamera: [
    { id: '1', name: 'Logitech C920', serialNumber: 'LOG123487', status: 'Aktif', lastCheck: '08.06.2023', specs: 'HD Pro, 1080p' },
    { id: '2', name: 'Logitech BRIO', serialNumber: 'LOG456789', status: 'Aktif', lastCheck: '10.06.2023', specs: '4K Ultra HD, HDR' }
  ],
  tv: [
    { id: '1', name: 'Samsung 55"', serialNumber: 'SAMTV987654', status: 'Aktif', lastCheck: '09.06.2023', specs: '55 inç, 4K UHD Smart TV' }
  ],
  mikrofon: [
    { id: '1', name: 'Shure MV7', serialNumber: 'SHURE123456', status: 'Aktif', lastCheck: '07.06.2023', specs: 'USB/XLR Dinamik Mikrofon' },
    { id: '2', name: 'HyperX QuadCast', serialNumber: 'HYP789456', status: 'Aktif', lastCheck: '10.06.2023', specs: 'USB Condenser Mikrofon' }
  ]
};

const DeviceTypeDetail = ({ route }) => {
  const navigation = useNavigation();
  const { deviceType, courtroomId, courtroomName } = route.params;
  
  // Cihaz tipine göre başlık ve ikon
  const getDeviceInfo = () => {
    switch(deviceType) {
      case 'kasa':
        return { title: 'Kasalar', icon: 'desktop-tower' };
      case 'monitor':
        return { title: 'Monitörler', icon: 'monitor' };
      case 'segbis':
        return { title: 'SEGBİS Üniteleri', icon: 'video' };
      case 'kamera':
        return { title: 'Kameralar', icon: 'cctv' };
      case 'tv':
        return { title: 'TV\'ler', icon: 'television' };
      case 'mikrofon':
        return { title: 'Mikrofonlar', icon: 'microphone' };
      default:
        return { title: 'Cihazlar', icon: 'devices' };
    }
  };
  
  const { title, icon } = getDeviceInfo();
  
  // Durum rengini belirle
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif':
        return '#10b981'; // yeşil
      case 'Arıza':
        return '#ef4444'; // kırmızı
      case 'Bakım':
        return '#f59e0b'; // turuncu
      default:
        return '#6b7280'; // gri
    }
  };
  
  // Cihaz kartı bileşeni
  const renderDeviceCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.deviceCard}
      onPress={() => {
        // Burada cihaz detayına gidilebilir
        // navigation.navigate('DeviceDetail', { deviceId: item.id });
      }}
    >
      <View style={styles.deviceHeader}>
        <View style={styles.deviceHeaderLeft}>
          <MaterialCommunityIcons name={icon} size={22} color="#4f46e5" />
          <Text style={styles.deviceName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.deviceInfoRow}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="barcode" size={18} color="#64748b" />
          <Text style={styles.infoText}>S/N: {item.serialNumber}</Text>
        </View>
      </View>
      
      <View style={styles.deviceInfoRow}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#64748b" />
          <Text style={styles.infoText}>{item.specs}</Text>
        </View>
      </View>
      
      <View style={styles.deviceInfoRow}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="calendar-check" size={18} color="#64748b" />
          <Text style={styles.infoText}>Son Kontrol: {item.lastCheck}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 32 }} />
      </View>
      
      <View style={styles.subheader}>
        <Text style={styles.courtroomName}>
          {courtroomName || 'Duruşma Salonu'}
        </Text>
        <Text style={styles.deviceCount}>
          {MOCK_DEVICES[deviceType]?.length || 0} Cihaz
        </Text>
      </View>
      
      <FlatList
        data={MOCK_DEVICES[deviceType] || []}
        keyExtractor={item => item.id}
        renderItem={renderDeviceCard}
        contentContainerStyle={styles.deviceList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              Bu tipte cihaz bulunamadı.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subheader: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 16,
  },
  courtroomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  deviceCount: {
    fontSize: 14,
    color: '#64748b',
  },
  deviceList: {
    padding: 16,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 12,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default DeviceTypeDetail; 