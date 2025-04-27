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
  ScrollView,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import withThemedScreen from '../../components/withThemedScreen';

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

const CourtroomsScreen = ({ route, theme, themedStyles }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [courtrooms, setCourtrooms] = useState(MOCK_COURTROOMS);
  const [filteredCourtrooms, setFilteredCourtrooms] = useState(MOCK_COURTROOMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tümü');
  const [loading, setLoading] = useState(false);

  // Process courtroom updates when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Handle courtroom actions
      if (route?.params) {
        // Handle new courtroom added
        if (route.params.action === 'add' && route.params.courtroom) {
          setCourtrooms(prev => [route.params.courtroom, ...prev]);
        }
        
        // Handle courtroom updated
        else if (route.params.action === 'update' && route.params.courtroom) {
          setCourtrooms(prev => 
            prev.map(item => 
              item.id === route.params.courtroom.id 
                ? route.params.courtroom 
                : item
            )
          );
        }
        
        // Handle courtroom deleted
        else if (route.params.action === 'delete' && route.params.courtroomId) {
          setCourtrooms(prev => 
            prev.filter(item => item.id !== route.params.courtroomId)
          );
        }
        
        // Clear route params after processing
        if (route.params.action) {
          navigation.setParams({ action: null, courtroom: null, courtroomId: null });
        }
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
      case 'Pasif':
        return '#64748b'; // slate
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

  // Render empty component
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.textSecondary} />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {searchQuery || statusFilter !== 'Tümü'
          ? 'Aramanızla eşleşen duruşma salonu bulunamadı.'
          : 'Henüz duruşma salonu eklenmemiş.'}
      </Text>
      <TouchableOpacity 
        style={[styles.emptyAddButton, { backgroundColor: theme.primary }]}
        onPress={handleAddCourtroom}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.emptyAddButtonText}>Salon Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  // Render courtroom card
  const renderCourtroomCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    
    // Calculate total device count
    const totalDevices = Object.values(item.devices || {}).reduce((sum, count) => sum + count, 0);
    
    const card = (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => navigation.navigate('CourtroomDetail', { courtroom: item })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{item.court}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.cardInfoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker" size={18} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{item.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="devices" size={18} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{totalDevices} Cihaz</Text>
          </View>
        </View>
        
        {totalDevices > 0 && (
          <View style={[styles.deviceGrid, { borderTopColor: theme.border }]}>
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
                    color={theme.primary} 
                  />
                  <Text style={[styles.deviceText, { color: theme.text }]}>
                    {deviceLabel}
                  </Text>
                  <View style={[styles.deviceCountBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={[styles.deviceCountText, { color: theme.text }]}>{count}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        
        <View style={styles.cardInfoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>Son Kontrol: {item.lastCheck}</Text>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Duruşma Salonları</Text>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="magnify" size={22} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Salon adı, mahkeme veya konum ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.textSecondary}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScrollContainer}
          >
            {['Tümü', 'Aktif', 'Arıza', 'Bakım', 'Pasif'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  { borderColor: theme.border },
                  statusFilter === status && { 
                    backgroundColor: status === 'Tümü' 
                      ? theme.primary 
                      : getStatusColor(status),
                    borderColor: status === 'Tümü' 
                      ? theme.primary 
                      : getStatusColor(status),
                  }
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text 
                  style={[
                    styles.filterText,
                    { color: theme.textSecondary },
                    statusFilter === status && { color: '#fff' }
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredCourtrooms}
            keyExtractor={item => item.id}
            renderItem={renderCourtroomCard}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyComponent}
          />
        )}
        
        {/* Fixed Action Button for adding new courtroom */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
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
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
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
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 15,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
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
  },
  cardSubtitle: {
    fontSize: 14,
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
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 5,
    borderTopWidth: 1,
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
    marginLeft: 4,
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
    marginLeft: 4,
  },
  deviceCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default withThemedScreen(CourtroomsScreen); 