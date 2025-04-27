import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import withThemedScreen from '../../components/withThemedScreen';

const JudgeRoomForm = ({ route, theme, themedStyles }) => {
  const navigation = useNavigation();
  const { judgeRoom } = route?.params || {};
  const isEditMode = !!judgeRoom;

  // Form state
  const [roomNumber, setRoomNumber] = useState(judgeRoom?.roomNumber || '');
  const [court, setCourt] = useState(judgeRoom?.court || '');
  const [location, setLocation] = useState(judgeRoom?.location || '');
  const [notes, setNotes] = useState(judgeRoom?.notes || '');
  const [status, setStatus] = useState(judgeRoom?.status || 'Aktif');
  
  // Hakimler state'i
  const [judges, setJudges] = useState(judgeRoom?.judges || []);
  
  // Hakim ekleme modal state'i
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [currentJudge, setCurrentJudge] = useState(null);
  const [judgeName, setJudgeName] = useState('');
  const [judgeId, setJudgeId] = useState('');
  const [judgeTitle, setJudgeTitle] = useState('');
  const [judgeModalMode, setJudgeModalMode] = useState('add'); // 'add' veya 'edit'
  
  // Cihaz sayıları
  const [devices, setDevices] = useState({
    laptop: judgeRoom?.devices?.laptop || 0,
    monitor: judgeRoom?.devices?.monitor || 0,
    printer: judgeRoom?.devices?.printer || 0,
  });

  // Form validasyonu
  const [errors, setErrors] = useState({});
  const [judgeErrors, setJudgeErrors] = useState({});

  // Cihaz sayısını değiştir
  const changeDeviceCount = (deviceType, increment) => {
    setDevices(prev => {
      const currentCount = prev[deviceType] || 0;
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
      return { ...prev, [deviceType]: newCount };
    });
  };

  // Form validasyonu yap
  const validateForm = () => {
    const newErrors = {};

    if (!roomNumber.trim()) {
      newErrors.roomNumber = 'Oda numarası gereklidir.';
    }

    if (!court.trim()) {
      newErrors.court = 'Mahkeme adı gereklidir.';
    }
    
    if (judges.length === 0) {
      newErrors.judges = 'En az bir hakim eklemelisiniz.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Hakim form validasyonu
  const validateJudgeForm = () => {
    const newErrors = {};
    
    if (!judgeName.trim()) {
      newErrors.judgeName = 'Hakim adı gereklidir.';
    }
    
    setJudgeErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Durum değiştir
  const toggleStatus = (newStatus) => {
    setStatus(newStatus);
  };
  
  // Hakim ekleme modalını aç
  const openAddJudgeModal = () => {
    setJudgeName('');
    setJudgeId('');
    setJudgeTitle('');
    setJudgeErrors({});
    setJudgeModalMode('add');
    setCurrentJudge(null);
    setShowJudgeModal(true);
  };
  
  // Hakim düzenleme modalını aç
  const openEditJudgeModal = (judge) => {
    setJudgeName(judge.name || '');
    setJudgeId(judge.id || '');
    setJudgeTitle(judge.title || '');
    setJudgeErrors({});
    setJudgeModalMode('edit');
    setCurrentJudge(judge);
    setShowJudgeModal(true);
  };
  
  // Hakim ekle veya düzenle
  const handleSaveJudge = () => {
    if (!validateJudgeForm()) return;
    
    const judgeData = {
      id: judgeModalMode === 'add' ? Date.now().toString() : currentJudge.id,
      name: judgeName,
      regId: judgeId,
      title: judgeTitle,
    };
    
    if (judgeModalMode === 'add') {
      setJudges([...judges, judgeData]);
    } else {
      setJudges(judges.map(j => j.id === currentJudge.id ? judgeData : j));
    }
    
    setShowJudgeModal(false);
  };
  
  // Hakim sil
  const handleDeleteJudge = (judgeId) => {
    Alert.alert(
      'Hakim Sil',
      'Bu hakimi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setJudges(judges.filter(j => j.id !== judgeId));
          }
        }
      ]
    );
  };

  // Kaydet
  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    // Ana hakim adını belirle (ilk hakim)
    const primaryJudge = judges[0] || { name: '', regId: '' };

    const updatedJudgeRoom = {
      id: judgeRoom?.id || Date.now().toString(),
      roomNumber,
      // Geriye dönük uyumluluk için ilk hakimin bilgilerini ana alanlara da koyuyoruz
      judgeName: primaryJudge.name,
      judgeId: primaryJudge.regId,
      judges, // Tüm hakimler listesi
      court,
      location,
      notes,
      status,
      devices,
    };

    if (isEditMode) {
      navigation.navigate('JudgeRooms', { updatedJudgeRoom });
    } else {
      navigation.navigate('JudgeRooms', { newJudgeRoom: updatedJudgeRoom });
    }
  };

  // Durum arka plan rengini belirle
  const getStatusBackgroundColor = (statusValue) => {
    switch (statusValue) {
      case 'Aktif':
        return theme.isDark ? '#064e3b50' : '#dcfce7';
      case 'Arıza':
        return theme.isDark ? '#7f1d1d50' : '#fee2e2';
      case 'Bakım':
        return theme.isDark ? '#78350f50' : '#fef3c7';
      case 'Pasif':
        return theme.isDark ? '#33415550' : '#f1f5f9';
      default:
        return theme.isDark ? '#33415550' : '#f1f5f9';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isEditMode ? 'Hakim Odası Düzenle' : 'Yeni Hakim Odası'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.formContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Temel Bilgiler</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Oda Numarası *</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.roomNumber && styles.inputError, 
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: errors.roomNumber ? "#ef4444" : theme.border,
                    color: theme.text 
                  }
                ]}
                value={roomNumber}
                onChangeText={setRoomNumber}
                placeholder="Oda numarasını girin"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.roomNumber && (
                <Text style={styles.errorText}>{errors.roomNumber}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Mahkeme *</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.court && styles.inputError,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: errors.court ? "#ef4444" : theme.border,
                    color: theme.text 
                  }
                ]}
                value={court}
                onChangeText={setCourt}
                placeholder="Mahkeme adını girin"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.court && (
                <Text style={styles.errorText}>{errors.court}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Konum</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: theme.border,
                    color: theme.text 
                  }
                ]}
                value={location}
                onChangeText={setLocation}
                placeholder="Kat bilgisi veya konum girin"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.text }]}>Hakimler *</Text>
            
            <View style={styles.judgesContainer}>
              {judges.length > 0 ? (
                judges.map((judge, index) => (
                  <View key={judge.id} style={[styles.judgeItem, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                    <View style={styles.judgeInfo}>
                      <Text style={[styles.judgeName, { color: theme.text }]}>{judge.name}</Text>
                      {judge.regId ? (
                        <Text style={[styles.judgeId, { color: theme.textSecondary }]}>Sicil: {judge.regId}</Text>
                      ) : null}
                      {judge.title ? (
                        <Text style={[styles.judgeTitle, { color: theme.textSecondary }]}>{judge.title}</Text>
                      ) : null}
                    </View>
                    <View style={styles.judgeActions}>
                      <TouchableOpacity 
                        style={styles.judgeActionButton}
                        onPress={() => openEditJudgeModal(judge)}
                      >
                        <MaterialCommunityIcons name="pencil" size={18} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.judgeActionButton}
                        onPress={() => handleDeleteJudge(judge.id)}
                      >
                        <MaterialCommunityIcons name="delete" size={18} color={theme.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyJudges, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <Text style={[styles.emptyJudgesText, { color: theme.textSecondary }]}>Henüz hakim eklenmemiş</Text>
                </View>
              )}
              
              {errors.judges && (
                <Text style={styles.errorText}>{errors.judges}</Text>
              )}
              
              <TouchableOpacity 
                style={[styles.addJudgeButton, { backgroundColor: theme.primary }]}
                onPress={openAddJudgeModal}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
                <Text style={styles.addJudgeButtonText}>Hakim Ekle</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.text }]}>Durum</Text>

            <View style={styles.statusContainer}>
              {['Aktif', 'Bakım', 'Arıza', 'Pasif'].map((statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={[
                    styles.statusOption,
                    { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                    status === statusOption && styles.statusOptionSelected,
                    status === statusOption && 
                    { backgroundColor: getStatusBackgroundColor(statusOption), borderColor: getStatusColor(statusOption) },
                  ]}
                  onPress={() => toggleStatus(statusOption)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: theme.textSecondary },
                      status === statusOption && { color: theme.text, fontWeight: 'bold' },
                    ]}
                  >
                    {statusOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.text }]}>Cihazlar</Text>

            <View style={styles.devicesContainer}>
              {Object.entries({
                laptop: { icon: 'laptop', label: 'Dizüstü Bilgisayar' },
                monitor: { icon: 'monitor', label: 'Monitör' },
                printer: { icon: 'printer', label: 'Yazıcı' },
              }).map(([key, { icon, label }]) => (
                <View key={key} style={[styles.deviceCounterRow, { borderBottomColor: theme.border }]}>
                  <View style={styles.deviceInfo}>
                    <MaterialCommunityIcons name={icon} size={22} color={theme.primary} />
                    <Text style={[styles.deviceLabel, { color: theme.text }]}>{label}</Text>
                  </View>
                  <View style={styles.counterContainer}>
                    <TouchableOpacity
                      style={[styles.counterButton, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => changeDeviceCount(key, false)}
                    >
                      <MaterialCommunityIcons name="minus" size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.counterValue, { color: theme.text }]}>{devices[key]}</Text>
                    <TouchableOpacity
                      style={[styles.counterButton, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => changeDeviceCount(key, true)}
                    >
                      <MaterialCommunityIcons name="plus" size={18} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.text }]}>Notlar</Text>

            <View style={styles.formGroup}>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: theme.border,
                    color: theme.text 
                  }
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notlar..."
                placeholderTextColor={theme.textSecondary}
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]} 
            onPress={handleSave}
          >
            <MaterialCommunityIcons name="content-save" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
        
        {/* Hakim Ekleme/Düzenleme Modal */}
        <Modal
          visible={showJudgeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowJudgeModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {judgeModalMode === 'add' ? 'Hakim Ekle' : 'Hakim Düzenle'}
                </Text>
                <TouchableOpacity onPress={() => setShowJudgeModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Hakim Adı *</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      judgeErrors.judgeName && styles.inputError,
                      { 
                        backgroundColor: theme.inputBg, 
                        borderColor: judgeErrors.judgeName ? "#ef4444" : theme.border,
                        color: theme.text 
                      }
                    ]}
                    value={judgeName}
                    onChangeText={setJudgeName}
                    placeholder="Hakim adını girin"
                    placeholderTextColor={theme.textSecondary}
                  />
                  {judgeErrors.judgeName && (
                    <Text style={styles.errorText}>{judgeErrors.judgeName}</Text>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Sicil No</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.inputBg, 
                        borderColor: theme.border,
                        color: theme.text 
                      }
                    ]}
                    value={judgeId}
                    onChangeText={setJudgeId}
                    placeholder="Sicil numarasını girin"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Unvan</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.inputBg, 
                        borderColor: theme.border,
                        color: theme.text 
                      }
                    ]}
                    value={judgeTitle}
                    onChangeText={setJudgeTitle}
                    placeholder="Unvan (isteğe bağlı)"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>
              
              <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
                  onPress={() => setShowJudgeModal(false)}
                >
                  <Text style={[styles.modalCancelButtonText, { color: theme.textSecondary }]}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveButton, { backgroundColor: theme.primary }]}
                  onPress={handleSaveJudge}
                >
                  <Text style={styles.modalSaveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Durum rengini belirle
const getStatusColor = (status) => {
  switch (status) {
    case 'Aktif':
      return '#10b981';
    case 'Arıza':
      return '#ef4444';
    case 'Bakım':
      return '#f59e0b';
    case 'Pasif':
      return '#64748b';
    default:
      return '#64748b';
  }
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
  formContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  judgesContainer: {
    marginBottom: 16,
  },
  judgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  judgeInfo: {
    flex: 1,
  },
  judgeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  judgeId: {
    fontSize: 14,
    marginTop: 2,
  },
  judgeTitle: {
    fontSize: 14,
    marginTop: 2,
    fontStyle: 'italic',
  },
  judgeActions: {
    flexDirection: 'row',
  },
  judgeActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyJudges: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  emptyJudgesText: {
    fontSize: 14,
  },
  addJudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
  },
  addJudgeButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  devicesContainer: {
    marginBottom: 16,
  },
  deviceCounterRow: {
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
  deviceLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelButtonText: {
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default withThemedScreen(JudgeRoomForm); 