import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import withThemedScreen from '../components/withThemedScreen';

const IssuesScreen = ({ theme }) => {
  const navigation = useNavigation();

  const navigateToIssueList = () => {
    navigation.navigate('IssueList');
  };

  const navigateToIssueReport = () => {
    navigation.navigate('IssueReport');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Arıza Takip</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={navigateToIssueList}
        >
          <View style={[styles.cardIcon, { backgroundColor: theme.inputBg }]}>
            <MaterialCommunityIcons name="format-list-bulleted" size={32} color="#3b82f6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Arıza Listesi</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Tüm arıza bildirimlerini görüntüleyin</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={navigateToIssueReport}
        >
          <View style={[styles.cardIcon, { backgroundColor: theme.inputBg }]}>
            <MaterialCommunityIcons name="plus-circle" size={32} color="#f59e0b" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Arıza Bildir</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Yeni bir arıza kaydı oluşturun</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={[styles.cardIcon, { backgroundColor: theme.inputBg }]}>
            <MaterialCommunityIcons name="chart-bar" size={32} color="#10b981" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Arıza İstatistikleri</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Arıza istatistiklerini görüntüleyin</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
});

export default withThemedScreen(IssuesScreen); 