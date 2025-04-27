import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import withThemedScreen from '../../components/withThemedScreen';

const deviceTypes = [
  { id: 'pc', title: 'Kasa', icon: 'desktop', color: '#4f46e5' },
  { id: 'monitor', title: 'Monitör', icon: 'tv', color: '#10b981' },
  { id: 'printer', title: 'Yazıcı', icon: 'print', color: '#f59e0b' },
  { id: 'scanner', title: 'Tarayıcı', icon: 'scan', color: '#ef4444' },
  { id: 'segbis', title: 'SEGBİS', icon: 'videocam', color: '#6366f1' },
  { id: 'hearing', title: 'E-Duruşma', icon: 'people', color: '#8b5cf6' },
  { id: 'microphone', title: 'Mikrofon', icon: 'mic', color: '#ec4899' },
  { id: 'tv', title: 'TV', icon: 'tv', color: '#14b8a6' },
];

// Örnek cihaz verileri
const mockDevices = [
  { 
    id: '1', 
    name: 'PC-101', 
    type: 'pc', 
    location: 'Ağır Ceza 1', 
    status: 'active',
    brand: 'HP',
    model: 'EliteDesk 800 G6',
    serialNumber: 'PC202201101',
    userName: 'Ahmet Yılmaz',
    userTitle: 'Hakim',
    userRegistrationNumber: '12345',
    lastMaintenance: '15.01.2023',
    nextMaintenance: '15.01.2024',
    typeColor: '#4f46e5',
    barcodeValue: 'PC2022XYZ101',
    qrValue: JSON.stringify({
      id: 'PC2022XYZ101',
      type: 'pc',
      brand: 'HP',
      model: 'EliteDesk 800 G6',
      serialNumber: 'PC202201101',
      timestamp: 1673758800000
    })
  },
  { 
    id: '2', 
    name: 'MON-102', 
    type: 'monitor', 
    location: 'Asliye Hukuk 2', 
    status: 'active',
    brand: 'Dell',
    model: 'P2419H',
    serialNumber: 'MON202201102',
    userName: 'Ayşe Kaya',
    userTitle: 'Zabıt Katibi',
    userRegistrationNumber: '23456',
    lastMaintenance: '20.02.2023',
    nextMaintenance: '20.02.2024',
    typeColor: '#10b981',
    barcodeValue: 'MON2022XYZ102',
    qrValue: JSON.stringify({
      id: 'MON2022XYZ102',
      type: 'monitor',
      brand: 'Dell',
      model: 'P2419H',
      serialNumber: 'MON202201102',
      timestamp: 1676844000000
    })
  },
  { 
    id: '3', 
    name: 'PRN-103', 
    type: 'printer', 
    location: 'Sulh Ceza 1', 
    status: 'maintenance',
    brand: 'HP',
    model: 'LaserJet Pro M428',
    serialNumber: 'PRN202201103',
    lastMaintenance: '10.03.2023',
    nextMaintenance: '10.03.2024',
    typeColor: '#f59e0b',
    barcodeValue: 'PRN2022XYZ103',
    qrValue: JSON.stringify({
      id: 'PRN2022XYZ103',
      type: 'printer',
      brand: 'HP',
      model: 'LaserJet Pro M428',
      serialNumber: 'PRN202201103',
      timestamp: 1678453200000
    })
  },
  { 
    id: '4', 
    name: 'SCN-104', 
    type: 'scanner', 
    location: 'İcra 1', 
    status: 'active',
    brand: 'Canon',
    model: 'DR-C225',
    serialNumber: 'SCN202201104',
    lastMaintenance: '05.04.2023',
    nextMaintenance: '05.04.2024',
    typeColor: '#ef4444',
    barcodeValue: 'SCN2022XYZ104',
    qrValue: JSON.stringify({
      id: 'SCN2022XYZ104',
      type: 'scanner',
      brand: 'Canon',
      model: 'DR-C225',
      serialNumber: 'SCN202201104',
      timestamp: 1680652800000
    })
  },
  { 
    id: '5', 
    name: 'SEG-105', 
    type: 'segbis', 
    location: 'Ağır Ceza 2', 
    status: 'error',
    brand: 'Logitech',
    model: 'Rally Plus',
    serialNumber: 'SEG202201105',
    lastMaintenance: '18.05.2023',
    nextMaintenance: '18.05.2024',
    typeColor: '#6366f1',
    barcodeValue: 'SEG2022XYZ105',
    qrValue: JSON.stringify({
      id: 'SEG2022XYZ105',
      type: 'segbis',
      brand: 'Logitech',
      model: 'Rally Plus',
      serialNumber: 'SEG202201105',
      timestamp: 1684364400000
    })
  },
  { 
    id: '6', 
    name: 'EDR-106', 
    type: 'hearing', 
    location: 'Asliye Ceza 1', 
    status: 'active',
    brand: 'Poly',
    model: 'Studio X50',
    serialNumber: 'EDR202201106',
    lastMaintenance: '25.06.2023',
    nextMaintenance: '25.06.2024',
    typeColor: '#8b5cf6',
    barcodeValue: 'EDR2022XYZ106',
    qrValue: JSON.stringify({
      id: 'EDR2022XYZ106',
      type: 'hearing',
      brand: 'Poly',
      model: 'Studio X50',
      serialNumber: 'EDR202201106',
      timestamp: 1687651200000
    })
  },
  { 
    id: '7', 
    name: 'MIC-107', 
    type: 'microphone', 
    location: 'Ağır Ceza 3', 
    status: 'active',
    brand: 'Shure',
    model: 'MX418',
    serialNumber: 'MIC202201107',
    lastMaintenance: '30.07.2023',
    nextMaintenance: '30.07.2024',
    typeColor: '#ec4899',
    barcodeValue: 'MIC2022XYZ107',
    qrValue: JSON.stringify({
      id: 'MIC2022XYZ107',
      type: 'microphone',
      brand: 'Shure',
      model: 'MX418',
      serialNumber: 'MIC202201107',
      timestamp: 1690675200000
    })
  },
  { 
    id: '8', 
    name: 'TV-108', 
    type: 'tv', 
    location: 'Bekleme Salonu', 
    status: 'active',
    brand: 'Samsung',
    model: 'QE55Q80T',
    serialNumber: 'TV202201108',
    lastMaintenance: '12.08.2023',
    nextMaintenance: '12.08.2024',
    typeColor: '#14b8a6',
    barcodeValue: 'TV2022XYZ108',
    qrValue: JSON.stringify({
      id: 'TV2022XYZ108',
      type: 'tv',
      brand: 'Samsung',
      model: 'QE55Q80T',
      serialNumber: 'TV202201108',
      timestamp: 1691798400000
    })
  },
];

