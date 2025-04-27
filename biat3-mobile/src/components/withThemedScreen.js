import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useTheme, lightTheme } from '../contexts/ThemeContext';

/**
 * Higher-Order Component that wraps screens with theme styling
 * @param {React.Component} WrappedComponent The component to wrap with theming
 * @param {Object} options Options to customize the theme application
 * @returns {React.Component} The wrapped component with theming applied
 */
export const withThemedScreen = (WrappedComponent, options = {}) => {
  // Default options
  const defaultOptions = {
    withSafeArea: true,
    withHeader: true,
    withPadding: true,
    statusBarTranslucent: false,
  };

  // Merge options with defaults
  const mergedOptions = { ...defaultOptions, ...options };

  // Return a new component with theme applied
  return (props) => {
    const { theme, isDarkMode } = useTheme();

    return (
      <SafeAreaView 
        style={[
          styles.container, 
          { backgroundColor: theme.background },
          !mergedOptions.withPadding && styles.noPadding
        ]}
      >
        <StatusBar 
          barStyle={theme.statusBar} 
          backgroundColor={theme.navBackground} 
          translucent={mergedOptions.statusBarTranslucent}
        />
        
        <WrappedComponent 
          {...props} 
          theme={theme}
          isDarkMode={isDarkMode}
          // Pass theme-related props to the wrapped component
          themedStyles={{
            card: { backgroundColor: theme.card, borderColor: theme.border },
            text: { color: theme.text },
            textSecondary: { color: theme.textSecondary },
            header: { 
              backgroundColor: theme.card, 
              borderBottomColor: theme.border,
              borderBottomWidth: 1
            },
            input: {
              backgroundColor: theme.inputBg,
              borderColor: theme.border,
              color: theme.text
            },
            shadow: {
              shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
            }
          }}
        />
      </SafeAreaView>
    );
  };
};

// Basic styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noPadding: {
    padding: 0,
  },
});

export default withThemedScreen; 