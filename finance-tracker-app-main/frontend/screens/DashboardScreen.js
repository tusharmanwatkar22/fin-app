import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import ExpenseItem from '../components/ExpenseItem';
import { ExpensePieChart } from '../components/Chart';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { userId, userProfile } = useAuth();

  const fetchData = async () => {
    try {
      const resSum = await api.get(`/summary?user_id=${userId}`);
      if (resSum.data && resSum.data.success) {
        setSummary(resSum.data.data);
      }
      const [resExp, resInc] = await Promise.all([
        api.get(`/expense/list?user_id=${userId}`),
        api.get(`/income/list?user_id=${userId}`)
      ]);
      
      let allTxs = [];
      if (resExp.data && resExp.data.success) {
        setExpenses(resExp.data.data);
        allTxs = [...allTxs, ...resExp.data.data.map(e => ({ ...e, type: 'expense', id: `exp_${e.expense_id}` }))];
      }
      if (resInc.data && resInc.data.success) {
        allTxs = [...allTxs, ...resInc.data.data.map(i => ({ ...i, type: 'income', category: i.source, payment_mode: 'Bank', id: `inc_${i.income_id}` }))];
      }
      
      setRecentTransactions(allTxs.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    fetchData();
    return unsubscribe;
  }, [navigation]);

  // Soft aesthetic palette
  const pieColors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];
  const aggExp = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  
  const pieData = Object.keys(aggExp).map((key, i) => ({
    name: key,
    amount: aggExp[key],
    color: pieColors[i % pieColors.length],
    legendFontColor: "#6b7280",
    legendFontSize: 13
  }));

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.header}>{userProfile?.name || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
           <Ionicons name="person" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Premium Dark Summary Card */}
      <View style={styles.mainCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>
          ₹{(summary ? summary.balance : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.row}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="arrow-down-circle" size={16} color="#34d399" />
              <Text style={styles.subtext}> Income</Text>
            </View>
            <Text style={styles.income}>₹{(summary ? summary.total_income : 0).toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="arrow-up-circle" size={16} color="#f87171" />
              <Text style={styles.subtext}> Expenses</Text>
            </View>
            <Text style={styles.expense}>₹{(summary ? summary.total_expense : 0).toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {pieData.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <Card style={{ paddingLeft: 0, paddingRight: 0 }}>
            <ExpensePieChart data={pieData} />
          </Card>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
           <Text style={styles.sectionTitle}>Recent Transactions</Text>
           <Text style={styles.seeAll}>See All</Text>
        </View>
        <Card>
          {recentTransactions.slice(0, 5).map(item => (
             <ExpenseItem 
               key={item.id} 
               category={item.category} 
               amount={item.amount} 
               date={new Date(item.date)} 
               mode={item.payment_mode || 'Unknown'} 
               type={item.type}
             />
          ))}
          {recentTransactions.length === 0 && <Text style={{ color: '#9ca3af', textAlign: 'center', padding: 10 }}>No recent transactions yet.</Text>}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 60, marginBottom: 24 },
  greeting: { fontSize: 15, color: '#6b7280', marginBottom: 2 },
  header: { fontSize: 26, fontWeight: '800', color: '#111827' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center' },
  
  mainCard: { 
    backgroundColor: '#1e1b4b', 
    borderRadius: 24, 
    padding: 24, 
    shadowColor: '#312e81', 
    shadowOpacity: 0.4, 
    shadowRadius: 20, 
    shadowOffset: { width: 0, height: 10 }, 
    elevation: 8,
    marginBottom: 10 
  },
  balanceLabel: { fontSize: 15, color: '#a5b4fc', fontWeight: '500', marginBottom: 8 },
  balanceValue: { fontSize: 40, fontWeight: '900', color: '#ffffff', marginBottom: 24, letterSpacing: -1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
  subtext: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  income: { fontSize: 18, color: '#ffffff', fontWeight: '700' },
  expense: { fontSize: 18, color: '#ffffff', fontWeight: '700' },
  
  sectionHeader: { marginTop: 24 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  seeAll: { fontSize: 14, color: '#6366f1', fontWeight: '600' }
});

export default DashboardScreen;
