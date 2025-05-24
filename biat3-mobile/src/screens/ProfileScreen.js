import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  useColorScheme,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a theme context
const ThemeContext = createContext();
console.log('ProfileScreen rendered');
// Theme colors
const lightTheme = {
  background: '#f3f4f6',
  card: '#FFFFFF',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  primary: '#1e3a8a',
  inputBg: '#f8fafc',
  statusBar: 'dark-content',
};

const darkTheme = {
  background: '#1e293b',
  card: '#334155',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  border: '#475569',
  primary: '#60a5fa',
  inputBg: '#475569',
  statusBar: 'light-content',
};

const ProfileScreen = ({ navigation }) => {
  const deviceTheme = useColorScheme();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [resolvedCount, setResolvedCount] = useState(0);

  const [activityStats] = useState({
    deviceManaged: 342,
    maintenancePerformed: 56
  });

  const [preferences, setPreferences] = useState({
    notificationsEnabled: true,
    emailAlerts: true,
    darkMode: isDarkMode,
    locationTracking: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Simulate loading user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const email = await AsyncStorage.getItem('user_email');
      console.log('Supabase email:', email);
      if (email) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        console.log('Supabase data:', data);
        console.log('Supabase error:', error);
        if (data) {
          setUser(data);
          // Çözülen arıza sayısını çek
          const { count, error: arizaError } = await supabase
            .from('cozulen_arizalar')
            .select('*', { count: 'exact', head: true })
            .eq('arizayi_cozen_personel', data.ad_soyad)
            .eq('ariza_durumu', 'Çözüldü');
          if (!arizaError) setResolvedCount(count || 0);
          else console.log('Arıza count error:', arizaError);
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const togglePreference = (key) => {
    if (key === 'darkMode') {
      toggleTheme();
    }
    
    setPreferences(prev => ({ 
      ...prev, 
      [key]: !prev[key] 
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Oturumunuzu kapatmak istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Çıkış Yap", 
          onPress: () => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }, 1000);
          },
          style: "destructive"
        }
      ]
    );
  };

  const openSettings = () => {
    setShowSettingsModal(true);
  };

  const openHelpSupport = () => {
    setShowHelpModal(true);
  };

  const openSecuritySettings = () => {
    setShowSecurityModal(true);
    // Reset password fields when opening modal
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const openAbout = () => {
    setShowAboutModal(true);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      Alert.alert("Hata", "Mevcut şifrenizi girmelisiniz.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Hata", "Yeni şifreniz en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Yeni şifreler eşleşmiyor.");
      return;
    }
    setIsLoading(true);
    try {
      // Kullanıcıyı tekrar çek
      const email = await AsyncStorage.getItem('user_email');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (userError || !userData) {
        setIsLoading(false);
        Alert.alert('Hata', 'Kullanıcı bulunamadı.');
        return;
      }
      if (userData.sifre !== currentPassword) {
        setIsLoading(false);
        Alert.alert('Hata', 'Mevcut şifreniz yanlış.');
        return;
      }
      // Şifreyi güncelle
      const { error: updateError } = await supabase
        .from('users')
        .update({ sifre: newPassword })
        .eq('email', email);
      setIsLoading(false);
      if (updateError) {
        Alert.alert('Hata', 'Şifre güncellenemedi: ' + updateError.message);
        return;
      }
      setShowSecurityModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu.');
    }
  };

  if (!isLoading && !user) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}> 
        <Text style={[styles.loadingText, { color: theme.text }]}>Kullanıcı bilgisi bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      borderBottomColor: theme.border,
    },
    userName: {
      color: theme.text,
    },
    userRole: {
      color: theme.textSecondary,
    },
    card: {
      backgroundColor: theme.card,
      borderColor: theme.border,
    },
    text: {
      color: theme.text,
    },
    secondaryText: {
      color: theme.textSecondary,
    },
    border: {
      borderColor: theme.border,
    },
    modalContent: {
      backgroundColor: theme.card,
    },
    modalHeader: {
      borderBottomColor: theme.border,
    },
    input: {
      backgroundColor: theme.inputBg,
      borderColor: theme.border,
      color: theme.text,
    },
  };

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, dynamicStyles.modalContent]}>
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <Text style={[styles.modalTitle, dynamicStyles.text]}>Ayarlar</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Bildirim Ayarları</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, dynamicStyles.text]}>Bildirimleri Etkinleştir</Text>
                <Text style={[styles.settingDescription, dynamicStyles.secondaryText]}>Uygulama bildirimlerini göster</Text>
              </View>
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={() => togglePreference('notificationsEnabled')}
                trackColor={{ false: theme.border, true: `${theme.primary}80` }}
                thumbColor={preferences.notificationsEnabled ? theme.primary : "#f4f4f5"}
              />
            </View>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, dynamicStyles.text]}>E-posta Bildirimleri</Text>
                <Text style={[styles.settingDescription, dynamicStyles.secondaryText]}>Kritik sorunlarda e-posta bildirimleri al</Text>
              </View>
              <Switch
                value={preferences.emailAlerts}
                onValueChange={() => togglePreference('emailAlerts')}
                trackColor={{ false: theme.border, true: `${theme.primary}80` }}
                thumbColor={preferences.emailAlerts ? theme.primary : "#f4f4f5"}
              />
            </View>
            
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Uygulama Ayarları</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, dynamicStyles.text]}>Karanlık Mod</Text>
                <Text style={[styles.settingDescription, dynamicStyles.secondaryText]}>Karanlık tema kullan</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={() => togglePreference('darkMode')}
                trackColor={{ false: theme.border, true: `${theme.primary}80` }}
                thumbColor={isDarkMode ? theme.primary : "#f4f4f5"}
              />
            </View>
            
            {/* Şifre Değişikliği Alanı */}
            <Text style={[styles.sectionTitle, dynamicStyles.text, { marginTop: 24 }]}>Şifre Değişikliği</Text>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.text]}>Mevcut Şifre</Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mevcut şifrenizi girin"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.text]}>Yeni Şifre</Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Yeni şifrenizi girin"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.text]}>Yeni Şifre (Tekrar)</Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Yeni şifrenizi tekrar girin"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.primary }]} 
              onPress={handlePasswordChange}
            >
              <Text style={styles.saveButtonText}>Şifreyi Değiştir</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]} 
            onPress={() => {
              // Simulate saving settings
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                setShowSettingsModal(false);
                Alert.alert("Başarılı", "Ayarlarınız kaydedildi.");
              }, 1000);
            }}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderHelpModal = () => (
    <Modal
      visible={showHelpModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yardım ve Destek</Text>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.helpItem}>
              <Ionicons name="mail" size={24} color="#1e3a8a" />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>E-posta ile İletişim</Text>
                <Text style={styles.helpDescription}>destek@biat.gov.tr</Text>
                <TouchableOpacity style={styles.helpButton}>
                  <Text style={styles.helpButtonText}>E-posta Gönder</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.helpItem}>
              <Ionicons name="call" size={24} color="#1e3a8a" />
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Telefon ile İletişim</Text>
                <Text style={styles.helpDescription}>+90 312 123 4567</Text>
                <TouchableOpacity style={styles.helpButton}>
                  <Text style={styles.helpButtonText}>Ara</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSecurityModal = () => (
    <Modal
      visible={showSecurityModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSecurityModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gizlilik ve Güvenlik</Text>
            <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Şifre Değişikliği</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.text]}>Mevcut Şifre</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mevcut şifrenizi girin"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.text]}>Yeni Şifre</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Yeni şifrenizi girin"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.text]}>Yeni Şifre (Tekrar)</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Yeni şifrenizi tekrar girin"
                secureTextEntry
              />
            </View>
            
            <Text style={styles.sectionTitle}>Güvenlik Önlemleri</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>İki Faktörlü Doğrulama</Text>
                <Text style={styles.settingDescription}>Hesabınızı daha güvenli hale getirir</Text>
              </View>
              <Switch
                value={preferences.twoFactorAuth}
                onValueChange={() => togglePreference('twoFactorAuth')}
                trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
                thumbColor={preferences.twoFactorAuth ? "#1e3a8a" : "#f4f4f5"}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Oturum Bilgileri</Text>
                <Text style={styles.settingDescription}>Aktif oturumları görüntüle ve yönet</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Oturum Kayıtları</Text>
                <Text style={styles.settingDescription}>Oturum açma geçmişinizi görüntüleyin</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handlePasswordChange}
          >
            <Text style={styles.saveButtonText}>Şifreyi Değiştir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAboutModal = () => (
    <Modal
      visible={showAboutModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAboutModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hakkında</Text>
            <TouchableOpacity onPress={() => setShowAboutModal(false)}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.aboutLogoContainer}>
              <Image
                source={require('../../images/BIAT-logo.png')}
                style={styles.aboutLogo}
                resizeMode="contain"
              />
              <Text style={styles.aboutAppName}>BIAT</Text>
              <Text style={styles.aboutVersion}>Sürüm 1.0.0</Text>
            </View>
            
            <Text style={styles.aboutDescription}>
              Bilgisayar arıza takip sistemi, Adalet Bakanlığı'nda bilgisayar arızalarının tek noktadan yönetimi ve takibi için geliştirilmiş bir platformdur.
            </Text>
            
            <Text style={styles.aboutDescription}>
              Tüm geliştime süreci bir üniversite öğrencisi olan Kenan Karabey tarafından yapılmıştır.
            </Text>
            
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>İletişim</Text>
              <Text style={styles.aboutSectionText}>ab306515@adalet.gov.tr</Text>
              <Text style={styles.aboutSectionText}>552 363 14 01</Text>
            </View>
            
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>© 2025 BIAT</Text>
              <Text style={styles.aboutSectionText}>Tüm hakları saklıdır.</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {user && (
          <View style={[styles.header, dynamicStyles.header]}>
        <Image
                source={user.foto_url ? { uri: user.foto_url } : require('../../images/BIAT-logo.png')}
          style={styles.Image}
                resizeMode="cover"
        />
              <Text style={[styles.userName, dynamicStyles.userName]}>{user.ad_soyad}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                  <Text style={styles.badgeText}>{user.departman}</Text>
              </View>
              <View style={[styles.badge, styles.activeBadge]}>
                <Text style={styles.activeBadgeText}>Aktif</Text>
              </View>
            </View>
          </View>
          )}

          <View style={[styles.statsContainer, dynamicStyles.card]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, dynamicStyles.text]}>{resolvedCount}</Text>
              <Text style={[styles.statLabel, dynamicStyles.secondaryText]}>Çözülen Arıza</Text>
            </View>
      </View>

          <View style={[styles.infoContainer, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.text]}>Kişisel Bilgiler</Text>
            
            <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
              <Ionicons name="mail-outline" size={22} color={theme.primary} />
              <Text style={[styles.infoText, dynamicStyles.text]}>{user?.email}</Text>
            </View>
            <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
              <Ionicons name="call-outline" size={22} color={theme.primary} />
              <Text style={[styles.infoText, dynamicStyles.text]}>{user?.telefon}</Text>
            </View>
            <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
              <Ionicons name="location-outline" size={22} color={theme.primary} />
              <Text style={[styles.infoText, dynamicStyles.text]}>{user?.konum}</Text>
            </View>
            <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
              <Ionicons name="business-outline" size={22} color={theme.primary} />
              <Text style={[styles.infoText, dynamicStyles.text]}>{user?.departman}</Text>
        </View>
      </View>

          <View style={[styles.optionsContainer, dynamicStyles.card]}>
            <TouchableOpacity style={[styles.optionItem, { borderBottomColor: theme.border }]} onPress={openSettings}>
              <Ionicons name="settings-outline" size={22} color={theme.primary} />
              <Text style={[styles.optionText, dynamicStyles.text]}>Ayarlar</Text>
              <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        
            <TouchableOpacity style={[styles.optionItem, { borderBottomWidth: 0 }]} onPress={openAbout}>
              <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
              <Text style={[styles.optionText, dynamicStyles.text]}>Hakkında</Text>
              <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#dc2626' : theme.primary }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
          
          <View style={styles.versionInfo}>
            <Text style={[styles.versionText, dynamicStyles.secondaryText]}>BIAT Kontrol Uygulaması v1.2.5</Text>
          </View>
        </ScrollView>
        
        {renderSettingsModal()}
        {showHelpModal && renderHelpModal()}
        {showSecurityModal && renderSecurityModal()}
        {showAboutModal && renderAboutModal()}
    </SafeAreaView>
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  Image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#e2e8f0',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  badgeText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  activeBadgeText: {
    color: '#16a34a',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  logoutButton: {
    backgroundColor: '#1e3a8a',
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalBody: {
    padding: 16,
    maxHeight: '70%',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#1e3a8a',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  helpContent: {
    flex: 1,
    marginLeft: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  helpDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
  },
  helpButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Password change styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  passwordRequirements: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  
  // About screen styles
  aboutLogoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  aboutLogo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  aboutAppName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 16,
    color: '#64748b',
  },
  aboutDescription: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  aboutSectionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default ProfileScreen; 