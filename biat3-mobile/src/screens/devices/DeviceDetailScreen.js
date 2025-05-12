import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import BarcodeDisplay, { QRCodeDisplay, BarcodeOnlyDisplay } from '../../components/BarcodeDisplay';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';


const DeviceDetailScreen = ({ route, navigation, theme, themedStyles, isDarkMode }) => {
  const { device } = route.params;
  console.log('Device detail:', route?.params?.device);

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

  // Barkod ve QR kod paylaşım fonksiyonu
  const handleShareCodes = async () => {
    if (!device.barcodeValue) {
      Alert.alert(
        "Hata",
        "Bu cihaz için barkod bilgisi bulunamadı.",
        [{ text: "Tamam" }]
      );
      return;
    }

    try {
      // Paylaşılacak içeriği hazırla
      const qrContent = `BIAT-Cihaz:${device.barcodeValue}\nTür:${device.type}\nMarka:${device.brand || 'Belirtilmemiş'}\nModel:${device.model || 'Belirtilmemiş'}\nSeri No:${device.serialNumber || 'Belirtilmemiş'}`;
      
      // Gerçek bir uygulamada bu kısımda PDF oluşturma ve yazdırma işlemleri olurdu
      // Burada sadece paylaşım işlemi yapıyoruz
      const result = await Share.share({
        message: `Cihaz Bilgileri:\nAd: ${device.name}\nTür: ${device.type}\nBarkod: ${device.barcodeValue}\nKonum: ${device.location}\n\n${qrContent}`,
        title: `${device.name} Barkod Bilgileri`,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Paylaşıldı
          console.log(`Shared via ${result.activityType}`);
        } else {
          // Paylaşıldı
          console.log('Shared');
        }
      } else if (result.action === Share.dismissedAction) {
        // İptal edildi
        console.log('Dismissed');
      }
    } catch (error) {
      Alert.alert("Hata", error.message);
    }
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

  // Fonksiyon: Kullanıcı bilgileri gösterilsin mi?
  const shouldShowUserInfo = () => {
    if (device.oda_tipi === 'Duruşma Salonu') return false;
    if ((device.tip === 'Yazıcı' || device.tip === 'yazıcı') && device.oda_tipi !== 'Hakim Odası') return false;
    return true;
  };

  // Cihaz tipi prefix haritası
  const prefixMap = {
    Kasa: 'kasa',
    Monitör: 'ekran',
    Yazıcı: 'yazici',
    Tarayıcı: 'tarayici',
    SEGBİS: 'segbis',
    Mikrofon: 'mikrofon',
    Kamera: 'kamera',
    TV: 'tv',
    'E-Duruşma': 'e_durusma'
  };
  const prefix = prefixMap[device.tip] || '';

  const displayMarka = device[`${prefix}_marka`] || device.kasa_marka || device.marka || '-';
  const displayModel = device[`${prefix}_model`] || device.kasa_model || device.model || '-';
  const displaySeriNo = device[`${prefix}_seri_no`] || device.kasa_seri_no || device.seri_no || '-';

  return (
    <>
      <View style={[styles.header, themedStyles.header]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themedStyles.text]}>Cihaz Detayı</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <GestureHandlerRootView>
          <Swipeable renderRightActions={renderRightActions}>
            <View style={[styles.deviceCard, themedStyles.card, themedStyles.shadow]}>
              <View style={styles.deviceHeader}>
                <View style={[styles.iconContainer, { backgroundColor: device.color || '#4f46e5' }]}>
                  <Ionicons name={device.icon || getDeviceTypeIcon()} size={32} color="#FFFFFF" />
                </View>
                <View style={styles.titleContainer}>
                  <Text style={[styles.deviceName, themedStyles.text]}>{displayMarka + ' ' + displayModel}</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, themedStyles.text]}>Cihaz Bilgileri</Text>
                <View style={[styles.infoCard, themedStyles.card, { borderColor: theme.border, borderWidth: 1 }]}>  
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Mahkeme No</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{device.mahkeme_no || device.kasa_mahkeme_no || '-'}</Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Birim</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{device.birim || '-'}</Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Oda Tipi</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{device.oda_tipi || device.kasa_oda_tipi || '-'}</Text>
                  </View>

                  {/* Kasa, Laptop, Monitör için Unvan, Sicil No, İsim Soyisim */}
                  {(['Kasa', 'Laptop', 'Monitör'].includes(device.tip) && device.oda_tipi !== 'Duruşma Salonu') && (
                    <>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Unvan</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.unvan || '-'}</Text>
                      </View>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Adı Soyadı</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.adi_soyadi || '-'}</Text>
                      </View>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Sicil No</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.sicil_no || '-'}</Text>
                      </View>
                    </>
                  )}

                  {/* Sadece Yazıcı ve oda_tipi Hakim Odaları ise Unvan, Sicil No, İsim Soyisim */}
                  {(device.tip === 'Yazıcı' && device.oda_tipi === 'Hakim Odaları') && (
                    <>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Unvan</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.unvan || '-'}</Text>
                      </View>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Adı Soyadı</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.adi_soyadi || '-'}</Text>
                      </View>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Sicil No</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.sicilno || '-'}</Text>
                      </View>
                    </>
                  )}

                  {/* Marka, Model, Seri No, İlk/Son Garanti Tarihi her cihazda gösterilsin */}
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Marka</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{displayMarka}</Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Model</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{displayModel}</Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Seri No</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{displaySeriNo}</Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>İlk Garanti Tarihi</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{device.ilk_garanti_tarihi || '-'}</Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                    <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Son Garanti Tarihi</Text>
                    <Text style={[styles.infoValue, themedStyles.text]}>{device.son_garanti_tarihi || '-'}</Text>
                  </View>

                  {/* Sadece Kasa için temizlik tarihleri */}
                  {device.tip === 'Kasa' && (
                    <>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>İlk Temizlik Tarihi</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.ilk_temizlik_tarihi || '-'}</Text>
                      </View>
                      <View style={[styles.infoItem, { borderBottomColor: theme.border }]}> 
                        <Text style={[styles.infoLabel, themedStyles.textSecondary]}>Son Temizlik Tarihi</Text>
                        <Text style={[styles.infoValue, themedStyles.text]}>{device.son_temizlik_tarihi || '-'}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, themedStyles.text]}>Cihaz Kodları</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  {/* QR Kod Kutusu */}
                  <View style={styles.codeBox}>
                    <QRCodeDisplay value={device.qr_kod || ''} />
                    <Text style={styles.codeLabel}>QR Kod</Text>
                  </View>
                  {/* Barkod Kutusu */}
                  <View style={styles.codeBox}>
                    <BarcodeOnlyDisplay value={device.barkod || ''} />
                    <Text style={styles.codeLabel}>Barkod</Text>
                  </View>
                </View>
              </View>
            </View>
          </Swipeable>
        </GestureHandlerRootView>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  deviceCard: {
    borderRadius: 12,
    padding: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  barcodeSection: {
    marginBottom: 24,
  },
  barcodeCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
  codeBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '47%',
  },
  codeLabel: {
    marginTop: 8,
    fontWeight: '600',
    color: '#64748b',
    fontSize: 16,
  },
});

export default withThemedScreen(DeviceDetailScreen); 