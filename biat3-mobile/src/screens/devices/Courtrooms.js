import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  Alert,
  Animated,
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

// Mock data for courtrooms
const MOCK_COURTROOMS = [
  { 
    id: '1', 
    name: '2. İş', 
    court: 'İş Mahkemesi', 
    location: 'Zemin Kat', 
    devices: {
      kasa: 1,
      monitor: 1,
      segbis: 1,
      kamera: 1,
      tv: 0,
      mikrofon: 1
    },
    status: 'Aktif', 
    lastCheck: '10.06.2023', 
    notes: 'Tüm cihazlar çalışır durumda.' 
  },
  { 
    id: '2', 
    name: '1. Tüketici', 
    court: 'Tüketici Mahkemesi', 
    location: 'Zemin Kat', 
    devices: {
      kasa: 1,
      monitor: 1,
      segbis: 1,
      kamera: 1,
      tv: 1,
      mikrofon: 1
    },
    status: 'Aktif', 
    lastCheck: '12.06.2023', 
    notes: 'Kameralar yeni değiştirildi.' 
  },
  { 
    id: '3', 
    name: '3. Asliye Hukuk', 
    court: 'Asliye Hukuk Mahkemesi', 
    location: 'Zemin Kat', 
    devices: {
      kasa: 1,
      monitor: 1,
      segbis: 1,
      kamera: 0,
      tv: 1,
      mikrofon: 1
    },
    status: 'Aktif', 
    lastCheck: '15.06.2023', 
    notes: '' 
  },
  { 
    id: '4', 
    name: '4. Asliye Ceza', 
    court: 'Asliye Ceza Mahkemesi', 
    location: '1. Kat', 
    devices: {
      kasa: 0,
      monitor: 1,
      segbis: 1,
      kamera: 1,
      tv: 1,
      mikrofon: 0
    },
    status: 'Arıza', 
    lastCheck: '05.06.2023', 
    notes: 'Bilgisayar arızalı, onarım bekleniyor.' 
  },
  { 
    id: '5', 
    name: '2. Sulh Hukuk', 
    court: 'Sulh Hukuk Mahkemesi', 
    location: '1. Kat', 
    devices: {
      kasa: 1,
      monitor: 1,
      segbis: 0,
      kamera: 1,
      tv: 0,
      mikrofon: 0
    },
    status: 'Arıza', 
    lastCheck: '01.06.2023', 
    notes: 'Ses sistemi çalışmıyor.' 
  },
];

// SwipeableRow component for swipe actions
const SwipeableRow = ({ item, onEdit, onDelete, children }) => {
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.swipeActions}>
        <Animated.View
          style={[
            styles.editAction,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          <TouchableOpacity onPress={() => onEdit(item)}>
            <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.deleteAction,
            {
              transform: [{ translateX: trans }],
            },
          ]}>
          <TouchableOpacity onPress={() => onDelete(item)}>
            <MaterialCommunityIcons name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
};

