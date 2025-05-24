import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withThemedScreen from '../components/withThemedScreen';
import { supabase } from '../supabaseClient';

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

  const [deviceCounts, setDeviceCounts] = useState({
    toplamCihaz: 0,
    mahkemeKalemi: 0,
    durusmaSalonu: 0,
    hakimOdasi: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      // Toplam cihaz
      const { count: toplamCihaz } = await supabase.from('devices').select('*', { count: 'exact', head: true });
      // Mahkeme kalemi
      const { count: mahkemeKalemi } = await supabase.from('devices').select('*', { count: 'exact', head: true }).eq('oda_tipi', 'Mahkeme Kalemleri');
      // Duruşma salonu
      const { count: durusmaSalonu } = await supabase.from('devices').select('*', { count: 'exact', head: true }).eq('oda_tipi', 'Duruşma Salonu');
      // Hakim odası
      const { count: hakimOdasi } = await supabase.from('devices').select('*', { count: 'exact', head: true }).eq('oda_tipi', 'Hakim Odaları');
      setDeviceCounts({
        toplamCihaz: toplamCihaz || 0,
        mahkemeKalemi: mahkemeKalemi || 0,
        durusmaSalonu: durusmaSalonu || 0,
        hakimOdasi: hakimOdasi || 0,
      });
      setIsLoading(false);
    };
    fetchCounts();
  }, []);

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
});

export default withThemedScreen(DevicesScreen); 