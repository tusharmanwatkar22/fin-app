import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GoalProgress = ({ name, target, saved }) => {
  const progress = Math.min((saved / target) * 100, 100) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.amounts}>₹{saved} / ₹{target}</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.percentage}>{progress.toFixed(1)}% Completed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  amounts: {
    fontSize: 13,
    color: '#666',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#e6f7ff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#1890ff',
  },
  percentage: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default GoalProgress;
