import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BudgetBar = ({ category, spent, limit, color }) => {
  const percentage = Math.min((spent / limit) * 100, 100) || 0;
  const isExceeded = spent > limit;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.category}>{category}</Text>
        <Text style={[styles.amount, { color: isExceeded ? '#ef4444' : '#1f2937' }]}>
          {`₹${Math.floor(spent).toLocaleString()} / ₹${Math.floor(limit).toLocaleString()}`}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: isExceeded ? '#ef4444' : color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' },
  category: { fontSize: 16, fontWeight: '700', color: '#374151' },
  amount: { fontSize: 15, fontWeight: '800' },
  barBackground: { height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
});

export default BudgetBar;
