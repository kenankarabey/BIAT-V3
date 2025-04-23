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

const CourtOfficePersonnelForm = ({ route, navigation }) => {
  const { officeId, officeName } = route.params;
  
  // Form verisi
  const [formData, setFormData] = useState({
    name: '',
    title: 'Zabıt Katibi',
    registrationNumber: '',
    computer: {
      selected: false,
      brand: '',
      model: '',
      serialNumber: ''
    },
    monitor: {
      selected: false,
      brand: '',
      model: '',
      serialNumber: ''
    }
  });
  
  // Unvan listesi
  const titles = [
    'Zabıt Katibi',
    'Yazı İşleri Müdürü',
    'Hakim',
    'Cumhuriyet Savcısı',
    'Mübaşir',
    'İcra Memuru',
    'Diğer'
  ];
  
  // Örnek cihaz verileri - Gerçekte API'den alınacak
  const availableComputers = [
    { id: '1', brand: 'HP', model: 'EliteDesk 800 G6', serialNumber: 'HP123456' },
    { id: '2', brand: 'Dell', model: 'OptiPlex 7080', serialNumber: 'DL654321' },
    { id: '3', brand: 'Lenovo', model: 'ThinkCentre M720', serialNumber: 'LN789456' }
  ];
  
  const availableMonitors = [
    { id: '1', brand: 'Dell', model: 'P2419H', serialNumber: 'DM123456' },
    { id: '2', brand: 'HP', model: 'E24 G4', serialNumber: 'HM654321' },
    { id: '3', brand: 'Samsung', model: 'S24R650', serialNumber: 'SM789456' }
  ];
  
  // Form alanı değişikliğini işle
  const handleInputChange = (field, value) => {
    // Nested field kontrolü
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };
  
  // Cihaz seçim/değişim işlemi
  const handleDeviceSelect = (type, device) => {
    setFormData({
      ...formData,
      [type]: {
        selected: true,
        brand: device.brand,
        model: device.model,
        serialNumber: device.serialNumber
      }
    });
  };
  
  // Form gönderme işlemi
  const handleSubmit = () => {
    // Zorunlu alanları kontrol et
    if (!formData.name || !formData.registrationNumber) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm zorunlu alanları doldurun");
      return;
    }
    
    // Özetle bir formun sonucunu göster ve geri dön
    Alert.alert(
      "Personel Eklendi",
      `${formData.name} adlı personel ${officeName} kalemine başarıyla eklendi.`,
      [
        {
          text: "Tamam",
          onPress: () => navigation.goBack()
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
          <Text style={styles.headerTitle}>Personel Ekle</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.infoText}>
            <Text style={styles.infoTextContent}>
              <Text style={styles.officeName}>{officeName}</Text> kalemine yeni personel ekleniyor.
            </Text>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personel Bilgileri</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adı Soyadı *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Personelin adını ve soyadını girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ünvan</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.title}
                  onValueChange={(value) => handleInputChange('title', value)}
                  style={styles.picker}
                >
                  {titles.map(title => (
                    <Picker.Item key={title} label={title} value={title} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Sicil Numarası *</Text>
              <TextInput
                style={styles.input}
                value={formData.registrationNumber}
                onChangeText={(text) => handleInputChange('registrationNumber', text)}
                placeholder="Personel sicil numarasını girin"
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Bilgisayar</Text>
            
            {!formData.computer.selected ? (
              <View style={styles.deviceSelection}>
                <Text style={styles.deviceSelectionText}>Kullanacağı bilgisayarı seçin:</Text>
                {availableComputers.map(computer => (
                  <TouchableOpacity
                    key={computer.id}
                    style={styles.deviceOption}
                    onPress={() => handleDeviceSelect('computer', computer)}
                  >
                    <Ionicons name="desktop-outline" size={22} color="#1e3a8a" style={styles.deviceIcon} />
                    <View style={styles.deviceOptionInfo}>
                      <Text style={styles.deviceOptionTitle}>{computer.brand} {computer.model}</Text>
                      <Text style={styles.deviceOptionSerial}>SN: {computer.serialNumber}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.selectedDevice}>
                <View style={styles.selectedDeviceHeader}>
                  <Text style={styles.selectedDeviceText}>Seçilen Bilgisayar:</Text>
                  <TouchableOpacity
                    onPress={() => handleInputChange('computer.selected', false)}
                    style={styles.changeButton}
                  >
                    <Text style={styles.changeButtonText}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.deviceDetails}>
                  <Ionicons name="desktop-outline" size={22} color="#1e3a8a" style={styles.deviceIcon} />
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceBrandModel}>{formData.computer.brand} {formData.computer.model}</Text>
                    <Text style={styles.deviceSerial}>SN: {formData.computer.serialNumber}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Monitör</Text>
            
            {!formData.monitor.selected ? (
              <View style={styles.deviceSelection}>
                <Text style={styles.deviceSelectionText}>Kullanacağı monitörü seçin:</Text>
                {availableMonitors.map(monitor => (
                  <TouchableOpacity
                    key={monitor.id}
                    style={styles.deviceOption}
                    onPress={() => handleDeviceSelect('monitor', monitor)}
                  >
                    <Ionicons name="tv-outline" size={22} color="#1e3a8a" style={styles.deviceIcon} />
                    <View style={styles.deviceOptionInfo}>
                      <Text style={styles.deviceOptionTitle}>{monitor.brand} {monitor.model}</Text>
                      <Text style={styles.deviceOptionSerial}>SN: {monitor.serialNumber}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.selectedDevice}>
                <View style={styles.selectedDeviceHeader}>
                  <Text style={styles.selectedDeviceText}>Seçilen Monitör:</Text>
                  <TouchableOpacity
                    onPress={() => handleInputChange('monitor.selected', false)}
                    style={styles.changeButton}
                  >
                    <Text style={styles.changeButtonText}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.deviceDetails}>
                  <Ionicons name="tv-outline" size={22} color="#1e3a8a" style={styles.deviceIcon} />
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceBrandModel}>{formData.monitor.brand} {formData.monitor.model}</Text>
                    <Text style={styles.deviceSerial}>SN: {formData.monitor.serialNumber}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Personeli Ekle</Text>
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
  infoText: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    marginBottom: 16,
  },
  infoTextContent: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
  officeName: {
    fontWeight: 'bold',
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
  deviceSelection: {
    marginTop: 8,
  },
  deviceSelectionText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  deviceIcon: {
    marginRight: 12,
  },
  deviceOptionInfo: {
    flex: 1,
  },
  deviceOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  deviceOptionSerial: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  selectedDevice: {
    marginTop: 8,
  },
  selectedDeviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDeviceText: {
    fontSize: 14,
    color: '#4b5563',
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  changeButtonText: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  deviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceBrandModel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  deviceSerial: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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

export default CourtOfficePersonnelForm; 