import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';
import { Swipeable } from 'react-native-gesture-handler';

// Mock issues data (would come from API/backend in a real app)
const MOCK_ISSUES = [
  {
    id: '1',
    title: 'Projeksiyon cihazı çalışmıyor',
    description: 'Duruşma salonu 1\'deki projeksiyon cihazı açılmıyor.',
    status: 'Bekleyen',
    priority: 'Yüksek',
    location: 'Duruşma Salonu 1',
    deviceType: 'Projeksiyon',
    deviceId: 'PRJ-2023-001',
    reportDate: '2023-04-12T10:30:00Z',
    lastUpdateDate: '2023-04-12T10:30:00Z',
  },
  {
    id: '2',
    title: 'Bilgisayar ekranı donuyor',
    description: 'Hakimlik makamındaki bilgisayar belirli aralıklarla donuyor.',
    status: 'İşlemde',
    priority: 'Orta',
    location: 'Hakimlik Makamı 3',
    deviceType: 'Bilgisayar',
    deviceId: 'PC-2022-015',
    reportDate: '2023-04-10T14:15:00Z',
    lastUpdateDate: '2023-04-11T09:22:00Z',
  },
  {
    id: '3',
    title: 'Ses sistemi çok düşük',
    description: 'Ses sisteminin sesi çok düşük, duruşmada katılımcılar duyamıyor.',
    status: 'Çözüldü',
    priority: 'Düşük',
    location: 'Duruşma Salonu 2',
    deviceType: 'Ses Sistemi',
    deviceId: 'AUD-2023-005',
    reportDate: '2023-04-08T11:45:00Z',
    lastUpdateDate: '2023-04-09T16:30:00Z',
  },
  {
    id: '4',
    title: 'Kamera görüntüsü bulanık',
    description: 'Duruşma salonundaki kamera görüntüsü bulanık geliyor.',
    status: 'İptal Edildi',
    priority: 'Kritik',
    location: 'Duruşma Salonu 4',
    deviceType: 'Kamera',
    deviceId: 'CAM-2023-008',
    reportDate: '2023-04-05T09:00:00Z',
    lastUpdateDate: '2023-04-07T13:45:00Z',
  },
  {
    id: '5',
    title: 'Monitör renk bozukluğu',
    description: 'Yazı işleri monitöründe renk bozukluğu var, ekran kırmızı tonda görünüyor.',
    status: 'Bekleyen',
    priority: 'Orta',
    location: 'Yazı İşleri 2',
    deviceType: 'Monitör',
    deviceId: 'MON-2022-032',
    reportDate: '2023-04-11T16:20:00Z',
    lastUpdateDate: '2023-04-11T16:20:00Z',
  }
];

