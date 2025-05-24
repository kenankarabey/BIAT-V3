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
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import withThemedScreen from '../../components/withThemedScreen';
import ModalSelector from 'react-native-modal-selector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';

const IssueReportScreen = ({ route, theme }) => {
  const navigation = useNavigation();
  const { editIssue } = route?.params || {};
  const isEditMode = !!editIssue;

  // Form state
  const [title, setTitle] = useState(editIssue?.title || '');
  const [description, setDescription] = useState(editIssue?.description || '');
  const [location, setLocation] = useState(editIssue?.location || '');
  const [deviceType, setDeviceType] = useState(editIssue?.deviceType || '');
  const [deviceId, setDeviceId] = useState(editIssue?.deviceId || '');
  const [status, setStatus] = useState(editIssue?.ariza_durumu || editIssue?.status || 'Beklemede');
  const [priority, setPriority] = useState(editIssue?.priority || 'Orta');
  const [images, setImages] = useState(editIssue?.images || []);
  const [updating, setUpdating] = useState(false);

  // Form validasyonu
  const [errors, setErrors] = useState({});

  // Mock device types for dropdown
  const deviceTypes = [
    { label: 'Seçiniz...', value: '' },
    { label: 'Bilgisayar', value: 'Bilgisayar' },
    { label: 'Monitör', value: 'Monitör' },
    { label: 'Projeksiyon', value: 'Projeksiyon' },
    { label: 'Ses Sistemi', value: 'Ses Sistemi' },
    { label: 'Kamera', value: 'Kamera' },
  ];

  // Mock statuses for dropdown
  const statuses = [
    { label: 'Açık', value: 'Açık' },
    { label: 'İşlemde', value: 'İşlemde' },
    { label: 'Çözüldü', value: 'Çözüldü' },
    { label: 'Kapatıldı', value: 'Kapatıldı' },
  ];

  // Mock priorities for dropdown
  const priorities = [
    { label: 'Düşük', value: 'Düşük' },
    { label: 'Orta', value: 'Orta' },
    { label: 'Yüksek', value: 'Yüksek' },
    { label: 'Kritik', value: 'Kritik' },
  ];

  // Form validasyonu yap
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Başlık gereklidir.';
    }

    if (!description.trim()) {
      newErrors.description = 'Açıklama gereklidir.';
    }

    if (!location.trim()) {
      newErrors.location = 'Konum gereklidir.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Öncelik değiştir
  const togglePriority = (newPriority) => {
    setPriority(newPriority);
  };

  // Fotoğraf ekle
  const handleAddPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Fotoğraf ekleyebilmek için galeri erişim izni gereklidir.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setImages([...images, newImage]);
      }
    } catch (error) {
      console.error('Fotoğraf ekleme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf eklenirken bir hata oluştu.');
    }
  };

  // Kamera ile fotoğraf çek
  const handleTakePhoto = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!cameraPermission.granted) {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekebilmek için kamera erişim izni gereklidir.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
        };
        setImages([...images, newImage]);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    }
  };

  // Fotoğraf sil
  const handleDeleteImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
  };

  // Kaydet
  const handleSave = async () => {
    setUpdating(true);
    try {
      // Kullanıcı adını çek
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const currentUserName = user?.ad_soyad || '';
      if (status === 'Çözüldü' && editIssue.ariza_durumu !== 'Çözüldü') {
        // Kayıt ariza_bildirimleri'nden sil, cozulen_arizalar'a ekle
        const newSolved = {
          ariza_no: editIssue.ariza_no,
          arizayi_bildiren_personel: editIssue.arizayi_bildiren_personel,
          arizayi_cozen_personel: currentUserName,
          telefon: editIssue.telefon,
          cozulme_tarihi: new Date().toISOString(),
          ariza_durumu: 'Çözüldü',
          ariza_aciklamasi: editIssue.ariza_aciklamasi,
          foto_url: editIssue.foto_url,
        };
        // 1. cozulen_arizalar tablosuna ekle
        const { error: insertError } = await supabase
          .from('cozulen_arizalar')
          .insert([newSolved]);
        console.log('cozulen_arizalar insert error:', insertError);
        // 2. ariza_bildirimleri tablosundan sil
        const { error: deleteError } = await supabase
          .from('ariza_bildirimleri')
          .delete()
          .eq('id', editIssue.id);
        if (!insertError && !deleteError) {
          Alert.alert('Başarılı', 'Durum güncellendi.');
          navigation.goBack();
        } else {
          Alert.alert('Hata', 'Kayıt güncellenemedi.');
        }
      } else if (editIssue.ariza_durumu === 'Çözüldü' && status === 'İptal Edildi') {
        // Çözülen arızayı iptal edildi olarak güncelle
        const { error } = await supabase
          .from('cozulen_arizalar')
          .update({ ariza_durumu: 'İptal Edildi' })
          .eq('id', editIssue.id);
        if (!error) {
          Alert.alert('Başarılı', 'Durum güncellendi.');
          navigation.goBack();
        } else {
          Alert.alert('Hata', 'Kayıt güncellenemedi.');
        }
      } else {
        // Sadece ariza_bildirimleri tablosunda güncelle
        const { error } = await supabase
          .from('ariza_bildirimleri')
          .update({ ariza_durumu: status })
          .eq('id', editIssue.id);
        if (!error) {
          Alert.alert('Başarılı', 'Durum güncellendi.');
          navigation.goBack();
        } else {
          Alert.alert('Hata', 'Kayıt güncellenemedi.');
        }
      }
    } catch (e) {
      Alert.alert('Hata', 'Bir hata oluştu.');
    } finally {
      setUpdating(false);
    }
  };

  const renderField = (label, value, setValue, placeholder, multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          multiline && styles.textArea,
          errors[label.toLowerCase().replace(/\s+/g, '')] && styles.inputError,
          { 
            backgroundColor: theme.inputBg, 
            borderColor: theme.border,
            color: theme.text
          }
        ]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      {errors[label.toLowerCase().replace(/\s+/g, '')] && (
        <Text style={styles.errorText}>{errors[label.toLowerCase().replace(/\s+/g, '')]}</Text>
      )}
    </View>
  );

  const renderPickerField = (label, value, setValue, items) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => setValue(itemValue)}
          style={styles.picker}
          dropdownIconColor={theme.text}
          itemStyle={{ color: theme.text }}
        >
          {items.map((item) => (
            <Picker.Item 
              key={item.value} 
              label={item.label} 
              value={item.value} 
              color={theme.text}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  // Eğer edit modunda ve ariza_durumu Beklemede/İşlemde/İptal Edildi/Çözüldü ise özel detay görünümünü göster
  if (isEditMode && ['Beklemede', 'İşlemde', 'İptal Edildi', 'Çözüldü'].includes(editIssue.ariza_durumu)) {
    // ModalSelector seçeneklerini duruma göre ayarla
    const statusOptions =
      status === 'Çözüldü'
        ? [
            { key: 'Çözüldü', label: 'Çözüldü' },
            { key: 'İptal Edildi', label: 'İptal Edildi' },
          ]
        : [
            { key: 'Beklemede', label: 'Beklemede' },
            { key: 'İşlemde', label: 'İşlemde' },
            { key: 'Çözüldü', label: 'Çözüldü' },
            { key: 'İptal Edildi', label: 'İptal Edildi' },
          ];
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}> 
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Arıza Kaydını Düzenle</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 16 }}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            <InfoRow label="Arıza No" value={editIssue.ariza_no} theme={theme} item={editIssue} />
            <Divider theme={theme} />
            <InfoRow label="Arızayı Bildiren" value={editIssue.arizayi_bildiren_personel} theme={theme} item={editIssue} />
            <Divider theme={theme} />
            {status === 'Çözüldü' && (
              <>
                <InfoRow label="Arızayı Çözen" value={editIssue.arizayi_cozen_personel} theme={theme} item={editIssue} />
                <Divider theme={theme} />
              </>
            )}
            <InfoRow label="Telefon" value={editIssue.telefon} theme={theme} item={editIssue} />
            <Divider theme={theme} />
            <InfoRow label="Tarih" value={editIssue.tarih} theme={theme} item={editIssue} />
            <Divider theme={theme} />
            <InfoRow label="Durum" value={status} theme={theme} item={editIssue} />
            <Divider theme={theme} />
            <InfoRow label="Açıklama" value={editIssue.ariza_aciklamasi} theme={theme} multiline item={editIssue} />
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginBottom: 8 }]}>Fotoğraf</Text>
              {editIssue.foto_url ? (
                <Image source={{ uri: editIssue.foto_url }} style={styles.photo} resizeMode="cover" />
              ) : (
                <Text style={{ color: theme.textSecondary }}>Fotoğraf yok</Text>
              )}
            </View>
          </View>
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginBottom: 8 }]}>Durum</Text>
            <ModalSelector
              data={statusOptions}
              initValue={status}
              selectedKey={status}
              disabled={updating}
              onChange={option => setStatus(option.key)}
              style={{ backgroundColor: theme.inputBg, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}
              selectStyle={{ backgroundColor: theme.inputBg, borderRadius: 8, borderWidth: 0, padding: 12 }}
              optionTextStyle={{ color: theme.text }}
              optionContainerStyle={{ backgroundColor: theme.card }}
              initValueTextStyle={{ color: theme.text }}
              selectedItemTextStyle={{ color: theme.primary }}
              cancelText="Kapat"
            />
          </View>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: theme.primary, marginTop: 24 }]}
            onPress={handleSave}
            disabled={updating}
          >
            <Text style={styles.submitButtonText}>{updating ? 'Güncelleniyor...' : 'Güncelle'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isEditMode ? 'Arıza Kaydını Düzenle' : 'Yeni Arıza Bildir'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            {renderField('Başlık', title, setTitle, 'Arıza başlığını girin')}
            {renderField('Açıklama', description, setDescription, 'Arıza detaylarını girin', true)}
            {renderField('Konum', location, setLocation, 'Arızanın olduğu konumu girin')}
            {renderPickerField('Cihaz Türü', deviceType, setDeviceType, deviceTypes)}
            {renderField('Cihaz ID', deviceId, setDeviceId, 'Cihaz ID/Seri No (opsiyonel)')}
            
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Öncelik</Text>
              <View style={styles.priorityButtonsContainer}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityButton,
                      { 
                        backgroundColor: priority === p.value 
                          ? getPriorityBackgroundColor(p.value) 
                          : theme.inputBg 
                      }
                    ]}
                    onPress={() => setPriority(p.value)}
                  >
                    <Text 
                      style={[
                        styles.priorityButtonText, 
                        { color: priority === p.value ? getPriorityColor(p.value) : theme.textSecondary }
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {isEditMode && (
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Durum</Text>
                <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Picker
                    selectedValue={status}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={theme.text}
                    itemStyle={{ color: theme.text }}
                  >
                    {statuses.map((item) => (
                      <Picker.Item 
                        key={item.value} 
                        label={item.label} 
                        value={item.value} 
                        color={theme.text}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Fotoğraflar</Text>
              <View style={styles.photoButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.photoButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]} 
                  onPress={handleAddPhoto}
                >
                  <MaterialCommunityIcons name="image-plus" size={20} color={theme.primary} />
                  <Text style={[styles.photoButtonText, { color: theme.text }]}>Galeriden Seç</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.photoButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]} 
                  onPress={handleTakePhoto}
                >
                  <MaterialCommunityIcons name="camera" size={20} color={theme.primary} />
                  <Text style={[styles.photoButtonText, { color: theme.text }]}>Fotoğraf Çek</Text>
                </TouchableOpacity>
              </View>

              {images.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.photosContainer}
                >
                  {images.map((image) => (
                    <View key={image.id} style={styles.photoContainer}>
                      <Image source={{ uri: image.uri }} style={styles.photo} />
                      <TouchableOpacity 
                        style={styles.deletePhotoButton}
                        onPress={() => handleDeleteImage(image.id)}
                      >
                        <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Güncelle' : 'Arıza Bildir'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Düşük':
      return '#10b981'; // green
    case 'Orta':
      return '#0ea5e9'; // sky
    case 'Yüksek':
      return '#f59e0b'; // amber
    case 'Kritik':
      return '#ef4444'; // red
    default:
      return '#cbd5e1'; // slate
  }
};

const getPriorityBackgroundColor = (priority) => {
  switch (priority) {
    case 'Düşük':
      return '#dcfce7'; // green-100
    case 'Orta':
      return '#e0f2fe'; // sky-100
    case 'Yüksek':
      return '#fef3c7'; // amber-100
    case 'Kritik':
      return '#fee2e2'; // red-100
    default:
      return '#f1f5f9'; // slate-100
  }
};

const InfoRow = ({ label, value, theme, multiline, item }) => {
  // Tarih alanı için Türkçe formatlama
  let displayValue = value;
  if (label === 'Tarih') {
    if (item && item.ariza_durumu === 'Çözüldü' && item.cozulme_tarihi) {
      displayValue = formatDate(item.cozulme_tarihi);
    } else if (value) {
      displayValue = formatDate(value);
    }
  }
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={multiline ? 4 : 1}>{displayValue || '-'}</Text>
    </View>
  );
};

// Türkçe tarih formatlama fonksiyonu
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

const Divider = ({ theme }) => (
  <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 2 }} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  priorityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  photoButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  photoContainer: {
    marginRight: 10,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  value: {
    fontSize: 15,
    fontWeight: '400',
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
});

export default withThemedScreen(IssueReportScreen); 