import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AllDevicesScreen = ({ navigation }) => {
  // Örnek cihazlar listesi
  const devices = [
    { id: '1', name: 'PC-i5-8400', type: 'Masaüstü Bilgisayar', location: 'Asliye Ceza Mahkemesi', status: 'Aktif' },
    { id: '2', name: 'LPT-L340', type: 'Dizüstü Bilgisayar', location: 'Hâkim Odası 103', status: 'Bakım' },
    { id: '3', name: 'PRN-C600', type: 'Yazıcı', location: 'Duruşma Salonu 2', status: 'Aktif' },
    { id: '4', name: 'SCN-FJ254', type: 'Tarayıcı', location: 'İcra Dairesi', status: 'Arıza' },
    { id: '5', name: 'PC-i7-9700', type: 'Masaüstü Bilgisayar', location: 'Ağır Ceza Mahkemesi', status: 'Aktif' },
    { id: '6', name: 'PRN-L655', type: 'Yazıcı', location: 'Hâkim Odası 205', status: 'Aktif' },
    { id: '7', name: 'LPT-X1', type: 'Dizüstü Bilgisayar', location: 'Savcılık', status: 'Bakım' },
    { id: '8', name: 'PC-Ryzen7', type: 'Masaüstü Bilgisayar', location: 'Bilgi İşlem', status: 'Aktif' },
    { id: '9', name: 'PRN-MP250', type: 'Yazıcı', location: 'Asliye Hukuk Mahkemesi', status: 'Arıza' },
    { id: '10', name: 'SCN-DR50', type: 'Tarayıcı', location: 'Duruşma Salonu 5', status: 'Aktif' },
    { id: '11', name: 'PC-i3-9100', type: 'Masaüstü Bilgisayar', location: 'İcra Dairesi', status: 'Aktif' },
    { id: '12', name: 'LPT-ThinkPad', type: 'Dizüstü Bilgisayar', location: 'Sulh Ceza Hakimliği', status: 'Arıza' },
    { id: '13', name: 'PRN-Canon', type: 'Yazıcı', location: 'Ticaret Mahkemesi', status: 'Aktif' },
    { id: '14', name: 'SCN-HP', type: 'Tarayıcı', location: 'İdare Mahkemesi', status: 'Bakım' },
    { id: '15', name: 'PC-i9-10900', type: 'Masaüstü Bilgisayar', location: 'Cumhuriyet Savcılığı', status: 'Aktif' },
  ];

  // Durum rengini belirleme
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

  // Cihaz kartı bileşeni
  const DeviceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.deviceCard}
      onPress={() => console.log(`Cihaz seçildi: ${item.name}`)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceType}>{item.type}</Text>
        <Text style={styles.deviceLocation}>{item.location}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tüm Cihazlar</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <Text style={styles.searchPlaceholder}>Cihaz ara...</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{devices.length}</Text>
          <Text style={styles.statLabel}>Toplam</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{devices.filter(d => d.status === 'Aktif').length}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{devices.filter(d => d.status === 'Arıza').length}</Text>
          <Text style={styles.statLabel}>Arıza</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{devices.filter(d => d.status === 'Bakım').length}</Text>
          <Text style={styles.statLabel}>Bakım</Text>
        </View>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={DeviceItem}
        contentContainerStyle={styles.devicesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchPlaceholder: {
    color: '#94a3b8',
    marginLeft: 8,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  devicesList: {
    padding: 16,
    paddingTop: 0,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  deviceType: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  deviceLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default AllDevicesScreen; 