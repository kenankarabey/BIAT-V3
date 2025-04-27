import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import withThemedScreen from '../components/withThemedScreen';

const AddDeviceScreen = ({ navigation, theme, themedStyles }) => {
  // Cihaz türleri
  const deviceTypes = [
    {
      id: 'pc',
      name: 'Kasa',
      icon: 'desktop-outline',
      color: '#4f46e5',
      description: 'Masa üstü bilgisayar kasası',
      isUserDevice: true,
    },
    {
      id: 'monitor',
      name: 'Monitör',
      icon: 'tv-outline',
      color: '#0891b2',
      description: 'Bilgisayar monitörü',
      isUserDevice: true,
    },
    {
      id: 'printer',
      name: 'Yazıcı',
      icon: 'print-outline',
      color: '#10b981',
      description: 'Yazıcı veya çok fonksiyonlu yazıcı',
      isUserDevice: false,
    },
    {
      id: 'scanner',
      name: 'Tarayıcı',
      icon: 'scan-outline',
      color: '#f59e0b',
      description: 'Doküman tarayıcı',
      isUserDevice: false,
    },
    {
      id: 'segbis',
      name: 'SEGBİS',
      icon: 'videocam-outline',
      color: '#ef4444',
      description: 'Ses ve Görüntü Bilişim Sistemi',
      isUserDevice: false,
    },
    {
      id: 'hearing',
      name: 'E-Duruşma',
      icon: 'people-outline',
      color: '#8b5cf6',
      description: 'E-Duruşma sistemi',
      isUserDevice: false,
    },
    {
      id: 'microphone',
      name: 'Mikrofon',
      icon: 'mic-outline',
      color: '#f97316',
      description: 'Mikrofon sistemleri',
      isUserDevice: false,
    },
    {
      id: 'tv',
      name: 'TV',
      icon: 'tv-outline',
      color: '#14b8a6',
      description: 'Televizyon',
      isUserDevice: false,
    },
    {
      id: 'camera',
      name: 'Kamera',
      icon: 'camera-outline',
      color: '#6366f1',
      description: 'Güvenlik kamerası',
      isUserDevice: false,
    }
  ];

  const handleSelectDeviceType = (deviceType) => {
    navigation.navigate('DeviceForm', { deviceType });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cihaz Türü Seçin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Eklemek istediğiniz cihaz türünü seçin
        </Text>

        <View style={styles.typesContainer}>
          {deviceTypes.map((deviceType) => (
            <TouchableOpacity 
              key={deviceType.id}
              style={[
                styles.typeCard, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                  borderWidth: 1,
                  elevation: 0
                }
              ]}
              onPress={() => handleSelectDeviceType(deviceType)}
            >
              <View style={[styles.iconContainer, { backgroundColor: deviceType.color }]}>
                <Ionicons name={deviceType.icon} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.typeName, { color: theme.text }]}>{deviceType.name}</Text>
              <Text style={[styles.typeDescription, { color: theme.textSecondary }]}>{deviceType.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default withThemedScreen(AddDeviceScreen); 