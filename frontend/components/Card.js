import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Card = ({ children, style }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    shadowColor: theme.cardShadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
});

export default Card;
