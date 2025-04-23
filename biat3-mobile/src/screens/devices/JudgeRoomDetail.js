import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const JudgeRoomDetail = ({ route }) => {
  const navigation = useNavigation();
  const { judgeRoom = {} } = route?.params || {};
  
  // Cihaz icon ve etiketleri
  const deviceMap = {
    laptop: { icon: 'laptop', label: 'Dizüstü Bilgisayar' },
    monitor: { icon: 'monitor', label: 'Monitör' },
    printer: { icon: 'printer', label: 'Yazıcı' },
  };

  // Durum rengini belirle
  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    
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
  const totalDevices = Object.values(judgeRoom?.devices || {}).reduce((sum, count) => sum + count, 0);

  // Düzenleme ekranına git
  const handleEdit = () => {
    try {
      setTimeout(() => {
        navigation.navigate('JudgeRoomForm', { judgeRoom });
      }, 0);
    } catch (error) {
      console.error('Düzenleme navigasyon hatası: ', error);
      Alert.alert('Hata', 'Düzenleme sayfasına geçişte bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Oda silme
  const handleDelete = () => {
    try {
      Alert.alert(
        'Oda Sil',
        `"${judgeRoom?.judgeName || 'Bu odayı'}" silmek istediğinize emin misiniz?`,
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: () => {
              try {
                setTimeout(() => {
                  navigation.navigate('JudgeRooms', { deletedJudgeRoom: judgeRoom });
                }, 0);
              } catch (navError) {
                console.error('Silme işlemi navigasyon hatası: ', navError);
                alert('Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Silme dialog hatası: ', error);
      alert('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Cihaz detay sayfasına git
  const handleDeviceDetail = (deviceType) => {
    // Eğer judgeRoom veya deviceMap tanımlı değilse kontrolü
    if (!judgeRoom || !deviceMap || !deviceType) {
      return;
    }
    
    // Eğer cihaz sayısı 0 ise, detay sayfasına gitmeye gerek yok
    if (!judgeRoom.devices || !judgeRoom.devices[deviceType] || judgeRoom.devices[deviceType] <= 0) {
      return;
    }
    
    try {
      setTimeout(() => {
        navigation.navigate('DeviceTypeDetail', { 
          deviceType,
          judgeRoomId: judgeRoom.id,
          judgeName: judgeRoom.judgeName,
          roomNumber: judgeRoom.roomNumber,
          deviceCount: judgeRoom.devices[deviceType],
          sourceScreen: 'JudgeRoomDetail'
        });
      }, 0);
    } catch (error) {
      console.error('Cihaz detay navigasyon hatası:', error);
      Alert.alert('Hata', 'Cihaz detaylarına erişilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // If judgeRoom is undefined or null, show an error state
  if (!judgeRoom || Object.keys(judgeRoom).length === 0) {
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
            <Text style={styles.headerTitle}>Hakim Odası Detayları</Text>
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#ef4444" />
            <Text style={styles.errorText}>Hakim odası bilgileri bulunamadı.</Text>
            <TouchableOpacity 
              style={styles.backButtonLarge}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Hakim Odası Detayları</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Oda {String(judgeRoom?.roomNumber || 'Belirtilmemiş')}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(judgeRoom?.status) }]}>
                <Text style={styles.statusText}>{String(judgeRoom?.status || 'Belirsiz')}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account" size={20} color="#4f46e5" />
              <Text style={styles.sectionTitle}>Hakim Bilgileri</Text>
            </View>

            {/* Eğer judges dizisi varsa onları göster, yoksa eski yöntemi kullan */}
            {judgeRoom?.judges && judgeRoom.judges.length > 0 ? (
              judgeRoom.judges.map((judge, index) => (
                <View key={judge.id || index} style={[styles.judgeCard, index > 0 && styles.judgeCardSeparator]}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account-tie" size={20} color="#64748b" />
                    <Text style={styles.infoText}>{String(judge.name || 'Belirtilmemiş')}</Text>
                  </View>

                  {judge.regId ? (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="card-account-details" size={20} color="#64748b" />
                      <Text style={styles.infoText}>Sicil No: {String(judge.regId)}</Text>
                    </View>
                  ) : null}

                  {judge.title ? (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="badge-account" size={20} color="#64748b" />
                      <Text style={styles.infoText}>{String(judge.title)}</Text>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account-tie" size={20} color="#64748b" />
                  <Text style={styles.infoText}>{String(judgeRoom?.judgeName || 'Belirtilmemiş')}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="card-account-details" size={20} color="#64748b" />
                  <Text style={styles.infoText}>Sicil No: {String(judgeRoom?.judgeId || 'Belirtilmemiş')}</Text>
                </View>
              </>
            )}

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="gavel" size={20} color="#64748b" />
              <Text style={styles.infoText}>{String(judgeRoom?.court || 'Belirtilmemiş')}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
              <Text style={styles.infoText}>{String(judgeRoom?.roomNumber || 'Belirtilmemiş')} Nolu Oda, {String(judgeRoom?.location || 'Adliye')}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="devices" size={20} color="#4f46e5" />
              <Text style={styles.sectionTitle}>Cihazlar ({totalDevices})</Text>
            </View>
            
            <View style={styles.deviceGrid}>
              {Object.entries(deviceMap || {}).map(([key, { icon, label }]) => {
                // deviceMap içindeki değer kontrolü
                if (!key || !icon || !label) return null;
                
                return (
                  <TouchableOpacity 
                    key={key} 
                    style={styles.deviceItem}
                    onPress={() => handleDeviceDetail(key)}
                    disabled={!judgeRoom?.devices || !judgeRoom.devices[key] || judgeRoom.devices[key] <= 0}
                  >
                    <View style={[
                      styles.deviceIconContainer,
                      { backgroundColor: judgeRoom?.devices && judgeRoom.devices[key] > 0 ? '#eef2ff' : '#f1f5f9' }
                    ]}>
                      <MaterialCommunityIcons 
                        name={icon} 
                        size={24} 
                        color={judgeRoom?.devices && judgeRoom.devices[key] > 0 ? '#4f46e5' : '#94a3b8'} 
                      />
                    </View>
                    <Text style={[
                      styles.deviceItemText,
                      { color: judgeRoom?.devices && judgeRoom.devices[key] > 0 ? '#1e293b' : '#94a3b8' }
                    ]}>
                      {label}
                    </Text>
                    {judgeRoom?.devices && judgeRoom.devices[key] > 0 ? (
                      <View style={styles.deviceCountTag}>
                        <Text style={styles.deviceCountText}>{judgeRoom.devices[key]}</Text>
                      </View>
                    ) : (
                      <View style={styles.deviceMissingTag}>
                        <Text style={styles.deviceMissingText}>0</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {judgeRoom?.notes && (
              <>
                <View style={styles.divider} />
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="note-text" size={20} color="#4f46e5" />
                  <Text style={styles.sectionTitle}>Notlar</Text>
                </View>
                <Text style={styles.notesText}>{judgeRoom.notes}</Text>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonLarge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
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
  judgeCard: {
    paddingVertical: 8,
  },
  judgeCardSeparator: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8,
    paddingTop: 12,
  },
});

export default JudgeRoomDetail; 