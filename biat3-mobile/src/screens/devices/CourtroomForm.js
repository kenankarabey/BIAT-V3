import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import withThemedScreen from '../../components/withThemedScreen';
import { supabase } from '../../supabaseClient';


const courtTypes = [
  { label: 'Sulh Hukuk Mahkemesi', value: 'Sulh Hukuk Mahkemesi' },
  { label: 'Asliye Hukuk Mahkemesi', value: 'Asliye Hukuk Mahkemesi' },
  { label: 'Tüketici Mahkemesi', value: 'Tüketici Mahkemesi' },
  { label: 'Kadastro Mahkemesi', value: 'Kadastro Mahkemesi' },
  { label: 'İş Mahkemesi', value: 'İş Mahkemesi' },
  { label: 'Aile Mahkemesi', value: 'Aile Mahkemesi' },
  { label: 'Ağır Ceza Mahkemesi', value: 'Ağır Ceza Mahkemesi' },
  { label: 'Sulh Ceza Hakimliği', value: 'Sulh Ceza Hakimliği' },
  { label: 'İnfaz Hakimliği', value: 'İnfaz Hakimliği' },
  { label: 'Çocuk Mahkemesi', value: 'Çocuk Mahkemesi' },
  { label: 'Asliye Ceza Mahkemesi', value: 'Asliye Ceza Mahkemesi' },
  { label: 'İdari İşler Müdürlüğü', value: 'İdari İşler Müdürlüğü' },
  { label: 'Nöbetçi Sulh Ceza Hakimliği', value: 'Nöbetçi Sulh Ceza Hakimliği' },
  { label: 'İcra Hukuk Mahkemesi', value: 'İcra Hukuk Mahkemesi' },
  { label: 'İcra Ceza Mahkemesi', value: 'İcra Ceza Mahkemesi' },
];
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
const statusOptions = [
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Arızalı', value: 'Arızalı' },
  { label: 'Bakımda', value: 'Bakımda' },
];

const CourtroomForm = ({ theme, navigation }) => {
  const [formData, setFormData] = useState({
    court: '',
    name: '',
    blok: '',
    kat: '',
    status: '',
  });

  const styles = StyleSheet.create({
    formContainer: {
      borderRadius: 16,
      padding: 20,
      marginVertical: 24,
      backgroundColor: theme.isDark ? '#334155' : theme.cardBackground,
      width: '95%',
      maxWidth: 420,
    },
    label: {
      fontSize: 14,
      marginBottom: 6,
      color: theme.text,
      fontWeight: 'bold',
    },
    input: {
      borderWidth: 0,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 0,
      color: theme.text,
      backgroundColor: theme.isDark ? '#475569' : theme.inputBg,
    },
    dropdown: {
      marginBottom: 16,
    },
    selectText: {
      fontSize: 16,
      color: theme.text,
      padding: 2,
    },
    selectTextPlaceholder: {
      color: theme.textSecondary,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 18,
      gap: 12,
    },
    cancelButton: {
      backgroundColor: theme.cardBackground,
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 8,
    },
    cancelButtonText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCancel = () => {
    if (navigation && navigation.goBack) navigation.goBack();
  };

  const handleSave = async () => {
    // Validasyon
    if (!formData.kat || !formData.name || !formData.blok || !formData.status || !formData.court) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    // salon_no int, diğerleri string
    const salon_no = parseInt(formData.name, 10);
    if (isNaN(salon_no)) {
      alert('Salon No sayısal olmalı!');
      return;
    }
    const { data, error } = await supabase.from('durusma_salonlari').insert([
      {
        kat: formData.kat,
        salon_no,
        blok: formData.blok,
        durum: formData.status,
        mahkeme_turu: formData.court,
      }
    ]);
    console.log('Supabase insert response:', { data, error });
    if (!error) {
      if (navigation) {
        navigation.navigate('Courtrooms', { refresh: true });
      }
    } else {
      alert('Kayıt sırasında hata oluştu: ' + (error?.message || JSON.stringify(error)));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Mahkeme Türü</Text>
        <ModalSelector
          data={courtTypes.map((item, idx) => ({ key: idx, label: item.label, value: item.value }))}
          initValue="Mahkeme Türü Seçin"
          onChange={option => handleChange('court', option.value)}
          style={styles.dropdown}
          cancelText="Vazgeç"
          selectedKey={formData.court}
          value={formData.court}
        >
          <View style={styles.input}>
            <Text style={[styles.selectText, !formData.court && styles.selectTextPlaceholder]}>
              {formData.court || 'Mahkeme Türü Seçin'}
            </Text>
          </View>
        </ModalSelector>

        <Text style={styles.label}>Salon No</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={text => handleChange('name', text)}
          placeholder="Salon No Girin"
          placeholderTextColor={theme.textSecondary}
          keyboardType="default"
        />

        <Text style={styles.label}>Blok</Text>
        <ModalSelector
          data={blockOptions.map((item, idx) => ({ key: idx, label: item.label, value: item.value }))}
          initValue="Blok Seçin"
          onChange={option => handleChange('blok', option.value)}
          style={styles.dropdown}
          cancelText="Vazgeç"
          selectedKey={formData.blok}
          value={formData.blok}
        >
          <View style={styles.input}>
            <Text style={[styles.selectText, !formData.blok && styles.selectTextPlaceholder]}>
              {formData.blok || 'Blok Seçin'}
            </Text>
          </View>
        </ModalSelector>

        <Text style={styles.label}>Kat</Text>
        <ModalSelector
          data={floorOptions.map((item, idx) => ({ key: idx, label: item.label, value: item.value }))}
          initValue="Kat Seçin"
          onChange={option => handleChange('kat', option.value)}
          style={styles.dropdown}
          cancelText="Vazgeç"
          selectedKey={formData.kat}
          value={formData.kat}
        >
          <View style={styles.input}>
            <Text style={[styles.selectText, !formData.kat && styles.selectTextPlaceholder]}>
              {formData.kat || 'Kat Seçin'}
            </Text>
          </View>
        </ModalSelector>

        <Text style={styles.label}>Durum</Text>
        <ModalSelector
          data={statusOptions.map((item, idx) => ({ key: idx, label: item.label, value: item.value }))}
          initValue="Durum Seçin"
          onChange={option => handleChange('status', option.value)}
          style={styles.dropdown}
          cancelText="Vazgeç"
          selectedKey={formData.status}
          value={formData.status}
        >
          <View style={styles.input}>
            <Text style={[styles.selectText, !formData.status && styles.selectTextPlaceholder]}>
              {formData.status || 'Durum Seçin'}
            </Text>
          </View>
        </ModalSelector>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default withThemedScreen(CourtroomForm); 
