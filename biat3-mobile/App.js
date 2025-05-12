import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Create the root stack navigator
const RootStack = createStackNavigator();

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
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            presentation: 'card',
            animationEnabled: true,
          }}
        >
          <RootStack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
          <RootStack.Screen 
            name="MainApp" 
            component={TabNavigator}
            options={{
              gestureEnabled: false,
            }}
          />
        </RootStack.Navigator>
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