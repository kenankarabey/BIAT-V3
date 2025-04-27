import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggleButton = ({ style, size = 24 }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: isDarkMode ? theme.card : '#e2e8f0' },
        style
      ]} 
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={[
        styles.toggle,
        {
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
          transform: [{ translateX: isDarkMode ? 20 : 0 }]
        }
      ]}>
        <Ionicons 
          name={isDarkMode ? 'moon' : 'sunny'} 
          size={size} 
          color={isDarkMode ? '#60a5fa' : '#f59e0b'} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default ThemeToggleButton; 