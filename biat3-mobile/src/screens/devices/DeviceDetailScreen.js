import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const DeviceDetailScreen = ({ route, navigation }) => {
  const { device } = route.params;

  // Cihaz türüne göre ek detayları belirleme
  const isUserDevice = ['pc', 'monitor'].includes(device.type);

  // Cihazı silme fonksiyonu
  const handleDelete = () => {
    Alert.alert(
      "Cihazı Sil",
      `${device.name} cihazını silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Sil", 
          onPress: () => {
            // Burada gerçek silme işlemi API'ye gönderilecek
            Alert.alert("Başarılı", "Cihaz başarıyla silindi");
            navigation.goBack();
          },
          style: "destructive"
        }
      ]
    );
  };

  // Cihazı düzenleme fonksiyonu
  const handleEdit = () => {
    // Cihaz türünü belirle
    const deviceTypeObj = {
      id: device.type,
      name: {
        pc: 'Kasa',
        monitor: 'Monitör',
        printer: 'Yazıcı',
        scanner: 'Tarayıcı',
        segbis: 'SEGBİS',
        hearing: 'E-Duruşma',
        microphone: 'Mikrofon',
        tv: 'TV'
      }[device.type] || 'Cihaz'
    };
    
    // Düzenleme formuna git
    navigation.navigate('DeviceForm', { deviceType: deviceTypeObj, device });
  };

  // Cihaz silme butonu
  const renderRightActions = () => {
    return (
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        <Text style={styles.deleteText}>Sil</Text>
      </TouchableOpacity>
    );
  };

  // Durum bilgisine göre renk belirleme
  const getStatusInfo = () => {
    const statusColors = {
      active: '#22c55e',
      maintenance: '#f59e0b',
      error: '#ef4444'
    };

    const statusText = {
      active: 'Aktif',
      maintenance: 'Bakımda',
      error: 'Arızalı'
    };

    return {
      color: statusColors[device.status] || '#64748b',
      text: statusText[device.status] || 'Bilinmiyor'
    };
  };
  
  // Cihaz türüne göre ikon belirleme
  const getDeviceTypeIcon = () => {
    const typeIcons = {
      pc: 'desktop',
      monitor: 'tv',
      printer: 'print',
      scanner: 'scan',
      segbis: 'videocam',
      hearing: 'people',
      microphone: 'mic',
      tv: 'tv'
    };

    return typeIcons[device.type] || 'hardware-chip';
  };

  const status = getStatusInfo();

  const deviceContent = (
    <>
      <View style={styles.deviceHeader}>
        <View style={[styles.iconContainer, { backgroundColor: device.typeColor || '#4f46e5' }]}>
          <Ionicons name={getDeviceTypeIcon()} size={32} color="#FFFFFF" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Cihaz Bilgileri</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tür</Text>
            <Text style={styles.infoValue}>{
              {
                pc: 'Kasa',
                monitor: 'Monitör',
                printer: 'Yazıcı',
                scanner: 'Tarayıcı',
                segbis: 'SEGBİS',
                hearing: 'E-Duruşma',
                microphone: 'Mikrofon',
                tv: 'TV'
              }[device.type] || 'Bilinmiyor'
            }</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Konum</Text>
            <Text style={styles.infoValue}>{device.location || 'Belirtilmemiş'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Marka</Text>
            <Text style={styles.infoValue}>{device.brand || 'Belirtilmemiş'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Model</Text>
            <Text style={styles.infoValue}>{device.model || 'Belirtilmemiş'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Seri No</Text>
            <Text style={styles.infoValue}>{device.serialNumber || 'Belirtilmemiş'}</Text>
          </View>
        </View>
      </View>

      {isUserDevice && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Kullanıcı Bilgileri</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ad Soyad</Text>
              <Text style={styles.infoValue}>{device.userName || 'Belirtilmemiş'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ünvan</Text>
              <Text style={styles.infoValue}>{device.userTitle || 'Belirtilmemiş'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Sicil No</Text>
              <Text style={styles.infoValue}>{device.userRegistrationNumber || 'Belirtilmemiş'}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Bakım Bilgileri</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Son Bakım</Text>
            <Text style={styles.infoValue}>{device.lastMaintenance || 'Belirtilmemiş'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sonraki Bakım</Text>
            <Text style={styles.infoValue}>{device.nextMaintenance || 'Belirtilmemiş'}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cihaz Detayı</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={24} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
          <Swipeable renderRightActions={renderRightActions}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {deviceContent}
            </ScrollView>
          </Swipeable>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default DeviceDetailScreen; 