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

const DeviceFormScreen = ({ route, navigation, theme }) => {
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
    
    // Barcode and QR code will be generated when saved
    barcodeValue: '',
    qrValue: '',
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
        barcodeValue: device.barcodeValue || '',
        qrValue: device.qrValue || '',
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

  // Generate a random alphanumeric string with the given length
  const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Generate barcode and QR codes based on device info
  const generateCodes = (deviceData) => {
    // Create a timestamp for uniqueness
    const timestamp = new Date().getTime();
    
    // Create a base string using device type, brand, model and timestamp
    const baseString = `${deviceType.id}-${deviceData.brand}-${deviceData.model}-${timestamp}`;
    
    // For barcode, we need a simpler alphanumeric code
    const barcodeValue = `${deviceType.id.toUpperCase()}${generateRandomString(8)}`;
    
    // For QR code, we can include more info in JSON format
    const qrValue = JSON.stringify({
      id: barcodeValue,
      type: deviceType.id,
      brand: deviceData.brand,
      model: deviceData.model,
      serialNumber: deviceData.serialNumber,
      timestamp
    });
    
    return { barcodeValue, qrValue };
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
    
    // Generate unique barcode and QR code values if they don't already exist
    let updatedFormData = { ...formData };
    
    if (!isEditMode || !formData.barcodeValue || !formData.qrValue) {
      const { barcodeValue, qrValue } = generateCodes(formData);
      updatedFormData.barcodeValue = barcodeValue;
      updatedFormData.qrValue = qrValue;
    }
    
    // Save device (just navigation back for now, would normally save to API/database)
    Alert.alert(
      "Başarılı",
      isEditMode ? "Cihaz başarıyla güncellendi" : "Cihaz başarıyla eklendi",
      [
        { 
          text: "Tamam", 
          onPress: () => navigation.navigate('Devices', { updatedDevice: updatedFormData })
        }
      ]
    );
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
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
                placeholderTextColor={theme.textSecondary}
                color={theme.text}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Marka *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => handleInputChange('brand', text)}
                placeholder="Cihazın markasını girin"
                placeholderTextColor={theme.textSecondary}
                color={theme.text}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Model *</Text>
              <TextInput
                style={styles.input}
                value={formData.model}
                onChangeText={(text) => handleInputChange('model', text)}
                placeholder="Cihazın modelini girin"
                placeholderTextColor={theme.textSecondary}
                color={theme.text}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bulunduğu Yer *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="Cihazın konumunu girin"
                placeholderTextColor={theme.textSecondary}
                color={theme.text}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Durum</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                  style={styles.picker}
                  dropdownIconColor={theme.text}
                  itemStyle={{color: theme.text}}
                >
                  <Picker.Item label="Aktif" value="Active" color={theme.text} />
                  <Picker.Item label="Arızalı" value="Broken" color={theme.text} />
                  <Picker.Item label="Tamir Bekliyor" value="Waiting" color={theme.text} />
                  <Picker.Item label="Hurda" value="Scrap" color={theme.text} />
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
                  placeholderTextColor={theme.textSecondary}
                  color={theme.text}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ünvanı *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.userTitle}
                  onChangeText={(text) => handleInputChange('userTitle', text)}
                  placeholder="Kullanıcının ünvanını girin"
                  placeholderTextColor={theme.textSecondary}
                  color={theme.text}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Sicil Numarası *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.userRegistrationNumber}
                  onChangeText={(text) => handleInputChange('userRegistrationNumber', text)}
                  placeholder="Kullanıcının sicil numarasını girin"
                  placeholderTextColor={theme.textSecondary}
                  color={theme.text}
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

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.dark ? 0.3 : 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.text,
  },
  pickerContainer: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: theme.text,
  },
  submitButton: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default withThemedScreen(DeviceFormScreen); 