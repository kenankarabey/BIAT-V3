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

const JudgeRoomForm = ({ route }) => {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Hakim Odası Düzenle' : 'Yeni Hakim Odası'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Temel Bilgiler</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Oda Numarası *</Text>
              <TextInput
                style={[styles.input, errors.roomNumber && styles.inputError]}
                value={roomNumber}
                onChangeText={setRoomNumber}
                placeholder="Oda numarasını girin"
                placeholderTextColor="#94a3b8"
              />
              {errors.roomNumber && (
                <Text style={styles.errorText}>{errors.roomNumber}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mahkeme *</Text>
              <TextInput
                style={[styles.input, errors.court && styles.inputError]}
                value={court}
                onChangeText={setCourt}
                placeholder="Mahkeme adını girin"
                placeholderTextColor="#94a3b8"
              />
              {errors.court && (
                <Text style={styles.errorText}>{errors.court}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Konum</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Kat bilgisi veya konum girin"
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Hakimler *</Text>
            
            <View style={styles.judgesContainer}>
              {judges.length > 0 ? (
                judges.map((judge, index) => (
                  <View key={judge.id} style={styles.judgeItem}>
                    <View style={styles.judgeInfo}>
                      <Text style={styles.judgeName}>{judge.name}</Text>
                      {judge.regId ? (
                        <Text style={styles.judgeId}>Sicil: {judge.regId}</Text>
                      ) : null}
                      {judge.title ? (
                        <Text style={styles.judgeTitle}>{judge.title}</Text>
                      ) : null}
                    </View>
                    <View style={styles.judgeActions}>
                      <TouchableOpacity 
                        style={styles.judgeActionButton}
                        onPress={() => openEditJudgeModal(judge)}
                      >
                        <MaterialCommunityIcons name="pencil" size={18} color="#4f46e5" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.judgeActionButton}
                        onPress={() => handleDeleteJudge(judge.id)}
                      >
                        <MaterialCommunityIcons name="delete" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyJudges}>
                  <Text style={styles.emptyJudgesText}>Henüz hakim eklenmemiş</Text>
                </View>
              )}
              
              {errors.judges && (
                <Text style={styles.errorText}>{errors.judges}</Text>
              )}
              
              <TouchableOpacity 
                style={styles.addJudgeButton}
                onPress={openAddJudgeModal}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
                <Text style={styles.addJudgeButtonText}>Hakim Ekle</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Durum</Text>

            <View style={styles.statusContainer}>
              {['Aktif', 'Bakım', 'Arıza', 'Pasif'].map((statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={[
                    styles.statusOption,
                    status === statusOption && styles.statusOptionSelected,
                    status === statusOption && 
                    { backgroundColor: getStatusBackgroundColor(statusOption) },
                  ]}
                  onPress={() => toggleStatus(statusOption)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === statusOption && styles.statusTextSelected,
                    ]}
                  >
                    {statusOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Cihazlar</Text>

            <View style={styles.devicesContainer}>
              {Object.entries({
                laptop: { icon: 'laptop', label: 'Dizüstü Bilgisayar' },
                monitor: { icon: 'monitor', label: 'Monitör' },
                printer: { icon: 'printer', label: 'Yazıcı' },
              }).map(([key, { icon, label }]) => (
                <View key={key} style={styles.deviceCounterRow}>
                  <View style={styles.deviceInfo}>
                    <MaterialCommunityIcons name={icon} size={22} color="#4f46e5" />
                    <Text style={styles.deviceLabel}>{label}</Text>
                  </View>
                  <View style={styles.counterContainer}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => changeDeviceCount(key, false)}
                    >
                      <MaterialCommunityIcons name="minus" size={18} color="#64748b" />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{devices[key]}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => changeDeviceCount(key, true)}
                    >
                      <MaterialCommunityIcons name="plus" size={18} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Notlar</Text>

            <View style={styles.formGroup}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notlar..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {judgeModalMode === 'add' ? 'Hakim Ekle' : 'Hakim Düzenle'}
                </Text>
                <TouchableOpacity onPress={() => setShowJudgeModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Hakim Adı *</Text>
                  <TextInput
                    style={[styles.input, judgeErrors.judgeName && styles.inputError]}
                    value={judgeName}
                    onChangeText={setJudgeName}
                    placeholder="Hakim adını girin"
                    placeholderTextColor="#94a3b8"
                  />
                  {judgeErrors.judgeName && (
                    <Text style={styles.errorText}>{judgeErrors.judgeName}</Text>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Sicil No</Text>
                  <TextInput
                    style={styles.input}
                    value={judgeId}
                    onChangeText={setJudgeId}
                    placeholder="Sicil numarasını girin"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Unvan</Text>
                  <TextInput
                    style={styles.input}
                    value={judgeTitle}
                    onChangeText={setJudgeTitle}
                    placeholder="Unvan (isteğe bağlı)"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowJudgeModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
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
const getStatusBackgroundColor = (status) => {
  switch (status) {
    case 'Aktif':
      return '#dcfce7';
    case 'Arıza':
      return '#fee2e2';
    case 'Bakım':
      return '#fef3c7';
    case 'Pasif':
      return '#f1f5f9';
    default:
      return '#f1f5f9';
  }
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
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
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
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  judgeInfo: {
    flex: 1,
  },
  judgeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  judgeId: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  judgeTitle: {
    fontSize: 14,
    color: '#64748b',
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
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  emptyJudgesText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  addJudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
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
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  statusOptionSelected: {
    borderColor: '#4f46e5',
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusTextSelected: {
    color: '#1e293b',
    fontWeight: 'bold',
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
    borderBottomColor: '#f1f5f9',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
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
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalContent: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 2,
    padding: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default JudgeRoomForm; 