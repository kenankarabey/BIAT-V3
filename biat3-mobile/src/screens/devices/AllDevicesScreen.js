import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';

const DEVICE_TABLES = [
  { table: 'computers', prefix: 'kasa', type: 'Kasa', icon: 'desktop', color: '#4f46e5' },
  { table: 'screens', prefix: 'ekran', type: 'Monitör', icon: 'tv', color: '#10b981' },
  { table: 'printers', prefix: 'yazici', type: 'Yazıcı', icon: 'print', color: '#f59e0b' },
  { table: 'scanners', prefix: 'tarayici', type: 'Tarayıcı', icon: 'scan', color: '#ef4444' },
  { table: 'segbis', prefix: 'segbis', type: 'SEGBİS', icon: 'videocam', color: '#6366f1' },
  { table: 'microphones', prefix: 'mikrofon', type: 'Mikrofon', icon: 'mic', color: '#ec4899' },
  { table: 'cameras', prefix: 'kamera', type: 'Kamera', icon: 'camera', color: '#f472b6' },
  { table: 'tvs', prefix: 'tv', type: 'TV', icon: 'tv', color: '#14b8a6' },
  { table: 'e_durusma', prefix: 'e_durusma', type: 'E-Duruşma', icon: 'people', color: '#8b5cf6' },
];

function AllDevicesScreen({ navigation, route, theme, themedStyles, isDarkMode }) {
  const [selectedType, setSelectedType] = useState('Kasa');
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchAllDevices = async () => {
      let allDevices = [];
      for (const dev of DEVICE_TABLES) {
        const { data, error } = await supabase.from(dev.table).select('*');
        if (!error && data) {
          const mapped = data.map(item => ({
            id: item.id,
            kasa_marka: item[`${dev.prefix}_marka`] || '',
            kasa_model: item[`${dev.prefix}_model`] || '',
            kasa_seri_no: item[`${dev.prefix}_seri_no`] || '',
            oda_tipi: item.oda_tipi || '',
            unvan: item.unvan || '',
            adi_soyadi: item.adi_soyadi || '',
            ...(dev.prefix === 'yazici'
              ? { sicilno: item.sicilno || '' }
              : { sicil_no: item.sicil_no || '' }
            ),
            kasa_ilk_temizlik_tarihi: dev.prefix === 'kasa' ? (item.kasa_ilk_temizlik_tarihi || '') : '',
            kasa_son_temizlik_tarihi: dev.prefix === 'kasa' ? (item.kasa_son_temizlik_tarihi || '') : '',
            ilk_temizlik_tarihi: item.ilk_temizlik_tarihi || '',
            son_temizlik_tarihi: item.son_temizlik_tarihi || '',
            ilk_garanti_tarihi: item.ilk_garanti_tarihi || '',
            son_garanti_tarihi: item.son_garanti_tarihi || '',
            qr_kod: item.qr_kod || '',
            barkod: item.barkod || '',
            tip: dev.type,
            icon: dev.icon,
            color: dev.color,
            mahkeme_no: item.mahkeme_no || '',
            birim: item.birim || '',
            durum: item[`${dev.prefix}_durum`] || 'active',
          }));
          allDevices = allDevices.concat(mapped);
        }
      }
      setDevices(allDevices);
    };
    fetchAllDevices();
  }, []);

  const filteredDevices = devices.filter(device => device.tip === selectedType);

  const handleEdit = (device) => {
    navigation.navigate('DeviceForm', { deviceType: { id: device.tip, name: device.tip }, device });
  };

  const handleDelete = (device) => {
    Alert.alert(
      "Cihazı Sil",
      `${device.kasa_marka} ${device.kasa_model} cihazını silmek istediğinize emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Sil", 
          onPress: () => {
            const updatedDevices = devices.filter(d => d.id !== device.id);
            setDevices(updatedDevices);
            Alert.alert("Başarılı", "Cihaz başarıyla silindi");
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderRightActions = (device, closeRow) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
      <TouchableOpacity 
        style={{ justifyContent: 'center', alignItems: 'center', width: 80, height: '100%', backgroundColor: theme.primary }}
        onPress={() => {
          closeRow();
          handleEdit(device);
        }}
      >
        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 4 }}>Düzenle</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={{ justifyContent: 'center', alignItems: 'center', width: 80, height: '100%', backgroundColor: '#ef4444' }}
        onPress={() => {
          closeRow();
          handleDelete(device);
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 4 }}>Sil</Text>
      </TouchableOpacity>
    </View>
  );

  const DeviceTypeCard = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.typeCard, 
        { backgroundColor: item.color + '20' }, 
        selectedType === item.type && { borderColor: item.color, borderWidth: 2 }
      ]} 
      onPress={() => setSelectedType(item.type === selectedType ? null : item.type)}
    >
      <Ionicons name={item.icon} size={24} color={item.color} />
      <Text style={[styles.typeTitle, themedStyles.text]}>{item.type}</Text>
    </TouchableOpacity>
  );

  const DeviceItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'active': return '#16a34a';
        case 'maintenance': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#64748b';
      }
    };

    const getStatusText = (status) => {
      switch(status) {
        case 'active': return 'Aktif';
        case 'maintenance': return 'Bakımda';
        case 'error': return 'Arızalı';
        default: return 'Bilinmiyor';
      }
    };

    const rowRef = React.useRef(null);

    const closeRow = () => {
      if (rowRef.current) {
        rowRef.current.close();
      }
    };

    return (
      <GestureHandlerRootView>
        <Swipeable
          ref={rowRef}
          renderRightActions={() => renderRightActions(item, closeRow)}
          overshootRight={false}
        >
          <TouchableOpacity 
            style={[styles.deviceItem, themedStyles.card, themedStyles.shadow]} 
            onPress={() => navigation.navigate('DeviceDetail', { device: item })}
          >
            <View style={[styles.deviceIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons 
                name={item.icon} 
                size={24} 
                color={item.color} 
              />
            </View>
            <View style={styles.deviceInfo}>
              <View style={styles.deviceHeader}>
                <Text style={[styles.deviceName, themedStyles.text]}>{(item.kasa_marka || '') + ' ' + (item.kasa_model || '')}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.durum) }]} />
                  <Text style={styles.statusText}>{getStatusText(item.durum)}</Text>
                </View>
              </View>
              <View style={styles.deviceDetails}>
                <Text style={[styles.deviceType, themedStyles.textSecondary]}>{item.tip}</Text>
                <Text style={[styles.deviceLocation, themedStyles.textSecondary]}>{(item.mahkeme_no || '') + ' ' + (item.birim || '')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <>
      <View style={[styles.header, themedStyles.header]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themedStyles.text]}>Tüm Cihazlar</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="search" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.typeCardContainer}
          >
            {DEVICE_TABLES.map((item, index) => (
              <DeviceTypeCard key={item.type + '_' + index} item={item} />
            ))}
          </ScrollView>
        </View>
        
        <FlatList
          data={filteredDevices}
          renderItem={({ item }) => <DeviceItem item={item} />}
          keyExtractor={(item, index) => item.tip + '_' + (item.id ? item.id.toString() : index.toString())}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="desktop-outline" size={50} color={theme.textSecondary} />
              <Text style={[styles.emptyText, themedStyles.text]}>Cihaz bulunamadı</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

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
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  typeCardContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeTitle: {
    marginLeft: 8,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
  },
  deviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceType: {
    fontSize: 14,
  },
  deviceLocation: {
    fontSize: 14,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    width: 100,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  }
});

export default withThemedScreen(AllDevicesScreen); 