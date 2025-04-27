import 'text-encoding-polyfill';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Wrap inner components with theme consumer
const ThemedApp = () => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={theme.statusBar} 
        backgroundColor={theme.navBackground} 
      />
      <NavigationContainer
        theme={{
          dark: isDarkMode,
          colors: {
            primary: theme.primary,
            background: theme.background,
            card: theme.navBackground,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
          },
        }}
      >
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
} 