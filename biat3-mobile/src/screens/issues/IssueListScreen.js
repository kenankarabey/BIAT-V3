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

// Mock issues data (would come from API/backend in a real app)
const MOCK_ISSUES = [
  {
    id: '1',
    title: 'Projeksiyon cihazı çalışmıyor',
    description: 'Duruşma salonu 1\'deki projeksiyon cihazı açılmıyor.',
    status: 'Açık',
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
    status: 'Kapatıldı',
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
    status: 'Açık',
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
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [filteredIssues, setFilteredIssues] = useState(MOCK_ISSUES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tümü');
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

  // Apply filters when issues, search query, or filters change
  useEffect(() => {
    applyFilters();
  }, [issues, searchQuery, statusFilter, priorityFilter]);

  // Filter issues based on search query and selected filters
  const applyFilters = () => {
    let filtered = [...issues];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.deviceType.toLowerCase().includes(query) ||
        issue.deviceId.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'Tümü') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'Tümü') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }
    
    setFilteredIssues(filtered);
  };

  // Get color based on issue status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Açık':
        return '#3b82f6'; // blue
      case 'İşlemde':
        return '#f59e0b'; // amber
      case 'Çözüldü':
        return '#10b981'; // green
      case 'Kapatıldı':
        return '#6b7280'; // gray
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

  // Render a single issue card
  const renderIssueCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.issueCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('IssueReport', { editIssue: item })}
    >
      <View style={styles.issueHeader}>
        <View style={styles.issueTitle}>
          <Text style={[styles.issueTitleText, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={[styles.issueStatus, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.issueStatusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={[styles.issueDescription, { color: theme.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.issueDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>{item.location}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="laptop" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>{item.deviceType}</Text>
        </View>
      </View>
      
      <View style={[styles.issueFooter, { borderTopColor: theme.border }]}>
        <View style={styles.footerLeft}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
          </View>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {formatDate(item.reportDate)}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
      </View>
    </TouchableOpacity>
  );

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
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Arıza Listesi</Text>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('IssueReport')}>
          <MaterialCommunityIcons name="plus-circle" size={24} color={theme.primary} />
        </TouchableOpacity>
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
      
      <View style={styles.filtersSection}>
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Durum:</Text>
        {renderFilterButton('', statusFilter, setStatusFilter, ['Tümü', 'Açık', 'İşlemde', 'Çözüldü', 'Kapatıldı'])}
        
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Öncelik:</Text>
        {renderFilterButton('', priorityFilter, setPriorityFilter, ['Tümü', 'Düşük', 'Orta', 'Yüksek', 'Kritik'])}
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
          // Simulating a fetch delay
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
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
  filtersSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
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
  }
});

export default withThemedScreen(IssueListScreen); 