import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JudgeRoomsScreen = ({ navigation }) => {
  // Örnek hakim odaları listesi
  const judgeRooms = [
    { id: '1', roomNumber: '103', judgeName: 'Hakim Ali Yılmaz', court: 'Asliye Ceza Mahkemesi', deviceCount: 4, status: 'Aktif' },
    { id: '2', roomNumber: '105', judgeName: 'Hakim Ayşe Demir', court: 'Asliye Hukuk Mahkemesi', deviceCount: 3, status: 'Aktif' },
    { id: '3', roomNumber: '201', judgeName: 'Hakim Mehmet Öz', court: 'Sulh Ceza Hakimliği', deviceCount: 5, status: 'Bakım' },
    { id: '4', roomNumber: '204', judgeName: 'Hakim Zeynep Kaya', court: 'İş Mahkemesi', deviceCount: 3, status: 'Arıza' },
    { id: '5', roomNumber: '301', judgeName: 'Hakim Ahmet Şahin', court: 'Ağır Ceza Mahkemesi', deviceCount: 6, status: 'Aktif' },
    { id: '6', roomNumber: '305', judgeName: 'Hakim Fatma Yıldız', court: 'Tüketici Mahkemesi', deviceCount: 4, status: 'Bakım' },
    { id: '7', roomNumber: '402', judgeName: 'Hakim Mustafa Çelik', court: 'Ticaret Mahkemesi', deviceCount: 5, status: 'Aktif' },
    { id: '8', roomNumber: '405', judgeName: 'Hakim Selin Aksoy', court: 'Aile Mahkemesi', deviceCount: 3, status: 'Arıza' },
    { id: '9', roomNumber: '501', judgeName: 'Hakim Kemal Özdemir', court: 'İcra Mahkemesi', deviceCount: 4, status: 'Aktif' },
    { id: '10', roomNumber: '505', judgeName: 'Hakim Deniz Bulut', court: 'İdare Mahkemesi', deviceCount: 5, status: 'Aktif' },
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

  // Hakim odası kartı bileşeni
  const RoomItem = ({ item }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomNumber}>Oda {item.roomNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.judgeName}>{item.judgeName}</Text>
        <Text style={styles.courtName}>{item.court}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.deviceInfoContainer}>
        <View style={styles.deviceIconContainer}>
          <Ionicons name="hardware-chip-outline" size={16} color="#1e3a8a" />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceCount}>{item.deviceCount} Cihaz</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsText}>Detaylar</Text>
            <Ionicons name="chevron-forward" size={16} color="#1e3a8a" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Hakim Odaları</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <Text style={styles.searchPlaceholder}>Oda ara...</Text>
        </View>
      </View>

      <FlatList
        data={judgeRooms}
        keyExtractor={(item) => item.id}
        renderItem={RoomItem}
        contentContainerStyle={styles.roomsList}
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
  roomsList: {
    padding: 16,
  },
  roomCard: {
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
  roomInfo: {
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  judgeName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  courtName: {
    fontSize: 14,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deviceInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceCount: {
    fontSize: 14,
    color: '#64748b',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e3a8a',
    marginRight: 4,
  },
});

export default JudgeRoomsScreen; 