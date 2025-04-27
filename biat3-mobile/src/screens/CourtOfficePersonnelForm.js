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

const CourtOfficePersonnelForm = ({ route, navigation, theme, themedStyles }) => {
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.header, themedStyles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, themedStyles.text]}>Personel Ekle</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={[styles.infoText, { backgroundColor: theme.inputBg, borderLeftColor: theme.primary }]}>
            <Text style={[styles.infoTextContent, { color: theme.textSecondary }]}>
              <Text style={[styles.officeName, { color: theme.text }]}>{officeName}</Text> kalemine yeni personel ekleniyor.
            </Text>
          </View>
          
          <View style={[styles.formSection, themedStyles.card, themedStyles.shadow]}>
            <Text style={[styles.sectionTitle, themedStyles.text]}>Personel Bilgileri</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Adı Soyadı *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Personelin adını ve soyadını girin"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Ünvan</Text>
              <View style={[styles.pickerContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Picker
                  selectedValue={formData.title}
                  onValueChange={(value) => handleInputChange('title', value)}
                  style={[styles.picker, { color: theme.text }]}
                  dropdownIconColor={theme.text}
                >
                  {titles.map(title => (
                    <Picker.Item key={title} label={title} value={title} color={theme.text} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, themedStyles.textSecondary]}>Sicil Numarası *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                value={formData.registrationNumber}
                onChangeText={(text) => handleInputChange('registrationNumber', text)}
                placeholder="Personel sicil numarasını girin"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <View style={[styles.formSection, themedStyles.card, themedStyles.shadow]}>
            <Text style={[styles.sectionTitle, themedStyles.text]}>Bilgisayar</Text>
            
            {!formData.computer.selected ? (
              <View style={styles.deviceSelection}>
                <Text style={[styles.deviceSelectionText, themedStyles.textSecondary]}>Kullanacağı bilgisayarı seçin:</Text>
                {availableComputers.map(computer => (
                  <TouchableOpacity
                    key={computer.id}
                    style={[styles.deviceOption, { borderBottomColor: theme.border }]}
                    onPress={() => handleDeviceSelect('computer', computer)}
                  >
                    <Ionicons name="desktop-outline" size={22} color={theme.primary} style={styles.deviceIcon} />
                    <View style={styles.deviceOptionInfo}>
                      <Text style={[styles.deviceOptionTitle, themedStyles.text]}>{computer.brand} {computer.model}</Text>
                      <Text style={[styles.deviceOptionSerial, themedStyles.textSecondary]}>SN: {computer.serialNumber}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.selectedDevice}>
                <View style={styles.selectedDeviceHeader}>
                  <Text style={[styles.selectedDeviceText, themedStyles.textSecondary]}>Seçilen Bilgisayar:</Text>
                  <TouchableOpacity
                    onPress={() => handleInputChange('computer.selected', false)}
                    style={[styles.changeButton, { backgroundColor: theme.inputBg }]}
                  >
                    <Text style={[styles.changeButtonText, { color: theme.primary }]}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.deviceDetails, { backgroundColor: theme.inputBg }]}>
                  <Ionicons name="desktop-outline" size={22} color={theme.primary} style={styles.deviceIcon} />
                  <View style={styles.deviceInfo}>
                    <Text style={[styles.deviceBrandModel, themedStyles.text]}>{formData.computer.brand} {formData.computer.model}</Text>
                    <Text style={[styles.deviceSerial, themedStyles.textSecondary]}>SN: {formData.computer.serialNumber}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          
          <View style={[styles.formSection, themedStyles.card, themedStyles.shadow]}>
            <Text style={[styles.sectionTitle, themedStyles.text]}>Monitör</Text>
            
            {!formData.monitor.selected ? (
              <View style={styles.deviceSelection}>
                <Text style={[styles.deviceSelectionText, themedStyles.textSecondary]}>Kullanacağı monitörü seçin:</Text>
                {availableMonitors.map(monitor => (
                  <TouchableOpacity
                    key={monitor.id}
                    style={[styles.deviceOption, { borderBottomColor: theme.border }]}
                    onPress={() => handleDeviceSelect('monitor', monitor)}
                  >
                    <Ionicons name="tv-outline" size={22} color={theme.primary} style={styles.deviceIcon} />
                    <View style={styles.deviceOptionInfo}>
                      <Text style={[styles.deviceOptionTitle, themedStyles.text]}>{monitor.brand} {monitor.model}</Text>
                      <Text style={[styles.deviceOptionSerial, themedStyles.textSecondary]}>SN: {monitor.serialNumber}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.selectedDevice}>
                <View style={styles.selectedDeviceHeader}>
                  <Text style={[styles.selectedDeviceText, themedStyles.textSecondary]}>Seçilen Monitör:</Text>
                  <TouchableOpacity
                    onPress={() => handleInputChange('monitor.selected', false)}
                    style={[styles.changeButton, { backgroundColor: theme.inputBg }]}
                  >
                    <Text style={[styles.changeButtonText, { color: theme.primary }]}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.deviceDetails, { backgroundColor: theme.inputBg }]}>
                  <Ionicons name="tv-outline" size={22} color={theme.primary} style={styles.deviceIcon} />
                  <View style={styles.deviceInfo}>
                    <Text style={[styles.deviceBrandModel, themedStyles.text]}>{formData.monitor.brand} {formData.monitor.model}</Text>
                    <Text style={[styles.deviceSerial, themedStyles.textSecondary]}>SN: {formData.monitor.serialNumber}</Text>
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
  infoText: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  infoTextContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  officeName: {
    fontWeight: 'bold',
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
  deviceSelection: {
    marginTop: 8,
  },
  deviceSelectionText: {
    fontSize: 14,
    marginBottom: 12,
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  },
  deviceOptionSerial: {
    fontSize: 12,
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
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceBrandModel: {
    fontSize: 14,
    fontWeight: '500',
  },
  deviceSerial: {
    fontSize: 12,
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

export default withThemedScreen(CourtOfficePersonnelForm); 