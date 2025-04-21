import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CourtroomsScreen = ({ navigation }) => {
  // Örnek duruşma salonları
  const courtrooms = [
    { id: '1', name: '2. İş', court: 'İş Mahkemesi', location: 'Zemin Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif' },
    { id: '2', name: '1. Tüketici', court: 'Tüketici Mahkemesi', location: 'Zemin Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif' },
    { id: '3', name: '3. Asliye Hukuk', court: 'Asliye Hukuk Mahkemesi', location: 'Zemin Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif' },
    { id: '4', name: '4. Asliye Ceza', court: 'Asliye Ceza Mahkemesi', location: '1. Kat', deviceCount: { pc: 1, camera: 1, other: 0 }, status: 'Arıza' },
    { id: '5', name: '2. Sulh Hukuk', court: 'Sulh Hukuk Mahkemesi', location: '1. Kat', deviceCount: { pc: 1, camera: 1, other: 0 }, status: 'Arıza' },
    { id: '6', name: '5. Ağır Ceza', court: 'Ağır Ceza Mahkemesi', location: '2. Kat', deviceCount: { pc: 1, camera: 0, other: 0 }, status: 'Bakım' },
    { id: '7', name: '6. İcra', court: 'İcra Mahkemesi', location: '2. Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif' },
    { id: '8', name: '3. Aile', court: 'Aile Mahkemesi', location: '3. Kat', deviceCount: { pc: 1, camera: 1, other: 0 }, status: 'Aktif' },
    { id: '9', name: '2. Ticaret', court: 'Ticaret Mahkemesi', location: '3. Kat', deviceCount: { pc: 1, camera: 0, other: 0 }, status: 'Arıza' },
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

  // Salon kartı bileşeni
  const CourtroomCard = ({ item }) => (
    <View style={styles.courtroomCard}>
      <View style={styles.courtroomHeader}>
        <Text style={styles.courtroomName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color="#64748b" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.deviceInfoRow}>
        <View style={styles.deviceCol}>
          <Ionicons name="desktop-outline" size={18} color="#1e3a8a" />
          <Text style={styles.deviceCount}>{item.deviceCount.pc}</Text>
        </View>
        
        <View style={styles.deviceCol}>
          <Ionicons name="videocam-outline" size={18} color="#1e3a8a" />
          <Text style={styles.deviceCount}>{item.deviceCount.camera}</Text>
        </View>
        
        <View style={styles.deviceCol}>
          <Ionicons name="hardware-chip-outline" size={18} color="#1e3a8a" />
          <Text style={styles.deviceCount}>{item.deviceCount.other}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={18} color="#1e293b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Duruşma Salonları</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Salon Ekle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Salon adı veya konum ara..."
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <FlatList
        data={courtrooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourtroomCard item={item} />}
        contentContainerStyle={styles.courtroomsList}
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
    fontSize: 20,
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
    marginLeft: 6,
    fontSize: 14,
    color: '#ffffff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
    height: 44,
  },
  courtroomsList: {
    padding: 16,
  },
  courtroomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  courtroomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courtroomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  deviceCol: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  deviceCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
});

export default CourtroomsScreen; 