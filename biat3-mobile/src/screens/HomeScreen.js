import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statsData, setStatsData] = useState([
    { title: 'Toplam Mahkeme', value: '148', icon: 'business', color: '#4C51BF' },
    { title: 'Toplam Duruşma Salonu', value: '52', icon: 'people', color: '#38B2AC' },
    { title: 'Aktif Arıza', value: '17', icon: 'warning', color: '#ED8936' },
    { title: 'Çözülen Arıza', value: '35', icon: 'checkmark-done', color: '#48BB78' },
  ]);

  const [performanceData, setPerformanceData] = useState([
    { month: 'Oca', value: 75 },
    { month: 'Şub', value: 82 },
    { month: 'Mar', value: 78 },
    { month: 'Nis', value: 89 },
    { month: 'May', value: 92 },
    { month: 'Haz', value: 87 },
  ]);

  const [issueDistribution, setIssueDistribution] = useState([
    { type: 'Donanım', percentage: 45, color: '#4C51BF' },
    { type: 'Yazılım', percentage: 30, color: '#38B2AC' },
    { type: 'Ağ', percentage: 15, color: '#ED8936' },
    { type: 'Diğer', percentage: 10, color: '#48BB78' },
  ]);

  // Aylık özet state'i
  const [monthlyStats, setMonthlyStats] = useState({
    totalRecord: 0,
    solved: 0,
    pending: 0,
    inProgress: 0,
    canceled: 0,
    monthLabel: '',
  });

  const fetchMonthlyStats = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDayDate = new Date(year, month, 0);
    const lastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDayDate.getDate().toString().padStart(2, '0')}`;
    // Çözülen
    const { data: solvedIssues } = await supabase.from('cozulen_arizalar').select('id').eq('ariza_durumu', 'Çözüldü').gte('cozulme_tarihi', firstDay).lte('cozulme_tarihi', lastDay);
    // İptal Edilen
    const { data: canceledIssues } = await supabase.from('cozulen_arizalar').select('id').eq('ariza_durumu', 'İptal Edildi').gte('cozulme_tarihi', firstDay).lte('cozulme_tarihi', lastDay);
    // Toplam Kayıt
    const { data: allArizaBildirimi } = await supabase.from('ariza_bildirimleri').select('id').gte('tarih', firstDay).lte('tarih', lastDay);
    const { data: solvedOrCanceled } = await supabase.from('cozulen_arizalar').select('id, ariza_durumu').gte('cozulme_tarihi', firstDay).lte('cozulme_tarihi', lastDay);
    const totalCozenOrCanceled = solvedOrCanceled?.filter(row => row.ariza_durumu === 'Çözüldü' || row.ariza_durumu === 'İptal Edildi').length || 0;
    const totalRecord = (allArizaBildirimi?.length || 0) + totalCozenOrCanceled;
    // Bekleyen
    const { data: pendingIssues } = await supabase.from('ariza_bildirimleri').select('id').eq('ariza_durumu', 'Beklemede').gte('tarih', firstDay).lte('tarih', lastDay);
    // İşlemde
    const { data: inProgressIssues } = await supabase.from('ariza_bildirimleri').select('id').eq('ariza_durumu', 'İşlemde').gte('tarih', firstDay).lte('tarih', lastDay);
    setMonthlyStats({
      totalRecord,
      solved: solvedIssues?.length || 0,
      pending: pendingIssues?.length || 0,
      inProgress: inProgressIssues?.length || 0,
      canceled: canceledIssues?.length || 0,
      monthLabel: now.toLocaleString('tr-TR', { month: 'long', year: 'numeric' }),
    });
  };

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    // Toplam Mahkeme
    const { count: mahkemeCount, error: mahkemeError } = await supabase
      .from('mahkeme_kalemleri')
      .select('*', { count: 'exact', head: true });
    console.log('mahkeme_kalemleri count:', mahkemeCount, mahkemeError);
    // Toplam Duruşma Salonu
    const { count: durusmaCount, error: durusmaError } = await supabase
      .from('durusma_salonlari')
      .select('*', { count: 'exact', head: true });
    console.log('durusma_salonlari count:', durusmaCount, durusmaError);
    // Aktif Arıza (Beklemede veya İşlemde)
    const { count: aktifArizaCount, error: arizaError } = await supabase
      .from('ariza_bildirimleri')
      .select('*', { count: 'exact', head: true })
      .in('ariza_durumu', ['Beklemede', 'İşlemde']);
    console.log('ariza_bildirimleri count:', aktifArizaCount, arizaError);
    // Çözülen Arıza
    const { count: cozulduArizaCount, error: cozulduError } = await supabase
      .from('cozulen_arizalar')
      .select('*', { count: 'exact', head: true })
      .eq('ariza_durumu', 'Çözüldü');
    console.log('cozulen_arizalar count:', cozulduArizaCount, cozulduError);
    setStatsData([
      { title: 'Toplam Mahkeme', value: mahkemeCount?.toString() || '0', icon: 'business', color: '#4C51BF' },
      { title: 'Toplam Duruşma Salonu', value: durusmaCount?.toString() || '0', icon: 'people', color: '#38B2AC' },
      { title: 'Aktif Arıza', value: aktifArizaCount?.toString() || '0', icon: 'warning', color: '#ED8936' },
      { title: 'Çözülen Arıza', value: cozulduArizaCount?.toString() || '0', icon: 'checkmark-done', color: '#48BB78' },
    ]);
    setIsLoading(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchMonthlyStats()
    ]);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
      fetchMonthlyStats();
    }, [])
  );

  const renderStatsCards = () => {
    // Calculate card width based on screen size
    const cardWidth = width < 380 ? '100%' : '48%';
    
    return (
      <View style={styles.statsContainer}>
        {statsData.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.statCard, 
              { 
                width: cardWidth, 
                backgroundColor: theme.card,
                shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
              }
            ]}
            onPress={() => {
              // Navigate to respective sections based on card type
              if (item.title === 'Toplam Mahkeme') {
                navigation.navigate('Devices', { screen: 'CourtOffices' });
              } else if (item.title === 'Toplam Duruşma Salonu') {
                navigation.navigate('Devices', { screen: 'AllDevices' });
              } else if (item.title === 'Aktif Arıza' || item.title === 'Çözülen Arıza') {
                navigation.navigate('Issues');
              }
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: theme.text }]}>{item.value}</Text>
              <Text style={[styles.statTitle, { color: theme.textSecondary }]}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMonthlyStats = () => (
    <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20, marginVertical: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: isDarkMode ? '#fff' : theme.text, fontWeight: 'bold', fontSize: 20 }}>Aylık Özet</Text>
        <View style={{ backgroundColor: isDarkMode ? '#232a5c' : theme.inputBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text style={{ color: isDarkMode ? '#fff' : theme.text, fontWeight: 'bold', fontSize: 14 }}>{monthlyStats.monthLabel.charAt(0).toUpperCase() + monthlyStats.monthLabel.slice(1)}</Text>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: isDarkMode ? '#232a5c' : theme.border, marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 12, padding: 18, marginBottom: 16, borderWidth: isDarkMode ? 1 : 1, borderColor: isDarkMode ? '#161a4a' : theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Toplam Kayıt</Text>
          <Text style={{ color: theme.text, fontSize: 24, marginTop: 8 }}>{monthlyStats.totalRecord}</Text>
        </View>
        <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 12, padding: 18, marginBottom: 16, borderWidth: isDarkMode ? 1 : 1, borderColor: isDarkMode ? '#161a4a' : theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Çözülen</Text>
          <Text style={{ color: theme.text, fontSize: 24, marginTop: 8 }}>{monthlyStats.solved}</Text>
        </View>
        <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 12, padding: 18, marginBottom: 16, borderWidth: isDarkMode ? 1 : 1, borderColor: isDarkMode ? '#161a4a' : theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>Bekleyen</Text>
          <Text style={{ color: theme.text, fontSize: 24, marginTop: 8 }}>{monthlyStats.pending}</Text>
        </View>
        <View style={{ width: '48%', backgroundColor: theme.card, borderRadius: 12, padding: 18, marginBottom: 16, borderWidth: isDarkMode ? 1 : 1, borderColor: isDarkMode ? '#161a4a' : theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>İşlemde</Text>
          <Text style={{ color: theme.text, fontSize: 24, marginTop: 8 }}>{monthlyStats.inProgress}</Text>
        </View>
        <View style={{ width: '100%', backgroundColor: theme.card, borderRadius: 12, padding: 18, marginBottom: 0, borderWidth: isDarkMode ? 1 : 1, borderColor: isDarkMode ? '#161a4a' : theme.border }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>İptal Edilen</Text>
          <Text style={{ color: theme.text, fontSize: 24, marginTop: 8 }}>{monthlyStats.canceled}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={theme.navBackground} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.navBackground} />
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../images/BIAT-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>BIAT Kontrol Paneli</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Merhaba, Kenan</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          <View style={[styles.notificationBadge, { borderColor: theme.card }]}>
            <Text style={styles.notificationText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Genel Bakış</Text>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {renderStatsCards()}
        {renderMonthlyStats()}
        
        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Hızlı Erişim</Text>
          <View style={styles.quickAccessItems}>
            <TouchableOpacity 
              style={[
                styles.quickAccessItem, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border, 
                  borderWidth: 1,
                  shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
                }
              ]}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Ionicons name="qr-code" size={28} color={theme.primary} />
              <Text style={[styles.quickAccessText, { color: theme.text }]}>Tarayıcı</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.quickAccessItem, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border, 
                  borderWidth: 1,
                  shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
                }
              ]}
              onPress={() => navigation.navigate('Devices', { screen: 'AddDevice' })}
            >
              <Ionicons name="add-circle" size={28} color={theme.primary} />
              <Text style={[styles.quickAccessText, { color: theme.text }]}>Cihaz Ekle</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickAccessItem, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border, 
                  borderWidth: 1,
                  shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
                }
              ]}
              onPress={() => navigation.navigate('Chatbot')}
            >
              <Ionicons name="chatbubbles" size={28} color={theme.primary} />
              <Text style={[styles.quickAccessText, { color: theme.text }]}>Destek</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    width: '15%',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 150,
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barLabelContainer: {
    marginTop: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  barValue: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  pieChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pieChartWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simplePieChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    flexDirection: 'row',
    transform: [{ rotate: '180deg' }]
  },
  pieSection: {
    height: '100%',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#1E293B',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  summaryFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  summaryFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryFooterText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  welcomeSection: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
  },
  quickAccessSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickAccessItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '30%',
    height: 100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

export default HomeScreen; 