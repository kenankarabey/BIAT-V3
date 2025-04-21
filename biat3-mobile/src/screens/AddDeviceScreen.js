import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddDeviceScreen = ({ navigation }) => {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cihaz Türü Seçin</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>
          Eklemek istediğiniz cihaz türünü seçin
        </Text>

        <View style={styles.typesContainer}>
          {deviceTypes.map((deviceType) => (
            <TouchableOpacity 
              key={deviceType.id}
              style={styles.typeCard}
              onPress={() => handleSelectDeviceType(deviceType)}
            >
              <View style={[styles.iconContainer, { backgroundColor: deviceType.color }]}>
                <Ionicons name={deviceType.icon} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.typeName}>{deviceType.name}</Text>
              <Text style={styles.typeDescription}>{deviceType.description}</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#64748b',
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default AddDeviceScreen; 