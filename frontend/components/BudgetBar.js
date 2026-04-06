import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const BudgetBar = ({ category, spent, limit, color, onPress, showArrow, expanded }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const percentage = Math.min((spent / limit) * 100, 100) || 0;
  const isExceeded = spent > limit;

  const HeaderComponent = onPress ? TouchableOpacity : View;

  return (
    <View style={styles.container}>
      <HeaderComponent style={styles.header} onPress={onPress}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{category}</Text>
          {showArrow && (
            <Ionicons 
              name={expanded ? "chevron-down" : "chevron-forward"} 
              size={18} 
              color={theme.textSecondary} 
              style={{ marginLeft: 6 }} 
            />
          )}
        </View>
        <Text style={[styles.amount, { color: isExceeded ? theme.danger : theme.text }]}>
          {`₹${Math.floor(spent).toLocaleString()} / ₹${Math.floor(limit).toLocaleString()}`}
        </Text>
      </HeaderComponent>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: isExceeded ? theme.danger : color }]} />
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  categoryContainer: { flexDirection: 'row', alignItems: 'center' },
  category: { fontSize: 16, fontWeight: '700', color: theme.text },
  amount: { fontSize: 15, fontWeight: '800' },
  barBackground: { height: 12, backgroundColor: theme.border, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
});

export default BudgetBar;
