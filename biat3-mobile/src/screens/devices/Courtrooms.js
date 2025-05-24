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
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../supabaseClient';


const fetchComputers = async () => {
  console.log('Kasa sorgusu:', {
    oda_tipi: 'Duruşma Salonu',
    birim: courtroom.court,
    salon_no: courtroom.name
  });
  const { data, error } = await supabase
    .from('computers')
    .select('*')
    .eq('oda_tipi', 'Duruşma Salonu')
    .eq('birim', courtroom.court)
    .eq('salon_no', courtroom.name);
  setComputers(data || []);
};
// Monitör (screens)
const fetchMonitors = async () => {
  console.log('Monitör sorgusu:', {
    oda_tipi: 'Duruşma Salonu',
    birim: courtroom.court,
    salon_no: courtroom.name
  });
  const { data, error } = await supabase
    .from('screens')
    .select('*')
    .eq('oda_tipi', 'Duruşma Salonu')
    .eq('birim', courtroom.court)
    .eq('salon_no', courtroom.name);
  setMonitors(data || []);
};



// SwipeableRow component for swipe actions
const SwipeableRow = ({ item, onEdit, onDelete, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowDimensions();
  const [cardHeight, setCardHeight] = useState(100); // default yükseklik

  // Kartın yüksekliğini ölç
  const handleCardLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    if (h && h !== cardHeight) setCardHeight(h);
  };

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-90, 0],
      outputRange: [0, 90],
      extrapolate: 'clamp',
    });
    return (
      <View style={[styles.swipeActions, { width: 180, height: cardHeight }]}> 
        <Animated.View
          style={[
            styles.editAction,
            {
              transform: [{ translateX: trans }],
              width: 90,
              height: cardHeight,
            },
          ]}>
          <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => onEdit(item)}>
            <MaterialCommunityIcons name="pencil" size={28} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>Düzenle</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            styles.deleteAction,
            {
              transform: [{ translateX: trans }],
              width: 90,
              height: cardHeight,
            },
          ]}>
          <TouchableOpacity style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => onDelete(item)}>
            <MaterialCommunityIcons name="delete" size={28} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>Sil</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => setIsOpen(true)}
      onSwipeableClose={() => setIsOpen(false)}
    >
      {React.cloneElement(children, { disabled: isOpen, onLayout: handleCardLayout })}
    </Swipeable>
  );
};

