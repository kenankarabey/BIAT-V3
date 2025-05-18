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
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import withThemedScreen from '../../components/withThemedScreen';
import ModalSelector from 'react-native-modal-selector';
import { supabase } from '../../supabaseClient';

const blockOptions = [
  { label: 'A Blok', value: 'A Blok' },
  { label: 'B Blok', value: 'B Blok' },
  { label: 'C Blok', value: 'C Blok' },
  { label: 'D Blok', value: 'D Blok' },
];

const floorOptions = [
  { label: 'Zemin Kat', value: 'Zemin Kat' },
  { label: '1. Kat', value: '1. Kat' },
  { label: '2. Kat', value: '2. Kat' },
  { label: '3. Kat', value: '3. Kat' },
  { label: '4. Kat', value: '4. Kat' },
  { label: '5. Kat', value: '5. Kat' },
  { label: '6. Kat', value: '6. Kat' },
  { label: '7. Kat', value: '7. Kat' },
  { label: '8. Kat', value: '8. Kat' },
  { label: '9. Kat', value: '9. Kat' },
  { label: '10. Kat', value: '10. Kat' },
];

const courtOptions = [
  { label: 'Sulh Hukuk Mahkemesi', value: 'Sulh Hukuk Mahkemesi' },
  { label: 'Asliye Hukuk Mahkemesi', value: 'Asliye Hukuk Mahkemesi' },
  { label: 'Tüketici Mahkemesi', value: 'Tüketici Mahkemesi' },
  { label: 'Kadastro Mahkemesi', value: 'Kadastro Mahkemesi' },
  { label: 'İş Mahkemesi', value: 'İş Mahkemesi' },
  { label: 'Aile Mahkemesi', value: 'Aile Mahkemesi' },
  { label: 'Ağır Ceza Mahkemesi', value: 'Ağır Ceza Mahkemesi' },
  { label: 'Adalet Komisyonu Başkanlığı', value: 'Adalet Komisyonu Başkanlığı' },
  { label: 'Sulh Ceza Hakimliği', value: 'Sulh Ceza Hakimliği' },
  { label: 'İnfaz Hakimliği', value: 'İnfaz Hakimliği' },
  { label: 'Çocuk Mahkemesi', value: 'Çocuk Mahkemesi' },
  { label: 'Asliye Ceza Mahkemesi', value: 'Asliye Ceza Mahkemesi' },
  { label: 'İcra Hukuk Mahkemesi', value: 'İcra Hukuk Mahkemesi' },
  { label: 'İcra Ceza Mahkemesi', value: 'İcra Ceza Mahkemesi' },
  { label: 'Nöbetçi Sulh Ceza Hakimliği', value: 'Nöbetçi Sulh Ceza Hakimliği' },
  { label: 'Cumhuriyet Başsavcılığı', value: 'Cumhuriyet Başsavcılığı' },
];

