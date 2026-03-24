import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import BudgetBar from '../components/BudgetBar';
import Card from '../components/Card';
import api from '../services/api';

const BudgetScreen = () => {
  const { userId } = useAuth();
  const [data, setData] = useState({ income: 0, expenses: 0, rule: null });
  const [refreshing, setRefreshing] = useState(false);

  const fetchBudget = async () => {
    try {
      const summaryRes = await api.get(`/summary?user_id=${userId}`);
      if (summaryRes.data.success) {
        const d = summaryRes.data.data;
        const ruleId = d.budget_rule_id;
        
        let activeRule = { needs_percentage: 50, wants_percentage: 30, savings_percentage: 20, rule_name: "50-30-20" };
        
        const rulesRes = await api.get('/budget-rules');
        if (rulesRes.data.success) {
          const ruleFound = rulesRes.data.data.find(r => r.rule_id === ruleId);
          if (ruleFound) activeRule = ruleFound;
        }

        setData({ income: d.total_income || 0, expenses: d.total_expense || 0, rule: activeRule });
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudget();
    setRefreshing(false);
  };

  if (!data.rule) return <View style={styles.container}><Text style={{marginTop: 60, textAlign: 'center'}}>Loading...</Text></View>;

  const inc = data.income;
  const needsLimit = (inc * data.rule.needs_percentage) / 100;
  const wantsLimit = (inc * data.rule.wants_percentage) / 100;
  const savingsLimit = (inc * data.rule.savings_percentage) / 100;

  const needsSpent = data.expenses * 0.6; // Mock distribution
  const wantsSpent = data.expenses * 0.4; // Mock distribution
  const savingsSpent = Math.max(0, inc - data.expenses);
  
  const wantsExceeded = wantsSpent > wantsLimit;
  const needsExceeded = needsSpent > needsLimit;

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Monthly Budgets</Text>
      
      <View style={styles.ruleBadge}>
        <Ionicons name="shield-checkmark" size={18} color="#4f46e5" style={{marginRight: 6}} />
        <Text style={styles.subtitle}>Active Rule: <Text style={{fontWeight: '800'}}>{data.rule.rule_name}</Text></Text>
      </View>

      <Card style={{ paddingVertical: 24 }}>
        <BudgetBar category={`Needs (${data.rule.needs_percentage}%)`} spent={needsSpent} limit={needsLimit} color="#3b82f6" />
        <BudgetBar category={`Wants (${data.rule.wants_percentage}%)`} spent={wantsSpent} limit={wantsLimit} color="#f59e0b" />
        <BudgetBar category={`Savings (${data.rule.savings_percentage}%)`} spent={savingsSpent} limit={savingsLimit} color="#10b981" />
      </Card>

      {wantsExceeded && (
        <View style={styles.warningBox}>
           <Ionicons name="warning" size={20} color="#ef4444" style={{marginRight: 8}} />
           <Text style={styles.warning}>You have exceeded your budget for Wants!</Text>
        </View>
      )}
      {needsExceeded && (
        <View style={styles.warningBox}>
           <Ionicons name="warning" size={20} color="#ef4444" style={{marginRight: 8}} />
           <Text style={styles.warning}>You have exceeded your budget for Needs!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 60, marginBottom: 8 },
  ruleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  subtitle: { fontSize: 14, color: '#4338ca', fontWeight: '600' },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#fecaca' },
  warning: { color: '#b91c1c', fontSize: 14, fontWeight: '700', flex: 1 }
});

export default BudgetScreen;
