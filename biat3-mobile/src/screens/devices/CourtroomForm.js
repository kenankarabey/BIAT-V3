import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  Switch,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Available status options
const statusOptions = ['Aktif', 'Arıza', 'Bakım', 'Pasif'];

const CourtroomForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editItem = route.params?.courtroom;
  const isEditing = !!editItem;

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    court: '',
    location: '',
    status: 'Aktif',
    devices: {
      kasa: 0,
      monitor: 0,
      segbis: 0,
      kamera: 0,
      tv: 0,
      mikrofon: 0
    },
    lastCheck: new Date().toISOString(),
    notes: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    court: '',
    location: ''
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        ...editItem
      });
    }
  }, [editItem]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!formData.name) {
      newErrors.name = 'Salon adı gerekli';
      isValid = false;
    }
    
    if (!formData.court) {
      newErrors.court = 'Mahkeme adı gerekli';
      isValid = false;
    }
    
    if (!formData.location) {
      newErrors.location = 'Konum gerekli';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Generate random ID if adding new courtroom
    const submittedData = {
      ...formData,
      id: isEditing ? formData.id : Math.random().toString(36).substring(2, 9),
      lastCheck: formData.lastCheck || new Date().toISOString()
    };

    // In a real app, this would be an API call
    // For now, we'll just return to the previous screen with the data
    navigation.navigate('Courtrooms', { 
      action: isEditing ? 'update' : 'add',
      courtroom: submittedData
    });
  };

  // Get status color
  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'Aktif':
        return '#10b981'; // green
      case 'Arıza':
        return '#ef4444'; // red
      case 'Bakım':
        return '#f59e0b'; // amber
      case 'Pasif':
        return '#64748b'; // slate
      default:
        return '#64748b';
    }
  };

  // Device map for icons and labels
  const deviceMap = {
    kasa: { icon: 'desktop-tower', label: 'Kasa' },
    monitor: { icon: 'monitor', label: 'Monitör' },
    segbis: { icon: 'video', label: 'SEGBİS' },
    kamera: { icon: 'cctv', label: 'Kamera' },
    tv: { icon: 'television', label: 'TV' },
    mikrofon: { icon: 'microphone', label: 'Mikrofon' }
  };
  
  // Cihaz sayısı düzenleme işlevi
  const handleDeviceCountChange = (deviceKey, increment) => {
    const currentCount = formData.devices[deviceKey] || 0;
    const newCount = increment ? 
      Math.min(currentCount + 1, 99) : // Maksimum 99
      Math.max(currentCount - 1, 0);  // Minimum 0
    
    const newDevices = { ...formData.devices };
    newDevices[deviceKey] = newCount;
    
    handleChange('devices', newDevices);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Salon Düzenle' : 'Yeni Salon Ekle'}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Salon Adı *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.name && styles.inputError,
                ]}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Örn: 101 Nolu Salon"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mahkeme Adı *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.court && styles.inputError,
                ]}
                value={formData.court}
                onChangeText={(text) => handleChange('court', text)}
                placeholder="Örn: İş Mahkemesi"
              />
              {errors.court && <Text style={styles.errorText}>{errors.court}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Konum *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.location && styles.inputError,
                ]}
                value={formData.location}
                onChangeText={(text) => handleChange('location', text)}
                placeholder="Örn: 1. Kat, Sağ Koridor"
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Durum</Text>
              <View style={styles.statusOptions}>
                {statusOptions.map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption}
                    style={[
                      styles.statusOption,
                      {
                        backgroundColor:
                          formData.status === statusOption ? getStatusColor(statusOption) : 'transparent',
                        borderColor: getStatusColor(statusOption),
                      },
                    ]}
                    onPress={() => handleChange('status', statusOption)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        { color: formData.status === statusOption ? '#fff' : getStatusColor(statusOption) },
                      ]}
                    >
                      {statusOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Salon Cihazları</Text>

            <View style={styles.deviceList}>
              {Object.entries(deviceMap).map(([key, { icon, label }]) => (
                <View key={key} style={styles.deviceToggleRow}>
                  <View style={styles.deviceInfo}>
                    <MaterialCommunityIcons 
                      name={icon} 
                      size={22} 
                      color={formData.devices && formData.devices[key] > 0 ? "#4f46e5" : "#64748b"} 
                    />
                    <Text style={styles.deviceLabel}>{label}</Text>
                  </View>
                  <View style={styles.deviceCounterContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.deviceCountButton, 
                        {opacity: !formData.devices || formData.devices[key] <= 0 ? 0.5 : 1}
                      ]}
                      onPress={() => handleDeviceCountChange(key, false)}
                      disabled={!formData.devices || formData.devices[key] <= 0}
                    >
                      <MaterialCommunityIcons name="minus" size={16} color="#4f46e5" />
                    </TouchableOpacity>
                    
                    <Text style={styles.deviceCountText}>
                      {formData.devices && formData.devices[key] ? formData.devices[key] : 0}
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.deviceCountButton}
                      onPress={() => handleDeviceCountChange(key, true)}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color="#4f46e5" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Son Kontrol Tarihi</Text>
              <TextInput
                style={styles.input}
                value={formData.lastCheck}
                onChangeText={(text) => handleChange('lastCheck', text)}
                placeholder="GG.AA.YYYY"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.notes}
                onChangeText={(text) => handleChange('notes', text)}
                placeholder="Salon hakkında notlar..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSubmit}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 16,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  deviceList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  deviceToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceLabel: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  textarea: {
    minHeight: 100,
    paddingTop: 10,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  deviceCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deviceCountButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  deviceCountText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'center',
  },
});

export default CourtroomForm; 