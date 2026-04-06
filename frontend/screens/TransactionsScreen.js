import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ExpenseItem from '../components/ExpenseItem';
import api from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TransactionsScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
        allTxs = [...allTxs, ...incRes.data.data.map(i => ({ ...i, type: 'income', category: i.source, payment_mode: i.payment_mode || 'Bank', id: `inc_${i.income_id}` }))];
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

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'Income' && t.type !== 'income') return false;
    if (filterType === 'Expenses' && t.type !== 'expense') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cat = (t.category || '').toLowerCase();
      if (!cat.includes(q)) return false;
    }
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top || 40 }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <TouchableOpacity hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="filter-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <View style={styles.tabButtons}>
          <TouchableOpacity 
            style={[styles.tabButton, filterType === 'All' && styles.tabButtonActive]}
            onPress={() => setFilterType('All')}
          >
            {filterType === 'All' && <Ionicons name="git-compare" size={16} color="#4f46e5" style={{marginRight: 6}} />}
            <Text style={[styles.tabButtonText, filterType === 'All' && styles.tabButtonTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, filterType === 'Income' && styles.tabButtonActive]}
            onPress={() => setFilterType('Income')}
          >
            <Text style={[styles.tabButtonText, filterType === 'Income' && styles.tabButtonTextActive]}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, filterType === 'Expenses' && styles.tabButtonActive]}
            onPress={() => setFilterType('Expenses')}
          >
            <Text style={[styles.tabButtonText, filterType === 'Expenses' && styles.tabButtonTextActive]}>Expenses</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchFilterBtn}>
            <Ionicons name="options" size={18} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <ExpenseItem 
            category={item.category} 
            amount={item.amount} 
            date={new Date(item.date)} 
            mode={item.payment_mode || 'Unknown'} 
            type={item.type}
          />
        )}
      />

      {/* Contextual Add Buttons */}
      {filterType === 'Income' && (
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={[styles.fabExtended, { backgroundColor: '#10b981' }]} 
            onPress={() => navigation.navigate('AddTransactionScreen', { type: 'income' })}
          >
            <Ionicons name="add" size={20} color="#FFF" style={{marginRight: 4}} />
            <Text style={styles.fabText}>Add Income</Text>
          </TouchableOpacity>
        </View>
      )}

      {filterType === 'Expenses' && (
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={[styles.fabExtended, { backgroundColor: '#f43f5e' }]} 
            onPress={() => navigation.navigate('AddTransactionScreen', { type: 'expense' })}
          >
            <Ionicons name="add" size={20} color="#FFF" style={{marginRight: 4}} />
            <Text style={styles.fabText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.background 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent'
  },
  tabButtonActive: {
    backgroundColor: theme.primary + '20', 
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textSecondary
  },
  tabButtonTextActive: {
    color: theme.primary 
  },
  sortButton: {
    padding: 8,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    shadowColor: theme.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    height: '100%'
  },
  searchFilterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    alignItems: 'flex-end',
  },
  fabExtended: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  }
});

export default TransactionsScreen;
