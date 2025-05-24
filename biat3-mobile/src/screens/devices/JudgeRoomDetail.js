import React, { useEffect, useState } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';

const JudgeRoomDetail = ({ route, theme, themedStyles }) => {
  const navigation = useNavigation();
  const { oda_numarasi } = route?.params || {};
  const [judgeRoom, setJudgeRoom] = useState(null);
  const [hakimDevices, setHakimDevices] = useState([
    { laptop: null, monitor: null, printer: null },
    { laptop: null, monitor: null, printer: null },
    { laptop: null, monitor: null, printer: null },
  ]);
  
  // Cihaz icon ve etiketleri
  const deviceMap = {
    laptop: { icon: 'laptop', label: 'Dizüstü Bilgisayar' },
    monitor: { icon: 'monitor-dashboard', label: 'Monitör' },
    printer: { icon: 'printer-pos', label: 'Yazıcı' },
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

  useEffect(() => {
    if (!oda_numarasi) return;
    const fetchJudgeRoom = async () => {
      const { data, error } = await supabase
        .from('hakim_odalari')
        .select('*')
        .eq('oda_numarasi', oda_numarasi)
        .single();
      setJudgeRoom(data);
    };
    fetchJudgeRoom();
  }, [oda_numarasi]);

  // Ekrana odaklanınca veriyi tekrar çek
  useFocusEffect(
    React.useCallback(() => {
      if (!oda_numarasi) return;
      const fetchJudgeRoom = async () => {
        const { data, error } = await supabase
          .from('hakim_odalari')
          .select('*')
          .eq('oda_numarasi', oda_numarasi)
          .single();
        setJudgeRoom(data);
      };
      fetchJudgeRoom();
    }, [oda_numarasi])
  );

  useEffect(() => {
    if (!judgeRoom) return;

    const fetchDevices = async () => {
      const newDevices = await Promise.all([1, 2, 3].map(async (i) => {
        const hakimAdSoyad = judgeRoom[`hakim${i}_adisoyadi`];
        const hakimBirim = judgeRoom[`hakim${i}_birimi`];
        const hakimMahkemeNo = judgeRoom[`hakim${i}_mahkemeno`];

        const [laptop, monitor, printer] = await Promise.all([
          hakimAdSoyad && hakimBirim && hakimMahkemeNo
            ? supabase.from('laptops').select('*')
                .eq('adi_soyadi', hakimAdSoyad)
                .eq('birim', hakimBirim)
                .eq('mahkeme_no', hakimMahkemeNo)
                .single()
            : { data: null },
          hakimAdSoyad && hakimBirim && hakimMahkemeNo
            ? supabase.from('screens').select('*')
                .eq('adi_soyadi', hakimAdSoyad)
                .eq('birim', hakimBirim)
                .eq('mahkeme_no', hakimMahkemeNo)
                .single()
            : { data: null },
          hakimAdSoyad && hakimBirim && hakimMahkemeNo
            ? supabase.from('printers').select('*')
                .eq('adi_soyadi', hakimAdSoyad)
                .eq('birim', hakimBirim)
                .eq('mahkeme_no', hakimMahkemeNo)
                .single()
            : { data: null },
        ]);
        return {
          laptop: laptop.data,
          monitor: monitor.data,
          printer: printer.data,
        };
      }));
      setHakimDevices(newDevices);
    };

    fetchDevices();
  }, [judgeRoom]);

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
        `${judgeRoom?.oda_numarasi || 'Bu odayı'} silmek istediğinize emin misiniz?`,
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from('hakim_odalari')
                  .delete()
                  .eq('id', judgeRoom.id);
                if (error) {
                  Alert.alert('Hata', 'Silme işlemi sırasında bir hata oluştu.');
                } else {
                  Alert.alert('Başarılı', 'Oda başarıyla silindi.');
                  navigation.goBack();
                }
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

  // Hakim bilgilerini diziye çevir
  const hakimler = [
    {
      adisoyadi: judgeRoom?.hakim1_adisoyadi,
      birimi: judgeRoom?.hakim1_birimi,
      mahkemeno: judgeRoom?.hakim1_mahkemeno,
      laptop: judgeRoom?.hakim1_laptop,
      monitor: judgeRoom?.hakim1_monitor,
      yazici: judgeRoom?.hakim1_yazici,
    },
    {
      adisoyadi: judgeRoom?.hakim2_adisoyadi,
      birimi: judgeRoom?.hakim2_birimi,
      mahkemeno: judgeRoom?.hakim2_mahkemeno,
      laptop: judgeRoom?.hakim2_laptop,
      monitor: judgeRoom?.hakim2_monitor,
      yazici: judgeRoom?.hakim2_yazici,
    },
    {
      adisoyadi: judgeRoom?.hakim3_adisoyadi,
      birimi: judgeRoom?.hakim3_birimi,
      mahkemeno: judgeRoom?.hakim3_mahkemeno,
      laptop: judgeRoom?.hakim3_laptop,
      monitor: judgeRoom?.hakim3_monitor,
      yazici: judgeRoom?.hakim3_yazici,
    },
  ];

  // If judgeRoom is undefined or null, show an error state
  if (!judgeRoom) {
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
          <Text style={[styles.headerTitle, { color: theme.text }]}> {judgeRoom?.oda_numarasi ? `${judgeRoom.oda_numarasi} Nolu Oda` : 'Hakim Odası Detayları'} </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.content}>
          {hakimler.filter(h => h.adisoyadi).map((hakim, idx) => {
            // Debug log
            console.log(`Hakim ${idx+1}:`, hakim.adisoyadi, 'Laptop:', hakimDevices[idx]?.laptop, 'Monitor:', hakimDevices[idx]?.monitor, 'Printer:', hakimDevices[idx]?.printer);
            return (
              <View key={idx} style={[styles.card, { backgroundColor: '#23272e', borderColor: '#23272e' }]}> 
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account-tie" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>{hakim.adisoyadi || 'Belirtilmemiş'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="gavel" size={20} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    {hakim.mahkemeno ? `${hakim.mahkemeno} ` : ''}{hakim.birimi || 'Belirtilmemiş'}
                  </Text>
                </View>
                <View style={styles.deviceRow}>
                  <TouchableOpacity
                    style={styles.deviceCard}
                    onPress={() => {
                      if (hakimDevices[idx]?.laptop) {
                        navigation.navigate('DeviceDetail', {
                          device: {
                            ...hakimDevices[idx].laptop,
                            type: 'laptop',
                            adi_soyadi: hakim.adisoyadi,
                            birim: hakim.birimi,
                            mahkeme_no: hakim.mahkemeno,
                            unvan: judgeRoom?.unvan || '',
                            sicil_no: judgeRoom?.sicil_no || judgeRoom?.sicilno || ''
                          }
                        });
                      }
                    }}
                    disabled={!hakimDevices[idx]?.laptop}
                  >
                    <MaterialCommunityIcons name="laptop" size={20} color={theme.textSecondary} />
                    {hakimDevices[idx]?.laptop ? (
                      <>
                        <Text style={[styles.deviceCardText, { color: theme.text }]}> {hakimDevices[idx].laptop.laptop_marka || '-'} {hakimDevices[idx].laptop.laptop_model || '-'} </Text>
                        <Text style={[styles.deviceCardText, { color: theme.textSecondary }]}>{hakimDevices[idx].laptop.laptop_seri_no || '-'}</Text>
                      </>
                    ) : (
                      <Text style={[styles.deviceCardText, { color: theme.text }]}>Laptop bulunamadı</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deviceCard}
                    onPress={() => {
                      if (hakimDevices[idx]?.monitor) {
                        navigation.navigate('DeviceDetail', {
                          device: {
                            ...hakimDevices[idx].monitor,
                            type: 'monitor',
                            adi_soyadi: hakim.adisoyadi,
                            birim: hakim.birimi,
                            mahkeme_no: hakim.mahkemeno,
                            unvan: judgeRoom?.unvan || '',
                            sicil_no: judgeRoom?.sicil_no || judgeRoom?.sicilno || ''
                          }
                        });
                      }
                    }}
                    disabled={!hakimDevices[idx]?.monitor}
                  >
                    <MaterialCommunityIcons name="monitor-dashboard" size={20} color={theme.textSecondary} />
                    {hakimDevices[idx]?.monitor ? (
                      <>
                        <Text style={[styles.deviceCardText, { color: theme.text }]}>{hakimDevices[idx].monitor.ekran_marka || '-'} {hakimDevices[idx].monitor.ekran_model || '-'}</Text>
                        <Text style={[styles.deviceCardText, { color: theme.textSecondary }]}>{hakimDevices[idx].monitor.ekran_seri_no || '-'}</Text>
                      </>
                    ) : (
                      <Text style={[styles.deviceCardText, { color: theme.text }]}>Monitör bulunamadı</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deviceCard}
                    onPress={() => {
                      if (hakimDevices[idx]?.printer) {
                        navigation.navigate('DeviceDetail', {
                          device: {
                            ...hakimDevices[idx].printer,
                            type: 'printer',
                            adi_soyadi: hakim.adisoyadi,
                            birim: hakim.birimi,
                            mahkeme_no: hakim.mahkemeno,
                            unvan: judgeRoom?.unvan || '',
                            sicil_no: judgeRoom?.sicil_no || judgeRoom?.sicilno || ''
                          }
                        });
                      }
                    }}
                    disabled={!hakimDevices[idx]?.printer}
                  >
                    <MaterialCommunityIcons name="printer-pos" size={20} color={theme.textSecondary} />
                    {hakimDevices[idx]?.printer ? (
                      <>
                        <Text style={[styles.deviceCardText, { color: theme.text }]}>{hakimDevices[idx].printer.yazici_marka || '-'} {hakimDevices[idx].printer.yazici_model || '-'}</Text>
                        <Text style={[styles.deviceCardText, { color: theme.textSecondary }]}>{hakimDevices[idx].printer.yazici_seri_no || '-'}</Text>
                      </>
                    ) : (
                      <Text style={[styles.deviceCardText, { color: theme.text }]}>Yazıcı bulunamadı</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  deviceRow: {
    marginTop: 12,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  deviceCardText: {
    fontSize: 14,
    marginLeft: 10,
    textAlign: 'left',
  },
});

export default withThemedScreen(JudgeRoomDetail);