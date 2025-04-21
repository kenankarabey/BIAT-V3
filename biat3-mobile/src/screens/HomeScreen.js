import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const statsData = [
    { title: 'Toplam Mahkeme', value: '148', icon: 'business', color: '#4C51BF' },
    { title: 'Aktif Cihazlar', value: '3,724', icon: 'desktop', color: '#38B2AC' },
    { title: 'Aktif Arıza', value: '17', icon: 'warning', color: '#ED8936' },
    { title: 'Bakım', value: '42', icon: 'build', color: '#48BB78' },
  ];

  const performanceData = [
    { month: 'Oca', value: 75 },
    { month: 'Şub', value: 82 },
    { month: 'Mar', value: 78 },
    { month: 'Nis', value: 89 },
    { month: 'May', value: 92 },
    { month: 'Haz', value: 87 },
  ];

  const issueDistribution = [
    { type: 'Donanım', percentage: 45, color: '#4C51BF' },
    { type: 'Yazılım', percentage: 30, color: '#38B2AC' },
    { type: 'Ağ', percentage: 15, color: '#ED8936' },
    { type: 'Diğer', percentage: 10, color: '#48BB78' },
  ];

  const renderStatsCards = () => {
    return (
      <View style={styles.statsContainer}>
        {statsData.map((item, index) => (
          <TouchableOpacity key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    const maxValue = Math.max(...performanceData.map(item => item.value));
    
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Performans Metrikleri</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          {performanceData.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelContainer}>
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: (item.value / maxValue) * 150,
                      backgroundColor: item.value > 85 ? '#48BB78' : item.value > 75 ? '#4C51BF' : '#ED8936'
                    }
                  ]} 
                />
                <Text style={styles.barValue}>{item.value}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderIssueDistribution = () => {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Arıza Dağılımı</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {issueDistribution.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.pieSlice,
                  {
                    backgroundColor: item.color,
                    transform: [
                      { rotateZ: `${index * 90}deg` },
                      { scaleX: item.percentage / 25 }
                    ]
                  }
                ]}
              />
            ))}
            <View style={styles.pieCenter} />
          </View>
          <View style={styles.legendContainer}>
            {issueDistribution.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.type}: %{item.percentage}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };
  
  const renderMonthlySummary = () => {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Aylık Özet</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>94%</Text>
            <Text style={styles.summaryLabel}>Çözüm Oranı</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>2.4 saat</Text>
            <Text style={styles.summaryLabel}>Ortalama Müdahale</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>112</Text>
            <Text style={styles.summaryLabel}>Toplam Destek</Text>
          </View>
        </View>
        <View style={styles.summaryFooter}>
          <View style={styles.summaryFooterItem}>
            <Ionicons name="trending-up" size={18} color="#48BB78" />
            <Text style={styles.summaryFooterText}>Bir önceki aya göre %12 artış</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BIAT Kontrol Paneli</Text>
          <Text style={styles.headerSubtitle}>Hoşgeldiniz, Kenan</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image 
              source={require('../../images/BIAT-logo.png')} 
              style={styles.profileImage} 
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStatsCards()}
        {renderIssueDistribution()}
        {renderPerformanceMetrics()}
        {renderMonthlySummary()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    width: '48%',
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
  },
  barContainer: {
    alignItems: 'center',
    width: '15%',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 150,
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
    height: 200,
  },
  pieChart: {
    width: 150,
    height: 150,
    borderRadius: 75,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieSlice: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: 0,
    left: '50%',
    transformOrigin: 'left bottom',
  },
  pieCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    zIndex: 1,
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
  bottomPadding: {
    height: 24,
  },
});

export default HomeScreen; 