import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const CourtOfficesScreen = ({ navigation }) => {
  // Örnek mahkeme kalemleri listesi
  const [courtOffices, setCourtOffices] = useState([
    { id: '1', name: '1. Asliye Hukuk Mahkemesi', deviceCount: { pc: 1, printer: 0, other: 0 }, type: 'Asliye Hukuk', location: 'B Blok, 9. Kat', status: 'Aktif', lastCheck: '07.04.2025' },
    { id: '2', name: '2. Sulh Hukuk Mahkemesi', deviceCount: { pc: 0, printer: 0, other: 0 }, type: 'Sulh Hukuk', location: '9. Kat', status: 'Aktif', lastCheck: '07.04.2025' },
    { id: '3', name: '1. Asliye Ceza Mahkemesi', deviceCount: { pc: 0, printer: 0, other: 0 }, type: 'Asliye Ceza', location: 'D Blok, 4. Kat', status: 'Aktif', lastCheck: '21.04.2025' },
    { id: '4', name: 'İcra Dairesi', deviceCount: { pc: 2, printer: 1, other: 1 }, type: 'İcra', location: 'A Blok, 2. Kat', status: 'Bakım', lastCheck: '05.04.2025' },
    { id: '5', name: 'Ağır Ceza Mahkemesi', deviceCount: { pc: 3, printer: 2, other: 0 }, type: 'Ağır Ceza', location: 'C Blok, 5. Kat', status: 'Aktif', lastCheck: '10.04.2025' },
    { id: '6', name: 'İş Mahkemesi', deviceCount: { pc: 2, printer: 1, other: 0 }, type: 'İş', location: 'B Blok, 3. Kat', status: 'Aktif', lastCheck: '12.04.2025' },
    { id: '7', name: 'Ticaret Mahkemesi', deviceCount: { pc: 2, printer: 1, other: 1 }, type: 'Ticaret', location: 'A Blok, 6. Kat', status: 'Bakım', lastCheck: '09.04.2025' },
    { id: '8', name: 'Aile Mahkemesi', deviceCount: { pc: 1, printer: 1, other: 0 }, type: 'Aile', location: 'D Blok, 2. Kat', status: 'Arıza', lastCheck: '14.04.2025' },
  ]);

  // Durum filtreleri
  const [selectedType, setSelectedType] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  
  // Mahkeme türleri listesi
  const courtTypes = ['Tümü', 'Asliye Hukuk', 'Sulh Hukuk', 'Asliye Ceza', 'Ağır Ceza', 'İcra', 'İş', 'Ticaret', 'Aile'];
  
  // Durum listesi
  const statusTypes = ['Tümü', 'Aktif', 'Arıza', 'Bakım'];
  
  // Filtreleme popup'ları
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  
  // Filtrelenmiş mahkeme kalemleri
  const filteredCourtOffices = courtOffices.filter(office => {
    // Tür filtresi
    const typeMatch = selectedType === 'Tümü' || office.type === selectedType;
    // Durum filtresi
    const statusMatch = selectedStatus === 'Tümü' || office.status === selectedStatus;
    
    return typeMatch && statusMatch;
  });

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
  
  // Filtre sıfırlama işlevi
  const resetFilters = () => {
    setSelectedType('Tümü');
    setSelectedStatus('Tümü');
  };
  
  // Mahkeme kalemini silme işlevi
  const handleDelete = (id) => {
    Alert.alert(
      "Mahkeme Kalemini Sil",
      "Bu mahkeme kalemini silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          onPress: () => {
            setCourtOffices(courtOffices.filter(office => office.id !== id));
            Alert.alert("Başarılı", "Mahkeme kalemi başarıyla silindi");
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // Mahkeme kalemini düzenleme işlevi
  const handleEdit = (office) => {
    navigation.navigate('CourtOfficeForm', { office });
  };
  
  // Sola kaydırma aksiyonları
  const renderRightActions = (office) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity 
          style={[styles.actionSwipeButton, { backgroundColor: '#4f46e5' }]}
          onPress={() => handleEdit(office)}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionSwipeText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionSwipeButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleDelete(office.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionSwipeText}>Sil</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Mahkeme kartı bileşeni
  const CourtOfficeCard = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.courtCard}
        onPress={() => navigation.navigate('CourtOfficeDetail', { office: item })}
      >
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
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="pencil-outline" size={18} color="#1e293b" style={styles.actionIcon} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" style={styles.actionIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mahkeme Kalemleri</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CourtOfficeForm')}
          >
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
            <TouchableOpacity 
              style={styles.filterBox}
              onPress={() => setShowTypeFilter(!showTypeFilter)}
            >
              <Text style={styles.filterValue}>{selectedType}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
            
            {showTypeFilter && (
              <View style={styles.filterDropdown}>
                {courtTypes.map((type) => (
                  <TouchableOpacity 
                    key={type} 
                    style={[
                      styles.filterOption,
                      selectedType === type && styles.selectedFilterOption
                    ]}
                    onPress={() => {
                      setSelectedType(type);
                      setShowTypeFilter(false);
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedType === type && styles.selectedFilterOptionText
                    ]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>DURUM</Text>
            <TouchableOpacity 
              style={styles.filterBox}
              onPress={() => setShowStatusFilter(!showStatusFilter)}
            >
              <Text style={styles.filterValue}>{selectedStatus}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
            
            {showStatusFilter && (
              <View style={styles.filterDropdown}>
                {statusTypes.map((status) => (
                  <TouchableOpacity 
                    key={status} 
                    style={[
                      styles.filterOption,
                      selectedStatus === status && styles.selectedFilterOption
                    ]}
                    onPress={() => {
                      setSelectedStatus(status);
                      setShowStatusFilter(false);
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedStatus === status && styles.selectedFilterOptionText
                    ]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.resetFilterButton}
            onPress={resetFilters}
          >
            <Ionicons name="refresh" size={16} color="#1e3a8a" />
            <Text style={styles.resetFilterText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredCourtOffices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CourtOfficeCard item={item} />}
          contentContainerStyle={styles.cardsContainer}
        />
      </View>
    </GestureHandlerRootView>
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
    zIndex: 100, // Dropdown filters should be on top
  },
  filterSection: {
    marginRight: 20,
    zIndex: 100,
    position: 'relative',
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
  filterDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    backgroundColor: '#ffffff',
    width: 160,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  filterOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedFilterOption: {
    backgroundColor: '#f1f5f9',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#1e293b',
  },
  selectedFilterOptionText: {
    fontWeight: '600',
    color: '#1e3a8a',
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
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
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
    color: '#64748b',
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
    marginVertical: 12,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  deviceCol: {
    alignItems: 'center',
  },
  deviceCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 4,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionIcon: {
    marginTop: 1,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionSwipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    paddingHorizontal: 10,
  },
  actionSwipeText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CourtOfficesScreen; 