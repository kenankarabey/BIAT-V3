import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme colors
export const lightTheme = {
  background: '#f3f4f6',
  card: '#FFFFFF',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  primary: '#1e3a8a',
  inputBg: '#f8fafc',
  statusBar: 'dark-content',
  navBackground: '#FFFFFF',
  tabBarBackground: '#FFFFFF',
  tabBarActiveColor: '#1e3a8a',
  tabBarInactiveColor: '#94a3b8',
  headerTint: '#1e293b'
};

export const darkTheme = {
  background: '#1e293b',
  card: '#334155',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  border: '#475569',
  primary: '#60a5fa',
  inputBg: '#475569',
  statusBar: 'light-content',
  navBackground: '#0f172a',
  tabBarBackground: '#0f172a',
  tabBarActiveColor: '#60a5fa',
  tabBarInactiveColor: '#94a3b8',
  headerTint: '#f8fafc'
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load the theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'true');
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Save the theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('isDarkMode', isDarkMode.toString());
      } catch (error) {
        console.log('Error saving theme preference:', error);
      }
    };

    if (!isLoading) {
      saveThemePreference();
    }
  }, [isDarkMode, isLoading]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Get the current theme
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext); 