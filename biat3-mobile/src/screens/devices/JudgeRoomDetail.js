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
import withThemedScreen from '../../components/withThemedScreen';

const JudgeRoomDetail = ({ route, theme, themedStyles }) => {
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
        return '#64748b'; // gri
      default:
        return '#64748b';
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Hakim Odası Detayları</Text>
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={60} color={theme.danger} />
            <Text style={[styles.errorText, { color: theme.text }]}>Hakim odası bilgileri bulunamadı.</Text>
            <TouchableOpacity 
              style={[styles.backButtonLarge, { backgroundColor: theme.primary }]}
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Hakim Odası Detayları</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.text }]}>Oda {String(judgeRoom?.roomNumber || 'Belirtilmemiş')}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(judgeRoom?.status) }]}>
                <Text style={styles.statusText}>{String(judgeRoom?.status || 'Belirsiz')}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Hakim Bilgileri</Text>
            </View>

            {/* Eğer judges dizisi varsa onları göster, yoksa eski yöntemi kullan */}
            {judgeRoom?.judges && judgeRoom.judges.length > 0 ? (
              judgeRoom.judges.map((judge, index) => (
                <View key={judge.id || index} style={[
                  styles.judgeCard, 
                  index > 0 && [styles.judgeCardSeparator, { borderTopColor: theme.border }]
                ]}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account-tie" size={20} color={theme.textSecondary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{String(judge.name || 'Belirtilmemiş')}</Text>
                  </View>

                  {judge.regId ? (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="card-account-details" size={20} color={theme.textSecondary} />
                      <Text style={[styles.infoText, { color: theme.text }]}>Sicil No: {String(judge.regId)}</Text>
                    </View>
                  ) : null}

                  {judge.title ? (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="badge-account" size={20} color={theme.textSecondary} />
                      <Text style={[styles.infoText, { color: theme.text }]}>{String(judge.title)}</Text>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account-tie" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>{String(judgeRoom?.judgeName || 'Belirtilmemiş')}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="card-account-details" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>Sicil No: {String(judgeRoom?.judgeId || 'Belirtilmemiş')}</Text>
                </View>
              </>
            )}

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="gavel" size={20} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.text }]}>{String(judgeRoom?.court || 'Belirtilmemiş')}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.text }]}>{String(judgeRoom?.roomNumber || 'Belirtilmemiş')} Nolu Oda, {String(judgeRoom?.location || 'Adliye')}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="devices" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Cihazlar ({totalDevices})</Text>
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
                      { backgroundColor: judgeRoom?.devices && judgeRoom.devices[key] > 0 ? 
                          theme.primary + '20' : theme.backgroundSecondary }
                    ]}>
                      <MaterialCommunityIcons 
                        name={icon} 
                        size={24} 
                        color={judgeRoom?.devices && judgeRoom.devices[key] > 0 ? 
                          theme.primary : theme.textSecondary} 
                      />
                    </View>
                    <Text style={[
                      styles.deviceItemText,
                      { color: judgeRoom?.devices && judgeRoom.devices[key] > 0 ? 
                          theme.text : theme.textSecondary }
                    ]}>
                      {label}
                    </Text>
                    {judgeRoom?.devices && judgeRoom.devices[key] > 0 ? (
                      <View style={[styles.deviceCountTag, { backgroundColor: theme.primary }]}>
                        <Text style={styles.deviceCountText}>{judgeRoom.devices[key]}</Text>
                      </View>
                    ) : (
                      <View style={[styles.deviceMissingTag, { backgroundColor: theme.backgroundSecondary }]}>
                        <Text style={[styles.deviceMissingText, { color: theme.textSecondary }]}>0</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {judgeRoom?.notes && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="note-text" size={20} color={theme.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Notlar</Text>
                </View>
                <Text style={[styles.notesText, { color: theme.textSecondary }]}>{judgeRoom.notes}</Text>
              </>
            )}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <TouchableOpacity 
            style={[styles.deleteButton, { 
              borderColor: theme.isDark ? '#991b1b' : '#fecaca', 
              backgroundColor: theme.isDark ? '#7f1d1d' : '#fef2f2'
            }]}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Sil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.primary }]}
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
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonLarge: {
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
    marginLeft: 8,
  },
  divider: {
    height: 1,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceMissingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
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
    marginTop: 8,
    paddingTop: 12,
  },
});

export default withThemedScreen(JudgeRoomDetail);