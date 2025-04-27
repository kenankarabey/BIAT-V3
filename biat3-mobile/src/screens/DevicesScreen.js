import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withThemedScreen from '../components/withThemedScreen';

// Ana kategori ekranı
const DevicesScreen = ({ navigation, theme, themedStyles }) => {
  // Kategori verileri
  const categories = [
    { 
      id: 'add', 
      title: 'Cihaz Ekle', 
      description: 'Yeni bir cihaz ekle', 
      icon: 'add-circle-outline',
      count: null,
      screen: 'AddDevice',
      color: '#0891b2'
    },
    { 
      id: 'all', 
      title: 'Tüm Cihazlar', 
      description: 'Adliyedeki tüm cihazların listesi ve durumları', 
      icon: 'hardware-chip-outline',
      count: 3724,
      screen: 'AllDevices',
      color: '#4f46e5'
    },
    { 
      id: 'court-offices', 
      title: 'Mahkeme Kalemleri', 
      description: 'Mahkeme kalemlerindeki cihazlar', 
      icon: 'briefcase-outline',
      count: 1256,
      screen: 'CourtOffices',
      color: '#10b981'
    },
    { 
      id: 'courtrooms', 
      title: 'Duruşma Salonları', 
      description: 'Duruşma salonlarındaki cihazlar', 
      icon: 'people-outline',
      count: 1578,
      screen: 'Courtrooms',
      color: '#f59e0b'
    },
    { 
      id: 'judge-rooms', 
      title: 'Hakim Odaları', 
      description: 'Hakim odalarındaki cihazlar', 
      icon: 'person-outline',
      count: 890,
      screen: 'JudgeRooms',
      color: '#ef4444'
    },
  ];

  // Kategori kartı bileşeni
  const CategoryCard = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        themedStyles.card,
        themedStyles.shadow,
        item.id === 'add' && styles.addCard
      ]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={28} color="#FFFFFF" />
      </View>
      <View style={styles.categoryContent}>
        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryTitle, themedStyles.text]}>{item.title}</Text>
          {item.count && (
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.categoryDescription, themedStyles.textSecondary]}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[styles.header, themedStyles.header]}>
        <Text style={[styles.headerTitle, themedStyles.text]}>Cihazlar</Text>
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.inputBg }]}>
          <Ionicons name="search" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.statsContainer, themedStyles.card, themedStyles.shadow]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, themedStyles.text]}>3,724</Text>
            <Text style={[styles.statLabel, themedStyles.textSecondary]}>Toplam Cihaz</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, themedStyles.text]}>3,605</Text>
            <Text style={[styles.statLabel, themedStyles.textSecondary]}>Aktif</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, themedStyles.text]}>119</Text>
            <Text style={[styles.statLabel, themedStyles.textSecondary]}>Arıza/Bakım</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, themedStyles.text]}>Kategoriler</Text>
        
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <CategoryCard key={category.id} item={category} />
          ))}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addCard: {
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryDescription: {
    fontSize: 14,
  },
  countContainer: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  }
});

export default withThemedScreen(DevicesScreen); 