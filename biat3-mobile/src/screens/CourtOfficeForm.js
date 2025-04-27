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

const CourtOfficeForm = ({ route, navigation, theme, themedStyles }) => {
  // Eğer düzenleme modundaysa office parametresi olacak
  const { office } = route.params || {};
  const isEditMode = !!office;
  
  // Tüm mahkeme türleri
  const courtTypes = [
    'Asliye Hukuk', 'Sulh Hukuk', 'Asliye Ceza', 'Ağır Ceza', 
    'İcra', 'İş', 'Ticaret', 'Aile', 'Diğer'
  ];
  
  // Form durumu
  const [formData, setFormData] = useState({
    name: '',
    type: 'Asliye Hukuk',
    location: '',
    status: 'Aktif',
    deviceCount: {
      pc: 0,
      printer: 0,
      other: 0
    },
    lastCheck: new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  });
  
  // Eğer düzenleme modundaysa, verileri form ile doldur
  useEffect(() => {
    if (isEditMode && office) {
      setFormData({
        name: office.name || '',
        type: office.type || 'Asliye Hukuk',
        location: office.location || '',
        status: office.status || 'Aktif',
        deviceCount: {
          pc: office.deviceCount?.pc || 0,
          printer: office.deviceCount?.printer || 0,
          other: office.deviceCount?.other || 0
        },
        lastCheck: office.lastCheck || new Date().toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      });
    }
  }, [isEditMode, office]);
  
  // Form alanı değişikliklerini işle
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // Nested field (deviceCount.pc gibi)
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Normal field
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };
  
  // Formu gönderme
  const handleSubmit = () => {
    // Zorunlu alanları kontrol et
    if (!formData.name || !formData.type || !formData.location) {
      Alert.alert(
        "Eksik Bilgi",
        "Lütfen tüm zorunlu alanları doldurun",
        [{ text: "Tamam" }]
      );
      return;
    }
    
    // Formun başarıyla gönderildiğini bildir
    Alert.alert(
      "Başarılı",
      isEditMode ? "Mahkeme kalemi güncellendi" : "Mahkeme kalemi eklendi",
      [
        { 
          text: "Tamam", 
          onPress: () => navigation.navigate('CourtOffices')
        }
      ]
    );
  };
  
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
              <Text style={[styles.label, themedStyles.textSecondary]}>Mahkeme Adı *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Mahkeme adını girin"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Mahkeme Türü *</Text>
              <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  style={[styles.picker, { color: theme.text }]}
                  dropdownIconColor={theme.text}
                >
                  {courtTypes.map(type => (
                    <Picker.Item key={type} label={type} value={type} color={theme.text} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Konum *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="Mahkemenin konumunu girin"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Durum</Text>
              <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  style={[styles.picker, { color: theme.text }]}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Aktif" value="Aktif" color={theme.text} />
                  <Picker.Item label="Bakım" value="Bakım" color={theme.text} />
                  <Picker.Item label="Arıza" value="Arıza" color={theme.text} />
                </Picker>
              </View>
            </View>
          </View>
          
          <View style={[styles.formSection, themedStyles.card, themedStyles.shadow]}>
            <Text style={[styles.sectionTitle, themedStyles.text]}>Cihaz Sayıları</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Bilgisayar Sayısı</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                value={String(formData.deviceCount.pc)}
                onChangeText={(text) => handleInputChange('deviceCount.pc', parseInt(text) || 0)}
                placeholder="PC sayısını girin"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Yazıcı Sayısı</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                value={String(formData.deviceCount.printer)}
                onChangeText={(text) => handleInputChange('deviceCount.printer', parseInt(text) || 0)}
                placeholder="Yazıcı sayısını girin"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Diğer Cihaz Sayısı</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                value={String(formData.deviceCount.other)}
                onChangeText={(text) => handleInputChange('deviceCount.other', parseInt(text) || 0)}
                placeholder="Diğer cihaz sayısını girin"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
  },
  picker: {
    height: 50,
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