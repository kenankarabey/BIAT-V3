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
    { title: 'Aktif Cihazlar', value: '3,724', icon: 'desktop', color: '#38B2AC' },
    { title: 'Aktif Arıza', value: '17', icon: 'warning', color: '#ED8936' },
    { title: 'Bakım', value: '42', icon: 'build', color: '#48BB78' },
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

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
      
      // Animate the layout change
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };
    
    loadData();
  }, []);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update data with some random variations
    setStatsData(prev => prev.map(item => ({
      ...item,
      value: Math.random() > 0.5 
        ? (parseInt(item.value.replace(',', '')) + Math.floor(Math.random() * 10)).toString()
        : item.value
    })));
    
    setPerformanceData(prev => prev.map(item => ({
      ...item,
      value: Math.min(100, Math.max(70, item.value + Math.floor(Math.random() * 10) - 5))
    })));
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRefreshing(false);
  };

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
              } else if (item.title === 'Aktif Cihazlar') {
                navigation.navigate('Devices', { screen: 'AllDevices' });
              } else if (item.title === 'Aktif Arıza' || item.title === 'Bakım') {
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

  const renderPerformanceMetrics = () => {
    const maxValue = Math.max(...performanceData.map(item => item.value));
    
    return (
      <View style={[
        styles.cardContainer, 
        { 
          backgroundColor: theme.card,
          shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
        }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Performans Metrikleri</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          {performanceData.map((item, index) => {
            // Calculate bar height with animation delay
            const barHeight = (item.value / maxValue) * 150;
            const barColor = item.value > 85 
              ? '#48BB78' 
              : item.value > 75 
                ? '#4C51BF' 
                : '#ED8936';
                
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight,
                        backgroundColor: barColor
                      }
                    ]} 
                  />
                  <Text style={[styles.barValue, { color: theme.textSecondary }]}>{item.value}%</Text>
                </View>
                <View style={styles.barLabelContainer}>
                  <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{item.month}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderIssueDistribution = () => {
    return (
      <View style={[
        styles.cardContainer, 
        { 
          backgroundColor: theme.card,
          shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
        }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Arıza Dağılımı</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChartWrapper}>
            <View style={styles.simplePieChart}>
              <View style={[styles.pieSection, { backgroundColor: '#4C51BF', flex: 0.45 }]} />
              <View style={[styles.pieSection, { backgroundColor: '#38B2AC', flex: 0.3 }]} />
              <View style={[styles.pieSection, { backgroundColor: '#ED8936', flex: 0.15 }]} />
              <View style={[styles.pieSection, { backgroundColor: '#48BB78', flex: 0.1 }]} />
            </View>
          </View>
          <View style={styles.legendContainer}>
            {issueDistribution.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>{item.type}: %{item.percentage}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };
  
  const renderMonthlySummary = () => {
    return (
      <View style={[
        styles.cardContainer, 
        { 
          backgroundColor: theme.card,
          shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)' 
        }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Aylık Özet</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.text }]}>94%</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Çözüm Oranı</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.text }]}>2.4 saat</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Ortalama Müdahale</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.text }]}>112</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Toplam Destek</Text>
          </View>
        </View>
        <View style={[styles.summaryFooter, { borderTopColor: theme.border }]}>
          <View style={styles.summaryFooterItem}>
            <Ionicons name="trending-up" size={18} color="#48BB78" />
            <Text style={[styles.summaryFooterText, { color: theme.textSecondary }]}>Bir önceki aya göre %12 artış</Text>
          </View>
        </View>
      </View>
    );
  };

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
        {renderMonthlySummary()}
        {renderPerformanceMetrics()}
        {renderIssueDistribution()}
        
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
              <Text style={[styles.quickAccessText, { color: theme.text }]}>QR Tara</Text>
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
              onPress={() => navigation.navigate('Issues', { screen: 'IssueReport' })}
            >
              <Ionicons name="warning" size={28} color={theme.primary} />
              <Text style={[styles.quickAccessText, { color: theme.text }]}>Arıza Bildir</Text>
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