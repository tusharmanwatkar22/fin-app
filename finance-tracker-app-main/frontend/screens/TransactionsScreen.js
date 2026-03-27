import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ExpenseItem from '../components/ExpenseItem';
import api from '../services/api';

const TransactionsScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        api.get(`/expense/list?user_id=${userId}`),
        api.get(`/income/list?user_id=${userId}`)
      ]);
      
      let allTxs = [];
      if (expRes.data && expRes.data.success) {
        allTxs = [...allTxs, ...expRes.data.data.map(e => ({ ...e, type: 'expense', id: `exp_${e.expense_id}` }))];
      }
      if (incRes.data && incRes.data.success) {
        allTxs = [...allTxs, ...incRes.data.data.map(i => ({ ...i, type: 'income', category: i.source, payment_mode: 'Bank', id: `inc_${i.income_id}` }))];
      }
      
      const sorted = allTxs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTransactions();
    });
    fetchTransactions();
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ExpenseItem 
            category={item.category} 
            amount={item.amount} 
            date={new Date(item.date)} 
            mode={item.payment_mode || 'Unknown'} 
            type={item.type}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
      
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, styles.fabExpense]} onPress={() => navigation.navigate('ExpenseScreen')}>
          <Ionicons name="trending-down" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabIncome]} onPress={() => navigation.navigate('IncomeScreen')}>
          <Ionicons name="trending-up" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 60, marginBottom: 20 },
  fabContainer: { position: 'absolute', bottom: 24, right: 24, flexDirection: 'row', gap: 16 },
  fab: { 
    width: 60, height: 60, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', 
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 
  },
  fabExpense: { backgroundColor: '#f43f5e' },
  fabIncome: { backgroundColor: '#10b981' }
});

export default TransactionsScreen;
