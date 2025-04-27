import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import withThemedScreen from '../../components/withThemedScreen';

const CourtroomDetail = ({ route, theme, themedStyles }) => {
  const { courtroom } = route.params;
  const navigation = useNavigation();
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Count total devices
  const getTotalDeviceCount = (devices) => {
    if (!devices) return 0;
    return Object.values(devices).reduce((sum, count) => sum + count, 0);
  };

  // Handle edit courtroom
  const handleEditCourtroom = () => {
    navigation.navigate('CourtroomForm', { 
      editMode: true,
      courtroom: courtroom 
    });
  };
  
  // Handle delete courtroom
  const handleDeleteCourtroom = () => {
    Alert.alert(
      'Salonu Sil',
      `${courtroom.name} salonunu silmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // Delete the courtroom
            navigation.navigate('Courtrooms', { 
              action: 'delete',
              courtroomId: courtroom.id 
            });
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.safeAreaView, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>{courtroom.name}</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerAction}
              onPress={handleEditCourtroom}
            >
              <MaterialCommunityIcons name="pencil" size={24} color={theme.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerAction}
              onPress={handleDeleteCourtroom}
            >
              <MaterialCommunityIcons name="delete" size={24} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="information" size={22} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Salon Bilgileri</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Mahkeme</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{courtroom.court}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Konum</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{courtroom.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Durum</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(courtroom.status) + '20', borderColor: getStatusColor(courtroom.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(courtroom.status) }]}>{courtroom.status}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Son Kontrol</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatDate(courtroom.lastCheck)}</Text>
            </View>
          </View>
          
          {/* Devices */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="devices" size={22} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Cihazlar ({getTotalDeviceCount(courtroom.devices)})</Text>
            </View>
            
            <View style={styles.deviceList}>
              {courtroom.devices && Object.entries(courtroom.devices).map(([key, count]) => {
                if (count <= 0) return null; // Sadece sayısı 0'dan büyük olanları göster
                
                let iconName = 'help-circle-outline';
                let deviceLabel = 'Bilinmeyen';
                
                switch(key) {
                  case 'kasa':
                    iconName = 'desktop-tower';
                    deviceLabel = 'Kasa';
                    break;
                  case 'monitor':
                    iconName = 'monitor';
                    deviceLabel = 'Monitör';
                    break;
                  case 'segbis':
                    iconName = 'video';
                    deviceLabel = 'SEGBİS';
                    break;
                  case 'kamera':
                    iconName = 'cctv';
                    deviceLabel = 'Kamera';
                    break;
                  case 'tv':
                    iconName = 'television';
                    deviceLabel = 'TV';
                    break;
                  case 'mikrofon':
                    iconName = 'microphone';
                    deviceLabel = 'Mikrofon';
                    break;
                }
                
                return (
                  <View key={key} style={[styles.deviceItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.deviceInfo}>
                      <View style={[styles.deviceIconContainer, { backgroundColor: theme.primary + '20' }]}>
                        <MaterialCommunityIcons name={iconName} size={20} color={theme.primary} />
                      </View>
                      <Text style={[styles.deviceName, { color: theme.text }]}>{deviceLabel}</Text>
                    </View>
                    <View style={[styles.deviceCountBadge, { backgroundColor: theme.backgroundSecondary }]}>
                      <Text style={[styles.deviceCount, { color: theme.text }]}>{count}</Text>
                    </View>
                  </View>
                );
              })}
              
              {(!courtroom.devices || getTotalDeviceCount(courtroom.devices) === 0) && (
                <View style={styles.emptyDevices}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={32} color={theme.textSecondary} />
                  <Text style={[styles.emptyDevicesText, { color: theme.textSecondary }]}>Bu salonda kayıtlı cihaz bulunmamaktadır</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Notes */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="note-text" size={22} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Notlar</Text>
            </View>
            
            {courtroom.notes ? (
              <Text style={[styles.notesText, { color: theme.text }]}>
                {courtroom.notes}
              </Text>
            ) : (
              <Text style={[styles.emptyNotesText, { color: theme.textSecondary }]}>
                Bu salon için not bulunmamaktadır
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 4,
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceList: {
    marginTop: 4,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    marginLeft: 12,
  },
  deviceCountBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyDevices: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyDevicesText: {
    fontSize: 14,
    marginTop: 8,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyNotesText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default withThemedScreen(CourtroomDetail); 