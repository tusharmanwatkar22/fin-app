import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BudgetDetailsScreen = ({ route, navigation }) => {
  // Gracefully provide default empty objects/arrays if not passed
  const { category = 'Details', transactions = [], spent = 0, limit = 0 } = route.params || {};
  const insets = useSafeAreaInsets();
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderItem = ({ item }) => (
    <View style={styles.txnCard}>
      <View style={styles.txnLeft}>
        <View style={[styles.iconBox, { backgroundColor: category === 'Needs' ? '#eff6ff' : category === 'Wants' ? '#fffbeb' : '#ecfdf5' }]}>
          <Ionicons name="receipt-outline" size={24} color={category === 'Needs' ? '#3b82f6' : category === 'Wants' ? '#f59e0b' : '#10b981'} />
        </View>
        <View style={styles.txnInfo}>
          <Text style={styles.txnCategory}>{item.category}</Text>
          <Text style={styles.txnDate}>{formatDate(item.date)} {item.note ? `• ${item.note}` : ''}</Text>
        </View>
      </View>
      <Text style={styles.txnAmount}>₹{item.amount.toFixed(2)}</Text>
    </View>
  );

  // Avoid division by zero
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isExceeded = spent > limit;
  const color = category === 'Needs' ? '#3b82f6' : category === 'Wants' ? '#f59e0b' : '#10b981';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Spent vs Limit</Text>
        <Text style={[styles.summaryAmount, { color: isExceeded ? '#ef4444' : '#1f2937' }]}>
          ₹{Math.floor(spent).toLocaleString()} / ₹{Math.floor(limit).toLocaleString()}
        </Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: isExceeded ? '#ef4444' : color }]} />
        </View>
      </View>

      <FlatList 
        data={transactions}
        keyExtractor={(item) => item.expense_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions found for this period.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  summaryBox: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  summaryLabel: { fontSize: 14, color: '#6b7280', fontWeight: '600', marginBottom: 8 },
  summaryAmount: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  barBg: { height: 12, backgroundColor: '#f3f4f6', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  txnCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  txnLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  txnInfo: { flex: 1 },
  txnCategory: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  txnDate: { fontSize: 13, color: '#6b7280' },
  txnAmount: { fontSize: 16, fontWeight: '800', color: '#111827' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15, color: '#9ca3af', fontStyle: 'italic' }
});

export default BudgetDetailsScreen;
