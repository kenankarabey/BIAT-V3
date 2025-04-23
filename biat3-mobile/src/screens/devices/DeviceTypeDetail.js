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
  Platform,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Örnek cihaz verileri - Ekipman tiplerine göre
const MOCK_DEVICES = {
  laptop: [
    { id: '1', name: 'Dell Latitude 5520', serialNumber: 'DELL45691237', status: 'Aktif', lastCheck: '05.06.2023', specs: 'i7-1185G7, 16GB RAM, 512GB SSD' },
    { id: '2', name: 'HP EliteBook 840', serialNumber: 'HP78965432', status: 'Aktif', lastCheck: '10.06.2023', specs: 'i5-1135G7, 8GB RAM, 256GB SSD' },
    { id: '3', name: 'Lenovo ThinkPad X1', serialNumber: 'LEN15975364', status: 'Arıza', lastCheck: '01.05.2023', specs: 'i7-1165G7, 16GB RAM, 1TB SSD' }
  ],
  monitor: [
    { id: '1', name: 'Dell P2419H', serialNumber: 'DELLMON123456', status: 'Aktif', lastCheck: '05.06.2023', specs: '24 inç, Full HD (1920x1080)' },
    { id: '2', name: 'Samsung S24R350', serialNumber: 'SAMMON789102', status: 'Aktif', lastCheck: '10.06.2023', specs: '24 inç, Full HD (1920x1080), IPS' },
    { id: '3', name: 'LG 27UK500', serialNumber: 'LGMON456789', status: 'Bakım', lastCheck: '20.05.2023', specs: '27 inç, 4K UHD (3840x2160), IPS' }
  ],
  printer: [
    { id: '1', name: 'HP LaserJet Pro M404dn', serialNumber: 'HPPRINT123456', status: 'Aktif', lastCheck: '15.06.2023', specs: 'Siyah Beyaz Lazer Yazıcı, 38ppm' },
    { id: '2', name: 'Brother HL-L2350DW', serialNumber: 'BROPRINT789456', status: 'Arıza', lastCheck: '05.05.2023', specs: 'Siyah Beyaz Lazer Yazıcı, 32ppm' }
  ]
};

const DeviceTypeDetail = ({ route }) => {
  const navigation = useNavigation();
  const { 
    deviceType, 
    judgeRoomId, 
    judgeName, 
    roomNumber,
    deviceCount,
    sourceScreen
  } = route?.params || {};

  // Cihaz tipine göre başlık ve ikon
  const getDeviceInfo = () => {
    switch(deviceType) {
      case 'laptop':
        return { title: 'Dizüstü Bilgisayarlar', icon: 'laptop' };
      case 'monitor':
        return { title: 'Monitörler', icon: 'monitor' };
      case 'printer':
        return { title: 'Yazıcılar', icon: 'printer' };
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

  // Cihaz detay sayfasına git
  const handleDeviceDetail = (device) => {
    Alert.alert('Bilgi', `${device.name} detayları yapım aşamasındadır.`);
    // İleride buraya cihaz detay sayfasına yönlendirme eklenebilir
    // navigation.navigate('DeviceDetail', { device });
  };
  
  // Yeni cihaz ekle
  const handleAddDevice = () => {
    Alert.alert('Bilgi', `Yeni ${getDeviceInfo().title} ekleme sayfası yapım aşamasındadır.`);
    // İleride buraya yeni cihaz ekleme sayfasına yönlendirme eklenebilir
    // navigation.navigate('DeviceForm', { deviceType, judgeRoomId, judgeName });
  };
  
  // Cihaz kartı bileşeni
  const renderDeviceCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.deviceCard}
      onPress={() => handleDeviceDetail(item)}
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

  // Sayfa başlığını belirle
  const getHeaderTitle = () => {
    return sourceScreen === 'JudgeRoomDetail' 
      ? `Hakim Odası ${roomNumber || ''} - ${title}` 
      : title;
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
            <MaterialCommunityIcons name="plus" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.subheader}>
          <Text style={styles.judgeName}>
            {judgeName || 'Hakim Adı'}
          </Text>
          <Text style={styles.deviceCount}>
            {deviceCount || MOCK_DEVICES[deviceType]?.length || 0} Cihaz
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
              <TouchableOpacity 
                style={styles.emptyAddButton}
                onPress={handleAddDevice}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.emptyAddButtonText}>Cihaz Ekle</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
  addButton: {
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
  judgeName: {
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
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default DeviceTypeDetail; 