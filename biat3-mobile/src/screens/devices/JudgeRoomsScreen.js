import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import withThemedScreen from '../../components/withThemedScreen';

const JudgeRoomsScreen = ({ route, theme, themedStyles }) => {
  const navigation = useNavigation();
  
  // Örnek hakim odaları listesi
  const initialJudgeRooms = [
    { 
      id: '1', 
      roomNumber: '103', 
      judgeName: 'Hakim Ali Yılmaz', 
      judgeId: 'HC12345',
      court: 'Asliye Ceza Mahkemesi', 
      location: '1. Kat',
      devices: {
        laptop: 1,
        monitor: 1,
        printer: 1,
      },
      status: 'Aktif',
      notes: 'Yazıcı toner değişimi gerekiyor.'
    },
    { 
      id: '2', 
      roomNumber: '105', 
      judgeName: 'Hakim Ayşe Demir', 
      judgeId: 'HH67890',
      court: 'Asliye Hukuk Mahkemesi', 
      location: '1. Kat',
      devices: {
        laptop: 1,
        monitor: 1,
        printer: 1,
      },
      status: 'Aktif',
      notes: ''
    },
    { 
      id: '3', 
      roomNumber: '201', 
      judgeName: 'Hakim Mehmet Öz', 
      judgeId: 'HS54321',
      court: 'Sulh Ceza Hakimliği', 
      location: '2. Kat',
      devices: {
        laptop: 1,
        monitor: 2,
        printer: 1,
      },
      status: 'Bakım',
      notes: 'Laptop yenisiyle değiştirilecek.'
    },
    { 
      id: '4', 
      roomNumber: '204', 
      judgeName: 'Hakim Zeynep Kaya', 
      judgeId: 'HI98765',
      court: 'İş Mahkemesi', 
      location: '2. Kat',
      devices: {
        laptop: 1,
        monitor: 1,
        printer: 0,
      },
      status: 'Arıza',
      notes: 'Monitör arızalı, yenisi talep edildi.'
    },
    { 
      id: '5', 
      roomNumber: '301', 
      judgeName: 'Hakim Ahmet Şahin', 
      judgeId: 'HA24680',
      court: 'Ağır Ceza Mahkemesi', 
      location: '3. Kat',
      devices: {
        laptop: 1,
        monitor: 2,
        printer: 1,
      },
      status: 'Aktif',
      notes: ''
    },
  ];

  // State tanımları
  const [judgeRooms, setJudgeRooms] = useState(initialJudgeRooms);
  const [filteredRooms, setFilteredRooms] = useState(initialJudgeRooms);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Process room updates when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Handle new room added
      if (route?.params?.newJudgeRoom) {
        setJudgeRooms(prev => [route.params.newJudgeRoom, ...prev]);
        navigation.setParams({ newJudgeRoom: null });
      }
      
      // Handle room updated
      if (route?.params?.updatedJudgeRoom) {
        setJudgeRooms(prev => 
          prev.map(item => 
            item.id === route.params.updatedJudgeRoom.id 
              ? route.params.updatedJudgeRoom 
              : item
          )
        );
        navigation.setParams({ updatedJudgeRoom: null });
      }
      
      // Handle room deleted
      if (route?.params?.deletedJudgeRoom) {
        setJudgeRooms(prev => 
          prev.filter(item => item.id !== route.params.deletedJudgeRoom.id)
        );
        navigation.setParams({ deletedJudgeRoom: null });
      }
    }, [route?.params, navigation])
  );

  // Filter rooms based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRooms(judgeRooms);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = judgeRooms.filter(
        item => 
          item.roomNumber.toLowerCase().includes(lowerCaseQuery) ||
          item.judgeName.toLowerCase().includes(lowerCaseQuery) ||
          item.court.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredRooms(filtered);
    }
  }, [judgeRooms, searchQuery]);
  
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

  // Yeni oda ekleme
  const handleAddRoom = () => {
    try {
      setTimeout(() => {
        navigation.navigate('JudgeRoomForm');
      }, 0);
    } catch (error) {
      console.error('Ekleme navigasyon hatası: ', error);
      alert('Yeni hakim odası ekleme sayfasına geçişte bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Hakim odası detayına git
  const handleRoomDetail = (room) => {
    try {
      // Odanın tüm gerekli alanlarının mevcut olduğunu kontrol et
      const safeRoom = {
        id: room?.id || '',
        roomNumber: room?.roomNumber || '',
        judgeName: room?.judgeName || '',
        judgeId: room?.judgeId || '',
        court: room?.court || '',
        location: room?.location || '',
        devices: room?.devices || {
          laptop: 0,
          monitor: 0,
          printer: 0,
        },
        status: room?.status || 'Belirsiz',
        notes: room?.notes || ''
      };
      
      // Navigasyon işlemini bir setTimeout içinde gerçekleştir
      // Bu, JavaScript event loop'un diğer işleri bitirmesine izin verir
      setTimeout(() => {
        navigation.navigate('JudgeRoomDetail', { judgeRoom: safeRoom });
      }, 0);
    } catch (error) {
      console.error('Navigasyon hatası: ', error);
      alert('Hakim odası detaylarına erişilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Hakim odası kartı bileşeni
  const renderRoomItem = ({ item }) => {
    // Toplam cihaz sayısını hesapla
    const totalDevices = item.devices ? 
      Object.values(item.devices).reduce((sum, count) => sum + count, 0) : 0;
    
    // Hakim isimlerini göster
    const displayJudges = () => {
      if (item.judges && item.judges.length > 0) {
        // Birden fazla hakim varsa hakim sayısını göster
        if (item.judges.length > 1) {
          return (
            <View style={styles.judgesInfo}>
              <Text style={[styles.judgeName, { color: theme.text }]}>{item.judges[0].name}</Text>
              <Text style={[styles.judgeCount, { color: theme.textSecondary }]}>+{item.judges.length - 1} hakim daha</Text>
            </View>
          );
        } else {
          // Tek hakim varsa sadece ismini göster
          return <Text style={[styles.judgeName, { color: theme.text }]}>{item.judges[0].name}</Text>;
        }
      } else {
        // Eski formatta veya hakim bilgisi yoksa
        return <Text style={[styles.judgeName, { color: theme.text }]}>{item.judgeName || "Belirtilmemiş"}</Text>;
      }
    };
      
    return (
      <TouchableOpacity 
        style={[styles.roomCard, { backgroundColor: theme.cardBackground, shadowColor: theme.isDark ? 'transparent' : '#000' }]}
        onPress={() => handleRoomDetail(item)}
      >
        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <Text style={[styles.roomNumber, { color: theme.text }]}>Oda {item.roomNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          {displayJudges()}
          <Text style={[styles.courtName, { color: theme.textSecondary }]}>{item.court}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.deviceInfoContainer}>
          <View style={[styles.deviceIconContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <MaterialCommunityIcons name="devices" size={16} color={theme.primary} />
          </View>
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceCount, { color: theme.textSecondary }]}>{totalDevices} Cihaz</Text>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => handleRoomDetail(item)}
            >
              <Text style={[styles.detailsText, { color: theme.primary }]}>Detaylar</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Hakim Odaları</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="filter" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Hakim adı, oda numarası veya mahkeme ara..."
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

        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoomItem}
          contentContainerStyle={styles.roomsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-off-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery
                  ? 'Aramanızla eşleşen hakim odası bulunamadı.'
                  : 'Henüz hakim odası eklenmemiş.'}
              </Text>
              <TouchableOpacity 
                style={[styles.emptyAddButton, { backgroundColor: theme.primary }]}
                onPress={handleAddRoom}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.emptyAddButtonText}>Oda Ekle</Text>
              </TouchableOpacity>
            </View>
          }
        />
        
        {/* Floating Action Button for adding new room */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={handleAddRoom}
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    height: '100%',
  },
  roomsList: {
    padding: 16,
  },
  roomCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  judgesInfo: {
    marginBottom: 4,
  },
  judgeCount: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  courtName: {
    fontSize: 14,
  },
  divider: {
    height: 1,
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
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
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
    marginBottom: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
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
});

export default withThemedScreen(JudgeRoomsScreen); 