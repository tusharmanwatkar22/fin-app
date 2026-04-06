import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import BudgetBar from '../components/BudgetBar';
import Card from '../components/Card';
import api from '../services/api';

const BudgetScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const [data, setData] = useState({ income: 0, expenses: 0, rule: null });
  const [rules, setRules] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const fetchBudget = async () => {
    if (!userId) return;
    try {
      const summaryRes = await api.get(`/summary?user_id=${userId}`);
      
      let activeRule = { needs_percentage: 50, wants_percentage: 30, savings_percentage: 20, rule_name: "50-30-20" };
      let d = { total_income: 0, total_expense: 0 };

      if (summaryRes.data && summaryRes.data.success) {
        d = summaryRes.data.data;
        const ruleId = d.budget_rule_id;
        
        try {
          const rulesRes = await api.get('/budget-rules');
          if (rulesRes.data && rulesRes.data.success) {
            setRules(rulesRes.data.data);
            const ruleFound = rulesRes.data.data.find(r => r.rule_id === ruleId);
            if (ruleFound) activeRule = ruleFound;
          }
        } catch (ruleErr) {
          console.log('Rules fetch error', ruleErr);
        }
      }

      setNetworkError(false);
      setData({ income: d.total_income || 0, expenses: d.total_expense || 0, rule: activeRule });
    } catch (e) {
      console.log('Budget fetch error', e);
      setNetworkError(true);
      setData({ income: 0, expenses: 0, rule: { rule_id: 1, needs_percentage: 50, wants_percentage: 30, savings_percentage: 20, rule_name: "50-30-20" } });
      setRules([
        { rule_id: 1, rule_name: "50-30-20", needs_percentage: 50, wants_percentage: 30, savings_percentage: 20 },
        { rule_id: 2, rule_name: "70-20-10", needs_percentage: 70, wants_percentage: 20, savings_percentage: 10 },
        { rule_id: 3, rule_name: "80-20-0", needs_percentage: 80, wants_percentage: 20, savings_percentage: 0 }
      ]);
    }
  };

  useEffect(() => {
    if (!navigation) {
      fetchBudget();
      return;
    }
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBudget();
    });
    fetchBudget();
    return unsubscribe;
  }, [navigation, userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudget();
    setRefreshing(false);
  };

  const handleSelectRule = async (rule_id) => {
    try {
      const res = await api.post(`/budget/select?user_id=${userId}&rule_id=${rule_id}`);
      if (res.data && res.data.success) {
        fetchBudget();
      }
    } catch(e) {
      console.log('Select rule error', e);
    }
  };

  if (!data || !data.rule) {
    return (
      <View style={styles.container}>
        <Text style={{marginTop: 60, textAlign: 'center'}}>Loading...</Text>
      </View>
    );
  }

  const inc = data.income || 0;
  const needsLimit = (inc * (data.rule.needs_percentage || 50)) / 100;
  const wantsLimit = (inc * (data.rule.wants_percentage || 30)) / 100;
  const savingsLimit = (inc * (data.rule.savings_percentage || 20)) / 100;

  const needsSpent = data.expenses * 0.6; // Mock distribution
  const wantsSpent = data.expenses * 0.4; // Mock distribution
  const savingsSpent = Math.max(0, inc - data.expenses);
  
  const wantsExceeded = wantsSpent > wantsLimit;
  const needsExceeded = needsSpent > needsLimit;

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.header}>Monthly Budgets</Text>
      
      {networkError && (
        <View style={[styles.warningBox, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}>
           <Ionicons name="wifi" size={20} color="#ef4444" style={{marginRight: 8}} />
           <Text style={styles.warning}>Backend connection failed! Please ensure your mobile device and PC are on the SAME WiFi and the backend terminal is running.</Text>
        </View>
      )}

      <View style={[styles.ruleBadge, networkError ? { marginTop: 16 } : null]}>
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

      <Text style={styles.sectionTitle}>Change Budget Rule</Text>
      {rules.map(r => {
        const isActive = data.rule.rule_id === r.rule_id;
        return (
          <TouchableOpacity 
            key={r.rule_id} 
            style={[styles.ruleCard, isActive && styles.activeRuleCard]} 
            onPress={() => {
              setData(prev => ({ ...prev, rule: r }));
              if (!networkError) {
                handleSelectRule(r.rule_id);
              }
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.ruleCardTitle, isActive && styles.activeRuleCardTitle]}>{r.rule_name}</Text>
              {isActive && <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />}
            </View>
            <Text style={[styles.ruleCardDesc, isActive && styles.activeRuleCardDesc]}>
              Needs {r.needs_percentage}% | Wants {r.wants_percentage}% | Savings {r.savings_percentage}%
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  header: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 60, marginBottom: 8 },
  ruleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e7ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  subtitle: { fontSize: 14, color: '#4338ca', fontWeight: '600' },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#fecaca' },
  warning: { color: '#b91c1c', fontSize: 14, fontWeight: '700', flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 30, marginBottom: 12 },
  ruleCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  activeRuleCard: { borderColor: '#4f46e5', backgroundColor: '#e0e7ff', borderWidth: 2 },
  ruleCardTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  activeRuleCardTitle: { color: '#4338ca' },
  ruleCardDesc: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  activeRuleCardDesc: { color: '#4f46e5' }
});

export default BudgetScreen;
