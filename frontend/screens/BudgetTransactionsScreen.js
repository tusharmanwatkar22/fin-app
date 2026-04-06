import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function BudgetTransactionsScreen({ route, navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { category, type, transactions = [], spent = 0, limit = 0 } = route.params || {};

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDotColor = () => {
    if (type === 'Needs') return '#3b82f6';
    if (type === 'Wants') return '#f59e0b';
    return '#10b981'; // Savings
  };

  const renderItem = ({ item }) => (
    <View style={styles.txnRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.txnDot, { backgroundColor: getDotColor() }]} />
        <View>
          <Text style={styles.txnCategory}>{item.category}</Text>
          <Text style={styles.txnDate}>{formatDate(item.date)} {item.note ? `- ${item.note}` : ''}</Text>
        </View>
      </View>
      <Text style={styles.txnAmount}>₹{item.amount.toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{type} Transactions</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>{category}</Text>
        <Text style={styles.summaryDetails}>
          Spent: ₹{spent.toFixed(2)} / Limit: ₹{limit.toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.expense_id ? item.expense_id.toString() : Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses in {type} yet. 🤔</Text>}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  summaryBox: {
    margin: 20,
    padding: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center'
  },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  summaryDetails: { fontSize: 18, fontWeight: '700', color: theme.text },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  txnRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 1,
    shadowColor: theme.cardShadow,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  txnDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  txnCategory: { fontSize: 16, fontWeight: '600', color: theme.text },
  txnDate: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
  txnAmount: { fontSize: 16, fontWeight: '700', color: theme.text },
  emptyText: { fontSize: 15, color: theme.textSecondary, fontStyle: 'italic', marginTop: 30, textAlign: 'center' }
});
