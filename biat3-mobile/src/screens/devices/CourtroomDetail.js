import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CourtroomDetail = ({ route }) => {
  const navigation = useNavigation();
  const { courtroom } = route.params;
  
  // Cihaz icon ve etiketleri
  const deviceMap = {
    kasa: { icon: 'desktop-tower', label: 'Kasa' },
    monitor: { icon: 'monitor', label: 'Monitör' },
    segbis: { icon: 'video', label: 'SEGBİS' },
    kamera: { icon: 'cctv', label: 'Duruşma Kamera' },
    tv: { icon: 'television', label: 'TV' },
    mikrofon: { icon: 'microphone', label: 'Mikrofon' },
  };

  // Durum rengini belirle
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif':
        return '#10b981'; // yeşil
      case 'Arıza':
        return '#ef4444'; // kırmızı
      case 'Bakım':
        return '#f59e0b'; // turuncu
      case 'Pasif':
        return '#6b7280'; // gri
      default:
        return '#6b7280';
    }
  };
  
  // Toplam cihaz sayısı
  const totalDevices = Object.values(courtroom.devices || {}).reduce((sum, count) => sum + count, 0);

  // Düzenleme ekranına git
  const handleEdit = () => {
    navigation.navigate('CourtroomForm', { courtroom });
  };

  // Salon silme
  const handleDelete = () => {
    Alert.alert(
      'Salon Sil',
      `"${courtroom.name}" salonunu silmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('Courtrooms', { deletedCourtroom: courtroom });
          },
        },
      ]
    );
  };

  // Cihaz detay sayfasına git
  const handleDeviceDetail = (deviceType) => {
    // Eğer cihaz sayısı 0 ise, detay sayfasına gitmeye gerek yok
    if (!courtroom.devices || courtroom.devices[deviceType] <= 0) {
      return;
    }
    
    // Cihaz tipine göre detay sayfasına git
    navigation.navigate('DeviceTypeDetail', { 
      deviceType,
      courtroomId: courtroom.id,
      courtroomName: courtroom.name
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Salon Detayları</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{courtroom.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(courtroom.status) }]}>
                <Text style={styles.statusText}>{courtroom.status}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="gavel" size={20} color="#64748b" />
              <Text style={styles.infoText}>{courtroom.court}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
              <Text style={styles.infoText}>{courtroom.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#64748b" />
              <Text style={styles.infoText}>Son Kontrol: {courtroom.lastCheck}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Cihazlar ({totalDevices})</Text>
            
            <View style={styles.deviceGrid}>
              {Object.entries(deviceMap).map(([key, { icon, label }]) => (
                <TouchableOpacity 
                  key={key} 
                  style={styles.deviceItem}
                  onPress={() => handleDeviceDetail(key)}
                  disabled={!courtroom.devices || courtroom.devices[key] <= 0}
                >
                  <View style={[
                    styles.deviceIconContainer,
                    { backgroundColor: courtroom.devices && courtroom.devices[key] > 0 ? '#eef2ff' : '#f1f5f9' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={icon} 
                      size={24} 
                      color={courtroom.devices && courtroom.devices[key] > 0 ? '#4f46e5' : '#94a3b8'} 
                    />
                  </View>
                  <Text style={[
                    styles.deviceItemText,
                    { color: courtroom.devices && courtroom.devices[key] > 0 ? '#1e293b' : '#94a3b8' }
                  ]}>
                    {label}
                  </Text>
                  {courtroom.devices && courtroom.devices[key] > 0 ? (
                    <View style={styles.deviceCountTag}>
                      <Text style={styles.deviceCountText}>{courtroom.devices[key]}</Text>
                    </View>
                  ) : (
                    <View style={styles.deviceMissingTag}>
                      <Text style={styles.deviceMissingText}>0</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {courtroom.notes && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Notlar</Text>
                <Text style={styles.notesText}>{courtroom.notes}</Text>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Sil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#ffffff" />
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  deviceItem: {
    width: '33.333%',
    padding: 6,
    marginBottom: 12,
    position: 'relative',
  },
  deviceIconContainer: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceItemText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  deviceCountTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4f46e5',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deviceMissingTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e2e8f0',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceMissingText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  editButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default CourtroomDetail; 