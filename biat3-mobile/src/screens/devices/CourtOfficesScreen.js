import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CourtOfficesScreen = ({ navigation }) => {
  // Örnek mahkeme kalemleri listesi
  const courtOffices = [
    { id: '1', name: '1. Asliye Hukuk Mahkemesi', deviceCount: { pc: 1, printer: 0, other: 0 }, type: 'Asliye Hukuk', location: 'B Blok, 9. Kat', status: 'Aktif', lastCheck: '07.04.2025' },
    { id: '2', name: '2. Sulh Hukuk Mahkemesi', deviceCount: { pc: 0, printer: 0, other: 0 }, type: 'Sulh Hukuk', location: '9. Kat', status: 'Aktif', lastCheck: '07.04.2025' },
    { id: '3', name: '1. Asliye Ceza Mahkemesi', deviceCount: { pc: 0, printer: 0, other: 0 }, type: 'Asliye Ceza', location: 'D Blok, 4. Kat', status: 'Aktif', lastCheck: '21.04.2025' },
    { id: '4', name: 'İcra Dairesi', deviceCount: { pc: 2, printer: 1, other: 1 }, type: 'İcra', location: 'A Blok, 2. Kat', status: 'Bakım', lastCheck: '05.04.2025' },
    { id: '5', name: 'Ağır Ceza Mahkemesi', deviceCount: { pc: 3, printer: 2, other: 0 }, type: 'Ağır Ceza', location: 'C Blok, 5. Kat', status: 'Aktif', lastCheck: '10.04.2025' },
    { id: '6', name: 'İş Mahkemesi', deviceCount: { pc: 2, printer: 1, other: 0 }, type: 'İş', location: 'B Blok, 3. Kat', status: 'Aktif', lastCheck: '12.04.2025' },
    { id: '7', name: 'Ticaret Mahkemesi', deviceCount: { pc: 2, printer: 1, other: 1 }, type: 'Ticaret', location: 'A Blok, 6. Kat', status: 'Bakım', lastCheck: '09.04.2025' },
    { id: '8', name: 'Aile Mahkemesi', deviceCount: { pc: 1, printer: 1, other: 0 }, type: 'Aile', location: 'D Blok, 2. Kat', status: 'Arıza', lastCheck: '14.04.2025' },
  ];

  // Durum filtreleri
  const [selectedType, setSelectedType] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');

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

  // Mahkeme kartı bileşeni
  const CourtOfficeCard = ({ item }) => (
    <View style={styles.courtCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.courtName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.courtTypeRow}>
        <Ionicons name="briefcase-outline" size={16} color="#64748b" />
        <Text style={styles.courtTypeText}>{item.type}</Text>
      </View>
      
      <View style={styles.courtLocationRow}>
        <Ionicons name="location-outline" size={16} color="#64748b" />
        <Text style={styles.courtLocationText}>{item.location}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.deviceInfoRow}>
        <View style={styles.deviceCol}>
          <Ionicons name="desktop-outline" size={18} color="#1e3a8a" />
          <Text style={styles.deviceCount}>{item.deviceCount.pc}</Text>
        </View>
        
        <View style={styles.deviceCol}>
          <Ionicons name="print-outline" size={18} color="#1e3a8a" />
          <Text style={styles.deviceCount}>{item.deviceCount.printer}</Text>
        </View>
        
        <View style={styles.deviceCol}>
          <Ionicons name="hardware-chip-outline" size={18} color="#1e3a8a" />
          <Text style={styles.deviceCount}>{item.deviceCount.other}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.dateText}>{item.lastCheck}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={18} color="#1e293b" style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" style={styles.actionIcon} />
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
        <Text style={styles.headerTitle}>Mahkeme Kalemleri</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Kalem Ekle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>Adliyedeki mahkeme kalemleri ve cihaz durumları</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>MAHKEME TÜRÜ</Text>
          <TouchableOpacity style={styles.filterBox}>
            <Text style={styles.filterValue}>{selectedType}</Text>
            <Ionicons name="chevron-down" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>DURUM</Text>
          <TouchableOpacity style={styles.filterBox}>
            <Text style={styles.filterValue}>{selectedStatus}</Text>
            <Ionicons name="chevron-down" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.resetFilterButton}>
          <Ionicons name="refresh" size={16} color="#1e3a8a" />
          <Text style={styles.resetFilterText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={courtOffices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourtOfficeCard item={item} />}
        contentContainerStyle={styles.cardsContainer}
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
  subHeader: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#f8fafc',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#64748b',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterSection: {
    marginRight: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
  },
  filterValue: {
    fontSize: 14,
    color: '#1e293b',
  },
  resetFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  resetFilterText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1e3a8a',
  },
  cardsContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  courtCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courtName: {
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
  courtTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courtTypeText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 6,
  },
  courtLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtLocationText: {
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  actionIcon: {
    opacity: 0.8,
  },
});

export default CourtOfficesScreen; 