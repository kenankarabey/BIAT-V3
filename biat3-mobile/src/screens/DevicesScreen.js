import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ana kategori ekranı
const DevicesScreen = ({ navigation }) => {
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
      style={[styles.categoryCard, item.id === 'add' && styles.addCard]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={28} color="#FFFFFF" />
      </View>
      <View style={styles.categoryContent}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          {item.count && (
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          )}
        </View>
        <Text style={styles.categoryDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cihazlar</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3,724</Text>
            <Text style={styles.statLabel}>Toplam Cihaz</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3,605</Text>
            <Text style={styles.statLabel}>Aktif</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>119</Text>
            <Text style={styles.statLabel}>Arıza/Bakım</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kategoriler</Text>
        
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <CategoryCard key={category.id} item={category} />
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  addCard: {
    borderWidth: 2,
    borderColor: '#0891b2',
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    fontWeight: '600',
    color: '#1e293b',
  },
  countContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e3a8a',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default DevicesScreen; 