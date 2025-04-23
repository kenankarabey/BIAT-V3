import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const CourtroomsScreen = ({ navigation, route }) => {
  // İlk duruşma salonları verisi
  const initialCourtrooms = [
    { id: '1', name: '2. İş', court: 'İş Mahkemesi', location: 'Zemin Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif', lastCheck: '10.06.2023', notes: 'Tüm cihazlar çalışır durumda.' },
    { id: '2', name: '1. Tüketici', court: 'Tüketici Mahkemesi', location: 'Zemin Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif', lastCheck: '12.06.2023', notes: 'Kameralar yeni değiştirildi.' },
    { id: '3', name: '3. Asliye Hukuk', court: 'Asliye Hukuk Mahkemesi', location: 'Zemin Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif', lastCheck: '15.06.2023', notes: '' },
    { id: '4', name: '4. Asliye Ceza', court: 'Asliye Ceza Mahkemesi', location: '1. Kat', deviceCount: { pc: 1, camera: 1, other: 0 }, status: 'Arıza', lastCheck: '05.06.2023', notes: 'Bilgisayar arızalı, onarım bekleniyor.' },
    { id: '5', name: '2. Sulh Hukuk', court: 'Sulh Hukuk Mahkemesi', location: '1. Kat', deviceCount: { pc: 1, camera: 1, other: 0 }, status: 'Arıza', lastCheck: '01.06.2023', notes: 'Ses sistemi çalışmıyor.' },
    { id: '6', name: '5. Ağır Ceza', court: 'Ağır Ceza Mahkemesi', location: '2. Kat', deviceCount: { pc: 1, camera: 0, other: 0 }, status: 'Bakım', lastCheck: '20.05.2023', notes: 'Sistem bakımda, haftaya tamamlanacak.' },
    { id: '7', name: '6. İcra', court: 'İcra Mahkemesi', location: '2. Kat', deviceCount: { pc: 1, camera: 1, other: 1 }, status: 'Aktif', lastCheck: '08.06.2023', notes: '' },
    { id: '8', name: '3. Aile', court: 'Aile Mahkemesi', location: '3. Kat', deviceCount: { pc: 1, camera: 1, other: 0 }, status: 'Aktif', lastCheck: '11.06.2023', notes: '' },
    { id: '9', name: '2. Ticaret', court: 'Ticaret Mahkemesi', location: '3. Kat', deviceCount: { pc: 1, camera: 0, other: 0 }, status: 'Arıza', lastCheck: '30.05.2023', notes: 'Kamera takılması gerekiyor.' },
  ];

  // State tanımları
  const [courtrooms, setCourtrooms] = useState(initialCourtrooms);
  const [filteredCourtrooms, setFilteredCourtrooms] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Arama sonuçlarını filtrele
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredCourtrooms(courtrooms);
    } else {
      const lowercasedText = searchText.toLowerCase();
      const filtered = courtrooms.filter(
        (courtroom) =>
          courtroom.name.toLowerCase().includes(lowercasedText) ||
          courtroom.court.toLowerCase().includes(lowercasedText) ||
          courtroom.location.toLowerCase().includes(lowercasedText)
      );
      setFilteredCourtrooms(filtered);
    }
  }, [searchText, courtrooms]);

  // Route params'tan gelen verileri işle
  useFocusEffect(
    React.useCallback(() => {
      // Yeni salon eklendiyse
      if (route.params?.newCourtroom) {
        setCourtrooms((prev) => [route.params.newCourtroom, ...prev]);
        navigation.setParams({ newCourtroom: null });
      }
      
      // Salon güncellendiyse
      if (route.params?.updatedCourtroom) {
        setCourtrooms((prev) =>
          prev.map((item) =>
            item.id === route.params.updatedCourtroom.id
              ? route.params.updatedCourtroom
              : item
          )
        );
        navigation.setParams({ updatedCourtroom: null });
      }
      
      // Salon silindiyse
      if (route.params?.deletedCourtroomId) {
        setCourtrooms((prev) =>
          prev.filter((item) => item.id !== route.params.deletedCourtroomId)
        );
        navigation.setParams({ deletedCourtroomId: null });
      }
    }, [route.params, navigation])
  );

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

  // Salon detaylarına gitme
  const handleViewCourtroom = (courtroom) => {
    navigation.navigate('CourtroomDetail', { courtroom });
  };

  // Salon düzenleme ekranına gitme
  const handleEditCourtroom = (courtroom) => {
    navigation.navigate('CourtroomForm', { courtroom });
  };

  // Salon silme onayı
  const handleDeleteCourtroom = (id, name) => {
    Alert.alert(
      'Salon Silme',
      `"${name}" salonunu silmek istediğinizden emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setCourtrooms((prev) => prev.filter((courtroom) => courtroom.id !== id));
          },
        },
      ]
    );
  };

  // Yeni salon ekleme ekranına gitme
  const handleAddCourtroom = () => {
    navigation.navigate('CourtroomForm');
  };

  // Salon kartı bileşeni
  const CourtroomCard = ({ item }) => (
    <TouchableOpacity
      style={styles.courtroomCard}
      onPress={() => handleViewCourtroom(item)}
    >
      <View style={styles.courtroomHeader}>
        <Text style={styles.courtroomName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.courtText}>{item.court}</Text>
      
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color="#64748b" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.deviceInfoRow}>
        <View style={styles.deviceCol}>
          <Ionicons name="desktop-outline" size={18} color="#475569" />
          <Text style={styles.deviceCount}>{item.deviceCount.pc}</Text>
          <Text style={styles.deviceLabel}>PC</Text>
        </View>
        
        <View style={styles.deviceCol}>
          <Ionicons name="videocam-outline" size={18} color="#475569" />
          <Text style={styles.deviceCount}>{item.deviceCount.camera}</Text>
          <Text style={styles.deviceLabel}>Kamera</Text>
        </View>
        
        <View style={styles.deviceCol}>
          <Ionicons name="hardware-chip-outline" size={18} color="#475569" />
          <Text style={styles.deviceCount}>{item.deviceCount.other}</Text>
          <Text style={styles.deviceLabel}>Diğer</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditCourtroom(item)}
        >
          <Ionicons name="create-outline" size={18} color="#1e293b" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteCourtroom(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>Duruşma Salonları</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCourtroom}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Salon</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Salon adı veya konum ara..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredCourtrooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourtroomCard item={item} />}
        contentContainerStyle={styles.courtroomsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {searchText
                ? 'Arama kriterlerine uygun sonuç bulunamadı.'
                : 'Henüz duruşma salonu eklenmemiş.'}
            </Text>
          </View>
        }
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
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
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
    borderRadius: 8,
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
    paddingBottom: 24,
  },
  courtroomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  courtroomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courtroomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  courtText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
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
    marginTop: 4,
    marginBottom: 2,
  },
  deviceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default CourtroomsScreen; 