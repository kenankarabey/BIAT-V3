import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';
import { useIsFocused } from '@react-navigation/native';

const CourtOfficesScreen = ({ navigation, theme, themedStyles }) => {
  // Mahkeme kalemleri
  const [courtOffices, setCourtOffices] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchCourtOffices = async () => {
      const { data, error } = await supabase.from('mahkeme_kalemleri').select('*');
      if (!error && data) {
        setCourtOffices(data);
      }
    };
    if (isFocused) fetchCourtOffices();
  }, [isFocused]);

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
  
  // Arama kutusu
  const [search, setSearch] = useState('');
  
  // Filtrelenmiş mahkeme kalemleri (arama)
  const filteredCourtOffices = courtOffices.filter(office => {
    const query = search.toLowerCase();
    return (
      (office.mahkeme_no + '. ' + office.mahkeme_turu + ' Mahkemesi').toLowerCase().includes(query) ||
      (office.mahkeme_turu || '').toLowerCase().includes(query) ||
      (office.mahkeme_hakimi || '').toLowerCase().includes(query)
    );
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
  const [deletingId, setDeletingId] = useState(null);
  const handleDelete = (id) => {
    Alert.alert(
      "Mahkeme Kalemini Sil",
      "Bu mahkeme kalemini silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          onPress: async () => {
            setDeletingId(id);
            const { error } = await supabase
              .from('mahkeme_kalemleri')
              .delete()
              .eq('id', id);
            setDeletingId(null);
            if (!error) {
            setCourtOffices(courtOffices.filter(office => office.id !== id));
            Alert.alert("Başarılı", "Mahkeme kalemi başarıyla silindi");
            } else {
              Alert.alert("Hata", error.message || "Silme işlemi başarısız oldu");
            }
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
          style={[styles.actionSwipeButton, { backgroundColor: theme.primary }]}
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
      <TouchableOpacity
        style={[styles.courtCard, themedStyles.card, themedStyles.shadow]}
        onPress={() => navigation.navigate('CourtOfficeDetail', { office: item })}
      >
      <Text style={[styles.courtName, themedStyles.text]}>{item.mahkeme_no}. {item.mahkeme_turu}</Text>
        <View style={styles.courtTypeRow}>
          <Ionicons name="briefcase-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.courtTypeText, themedStyles.textSecondary]}>{item.mahkeme_turu}</Text>
        </View>
        <View style={styles.courtLocationRow}>
          <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.courtLocationText, themedStyles.textSecondary]}>{item.blok}, {item.kat}</Text>
        </View>
      <View style={styles.courtJudgeRow}>
        <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.courtJudgeText, themedStyles.textSecondary]}>Mahkeme Hakimi: {item.mahkeme_hakimi}</Text>
        </View>
      </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, themedStyles.header]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={[styles.headerTitle, themedStyles.text]}>Mahkeme Kalemleri</Text>
          </View>
        </View>

        <View style={[styles.subHeader, { backgroundColor: theme.card }]}>
          <Text style={[styles.subHeaderText, themedStyles.textSecondary]}>Adliyedeki mahkeme kalemleri ve cihaz durumları</Text>
        </View>

        <View style={[styles.filterContainer, themedStyles.card, { borderBottomColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: theme.text, backgroundColor: 'transparent' }}
            placeholder="Mahkeme, tür veya hakim ara..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredCourtOffices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
              <CourtOfficeCard item={item} />
            </Swipeable>
          )}
          contentContainerStyle={styles.cardsContainer}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  subHeader: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  subHeaderText: {
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    marginBottom: 4,
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 120,
  },
  filterValue: {
    fontSize: 14,
  },
  filterDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    width: 160,
    borderRadius: 6,
    borderWidth: 1,
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
  },
  filterOptionText: {
    fontSize: 14,
  },
  resetFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  resetFilterText: {
    marginLeft: 4,
    fontSize: 14,
  },
  cardsContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  courtCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  courtTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courtTypeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  courtLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtLocationText: {
    fontSize: 14,
    marginLeft: 6,
  },
  courtJudgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtJudgeText: {
    fontSize: 14,
    marginLeft: 6,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default withThemedScreen(CourtOfficesScreen); 