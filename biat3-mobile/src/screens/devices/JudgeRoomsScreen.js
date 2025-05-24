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
import { supabase } from '../../supabaseClient';
import { Swipeable } from 'react-native-gesture-handler';

const JudgeRoomsScreen = ({ route, theme, themedStyles }) => {
  const navigation = useNavigation();
  
  const [judgeRooms, setJudgeRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Supabase'dan hakim odalarını çek
  useEffect(() => {
    const fetchJudgeRooms = async () => {
      const { data, error } = await supabase
        .from('hakim_odalari')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) {
        setJudgeRooms(data);
        setFilteredRooms(data);
      }
    };
    fetchJudgeRooms();
  }, []);

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
          (item.oda_numarasi || '').toString().toLowerCase().includes(lowerCaseQuery) ||
          (item.hakim1_adisoyadi || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.hakim2_adisoyadi || '').toLowerCase().includes(lowerCaseQuery) ||
          (item.hakim3_adisoyadi || '').toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredRooms(filtered);
    }
  }, [judgeRooms, searchQuery]);
  
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
      setTimeout(() => {
        navigation.navigate('JudgeRoomDetail', { oda_numarasi: room.oda_numarasi });
      }, 0);
    } catch (error) {
      console.error('Navigasyon hatası: ', error);
      alert('Hakim odası detaylarına erişilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Hakim odası sil
  const handleDeleteRoom = async (room) => {
    try {
      const { error } = await supabase
        .from('hakim_odalari')
        .delete()
        .eq('id', room.id);
      if (!error) {
        setJudgeRooms(prev => prev.filter(item => item.id !== room.id));
        setFilteredRooms(prev => prev.filter(item => item.id !== room.id));
      }
    } catch (err) {
      alert('Silme işlemi sırasında hata oluştu.');
    }
  };

  // Hakim odası düzenle
  const handleEditRoom = (room) => {
    navigation.navigate('JudgeRoomForm', { judgeRoom: room });
  };

  // Swipeable actions
  const renderRightActions = (room) => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: '#1e40af' }]}
        onPress={() => handleEditRoom(room)}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
        <Text style={styles.swipeActionText}>Düzenle</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: '#ef4444' }]}
        onPress={() => handleDeleteRoom(room)}
      >
        <MaterialCommunityIcons name="delete" size={24} color="#fff" />
        <Text style={styles.swipeActionText}>Sil</Text>
      </TouchableOpacity>
    </View>
  );

  // Hakim odası kartı bileşeni
  const renderRoomItem = ({ item }) => {
    // Konum: blok + kat
    const location = [item.blok, item.kat].filter(Boolean).join(' - ');
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity 
          style={[styles.roomCard, { backgroundColor: '#23272e', borderColor: '#23272e' }]}
          onPress={() => handleRoomDetail(item)}
        >
          <View style={styles.roomInfo}>
            <View style={styles.roomHeader}>
              <Text style={[styles.roomNumber, { color: theme.text }]}>Oda {item.oda_numarasi}</Text>
            </View>
            <Text style={[styles.judgeName, { color: theme.text }]}>{item.hakim1_adisoyadi}</Text>
            <Text style={[styles.judgeName, { color: theme.text }]}>{item.hakim2_adisoyadi}</Text>
            <Text style={[styles.judgeName, { color: theme.text }]}>{item.hakim3_adisoyadi}</Text>
            <Text style={[styles.courtName, { color: theme.textSecondary }]}>{location}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
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
    flex: 1,
    textAlign: 'center',
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
    borderWidth: 1,
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
  judgeName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  courtName: {
    fontSize: 14,
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
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    flexDirection: 'column',
  },
  swipeActionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default withThemedScreen(JudgeRoomsScreen); 