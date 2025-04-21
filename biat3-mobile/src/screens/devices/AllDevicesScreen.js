import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    typeColor: '#4f46e5'
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
    typeColor: '#10b981'
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
    typeColor: '#f59e0b'
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
    typeColor: '#ef4444'
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
    typeColor: '#6366f1'
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
    typeColor: '#8b5cf6'
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
    typeColor: '#ec4899'
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
    typeColor: '#14b8a6'
  },
];

export default function AllDevicesScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState(null);

  const filteredDevices = selectedType
    ? mockDevices.filter(device => device.type === selectedType)
    : mockDevices;

  const DeviceTypeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.typeCard}
      onPress={() => setSelectedType(selectedType === item.id ? null : item.id)}
    >
      <View style={[
        styles.typeIconContainer,
        selectedType === item.id && styles.selectedTypeIconContainer
      ]}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={selectedType === item.id ? '#FFFFFF' : item.color} 
        />
      </View>
      <Text style={[
        styles.typeTitle,
        selectedType === item.id && styles.selectedTypeTitle
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const DeviceItem = ({ item }) => {
    const statusColors = {
      active: '#22c55e',
      maintenance: '#f59e0b',
      error: '#ef4444'
    };

    const statusText = {
      active: 'Aktif',
      maintenance: 'Bakımda',
      error: 'Arızalı'
    };

    return (
      <TouchableOpacity 
        style={styles.deviceItem}
        onPress={() => navigation.navigate('DeviceDetail', { device: item })}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceLocation}>{item.location}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusText[item.status]}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tüm Cihazlar</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        <View style={styles.typeScroll}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeContainer}
          >
            {deviceTypes.map(type => (
              <DeviceTypeCard key={type.id} item={type} />
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredDevices}
          renderItem={({ item }) => <DeviceItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.deviceList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

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
  typeScroll: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  typeContainer: {
    paddingHorizontal: 8,
    gap: 8,
    flexDirection: 'row',
  },
  typeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  typeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#f3f4f6',
  },
  selectedTypeIconContainer: {
    backgroundColor: '#1e293b',
  },
  typeTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  selectedTypeTitle: {
    color: '#1e293b',
    fontWeight: '600',
  },
  deviceList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  deviceLocation: {
    fontSize: 14,
    color: '#64748b',
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
}); 