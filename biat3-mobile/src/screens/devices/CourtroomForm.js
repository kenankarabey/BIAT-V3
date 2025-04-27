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
import withThemedScreen from '../../components/withThemedScreen';

// Available status options
const statusOptions = ['Aktif', 'Arıza', 'Bakım', 'Pasif'];

const CourtroomForm = ({ theme, themedStyles }) => {
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {isEditing ? 'Salon Düzenle' : 'Yeni Salon Ekle'}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Salon Adı *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: errors.name ? "#ef4444" : theme.border,
                    color: theme.text
                  },
                ]}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Örn: 101 Nolu Salon"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Mahkeme Adı *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: errors.court ? "#ef4444" : theme.border,
                    color: theme.text
                  },
                ]}
                value={formData.court}
                onChangeText={(text) => handleChange('court', text)}
                placeholder="Örn: İş Mahkemesi"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.court && <Text style={styles.errorText}>{errors.court}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Konum *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: errors.location ? "#ef4444" : theme.border,
                    color: theme.text
                  },
                ]}
                value={formData.location}
                onChangeText={(text) => handleChange('location', text)}
                placeholder="Örn: 1. Kat, Sağ Koridor"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Durum</Text>
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

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Salon Cihazları</Text>

            <View style={[styles.deviceList, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {Object.entries(deviceMap).map(([key, { icon, label }]) => (
                <View key={key} style={[styles.deviceToggleRow, { borderBottomColor: theme.border }]}>
                  <View style={styles.deviceInfo}>
                    <MaterialCommunityIcons 
                      name={icon} 
                      size={22} 
                      color={formData.devices && formData.devices[key] > 0 ? theme.primary : theme.textSecondary} 
                    />
                    <Text style={[styles.deviceLabel, { color: theme.text }]}>{label}</Text>
                  </View>
                  <View style={[styles.deviceCounterContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <TouchableOpacity 
                      style={[
                        styles.deviceCountButton, 
                        {opacity: !formData.devices || formData.devices[key] <= 0 ? 0.5 : 1}
                      ]}
                      onPress={() => handleDeviceCountChange(key, false)}
                      disabled={!formData.devices || formData.devices[key] <= 0}
                    >
                      <MaterialCommunityIcons name="minus" size={16} color={theme.primary} />
                    </TouchableOpacity>
                    
                    <Text style={[styles.deviceCountText, { color: theme.text }]}>
                      {formData.devices && formData.devices[key] ? formData.devices[key] : 0}
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.deviceCountButton}
                      onPress={() => handleDeviceCountChange(key, true)}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Son Kontrol Tarihi</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: theme.border,
                    color: theme.text
                  },
                ]}
                value={formData.lastCheck}
                onChangeText={(text) => handleChange('lastCheck', text)}
                placeholder="GG.AA.YYYY"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Notlar</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textarea,
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: theme.border,
                    color: theme.text
                  },
                ]}
                value={formData.notes}
                onChangeText={(text) => handleChange('notes', text)}
                placeholder="Salon hakkında notlar..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: theme.isDark ? '#374151' : '#f1f5f9', borderColor: theme.border }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>İptal</Text>
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
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
  },
  deviceList: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  deviceToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  textarea: {
    minHeight: 100,
    paddingTop: 10,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
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
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  deviceCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
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
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'center',
  },
});

export default withThemedScreen(CourtroomForm); 