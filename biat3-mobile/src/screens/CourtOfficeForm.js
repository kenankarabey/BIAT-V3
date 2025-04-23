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

const CourtOfficeForm = ({ route, navigation }) => {
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Mahkeme Kalemi Düzenle' : 'Yeni Mahkeme Kalemi Ekle'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Mahkeme Bilgileri</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mahkeme Adı *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Mahkeme adını girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mahkeme Türü *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  style={styles.picker}
                >
                  {courtTypes.map(type => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Konum *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="Mahkemenin konumunu girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Durum</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Aktif" value="Aktif" />
                  <Picker.Item label="Bakım" value="Bakım" />
                  <Picker.Item label="Arıza" value="Arıza" />
                </Picker>
              </View>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Cihaz Sayıları</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bilgisayar Sayısı</Text>
              <TextInput
                style={styles.input}
                value={String(formData.deviceCount.pc)}
                onChangeText={(text) => handleInputChange('deviceCount.pc', parseInt(text) || 0)}
                placeholder="PC sayısını girin"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Yazıcı Sayısı</Text>
              <TextInput
                style={styles.input}
                value={String(formData.deviceCount.printer)}
                onChangeText={(text) => handleInputChange('deviceCount.printer', parseInt(text) || 0)}
                placeholder="Yazıcı sayısını girin"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Diğer Cihaz Sayısı</Text>
              <TextInput
                style={styles.input}
                value={String(formData.deviceCount.other)}
                onChangeText={(text) => handleInputChange('deviceCount.other', parseInt(text) || 0)}
                placeholder="Diğer cihaz sayısını girin"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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

export default CourtOfficeForm; 