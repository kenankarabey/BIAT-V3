import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import withThemedScreen from '../components/withThemedScreen';

const IssuesScreen = ({ theme }) => {
  const navigation = useNavigation();

  // Bekleyen ve çözülen arıza sayılarını IssueListScreen'deki MOCK_ISSUES ile eşleştir
  const MOCK_ISSUES = [
    { status: 'Bekleyen' }, { status: 'İşlemde' }, { status: 'Çözüldü' }, { status: 'İptal Edildi' }, { status: 'Bekleyen' }
  ]; // Bu satırı kaldır, gerçek IssueListScreen'den import veya context ile alınabilir
  // Şimdilik örnek için IssueListScreen'deki ile aynı yapıda olduğunu varsayalım
  const allIssues = require('./issues/IssueListScreen').MOCK_ISSUES || [];
  const bekleyenCount = allIssues.filter(i => (i.status === 'Bekleyen' || i.status === 'Açık')).length;
  const cozulenCount = allIssues.filter(i => (i.status === 'Çözüldü')).length;

  const navigateToBekleyen = () => {
    navigation.navigate('IssueList', { statusFilter: 'Bekleyen' });
  };
  const navigateToCozulen = () => {
    navigation.navigate('IssueList', { statusFilter: 'Çözüldü' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Arıza Takip</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={navigateToBekleyen}
        >
          <View style={[styles.cardIcon, { backgroundColor: theme.inputBg }]}> 
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#3b82f6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Bekleyen Arızalar</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{bekleyenCount} bekleyen arıza</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={navigateToCozulen}
        >
          <View style={[styles.cardIcon, { backgroundColor: theme.inputBg }]}> 
            <MaterialCommunityIcons name="check-circle-outline" size={32} color="#10b981" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Çözülen Arızalar</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{cozulenCount} çözülen arıza</Text>
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