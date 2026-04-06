import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const getCategoryTheme = (category) => {
  const cat = category ? category.toLowerCase() : '';
  if (cat.includes('food') || cat.includes('dining')) return { icon: 'fast-food', color: '#ff9800', bg: '#fff3e0' };
  if (cat.includes('transport') || cat.includes('travel')) return { icon: 'car', color: '#2196f3', bg: '#e3f2fd' };
  if (cat.includes('shop') || cat.includes('grocery')) return { icon: 'cart', color: '#9c27b0', bg: '#f3e5f5' };
  if (cat.includes('health') || cat.includes('med')) return { icon: 'medkit', color: '#f44336', bg: '#ffebee' };
  if (cat.includes('bill') || cat.includes('util')) return { icon: 'flash', color: '#fbc02d', bg: '#fffde7' };
  if (cat.includes('salary') || cat.includes('bonus')) return { icon: 'cash', color: '#4caf50', bg: '#e8f5e9' };
  return { icon: 'pricetag', color: '#607d8b', bg: '#eceff1' };
};

const ExpenseItem = ({ category, amount, date, mode, type = 'expense' }) => {
  const theme = getCategoryTheme(category);
  const isIncome = type.toLowerCase() === 'income';
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#e8f5e9' : theme.bg }]}>
        <Ionicons name={isIncome ? 'trending-up' : theme.icon} size={22} color={isIncome ? '#10b981' : theme.color} />
      </View>
      <View style={styles.details}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.dateMode}>{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {mode}</Text>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: isIncome ? '#10b981' : '#f43f5e' }]}>
          {isIncome ? '+' : '-'}₹{amount.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  dateMode: {
    fontSize: 13,
    color: '#a0aec0',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ExpenseItem;
