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

const DeviceFormScreen = ({ route, navigation }) => {
  const { deviceType, device } = route.params;
  const isEditMode = !!device; // Eğer device parametresi varsa düzenleme modundayız
  
  // Form state
  const [formData, setFormData] = useState({
    // Common fields for all devices
    serialNumber: '',
    brand: '',
    model: '',
    location: '',
    status: 'Active',

    // User related fields (only for pc and monitor)
    userName: '',
    userTitle: '',
    userRegistrationNumber: '',
  });

  // Eğer düzenleme modundaysa, formu mevcut cihaz verileriyle doldur
  useEffect(() => {
    if (isEditMode && device) {
      setFormData({
        serialNumber: device.serialNumber || '',
        brand: device.brand || '',
        model: device.model || '',
        location: device.location || '',
        status: device.status || 'Active',
        userName: device.userName || '',
        userTitle: device.userTitle || '',
        userRegistrationNumber: device.userRegistrationNumber || '',
      });
    }
  }, [isEditMode, device]);

  const isUserDevice = ['pc', 'monitor'].includes(deviceType.id);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = () => {
    // Validate required fields based on device type
    const requiredFields = ['serialNumber', 'brand', 'model', 'location'];
    
    if (isUserDevice) {
      requiredFields.push('userName', 'userTitle', 'userRegistrationNumber');
    }
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        "Eksik Bilgi",
        "Lütfen tüm zorunlu alanları doldurun",
        [{ text: "Tamam" }]
      );
      return;
    }
    
    // Save device (just navigation back for now, would normally save to API/database)
    Alert.alert(
      "Başarılı",
      isEditMode ? "Cihaz başarıyla güncellendi" : "Cihaz başarıyla eklendi",
      [
        { 
          text: "Tamam", 
          onPress: () => navigation.navigate('Devices')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? `${deviceType.name} Düzenle` : `${deviceType.name} Ekle`}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Cihaz Bilgileri</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Seri Numarası *</Text>
              <TextInput
                style={styles.input}
                value={formData.serialNumber}
                onChangeText={(text) => handleInputChange('serialNumber', text)}
                placeholder="Cihazın seri numarasını girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Marka *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => handleInputChange('brand', text)}
                placeholder="Cihazın markasını girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Model *</Text>
              <TextInput
                style={styles.input}
                value={formData.model}
                onChangeText={(text) => handleInputChange('model', text)}
                placeholder="Cihazın modelini girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bulunduğu Yer *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="Cihazın konumunu girin"
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
                  <Picker.Item label="Aktif" value="Active" />
                  <Picker.Item label="Arızalı" value="Broken" />
                  <Picker.Item label="Tamir Bekliyor" value="Waiting" />
                  <Picker.Item label="Hurda" value="Scrap" />
                </Picker>
              </View>
            </View>
          </View>
          
          {isUserDevice && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Kullanıcı Bilgileri</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Kullanıcı Adı Soyadı *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.userName}
                  onChangeText={(text) => handleInputChange('userName', text)}
                  placeholder="Cihazı kullanan kişinin adını girin"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ünvanı *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.userTitle}
                  onChangeText={(text) => handleInputChange('userTitle', text)}
                  placeholder="Kullanıcının ünvanını girin"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Sicil Numarası *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.userRegistrationNumber}
                  onChangeText={(text) => handleInputChange('userRegistrationNumber', text)}
                  placeholder="Kullanıcının sicil numarasını girin"
                />
              </View>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Cihazı Kaydet</Text>
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
    backgroundColor: '#0891b2',
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

export default DeviceFormScreen; 