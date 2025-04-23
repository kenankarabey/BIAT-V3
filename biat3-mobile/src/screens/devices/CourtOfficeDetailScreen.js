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

const CourtOfficeDetailScreen = ({ route, navigation }) => {
  const { office } = route.params;
  
  // Personel verileri - Normalde API'den gelecek
  const [personnel, setPersonnel] = useState([
    { 
      id: '1', 
      name: 'Ayşe Yılmaz', 
      title: 'Zabıt Katibi', 
      registrationNumber: '123456',
      devices: [
        { type: 'pc', brand: 'HP', model: 'EliteDesk 800 G6', serial: 'SN12345' },
        { type: 'monitor', brand: 'Dell', model: 'P2419H', serial: 'MD54321' }
      ]
    },
    { 
      id: '2', 
      name: 'Mehmet Demir', 
      title: 'Yazı İşleri Müdürü', 
      registrationNumber: '234567',
      devices: [
        { type: 'pc', brand: 'Lenovo', model: 'ThinkCentre M720', serial: 'SN98765' },
        { type: 'monitor', brand: 'HP', model: 'E24 G4', serial: 'MD67890' }
      ]
    },
  ]);
  
  // Ortak cihazlar - Normalde API'den gelecek
  const [sharedDevices, setSharedDevices] = useState([
    { id: '1', type: 'printer', brand: 'HP', model: 'LaserJet Pro M428', serial: 'PR12345', status: 'Aktif' },
    { id: '2', type: 'scanner', brand: 'Canon', model: 'DR-C225', serial: 'SC54321', status: 'Aktif' },
    { id: '3', type: 'printer', brand: 'Xerox', model: 'VersaLink C405', serial: 'PR98765', status: 'Bakım' },
  ]);
  
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
  
  // Cihaz tipine göre icon belirle
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'pc':
        return 'desktop-outline';
      case 'monitor':
        return 'tv-outline';
      case 'printer':
        return 'print-outline';
      case 'scanner':
        return 'scan-outline';
      default:
        return 'hardware-chip-outline';
    }
  };
  
  // Personel ekleme sayfasına git
  const handleAddPersonnel = () => {
    navigation.navigate('CourtOfficePersonnelForm', { officeId: office.id, officeName: office.name });
  };
  
  // Personel kartı
  const PersonnelCard = ({ item }) => (
    <View style={styles.personnelCard}>
      <View style={styles.personnelHeader}>
        <View style={styles.personnelInfo}>
          <Text style={styles.personnelName}>{item.name}</Text>
          <Text style={styles.personnelTitle}>{item.title}</Text>
        </View>
        <View style={styles.personnelActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create-outline" size={18} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                "Personeli Sil",
                `${item.name} adlı personeli silmek istediğinize emin misiniz?`,
                [
                  { text: "İptal", style: "cancel" },
                  { text: "Sil", style: "destructive", onPress: () => {
                    setPersonnel(personnel.filter(p => p.id !== item.id));
                    Alert.alert("Başarılı", "Personel başarıyla silindi");
                  }}
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.registrationNumber}>Sicil No: {item.registrationNumber}</Text>
      
      <View style={styles.divider} />
      
      <Text style={styles.devicesTitle}>Kullandığı Cihazlar</Text>
      
      {item.devices.map((device, index) => (
        <View key={index} style={styles.deviceItem}>
          <Ionicons name={getDeviceIcon(device.type)} size={20} color="#1e3a8a" style={styles.deviceIcon} />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceType}>
              {device.type === 'pc' ? 'Bilgisayar' : device.type === 'monitor' ? 'Monitör' : device.type}
            </Text>
            <Text style={styles.deviceDetails}>
              {device.brand} {device.model} (SN: {device.serial})
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
  
  // Ortak cihaz kartı
  const SharedDeviceCard = ({ item }) => (
    <View style={styles.sharedDeviceCard}>
      <View style={styles.sharedDeviceHeader}>
        <View style={styles.sharedDeviceIconContainer}>
          <Ionicons name={getDeviceIcon(item.type)} size={22} color="#1e3a8a" />
        </View>
        <View style={styles.sharedDeviceInfo}>
          <Text style={styles.sharedDeviceType}>
            {item.type === 'printer' ? 'Yazıcı' : item.type === 'scanner' ? 'Tarayıcı' : item.type}
          </Text>
          <Text style={styles.sharedDeviceDetails}>
            {item.brand} {item.model}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.serialContainer}>
        <Text style={styles.serialText}>Seri No: {item.serial}</Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mahkeme Detayı</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CourtOfficeForm', { office })}>
          <Ionicons name="create-outline" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.courtHeader}>
          <Text style={styles.courtName}>{office.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(office.status) }]}>
            <Text style={styles.statusText}>{office.status}</Text>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="briefcase-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{office.type}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{office.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>Son Kontrol: {office.lastCheck}</Text>
          </View>
        </View>
        
        <View style={styles.deviceCountRow}>
          <View style={styles.deviceCountCard}>
            <Ionicons name="desktop-outline" size={24} color="#1e3a8a" />
            <Text style={styles.deviceCountNumber}>{office.deviceCount.pc}</Text>
            <Text style={styles.deviceCountLabel}>Bilgisayar</Text>
          </View>
          <View style={styles.deviceCountCard}>
            <Ionicons name="print-outline" size={24} color="#1e3a8a" />
            <Text style={styles.deviceCountNumber}>{office.deviceCount.printer}</Text>
            <Text style={styles.deviceCountLabel}>Yazıcı</Text>
          </View>
          <View style={styles.deviceCountCard}>
            <Ionicons name="hardware-chip-outline" size={24} color="#1e3a8a" />
            <Text style={styles.deviceCountNumber}>{office.deviceCount.other}</Text>
            <Text style={styles.deviceCountLabel}>Diğer</Text>
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personel ({personnel.length})</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPersonnel}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Personel Ekle</Text>
          </TouchableOpacity>
        </View>
        
        {personnel.map(person => (
          <PersonnelCard key={person.id} item={person} />
        ))}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ortak Cihazlar ({sharedDevices.length})</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Cihaz Ekle</Text>
          </TouchableOpacity>
        </View>
        
        {sharedDevices.map(device => (
          <SharedDeviceCard key={device.id} item={device} />
        ))}
        
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
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
    color: '#1e293b',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#1e293b',
    marginLeft: 8,
  },
  deviceCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  deviceCountCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  deviceCountNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  deviceCountLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
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
    color: '#1e293b',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    color: '#1e293b',
  },
  personnelTitle: {
    fontSize: 14,
    color: '#64748b',
  },
  personnelActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  registrationNumber: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  devicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
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
    color: '#1e293b',
  },
  deviceDetails: {
    fontSize: 13,
    color: '#64748b',
  },
  sharedDeviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sharedDeviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sharedDeviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
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
    color: '#1e293b',
  },
  sharedDeviceDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  serialContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  serialText: {
    fontSize: 13,
    color: '#64748b',
  },
});

export default CourtOfficeDetailScreen; 