const Courtrooms = ({ route }) => {
  const navigation = useNavigation();
  const [courtrooms, setCourtrooms] = useState(MOCK_COURTROOMS);
  const [filteredCourtrooms, setFilteredCourtrooms] = useState(MOCK_COURTROOMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tümü');

  // Process courtroom updates when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Handle new courtroom added
      if (route?.params?.action === 'add' && route?.params?.courtroom) {
        setCourtrooms(prev => [route.params.courtroom, ...prev]);
        navigation.setParams({ action: null, courtroom: null });
      }
      
      // Handle courtroom updated
      if (route?.params?.action === 'update' && route?.params?.courtroom) {
        setCourtrooms(prev => 
          prev.map(item => 
            item.id === route.params.courtroom.id 
              ? route.params.courtroom 
              : item
          )
        );
        navigation.setParams({ action: null, courtroom: null });
      }
      
      // Handle courtroom deleted
      if (route?.params?.deletedCourtroom) {
        setCourtrooms(prev => 
          prev.filter(item => item.id !== route.params.deletedCourtroom.id)
        );
        navigation.setParams({ deletedCourtroom: null });
      }
    }, [route?.params, navigation])
  );

  // Filter courtrooms based on search query and status filter
  useEffect(() => {
    let result = courtrooms;
    
    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.court.toLowerCase().includes(lowerCaseQuery) ||
          item.location.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'Tümü') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredCourtrooms(result);
  }, [courtrooms, searchQuery, statusFilter]);

  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif':
        return '#10b981'; // green
      case 'Arıza':
        return '#ef4444'; // red
      case 'Bakım':
        return '#f59e0b'; // amber
      default:
        return '#64748b'; // slate
    }
  };

  // Function for handling edit
  const handleEdit = (courtroom) => {
    navigation.navigate('CourtroomForm', { courtroom });
  };

  // Function for handling delete
  const handleDelete = (courtroom) => {
    Alert.alert(
      'Salon Sil',
      `"${courtroom.name}" salonunu silmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setCourtrooms(prev => prev.filter(item => item.id !== courtroom.id));
          },
        },
      ]
    );
  };

  // Function to handle adding a new courtroom
  const handleAddCourtroom = () => {
    navigation.navigate('CourtroomForm');
  };

  // Render courtroom card
  const renderCourtroomCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    
    // Calculate total device count
    const totalDevices = Object.values(item.devices || {}).reduce((sum, count) => sum + count, 0);
    
    const card = (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('CourtroomDetail', { courtroom: item })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.court}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.cardInfoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="devices" size={18} color="#666" />
            <Text style={styles.infoText}>{totalDevices} Cihaz</Text>
          </View>
        </View>
        
        <View style={styles.deviceGrid}>
          {item.devices && Object.entries(item.devices).map(([key, count]) => {
            if (count <= 0) return null; // Sadece sayısı 0'dan büyük olanları göster
            
            let iconName = 'help-circle-outline';
            let deviceLabel = 'Bilinmeyen';
            
            switch(key) {
              case 'kasa':
                iconName = 'desktop-tower';
                deviceLabel = 'Kasa';
                break;
              case 'monitor':
                iconName = 'monitor';
                deviceLabel = 'Monitör';
                break;
              case 'segbis':
                iconName = 'video';
                deviceLabel = 'SEGBİS';
                break;
              case 'kamera':
                iconName = 'cctv';
                deviceLabel = 'Kamera';
                break;
              case 'tv':
                iconName = 'television';
                deviceLabel = 'TV';
                break;
              case 'mikrofon':
                iconName = 'microphone';
                deviceLabel = 'Mikrofon';
                break;
            }
            
            return (
              <View key={key} style={styles.deviceItem}>
                <MaterialCommunityIcons 
                  name={iconName} 
                  size={16} 
                  color="#4f46e5"
                />
                <Text style={styles.deviceText}>
                  {deviceLabel}
                </Text>
                <View style={styles.deviceCountBadge}>
                  <Text style={styles.deviceCountText}>{count}</Text>
                </View>
              </View>
            );
          })}
        </View>
        
        <View style={styles.cardInfoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#666" />
            <Text style={styles.infoText}>Son Kontrol: {item.lastCheck}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
    
    return (
      <SwipeableRow 
        item={item} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
      >
        {card}
      </SwipeableRow>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Duruşma Salonları</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={22} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Salon adı, mahkeme veya konum ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#a1a1aa"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScrollContainer}
          >
            {['Tümü', 'Aktif', 'Arıza', 'Bakım'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && { 
                    backgroundColor: status === 'Tümü' 
                      ? '#4f46e5' 
                      : getStatusColor(status),
                    borderColor: status === 'Tümü' 
                      ? '#4f46e5' 
                      : getStatusColor(status),
                  }
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text 
                  style={[
                    styles.filterText,
                    statusFilter === status && { color: '#fff' }
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <FlatList
          data={filteredCourtrooms}
          keyExtractor={item => item.id}
          renderItem={renderCourtroomCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter !== 'Tümü'
                  ? 'Aramanızla eşleşen duruşma salonu bulunamadı.'
                  : 'Henüz duruşma salonu eklenmemiş.'}
              </Text>
              <TouchableOpacity 
                style={styles.emptyAddButton}
                onPress={handleAddCourtroom}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.emptyAddButtonText}>Salon Ekle</Text>
              </TouchableOpacity>
            </View>
          }
        />
        
        {/* Fixed Action Button for adding new courtroom */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddCourtroom}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1e293b',
    height: '100%',
  },
  filterScrollContainer: {
    paddingRight: 16,
    paddingLeft: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
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
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '33%',
    marginBottom: 8,
  },
  deviceText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  inactiveDevice: {
    color: '#999',
  },
  swipeActions: {
    flexDirection: 'row',
    width: 120,
    height: '100%',
  },
  editAction: {
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4f46e5',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyAddButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deviceCountBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginLeft: 4,
  },
  deviceCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
  },
});

export default Courtrooms; 