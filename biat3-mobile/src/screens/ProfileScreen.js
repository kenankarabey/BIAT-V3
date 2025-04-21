import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Çıkış işlemi
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../images/BIAT-logo.png')}
          style={styles.profileImage}
          resizeMode="contain"
        />
        <Text style={styles.userName}>Kenan</Text>
        <Text style={styles.userRole}>Sistem Yöneticisi</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={22} color="#1e3a8a" />
          <Text style={styles.infoText}>kenan@biat.gov.tr</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={22} color="#1e3a8a" />
          <Text style={styles.infoText}>+90 555 123 4567</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={22} color="#1e3a8a" />
          <Text style={styles.infoText}>Ankara, Türkiye</Text>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="settings-outline" size={22} color="#1e3a8a" />
          <Text style={styles.optionText}>Ayarlar</Text>
          <Ionicons name="chevron-forward" size={22} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#1e3a8a" />
          <Text style={styles.optionText}>Gizlilik</Text>
          <Ionicons name="chevron-forward" size={22} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="help-circle-outline" size={22} color="#1e3a8a" />
          <Text style={styles.optionText}>Yardım ve Destek</Text>
          <Ionicons name="chevron-forward" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
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
});

export default ProfileScreen; 