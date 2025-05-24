import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import withThemedScreen from '../components/withThemedScreen';
import { supabase } from '../supabaseClient';
import ModalSelector from 'react-native-modal-selector';

const CourtOfficeForm = ({ route, navigation, theme, themedStyles }) => {
  // Eğer düzenleme modundaysa office parametresi olacak
  const { office } = route.params || {};
  const isEditMode = !!office;
  
  // Tüm mahkeme türleri
  const courtTypes = [
    'Sulh Hukuk Mahkemesi',
    'Hukuk Ön Büro',
    'Hukuk Vezne',
    'Asliye Hukuk Mahkemesi',
    'Tüketici Mahkemesi',
    'Kadastro Mahkemesi',
    'İş Mahkemesi',
    'Aile Mahkemesi',
    'Ağır Ceza Mahkemesi',
    'Adalet Komisyonu Başkanlığı',
    'Sulh Ceza Hakimliği',
    'İnfaz Hakimliği',
    'Çocuk Mahkemesi',
    'Savcılık İnfaz Bürosu',
    'Asliye Ceza Mahkemesi',
    'Adli Destek ve Mağdur Hizmetleri Müdürlüğü ve Görüşme Odaları',
    'Ceza Ön Büro',
    'Ceza Vezne',
    'Soruşturma Bürosu',
    'İdari İşler Müdürlüğü',
    'Müracaat Bürosu',
    'Muhabere Bürosu',
    'Talimat Bürosu',
    'Emanet Bürosu',
    'Nöbetçi Sulh Ceza Hakimliği',
    'Cumhuriyet Başsavcılığı',
    'Bakanlık Muhabere Bürosu',
    'CMK',
    'Maaş',
    'İcra Müdürlüğü',
    'Adli Sicil Şefliği',
    'İcra Hukuk Mahkemesi',
    'İcra Ceza Mahkemesi'
  ];
  
  const bloklar = ['A Blok', 'B Blok', 'C Blok', 'D Blok'];
  const katlar = ['1. Kat', '2. Kat', '3. Kat', '4. Kat', '5. Kat', '6. Kat', '7. Kat', '8. Kat', '9. Kat'];
  
  // Form durumu
  const [formData, setFormData] = useState({
    id: '',
    mahkeme_turu: '',
    mahkeme_no: '',
    blok: '',
    kat: '',
    mahkeme_hakimi: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showCourtType, setShowCourtType] = useState(false);
  const [showBlok, setShowBlok] = useState(false);
  const [showKat, setShowKat] = useState(false);
  
  // Eğer düzenleme modundaysa, verileri form ile doldur
  useEffect(() => {
    if (isEditMode && office) {
      setFormData({ ...office });
    }
  }, [isEditMode, office]);
  
  // Form alanı değişikliklerini işle
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.mahkeme_turu) newErrors.mahkeme_turu = 'Mahkeme türü gerekli';
    if (!formData.mahkeme_no) newErrors.mahkeme_no = 'Mahkeme no gerekli';
    if (!formData.blok) newErrors.blok = 'Blok gerekli';
    if (!formData.kat) newErrors.kat = 'Kat gerekli';
    if (!formData.mahkeme_hakimi) newErrors.mahkeme_hakimi = 'Mahkeme hakimi gerekli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Formu gönderme
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (isEditMode) {
      // Güncelle
      const { error } = await supabase
        .from('mahkeme_kalemleri')
        .update(formData)
        .eq('id', formData.id);
      if (!error) {
        Alert.alert(
          'Başarılı',
          'Mahkeme kalemi başarıyla güncellendi.',
          [
            {
              text: 'Tamam',
              onPress: () => {
                navigation.navigate('CourtOfficeDetail', { office: formData, refresh: true });
              },
            },
          ]
        );
      }
      else Alert.alert('Hata', 'Güncelleme başarısız');
    } else {
      // Ekle
      const { error } = await supabase
        .from('mahkeme_kalemleri')
        .insert([{ ...formData }]);
      if (!error) navigation.goBack();
      else Alert.alert('Hata', 'Ekleme başarısız');
    }
  };
  
  // Mahkeme Türü için ModalSelector kullanımı
  const courtTypeData = courtTypes.map((type, idx) => ({ key: idx, label: type }));
  
  const isDark = theme?.isDark;
  const boxStyle = {
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: isDark ? '#161a4a' : '#fff',
    paddingHorizontal: 12,
    paddingVertical: 0,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  };
  const inputCustom = {
    color: isDark ? '#fff' : '#222',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  };
  const modalOptionContainer = {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
  };
  const modalOptionText = {
    color: isDark ? '#fff' : theme.text,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  };
  const modalCancelText = {
    color: isDark ? '#fff' : theme.text,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  };
  const modalOverlay = {
    backgroundColor: 'rgba(22,26,74,0.7)',
  };
  
  const inputBgColor = isDark ? '#23272e' : theme.inputBg;
  const inputTextColor = isDark ? '#111' : theme.text;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.header, themedStyles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themedStyles.text]}>
            {isEditMode ? 'Mahkeme Kalemi Düzenle' : 'Yeni Mahkeme Kalemi Ekle'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={[styles.formSection, themedStyles.card, themedStyles.shadow]}>
            <Text style={[styles.sectionTitle, themedStyles.text]}>Mahkeme Bilgileri</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Mahkeme Türü *</Text>
              <TouchableOpacity style={[styles.input, { backgroundColor: inputBgColor, borderColor: errors.mahkeme_turu ? '#ef4444' : theme.border }]} onPress={() => setShowCourtType(true)}>
                <Text style={{ color: inputTextColor, fontSize: 16 }}>{formData.mahkeme_turu || 'Mahkeme Türü Seçin'}</Text>
              </TouchableOpacity>
              <ModalSelector
                data={courtTypeData}
                visible={showCourtType}
                onChange={option => { setShowCourtType(false); handleChange('mahkeme_turu', option.label); }}
                onModalClose={() => setShowCourtType(false)}
                optionContainerStyle={modalOptionContainer}
                optionTextStyle={modalOptionText}
                cancelTextStyle={modalCancelText}
                overlayStyle={modalOverlay}
                cancelText="Vazgeç"
                selectedKey={courtTypes.indexOf(formData.mahkeme_turu)}
                value={formData.mahkeme_turu}
                style={{ borderWidth: 0, borderColor: 'transparent' }}
                customSelector={<View />}
              />
              {errors.mahkeme_turu && <Text style={styles.errorText}>{errors.mahkeme_turu}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Mahkeme No *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBgColor, borderColor: errors.mahkeme_no ? '#ef4444' : theme.border, color: inputTextColor }]}
                value={formData.mahkeme_no}
                onChangeText={text => handleChange('mahkeme_no', text)}
                placeholder="Mahkeme No"
                placeholderTextColor={isDark ? '#888' : theme.textSecondary}
                keyboardType="default"
              />
              {errors.mahkeme_no && <Text style={styles.errorText}>{errors.mahkeme_no}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Blok *</Text>
              <TouchableOpacity style={[styles.input, { backgroundColor: inputBgColor, borderColor: errors.blok ? '#ef4444' : theme.border }]} onPress={() => setShowBlok(true)}>
                <Text style={{ color: inputTextColor, fontSize: 16 }}>{formData.blok || 'Blok Seçin'}</Text>
              </TouchableOpacity>
              <ModalSelector
                data={bloklar.map((b, idx) => ({ key: idx, label: b }))}
                visible={showBlok}
                onChange={option => { setShowBlok(false); handleChange('blok', option.label); }}
                onModalClose={() => setShowBlok(false)}
                optionContainerStyle={modalOptionContainer}
                optionTextStyle={modalOptionText}
                cancelTextStyle={modalCancelText}
                overlayStyle={modalOverlay}
                cancelText="Vazgeç"
                selectedKey={bloklar.indexOf(formData.blok)}
                value={formData.blok}
                style={{ borderWidth: 0, borderColor: 'transparent' }}
                customSelector={<View />}
              />
              {errors.blok && <Text style={styles.errorText}>{errors.blok}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Kat *</Text>
              <TouchableOpacity style={[styles.input, { backgroundColor: inputBgColor, borderColor: errors.kat ? '#ef4444' : theme.border }]} onPress={() => setShowKat(true)}>
                <Text style={{ color: inputTextColor, fontSize: 16 }}>{formData.kat || 'Kat Seçin'}</Text>
              </TouchableOpacity>
              <ModalSelector
                data={katlar.map((k, idx) => ({ key: idx, label: k }))}
                visible={showKat}
                onChange={option => { setShowKat(false); handleChange('kat', option.label); }}
                onModalClose={() => setShowKat(false)}
                optionContainerStyle={modalOptionContainer}
                optionTextStyle={modalOptionText}
                cancelTextStyle={modalCancelText}
                overlayStyle={modalOverlay}
                cancelText="Vazgeç"
                selectedKey={katlar.indexOf(formData.kat)}
                value={formData.kat}
                style={{ borderWidth: 0, borderColor: 'transparent' }}
                customSelector={<View />}
              />
              {errors.kat && <Text style={styles.errorText}>{errors.kat}</Text>}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Mahkeme Hakimi *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBgColor, borderColor: errors.mahkeme_hakimi ? '#ef4444' : theme.border, color: inputTextColor }]}
                value={formData.mahkeme_hakimi}
                onChangeText={text => handleChange('mahkeme_hakimi', text)}
                placeholder="Mahkeme Hakimi"
                placeholderTextColor={isDark ? '#888' : theme.textSecondary}
                keyboardType="default"
              />
              {errors.mahkeme_hakimi && <Text style={styles.errorText}>{errors.mahkeme_hakimi}</Text>}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Mahkeme Kalemini Güncelle' : 'Mahkeme Kalemini Ekle'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default withThemedScreen(CourtOfficeForm); 