const CourtroomsScreen = ({ route, theme, themedStyles }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [courtrooms, setCourtrooms] = useState([]);
  const [filteredCourtrooms, setFilteredCourtrooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const isDark = theme.background === '#1e293b';
  const [selectedCourtroom, setSelectedCourtroom] = useState(null);
 
    // ...diğer kodlar...
    console.log('theme:', theme);
    console.log('isDark:', theme?.isDark, theme?.dark, theme?.mode);
    // ...devamı...
  

  // Supabase'dan salonları çek
  const fetchCourtrooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('durusma_salonlari')
      .select('*')
      .order('id', { ascending: true });
    if (!error && data) {
      // Mapping: Supabase alanlarını ekranda beklenen alanlara dönüştür
      const mapped = (data || []).map(item => ({
        id: item.id,
        name: item.salon_no ? String(item.salon_no) : '',
        court: item.mahkeme_turu || '',
        location: [item.blok, item.kat].filter(Boolean).join(' - '),
        status: item.durum || '',
        lastCheck: item.lastCheck || item.son_kontrol || '',
        devices: item.devices || {},
        notes: item.notes || '',
        mahkeme_no: item.salon_no || ''
      }));
      setCourtrooms(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourtrooms();
  }, []);

  // Process courtroom updates when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Handle courtroom actions
      if (route?.params) {
        // Handle new courtroom added
        if (route.params.action === 'add' && route.params.courtroom) {
          fetchCourtrooms();
        }
        // Handle courtroom updated
        else if (route.params.action === 'update' && route.params.courtroom) {
          fetchCourtrooms();
        }
        // Handle courtroom deleted
        else if (route.params.action === 'delete' && route.params.courtroomId) {
          fetchCourtrooms();
        }
        // Refresh parametresi ile otomatik yenileme
        if (route.params.refresh) {
          fetchCourtrooms();
          navigation.setParams({ ...route.params, refresh: false });
        }
        // Clear route params after processing
        if (route.params.action) {
          navigation.setParams({ action: null, courtroom: null, courtroomId: null });
        }
      }
    }, [route?.params, navigation])
  );

  // Filter courtrooms based on search query
  useEffect(() => {
    let result = courtrooms;
    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          (item.name || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.court || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.location || '').toLowerCase().includes(lowerCaseQuery)
      );
    }
    setFilteredCourtrooms(result);
  }, [courtrooms, searchQuery]);

  // Hızlı istatistikler
  const activeCount = courtrooms.filter(s => s.status === 'Aktif' || s.status === 'active').length;
  const issueCount = courtrooms.filter(s => s.status === 'Arıza' || s.status === 'issue').length;
  const maintenanceCount = courtrooms.filter(s => s.status === 'Bakımda' || s.status === 'maintenance').length;

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

  // Kart arka planı ve badge rengi için fonksiyonlar
  const getCardBgColor = (status) => {
    switch (status) {
      case 'Arızalı':
      case 'Arıza':
      case 'issue':
        return '#ffeaea'; // açık kırmızı
      case 'Aktif':
      case 'active':
        return '#e6f9ed'; // açık yeşil
      case 'Bakımda':
      case 'maintenance':
        return '#fffbe6'; // açık sarı
      default:
        return '#f3f4f6'; // açık gri
    }
  };
  const getBadgeBgColor = (status) => {
    switch (status) {
      case 'Aktif':
      case 'active':
        return '#b6f2d6';
      case 'Bakımda':
      case 'maintenance':
        return '#fff3b6';
      case 'Arıza':
      case 'issue':
        return '#ffd6d6';
      default:
        return '#e5e7eb';
    }
  };
  const getBadgeTextColor = (status) => {
    switch (status) {
      case 'Aktif':
      case 'active':
        return '#10b981';
      case 'Bakımda':
      case 'maintenance':
        return '#f59e0b';
      case 'Arıza':
      case 'issue':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getCardGradientColors = (status) => {
    if (isDark) {
      switch (status) {
        case 'Aktif':
        case 'active':
          return ['#22c55e', '#16a34a']; // canlı yeşil
        case 'Bakımda':
        case 'maintenance':
          return ['#fde047', '#fbbf24'];
        case 'Arıza':
        case 'Arızalı':
        case 'issue':
          return ['#f87171', '#ef4444'];
        default:
          return ['#334155', '#1e293b'];
      }
    } else {
      switch (status) {
        case 'Aktif':
        case 'active':
          return ['#bbf7d0', '#22c55e']; // açık yeşil
        case 'Bakımda':
        case 'maintenance':
          return ['#fef08a', '#facc15'];
        case 'Arıza':
        case 'Arızalı':
        case 'issue':
          return ['#fca5a5', '#f87171'];
        default:
          return ['#f1f5f9', '#fff'];
      }
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
        {searchQuery
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
    const badgeBgColor = getBadgeBgColor(item.status);
    const badgeTextColor = getBadgeTextColor(item.status);
    const gradientColors = getCardGradientColors(item.status);
    // Calculate total device count
    const totalDevices = Object.values(item.devices || {}).reduce((sum, count) => sum + count, 0);
    const card = (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#1e293b', fontSize: 20, fontWeight: 'bold' }]}>{item.name} {item.court}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: badgeBgColor,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 6,
              alignSelf: 'flex-start',
            }
          ]}>
            <Text style={{ color: badgeTextColor, fontWeight: 'bold', fontSize: 13 }}>{item.status}</Text>
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="map-marker" size={18} color={isDark ? '#cbd5e1' : '#64748b'} />
            <Text style={{ color: isDark ? '#cbd5e1' : '#64748b', fontSize: 15, marginLeft: 4 }}>{item.location}</Text>
          </View>
        </View>
      </LinearGradient>
    );
    return (
      <SwipeableRow item={item} onEdit={handleEdit} onDelete={handleDelete}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CourtroomDetail', { courtroom: item })}
          activeOpacity={0.85}
          style={{ marginBottom: 12 }}
        >
          {card}
        </TouchableOpacity>
      </SwipeableRow>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Duruşma Salonları</Text>
          <TouchableOpacity
            onPress={() => selectedCourtroom && navigation.navigate('CourtroomForm', { courtroom: selectedCourtroom })}
            style={{ padding: 4, marginLeft: 8 }}
            disabled={!selectedCourtroom}
          >
           
          </TouchableOpacity>
        </View>
        
        {/* Hızlı İstatistikler */}
        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10, paddingHorizontal: 10 }}>
          {/* Aktif Salonlar */}
          <View style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 16,
            padding: 10,
            flex: 1,
            marginRight: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <View style={{ backgroundColor: isDark ? '#134e3a' : '#b6f2d6', borderRadius: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 11, marginBottom: 2, textAlign: 'center', alignSelf: 'center' }}>Aktif</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, textAlign: 'center', alignSelf: 'center' }}>{activeCount}</Text>
            </View>
          </View>
          {/* Arızalı Salonlar */}
          <View style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 16,
            padding: 10,
            flex: 1,
            marginRight: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <View style={{ backgroundColor: isDark ? '#7f1d1d' : '#ffd6d6', borderRadius: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 11, marginBottom: 2, textAlign: 'center', alignSelf: 'center' }}>Arızalı</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, textAlign: 'center', alignSelf: 'center' }}>{issueCount}</Text>
            </View>
          </View>
          {/* Bakımdaki Salonlar */}
          <View style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 16,
            padding: 10,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <View style={{ backgroundColor: isDark ? '#78350f' : '#fff3b6', borderRadius: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <MaterialCommunityIcons name="wrench" size={20} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 11, marginBottom: 2, textAlign: 'center', alignSelf: 'center' }}>Bakımda</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, textAlign: 'center', alignSelf: 'center' }}>{maintenanceCount}</Text>
            </View>
          </View>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
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
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    flex: 1,
    flexDirection: 'column',
    minHeight: 100,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    height: 64,
  },
  editAction: {
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
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
  cardActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default withThemedScreen(CourtroomsScreen); 