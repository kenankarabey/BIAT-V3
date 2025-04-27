import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const NotificationsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Arıza Bildirimi',
      message: 'Adliye 2. Kat 1 numaralı yazıcı arızası giderildi.',
      time: '10 dk önce',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Bakım Hatırlatması',
      message: 'Asliye Hukuk Mahkemesi bilgisayarlarının periyodik bakımı 2 gün içinde yapılacak.',
      time: '1 saat önce',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Kritik Arıza',
      message: 'E-Duruşma sistemi kablosunda arıza tespit edildi. Teknik ekip yönlendirildi.',
      time: '3 saat önce',
      read: true,
      type: 'error'
    },
    {
      id: '4',
      title: 'Yeni Cihaz',
      message: 'Ağır Ceza Mahkemesi için 3 yeni monitör eklenmiştir.',
      time: '1 gün önce',
      read: true,
      type: 'success'
    },
    {
      id: '5',
      title: 'Bakım Tamamlandı',
      message: 'Ticaret Mahkemesi yazıcılarının bakımı başarıyla tamamlandı.',
      time: '2 gün önce',
      read: true,
      type: 'success'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? {...notification, read: true} 
        : notification
    ));
  };

  const getIconName = (type) => {
    switch(type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: theme.card,
          shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
        },
        !item.read && {
          backgroundColor: isDarkMode ? theme.inputBg : '#F8FAFC',
          borderLeftWidth: 3,
          borderLeftColor: theme.primary,
        }
      ]} 
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.type)}20` }]}>
        <Ionicons 
          name={getIconName(item.type)} 
          size={24} 
          color={getIconColor(item.type)} 
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{item.time}</Text>
        </View>
        <Text style={[styles.message, { color: theme.textSecondary }]}>{item.message}</Text>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.navBackground} />
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Bildirimler</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="checkmark-done" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={50} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Hiç bildiriminiz bulunmuyor</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  }
});

export default NotificationsScreen; 