const IssueListScreen = ({ route, theme }) => {
  const navigation = useNavigation();
  
  // State tanımları
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState(MOCK_ISSUES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Bekleyen');
  const [priorityFilter, setPriorityFilter] = useState('Tümü');
  const [loading, setLoading] = useState(false);
  
  // Handle navigation params for adding, updating or deleting issues
  useFocusEffect(
    useCallback(() => {
      if (route.params?.newIssue && route.params?.action === 'add') {
        // Add new issue
        const updatedIssues = [route.params.newIssue, ...issues];
        setIssues(updatedIssues);
        
        // Clear params to prevent duplicate additions
        navigation.setParams({ newIssue: null, action: null });
      } else if (route.params?.updatedIssue && route.params?.action === 'update') {
        // Update existing issue
        const updatedIssues = issues.map(issue => 
          issue.id === route.params.updatedIssue.id ? route.params.updatedIssue : issue
        );
        setIssues(updatedIssues);
        
        // Clear params
        navigation.setParams({ updatedIssue: null, action: null });
      } else if (route.params?.issueId && route.params?.action === 'delete') {
        // Delete issue
        const updatedIssues = issues.filter(issue => issue.id !== route.params.issueId);
        setIssues(updatedIssues);
        
        // Clear params
        navigation.setParams({ issueId: null, action: null });
      }
    }, [route.params, issues, navigation])
  );

  // Supabase'dan ariza_bildirimleri veya cozulen_arizalar çek
  useEffect(() => {
    const fetchIssues = async () => {
      let data = [], error;
      if (statusFilter === 'Çözüldü' || statusFilter === 'İptal Edildi') {
        // Her iki tablodan da ilgili kayıtları çek
        const { data: arizaData, error: arizaError } = await supabase
          .from('ariza_bildirimleri')
          .select('*')
          .eq('ariza_durumu', statusFilter);
        const { data: cozulenData, error: cozulenError } = await supabase
          .from('cozulen_arizalar')
          .select('*')
          .eq('ariza_durumu', statusFilter);
        if (arizaError) console.log('ariza_bildirimleri error:', arizaError);
        if (cozulenError) console.log('cozulen_arizalar error:', cozulenError);
        data = [
          ...(arizaData || []),
          ...(cozulenData || [])
        ];
        error = arizaError || cozulenError;
      } else {
        // Diğer filtreler için sadece ariza_bildirimleri
        const res = await supabase
          .from('ariza_bildirimleri')
          .select('*')
          .in('ariza_durumu', ['Beklemede', 'İşlemde', 'İptal Edildi']);
        data = res.data;
        error = res.error;
      }
      console.log('Supabase data:', data);
      if (error) console.log('Supabase error:', error);
      if (!error && data) {
        setIssues(data);
      }
    };
    fetchIssues();
  }, [statusFilter]);

  // Apply filters when issues, search query, or filters change
  useEffect(() => {
    let filtered = [...issues];
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue =>
        (issue.ariza_no || '').toLowerCase().includes(query) ||
        (issue.ariza_aciklamasi || '').toLowerCase().includes(query) ||
        (issue.arizayi_bildiren_personel || '').toLowerCase().includes(query) ||
        (issue.gorevli_personel || '').toLowerCase().includes(query) ||
        (issue.arizayi_cozen_personel || '').toLowerCase().includes(query)
      );
    }
    // Durum filtresi
    if (statusFilter === 'Bekleyen') {
      filtered = filtered.filter(issue =>
        issue.ariza_durumu === 'Beklemede' || issue.ariza_durumu === 'İşlemde'
      );
    } else if (statusFilter === 'Çözüldü') {
      filtered = filtered.filter(issue => issue.ariza_durumu === 'Çözüldü');
    } else if (statusFilter === 'İptal Edildi') {
      filtered = filtered.filter(issue => issue.ariza_durumu === 'İptal Edildi');
    }
    setFilteredIssues(filtered);
  }, [issues, searchQuery, statusFilter]);

  useEffect(() => {
    console.log('issues state:', issues);
    console.log('filteredIssues state:', filteredIssues);
  }, [issues, filteredIssues]);

  // Get color based on issue status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Beklemede':
        return '#3b82f6'; // mavi
      case 'Bekleyen':
        return '#3b82f6'; // mavi (eski veri için)
      case 'İşlemde':
        return '#f59e0b'; // amber
      case 'Çözüldü':
        return '#10b981'; // yeşil
      case 'İptal Edildi':
        return '#ef4444'; // kırmızı
      default:
        return '#64748b';
    }
  };

  // Get color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Düşük':
        return '#94a3b8'; // slate-400
      case 'Orta':
        return '#4ade80'; // green-400
      case 'Yüksek':
        return '#fb923c'; // orange-400
      case 'Kritik':
        return '#f87171'; // red-400
      default:
        return '#64748b';
    }
  };

  // Format date to local string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayStatus = (status) => {
    if (status === 'Açık') return 'Bekleyen';
    if (status === 'Kapatıldı') return 'İptal Edildi';
    return status;
  };

  // Kartı silme fonksiyonu
  const handleDelete = async (item) => {
    try {
      let error;
      if (item.ariza_durumu === 'Çözüldü') {
        ({ error } = await supabase
          .from('cozulen_arizalar')
          .delete()
          .eq('id', item.id));
      } else {
        ({ error } = await supabase
          .from('ariza_bildirimleri')
          .delete()
          .eq('id', item.id));
      }
      if (!error) {
        setIssues((prev) => prev.filter((i) => i.id !== item.id));
        Alert.alert('Başarılı', 'Kayıt silindi.');
      } else {
        Alert.alert('Hata', 'Kayıt silinemedi.');
      }
    } catch (e) {
      Alert.alert('Hata', 'Bir hata oluştu.');
    }
  };

  // Swipeable silme butonu
  const renderRightActions = (item) => (
    <TouchableOpacity
      style={{ backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}
      onPress={() => handleDelete(item)}
    >
      <MaterialCommunityIcons name="trash-can-outline" size={28} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>Sil</Text>
    </TouchableOpacity>
  );

  // Render a single issue card
  const renderIssueCard = ({ item }) => {
    // Tarih alanı: çözülen arızalarda cozulme_tarihi, diğerlerinde tarih
    const displayDate = item.cozulme_tarihi || item.tarih;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity 
          style={[styles.issueCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('IssueReport', { editIssue: item })}
        >
          <View style={styles.issueHeader}>
            <View style={styles.issueTitle}>
              <Text style={[styles.issueTitleText, { color: theme.text }]} numberOfLines={1}>{item.ariza_no}</Text>
            </View>
            <View style={[styles.issueStatus, { backgroundColor: getStatusColor(item.ariza_durumu) + '20' }]}> 
              <Text style={[styles.issueStatusText, { color: getStatusColor(item.ariza_durumu) }]}>{item.ariza_durumu}</Text>
            </View>
          </View>
          <Text style={[styles.issueDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.ariza_aciklamasi && item.ariza_aciklamasi.length > 90
              ? item.ariza_aciklamasi.slice(0, 90) + '...'
              : item.ariza_aciklamasi}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account" size={18} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary, marginLeft: 4 }]} numberOfLines={1}>{item.arizayi_bildiren_personel}</Text>
            </View>
            {item.ariza_durumu === 'Çözüldü' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="account-check" size={18} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary, marginLeft: 4 }]} numberOfLines={1}>{item.arizayi_cozen_personel}</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="account-tie" size={18} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary, marginLeft: 4 }]} numberOfLines={1}>{item.gorevli_personel}</Text>
              </View>
            )}
          </View>
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary, marginLeft: 6, fontSize: 12 }}>
              {formatDate(displayDate)}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Render filter buttons
  const renderFilterButton = (label, currentFilter, setFilter, filterOptions) => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {filterOptions.map((option) => (
        <TouchableOpacity 
          key={option}
          style={[
            styles.filterButton, 
            { backgroundColor: option === currentFilter ? theme.primary : theme.inputBg },
          ]}
          onPress={() => setFilter(option)}
        >
          <Text 
            style={[
              styles.filterButtonText, 
              { color: option === currentFilter ? '#fff' : theme.textSecondary },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Show empty state when no issues match the filters
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Arıza kaydı bulunamadı</Text>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
        Aramaya uygun arıza kaydı bulunamadı. Filtreleri değiştirmeyi veya yeni arıza kaydı oluşturmayı deneyebilirsiniz.
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('IssueReport')}
      >
        <Text style={styles.emptyButtonText}>Yeni Arıza Bildir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, justifyContent: 'center' }]}> 
        <Text style={[styles.headerTitle, { color: theme.text, textAlign: 'center', flex: 1, marginLeft: 0 }]}>Arıza Listesi</Text> 
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Arıza kaydı ara..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Özet kartlar: Bekleyen, Çözülen, İptal Edilen */}
      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 16, marginBottom: 8 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#3b82f620',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginRight: 8,
            borderWidth: 1,
            borderColor: 'transparent',
            minWidth: 0,
            flex: 1
          }}
          onPress={() => { if (statusFilter !== 'Bekleyen') setStatusFilter('Bekleyen'); }}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#3b82f6" />
          <Text style={{ marginLeft: 8, color: theme.text, fontWeight: '500', fontSize: 14 }} numberOfLines={1}>Bekleyen Arızalar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#10b98120',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginRight: 8,
            borderWidth: 1,
            borderColor: 'transparent',
            minWidth: 0,
            flex: 1
          }}
          onPress={() => { if (statusFilter !== 'Çözüldü') setStatusFilter('Çözüldü'); }}
        >
          <MaterialCommunityIcons name="check-circle-outline" size={22} color="#10b981" />
          <Text style={{ marginLeft: 8, color: theme.text, fontWeight: '500', fontSize: 14 }} numberOfLines={1}>Çözülen Arızalar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#6b728020',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: 'transparent',
            minWidth: 0,
            flex: 1
          }}
          onPress={() => { if (statusFilter !== 'İptal Edildi') setStatusFilter('İptal Edildi'); }}
        >
          <MaterialCommunityIcons name="close-circle-outline" size={22} color="#6b7280" />
          <Text style={{ marginLeft: 8, color: theme.text, fontWeight: '500', fontSize: 14 }} numberOfLines={1}>İptal Edilen Arızalar</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredIssues}
        renderItem={renderIssueCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.issuesList}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginLeft: 0,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 8,
    fontSize: 14,
  },
  issuesList: {
    padding: 16,
    paddingTop: 8,
  },
  issueCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    flex: 1,
    marginRight: 8,
  },
  issueTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  issueStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  issueStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  issueDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  issueDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  filtersSection: {
    padding: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default withThemedScreen(IssueListScreen); 