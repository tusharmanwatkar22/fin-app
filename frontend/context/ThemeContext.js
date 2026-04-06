import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const lightTheme = {
  background: '#f4f6f9',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#f3f4f6',
  primary: '#3b82f6',
  danger: '#ef4444',
  success: '#10b981',
  cardShadow: '#000000',
  isDark: false,
};

export const darkTheme = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#f3f4f6',
  textSecondary: '#9ca3af',
  border: '#374151',
  primary: '#3b82f6',
  danger: '#ef4444',
  success: '#10b981',
  cardShadow: '#000000',
  isDark: true,
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_dark');
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === 'true');
        }
      } catch (e) {
        console.log('Error loading theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async (value) => {
    try {
      setIsDarkMode(value);
      await AsyncStorage.setItem('@theme_dark', value.toString());
    } catch (e) {
      console.log('Error saving theme preference', e);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