const JudgeRoomForm = ({ route, theme, themedStyles }) => {
  const navigation = useNavigation();
  const { judgeRoom } = route?.params || {};
  const isEditMode = !!judgeRoom;
  const [loading, setLoading] = useState(false);

  // Form state
  const [roomNumber, setRoomNumber] = useState(judgeRoom?.oda_numarasi || '');
  const [blok, setBlok] = useState(judgeRoom?.blok || '');
  const [kat, setKat] = useState(judgeRoom?.kat || '');
  const [errors, setErrors] = useState({});
  
  // Hakimler state'i - her hakim için ayrı state
  const [judges, setJudges] = useState([
    { 
      name: judgeRoom?.hakim1_adisoyadi || '', 
      court: judgeRoom?.hakim1_birimi || '',
      courtNo: judgeRoom?.hakim1_mahkemeno !== undefined && judgeRoom?.hakim1_mahkemeno !== null ? String(judgeRoom?.hakim1_mahkemeno) : ''
    },
    judgeRoom?.hakim2_adisoyadi ? {
      name: judgeRoom?.hakim2_adisoyadi || '',
      court: judgeRoom?.hakim2_birimi || '',
      courtNo: judgeRoom?.hakim2_mahkemeno !== undefined && judgeRoom?.hakim2_mahkemeno !== null ? String(judgeRoom?.hakim2_mahkemeno) : ''
    } : null,
    judgeRoom?.hakim3_adisoyadi ? {
      name: judgeRoom?.hakim3_adisoyadi || '',
      court: judgeRoom?.hakim3_birimi || '',
      courtNo: judgeRoom?.hakim3_mahkemeno !== undefined && judgeRoom?.hakim3_mahkemeno !== null ? String(judgeRoom?.hakim3_mahkemeno) : ''
    } : null,
  ].filter(Boolean));

  // Form validasyonu
  const validateForm = () => {
    const newErrors = {};

    if (!roomNumber.trim()) {
      newErrors.roomNumber = 'Oda numarası gereklidir.';
    }

    if (!blok.trim()) {
      newErrors.blok = 'Blok bilgisi gereklidir.';
    }

    // En az bir hakimin adı girilmiş olmalı
    if (!judges[0]?.name.trim()) {
      newErrors.judges = 'En az bir hakim adı girilmelidir.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kaydet
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const judgeRoomData = {
        oda_numarasi: roomNumber,
        blok,
        kat,
        hakim1_adisoyadi: judges[0]?.name || '',
        hakim1_birimi: judges[0]?.court || '',
        hakim1_mahkemeno: judges[0]?.courtNo ? parseInt(judges[0].courtNo, 10) : null,
        hakim2_adisoyadi: judges[1]?.name || '',
        hakim2_birimi: judges[1]?.court || '',
        hakim2_mahkemeno: judges[1]?.courtNo ? parseInt(judges[1].courtNo, 10) : null,
        hakim3_adisoyadi: judges[2]?.name || '',
        hakim3_birimi: judges[2]?.court || '',
        hakim3_mahkemeno: judges[2]?.courtNo ? parseInt(judges[2].courtNo, 10) : null,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('hakim_odalari')
          .update(judgeRoomData)
          .eq('id', judgeRoom.id);

        if (error) throw error;
        Alert.alert('Başarılı', 'Hakim odası başarıyla güncellendi.');
      } else {
        const { error } = await supabase
          .from('hakim_odalari')
          .insert(judgeRoomData);

        if (error) throw error;
        Alert.alert('Başarılı', 'Hakim odası başarıyla eklendi.');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Hakim odası kaydedilirken hata:', error.message);
      Alert.alert('Hata', 'Hakim odası kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Hakim bilgilerini güncelle
  const updateJudge = (index, field, value) => {
    const updatedJudges = [...judges];
    if (!updatedJudges[index]) {
      updatedJudges[index] = { name: '', court: '', courtNo: '' };
    }
    updatedJudges[index] = { ...updatedJudges[index], [field]: value };
    setJudges(updatedJudges);
  };

  // Hakim sil
  const handleRemoveJudge = (index) => {
    const updatedJudges = judges.filter((_, i) => i !== index);
    setJudges(updatedJudges);
  };

  // Hakim ekle
  const handleAddJudge = () => {
    if (judges.length < 3) {
      setJudges([...judges, { name: '', court: '', courtNo: '' }]);
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
              <Text style={[styles.label, { color: theme.textSecondary }]}>Blok *</Text>
              <ModalSelector
                data={blockOptions.map((item, idx) => ({ key: idx, label: item.label, value: item.value }))}
                initValue="Blok Seçin"
                onChange={option => setBlok(option.value)}
                style={styles.dropdown}
                cancelText="Vazgeç"
                selectedKey={blok}
                value={blok}
              >
                <View style={[
                  styles.input,
                  errors.blok && styles.inputError,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: errors.blok ? "#ef4444" : theme.border,
                    color: theme.text,
                    justifyContent: 'center'
                  }
                ]}>
                  <Text style={[styles.selectText, !blok && styles.selectTextPlaceholder, { color: theme.text }]}>
                    {blok || 'Blok Seçin'}
                  </Text>
                </View>
              </ModalSelector>
              {errors.blok && (
                <Text style={styles.errorText}>{errors.blok}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Kat</Text>
              <ModalSelector
                data={floorOptions.map((item, idx) => ({ key: idx, label: item.label, value: item.value }))}
                initValue="Kat Seçin"
                onChange={option => setKat(option.value)}
                style={styles.dropdown}
                cancelText="Vazgeç"
                selectedKey={kat}
                value={kat}
              >
                <View style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: theme.border,
                    color: theme.text,
                    justifyContent: 'center'
                  }
                ]}>
                  <Text style={[styles.selectText, !kat && styles.selectTextPlaceholder, { color: theme.text }]}>
                    {kat || 'Kat Seçin'}
                  </Text>
                </View>
              </ModalSelector>
            </View>
            
            <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.text }]}>Hakimler *</Text>
            
            <View style={styles.judgesContainer}>
              {judges.map((judge, index) => (
                <View key={index} style={[styles.judgeFields, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <View style={styles.judgeHeader}>
                    <Text style={[styles.judgeTitle, { color: theme.text }]}>{index + 1}. Hakim</Text>
                    {index > 0 && (
                      <TouchableOpacity 
                        style={styles.removeJudgeButton}
                        onPress={() => handleRemoveJudge(index)}
                      >
                        <MaterialCommunityIcons name="close" size={20} color={theme.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Hakim Adı Soyadı *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: theme.inputBg, 
                          borderColor: theme.border,
                          color: theme.text 
                        }
                      ]}
                      value={judge.name}
                      onChangeText={(value) => updateJudge(index, 'name', value)}
                      placeholder="Hakim adı soyadı girin"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Birim</Text>
                    <ModalSelector
                      data={courtOptions.map((item, idx) => ({ key: idx, label: item.label, value: item.value }))}
                      initValue="Birim Seçin"
                      onChange={option => updateJudge(index, 'court', option.value)}
                      style={styles.dropdown}
                      cancelText="Vazgeç"
                      selectedKey={judge.court}
                      value={judge.court}
                    >
                      <View style={[
                        styles.input,
                        { 
                          backgroundColor: theme.inputBg, 
                          borderColor: theme.border,
                          color: theme.text,
                          justifyContent: 'center'
                        }
                      ]}>
                        <Text style={[styles.selectText, !judge.court && styles.selectTextPlaceholder, { color: theme.text }]}> 
                          {judge.court || 'Birim Seçin'}
                        </Text>
                      </View>
                    </ModalSelector>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Mahkeme No</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: theme.inputBg, 
                          borderColor: theme.border,
                          color: theme.text 
                        }
                      ]}
                      value={judge.courtNo}
                      onChangeText={(value) => updateJudge(index, 'courtNo', value)}
                      placeholder="Mahkeme no girin"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}

              {errors.judges && (
                <Text style={styles.errorText}>{errors.judges}</Text>
              )}
              
              {judges.length < 3 && (
                <TouchableOpacity 
                  style={[styles.addJudgeButton, { backgroundColor: theme.primary }]}
                  onPress={handleAddJudge}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
                  <Text style={styles.addJudgeButtonText}>Hakim Ekle</Text>
                </TouchableOpacity>
              )}
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
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="content-save" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  judgeFields: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  judgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  judgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeJudgeButton: {
    padding: 4,
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
  dropdown: {
    marginBottom: 16,
  },
  selectText: {
    fontSize: 16,
    padding: 2,
  },
  selectTextPlaceholder: {
    color: '#9ca3af',
  }
});

export default withThemedScreen(JudgeRoomForm); 