function AllDevicesScreen({ navigation, route, theme, themedStyles, isDarkMode }) {
  const [selectedType, setSelectedType] = useState(null);
  const [devices, setDevices] = useState(mockDevices);

  // Check if a new device was added or updated
  useEffect(() => {
    if (route.params?.updatedDevice) {
      // Handle the updated device (in a real app this would update the database)
      const updatedDevice = route.params.updatedDevice;
      const existingDeviceIndex = devices.findIndex(d => d.id === updatedDevice.id);
      
      if (existingDeviceIndex !== -1) {
        // Update existing device
        const updatedDevices = [...devices];
        updatedDevices[existingDeviceIndex] = {
          ...updatedDevices[existingDeviceIndex],
          ...updatedDevice
        };
        setDevices(updatedDevices);
      } else {
        // Add new device with generated ID
        const newDevice = {
          ...updatedDevice,
          id: (devices.length + 1).toString(),
          name: `${updatedDevice.type.toUpperCase()}-${100 + devices.length + 1}`,
          typeColor: deviceTypes.find(t => t.id === updatedDevice.type)?.color || '#4f46e5'
        };
        setDevices([...devices, newDevice]);
      }
    }
  }, [route.params?.updatedDevice]);

  const filteredDevices = selectedType
    ? devices.filter(device => device.type === selectedType)
    : devices;

  // Düzenleme işlevi
  const handleEdit = (device) => {
    // Düzenleme formuna gidebilir veya modal açabilirsiniz
    navigation.navigate('DeviceForm', { deviceType: { id: device.type, name: deviceTypes.find(t => t.id === device.type)?.title || 'Cihaz' }, device });
  };

  // Silme işlevi
  const handleDelete = (device) => {
    Alert.alert(
      "Cihazı Sil",
      `${device.name} cihazını silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Sil", 
          onPress: () => {
            // Filter out the device to delete
            const updatedDevices = devices.filter(d => d.id !== device.id);
            setDevices(updatedDevices);
            Alert.alert("Başarılı", "Cihaz başarıyla silindi");
          },
          style: "destructive"
        }
      ]
    );
  };

  // Sola kaydırma aksiyonları
  const renderRightActions = (device, closeRow) => (
    <View style={styles.rightActionsContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: theme.primary }]} 
        onPress={() => {
          closeRow();
          handleEdit(device);
        }}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: '#ef4444' }]} 
        onPress={() => {
          closeRow();
          handleDelete(device);
        }}
      >
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const DeviceTypeCard = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.typeCard, 
        { backgroundColor: item.color + '20' }, 
        selectedType === item.id && { borderColor: item.color, borderWidth: 2 }
      ]} 
      onPress={() => setSelectedType(item.id === selectedType ? null : item.id)}
    >
      <Ionicons name={item.icon} size={24} color={item.color} />
      <Text style={[styles.typeTitle, themedStyles.text]}>{item.title}</Text>
    </TouchableOpacity>
  );

  const DeviceItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'active': return '#16a34a';
        case 'maintenance': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#64748b';
      }
    };

    const getStatusText = (status) => {
      switch(status) {
        case 'active': return 'Aktif';
        case 'maintenance': return 'Bakımda';
        case 'error': return 'Arızalı';
        default: return 'Bilinmiyor';
      }
    };

    const rowRef = React.useRef(null);

    const closeRow = () => {
      if (rowRef.current) {
        rowRef.current.close();
      }
    };

    return (
      <GestureHandlerRootView>
        <Swipeable
          ref={rowRef}
          renderRightActions={() => renderRightActions(item, closeRow)}
          overshootRight={false}
        >
          <TouchableOpacity 
            style={[styles.deviceItem, themedStyles.card, themedStyles.shadow]} 
            onPress={() => navigation.navigate('DeviceDetail', { device: item })}
          >
            <View style={[styles.deviceIcon, { backgroundColor: item.typeColor + '20' }]}>
              <Ionicons 
                name={deviceTypes.find(type => type.id === item.type)?.icon || 'help-circle'} 
                size={24} 
                color={item.typeColor} 
              />
            </View>
            <View style={styles.deviceInfo}>
              <View style={styles.deviceHeader}>
                <Text style={[styles.deviceName, themedStyles.text]}>{item.name}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                  <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>
              <View style={styles.deviceDetails}>
                <Text style={[styles.deviceType, themedStyles.textSecondary]}>
                  {deviceTypes.find(type => type.id === item.type)?.title || 'Bilinmiyor'}
                </Text>
                <Text style={[styles.deviceLocation, themedStyles.textSecondary]}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <>
      <View style={[styles.header, themedStyles.header]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themedStyles.text]}>Tüm Cihazlar</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="search" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.typeCardContainer}
          >
            {deviceTypes.map(item => (
              <DeviceTypeCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
        
        <FlatList
          data={filteredDevices}
          renderItem={({ item }) => <DeviceItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="desktop-outline" size={50} color={theme.textSecondary} />
              <Text style={[styles.emptyText, themedStyles.text]}>Cihaz bulunamadı</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  typeCardContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeTitle: {
    marginLeft: 8,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
  },
  deviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceType: {
    fontSize: 14,
  },
  deviceLocation: {
    fontSize: 14,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    width: 100,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  }
});

export default withThemedScreen(AllDevicesScreen); 