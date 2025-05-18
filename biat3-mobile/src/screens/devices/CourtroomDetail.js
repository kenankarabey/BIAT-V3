import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';

const DEVICE_TABS = [
  { key: 'kasa', label: 'Kasa', icon: 'desktop-tower' },
  { key: 'monitor', label: 'Monitör', icon: 'monitor' },
  { key: 'yazici', label: 'Yazıcı', icon: 'printer' },
  { key: 'edurusma', label: 'E-Duruşma', icon: 'laptop' },
  { key: 'segbis', label: 'SEGBİS', icon: 'video' },
  { key: 'mikrofon', label: 'Mikrofon', icon: 'microphone' },
  { key: 'tv', label: 'TV', icon: 'television' },
  { key: 'kamera', label: 'Kamera', icon: 'cctv' },
];

const CourtroomDetail = ({ route, theme, themedStyles }) => {
  const { courtroom } = route.params;
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('kasa');
  const [computers, setComputers] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [edurusma, setEDurusma] = useState([]);
  const [segbis, setSegbis] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [tvs, setTVs] = useState([]);
  const [cameras, setCameras] = useState([]);
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif':
        return '#10b981'; // green
      case 'Arıza':
        return '#ef4444'; // red
      case 'Bakım':
        return '#f59e0b'; // amber
      case 'Pasif':
        return '#64748b'; // slate
      default:
        return '#64748b';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Count total devices
  const getTotalDeviceCount = (devices) => {
    if (!devices) return 0;
    return Object.values(devices).reduce((sum, count) => sum + count, 0);
  };

  // Handle edit courtroom
  const handleEditCourtroom = () => {
    navigation.navigate('CourtroomForm', { 
      editMode: true,
      courtroom: courtroom 
    });
  };
  
  // Handle delete courtroom
  const handleDeleteCourtroom = () => {
    Alert.alert(
      'Salonu Sil',
      `${courtroom.name} salonunu silmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // Delete the courtroom
            navigation.navigate('Courtrooms', { 
              action: 'delete',
              courtroomId: courtroom.id 
            });
          },
        },
      ]
    );
  };
  
  useEffect(() => {
    // Kasa (computers)
    const fetchComputers = async () => {
      console.log('Kasa sorgusu:', {
        oda_tipi: 'Duruşma Salonu',
        birim: courtroom.court,
        mahkeme_no: courtroom.mahkeme_no
      });
      const { data, error } = await supabase
        .from('computers')
        .select('*')
        .eq('oda_tipi', 'Duruşma Salonu')
        .eq('birim', courtroom.court)
        .eq('mahkeme_no', courtroom.mahkeme_no);
      console.log('Kasa sonucu:', data, error);
      if (data && data.length > 0) {
        console.log('İlk kasa:', data[0]);
      }
      setComputers(data || []);
    };
    // Monitör (screens)
    const fetchMonitors = async () => {
      console.log('Monitör sorgusu:', {
        oda_tipi: 'Duruşma Salonu',
        birim: courtroom.court,
        mahkeme_no: courtroom.mahkeme_no
      });
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .eq('oda_tipi', 'Duruşma Salonu')
        .eq('birim', courtroom.court)
        .eq('mahkeme_no', courtroom.mahkeme_no);
      console.log('Monitör sonucu:', data, error);
      if (data && data.length > 0) {
        console.log('İlk monitör:', data[0]);
      }
      setMonitors(data || []);
    };
    fetchComputers();
    fetchMonitors();
    // E-Duruşma
    const fetchEDurusma = async () => {
      const { data, error } = await supabase
        .from('e_durusma')
        .select('*')
        .eq('oda_tipi', 'Duruşma Salonu')
        .eq('birim', courtroom.court)
        .eq('mahkeme_no', courtroom.mahkeme_no);
      console.log('E-Duruşma sonucu:', data, error, 'birim:', courtroom.court, 'mahkeme_no:', courtroom.mahkeme_no);
      setEDurusma(data || []);
    };
    // SEGBİS
    const fetchSegbis = async () => {
      const { data, error } = await supabase
        .from('segbis')
        .select('*')
        .eq('oda_tipi', 'Duruşma Salonu')
        .eq('birim', courtroom.court)
        .eq('mahkeme_no', courtroom.mahkeme_no);
      setSegbis(data || []);
    };
    // Mikrofon
    const fetchMicrophones = async () => {
      const { data, error } = await supabase
        .from('microphones')
        .select('*')
        .eq('oda_tipi', 'Duruşma Salonu')
        .eq('birim', courtroom.court)
        .eq('mahkeme_no', courtroom.mahkeme_no);
      setMicrophones(data || []);
    };
    // TV
    const fetchTVs = async () => {
      const { data, error } = await supabase
        .from('tvs')
        .select('*')
        .eq('oda_tipi', 'Duruşma Salonu')
        .eq('birim', courtroom.court)
        .eq('mahkeme_no', courtroom.mahkeme_no);
      setTVs(data || []);
    };
    // Kamera
    const fetchCameras = async () => {
      const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .eq('oda_tipi', 'Duruşma Salonu')
        .eq('birim', courtroom.court)
        .eq('mahkeme_no', courtroom.mahkeme_no);
      setCameras(data || []);
    };
    fetchEDurusma();
    fetchSegbis();
    fetchMicrophones();
    fetchTVs();
    fetchCameras();
  }, [courtroom.court, courtroom.mahkeme_no]);
  
  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{courtroom.name} {courtroom.court}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerAction}
              onPress={handleEditCourtroom}
            >
              <MaterialCommunityIcons name="pencil" size={24} color={theme.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerAction}
              onPress={handleDeleteCourtroom}
            >
              <MaterialCommunityIcons name="delete" size={24} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information" size={22} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Salon Bilgileri</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Mahkeme</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{courtroom.court}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Konum</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{courtroom.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Durum</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(courtroom.status) + '20', borderColor: getStatusColor(courtroom.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(courtroom.status) }]}>{courtroom.status}</Text>
              </View>
            </View>
          </View>
          
          {/* Cihazlar ana kartı */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}> 
            <View style={styles.sectionHeader}> 
              <MaterialCommunityIcons name="devices" size={22} color={theme.primary} /> 
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Cihazlar</Text> 
            </View>

            {/* Kasa */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Kasa</Text>
              {computers.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Kasa bulunamadı</Text>
              ) : (
                computers.map(comp => (
                  <TouchableOpacity
                    key={comp.id}
                    style={{
                      backgroundColor: theme.background,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 12,
                      marginBottom: 8,
                    }}
                    onPress={() => navigation.navigate('DeviceDetail', { device: { ...comp, type: 'pc' } })}
                  >
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>{comp.kasa_marka} {comp.kasa_model}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{comp.kasa_seri_no}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Monitör */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Monitör</Text>
              {monitors.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Monitör bulunamadı</Text>
              ) : (
                monitors.map(mon => (
                  <TouchableOpacity
                    key={mon.id}
                    style={{
                      backgroundColor: theme.background,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 12,
                      marginBottom: 8,
                    }}
                    onPress={() => navigation.navigate('DeviceDetail', { device: { ...mon, type: 'monitor' } })}
                  >
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>{mon.ekran_marka} {mon.ekran_model}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{mon.ekran_seri_no}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* E-Duruşma */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>E-Duruşma</Text>
              {edurusma.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>E-Duruşma cihazı bulunamadı</Text>
              ) : (
                edurusma.map(item => {
                  const marka = item.e_durusma_marka || item.edurusma_marka || item.marka || '';
                  const model = item.e_durusma_model || item.edurusma_model || item.model || '';
                  const seriNo = item.e_durusma_seri_no || item.edurusma_seri_no || item.seri_no || '';
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={{
                        backgroundColor: theme.background,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: theme.border,
                        padding: 12,
                        marginBottom: 8,
                      }}
                      onPress={() => navigation.navigate('DeviceDetail', { device: { ...item, type: 'hearing' } })}
                    >
                      <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>{marka} {model}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{seriNo}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* SEGBİS */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>SEGBİS</Text>
              {segbis.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>SEGBİS cihazı bulunamadı</Text>
              ) : (
                segbis.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: theme.background,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 12,
                      marginBottom: 8,
                    }}
                    onPress={() => navigation.navigate('DeviceDetail', { device: { ...item, type: 'segbis' } })}
                  >
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>{item.segbis_marka || item.marka || ''} {item.segbis_model || item.model || ''}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{item.segbis_seri_no || item.seri_no || ''}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Mikrofon */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Mikrofon</Text>
              {microphones.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Mikrofon bulunamadı</Text>
              ) : (
                microphones.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: theme.background,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 12,
                      marginBottom: 8,
                    }}
                    onPress={() => navigation.navigate('DeviceDetail', { device: { ...item, type: 'microphone' } })}
                  >
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>{item.mikrofon_marka || item.marka || ''} {item.mikrofon_model || item.model || ''}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{item.mikrofon_seri_no || item.seri_no || ''}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* TV */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>TV</Text>
              {tvs.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>TV bulunamadı</Text>
              ) : (
                tvs.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: theme.background,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 12,
                      marginBottom: 8,
                    }}
                    onPress={() => navigation.navigate('DeviceDetail', { device: { ...item, type: 'tv' } })}
                  >
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>{item.tv_marka || item.marka || ''} {item.tv_model || item.model || ''}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{item.tv_seri_no || item.seri_no || ''}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Kamera */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Kamera</Text>
              {cameras.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Kamera bulunamadı</Text>
              ) : (
                cameras.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: theme.background,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 12,
                      marginBottom: 8,
                    }}
                    onPress={() => navigation.navigate('DeviceDetail', { device: { ...item, type: 'kamera' } })}
                  >
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 15 }}>{item.kamera_marka || item.marka || ''} {item.kamera_model || item.model || ''}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{item.kamera_seri_no || item.seri_no || ''}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
          
          {/* Notes */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="note-text" size={22} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Notlar</Text>
            </View>
            
            {courtroom.notes ? (
              <Text style={[styles.notesText, { color: theme.text }]}>
                {courtroom.notes}
              </Text>
            ) : (
              <Text style={[styles.emptyNotesText, { color: theme.textSecondary }]}>
                Bu salon için not bulunmamaktadır
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 4,
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceList: {
    marginTop: 4,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    marginLeft: 12,
  },
  deviceCountBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyDevices: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyDevicesText: {
    fontSize: 14,
    marginTop: 8,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyNotesText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default withThemedScreen(CourtroomDetail); 