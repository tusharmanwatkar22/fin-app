import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BudgetBar from '../components/BudgetBar';
import Card from '../components/Card';
import api, { getProfile, updateProfile, getExpenses } from '../services/api';

const NEEDS_CATEGORIES = ['Food', 'Rent', 'Groceries', 'Utilities', 'Transport', 'Healthcare', 'Education', 'Insurance'];
const SAVINGS_CATEGORIES = ['Investment', 'Savings', 'Emergency Fund'];

const BudgetScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [data, setData] = useState({ rule: null });
  const [rules, setRules] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const [salary, setSalary] = useState(0);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [tempSalary, setTempSalary] = useState('');

  const [allExpenses, setAllExpenses] = useState([]);

  const [needsTxns, setNeedsTxns] = useState([]);
  const [wantsTxns, setWantsTxns] = useState([]);
  const [savingsTxns, setSavingsTxns] = useState([]);
  
  const [needsSpent, setNeedsSpent] = useState(0);
  const [wantsSpent, setWantsSpent] = useState(0);
  const [savingsSpent, setSavingsSpent] = useState(0);

  const fetchBudget = async () => {
    if (!userId) return;
    try {
      // Fetch Profile
      const profileRes = await getProfile(userId);
      let userSalary = 0;
      if (profileRes && profileRes.success) {
        userSalary = profileRes.data.monthly_income || 0;
        setSalary(userSalary);
        setTempSalary(userSalary.toString());
      }

      // Fetch Summary and Rules
      const summaryRes = await api.get(`/summary?user_id=${userId}`);
      let activeRule = { needs_percentage: 50, wants_percentage: 30, savings_percentage: 20, rule_name: "50-30-20" };

      if (summaryRes.data && summaryRes.data.success) {
        const d = summaryRes.data.data;
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

      // Fetch Expenses
      const expensesRes = await getExpenses(userId);
      if (expensesRes && expensesRes.success) {
        setAllExpenses(expensesRes.data || []);
      }

      setData({ rule: activeRule });
      setNetworkError(false);

    } catch (e) {
      console.log('Budget fetch error', e);
      setNetworkError(true);
      setData({ rule: { rule_id: 1, needs_percentage: 50, wants_percentage: 30, savings_percentage: 20, rule_name: "50-30-20" } });
      setRules([
        { rule_id: 1, rule_name: "50-30-20", needs_percentage: 50, wants_percentage: 30, savings_percentage: 20 },
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

  // Handle Filtering
  useEffect(() => {
    const nTxns = [];
    const wTxns = [];
    const sTxns = [];
    let nSpent = 0;
    let wSpent = 0;
    let sSpent = 0;

    const now = new Date();

    allExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      let include = false;

      // Default to Monthly filtering for Budget
      if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
        include = true;
      }

      if (include) {
        if (NEEDS_CATEGORIES.includes(exp.category)) {
          nTxns.push(exp);
          nSpent += exp.amount;
        } else if (SAVINGS_CATEGORIES.includes(exp.category)) {
          sTxns.push(exp);
          sSpent += exp.amount;
        } else {
          wTxns.push(exp);
          wSpent += exp.amount;
        }
      }
    });

    setNeedsTxns(nTxns);
    setWantsTxns(wTxns);
    setSavingsTxns(sTxns);
    setNeedsSpent(nSpent);
    setWantsSpent(wSpent);
    setSavingsSpent(sSpent);
  }, [allExpenses]);

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

  const handleSaveSalary = async () => {
    try {
      const newSalary = parseFloat(tempSalary) || 0;
      setIsEditingSalary(false);
      setSalary(newSalary);
      await updateProfile(userId, { monthly_income: newSalary });
      fetchBudget(); // refresh logic if needed
    } catch(e) {
      console.log('Update salary error', e);
    }
  };

  const navigateToTransactions = (type) => {
    let txns = [];
    let limit = 0;
    let spent = 0;
    let title = '';

    if (type === 'Needs') {
      txns = needsTxns;
      limit = (salary * (data.rule.needs_percentage || 50)) / 100;
      spent = needsSpent;
      title = `Needs (${data.rule.needs_percentage}%)`;
    } else if (type === 'Wants') {
      txns = wantsTxns;
      limit = (salary * (data.rule.wants_percentage || 30)) / 100;
      spent = wantsSpent;
      title = `Wants (${data.rule.wants_percentage}%)`;
    } else {
      txns = savingsTxns;
      limit = (salary * (data.rule.savings_percentage || 20)) / 100;
      spent = savingsSpent;
      title = `Savings (${data.rule.savings_percentage}%)`;
    }

    navigation.navigate('BudgetTransactions', {
      category: title,
      type: type,
      transactions: txns,
      spent: spent,
      limit: limit,
    });
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!data || !data.rule) {
    return (
      <View style={styles.container}>
        <Text style={{marginTop: 60, textAlign: 'center'}}>Loading...</Text>
      </View>
    );
  }

  const needsLimit = (salary * (data.rule.needs_percentage || 50)) / 100;
  const wantsLimit = (salary * (data.rule.wants_percentage || 30)) / 100;
  const savingsLimit = (salary * (data.rule.savings_percentage || 20)) / 100;

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

      {/* SALARY SECTION */}
      <View style={styles.salarySection}>
        <Text style={styles.salaryLabel}>Monthly Salary Setup</Text>
        <View style={styles.salaryRow}>
           <Text style={styles.salaryCurrency}>₹</Text>
           {isEditingSalary ? (
             <TextInput 
               style={styles.salaryInput} 
               value={tempSalary} 
               onChangeText={setTempSalary} 
               keyboardType="numeric"
               autoFocus
             />
           ) : (
             <Text style={styles.salaryDisplay}>{salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
           )}
           {isEditingSalary ? (
             <TouchableOpacity style={styles.salaryBtn} onPress={handleSaveSalary}>
               <Text style={styles.salaryBtnText}>Save</Text>
             </TouchableOpacity>
           ) : (
             <TouchableOpacity style={styles.salaryBtnOutline} onPress={() => setIsEditingSalary(true)}>
               <Text style={styles.salaryBtnOutlineText}>Edit</Text>
             </TouchableOpacity>
           )}
        </View>
        <Text style={styles.salarySubtext}>This amount is distributed according to your active rule.</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20 }}>
        <View style={[styles.ruleBadge, { marginBottom: 0 }]}>
          <Ionicons name="shield-checkmark" size={18} color="#4f46e5" style={{marginRight: 6}} />
          <Text style={styles.subtitle}>Active Rule: <Text style={{fontWeight: '800'}}>{data.rule.rule_name}</Text></Text>
        </View>
      </View>

      <Card style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
        <BudgetBar 
          category={`Needs (${data.rule.needs_percentage}%)`} 
          spent={needsSpent} 
          limit={needsLimit} 
          color="#3b82f6" 
          showArrow={true}
          expanded={false}
          onPress={() => navigateToTransactions('Needs')}
        />
        
        <View style={styles.divider} />

        <BudgetBar 
          category={`Wants (${data.rule.wants_percentage}%)`} 
          spent={wantsSpent} 
          limit={wantsLimit} 
          color="#f59e0b" 
          showArrow={true}
          expanded={false}
          onPress={() => navigateToTransactions('Wants')}
        />
        
        <View style={styles.divider} />

        <BudgetBar 
          category={`Savings (${data.rule.savings_percentage}%)`} 
          spent={savingsSpent} 
          limit={savingsLimit} 
          color="#10b981" 
          showArrow={true}
          expanded={false}
          onPress={() => navigateToTransactions('Savings')}
        />
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

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, paddingHorizontal: 20 },
  header: { fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 60, marginBottom: 8 },
  ruleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary + '20', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  subtitle: { fontSize: 14, color: theme.primary, fontWeight: '600' },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.danger + '20', padding: 16, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: theme.danger + '50' },
  warning: { color: theme.danger, fontSize: 14, fontWeight: '700', flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.text, marginTop: 30, marginBottom: 12 },
  ruleCard: { backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border, elevation: 2, shadowColor: theme.cardShadow, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  activeRuleCard: { borderColor: theme.primary, backgroundColor: theme.primary + '10', borderWidth: 2 },
  ruleCardTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 4 },
  activeRuleCardTitle: { color: theme.primary },
  ruleCardDesc: { fontSize: 14, color: theme.textSecondary, fontWeight: '500' },
  activeRuleCardDesc: { color: theme.primary },
  // Salary Section Styles
  salarySection: { backgroundColor: theme.surface, padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.border, elevation: 2, shadowColor: theme.cardShadow, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }},
  salaryLabel: { fontSize: 16, fontWeight: '600', color: theme.textSecondary, marginBottom: 12 },
  salaryRow: { flexDirection: 'row', alignItems: 'center' },
  salaryCurrency: { fontSize: 28, fontWeight: '800', color: theme.text, marginRight: 8 },
  salaryDisplay: { fontSize: 32, fontWeight: '800', color: theme.text, flex: 1 },
  salaryInput: { flex: 1, fontSize: 24, fontWeight: '700', color: theme.text, borderBottomWidth: 2, borderBottomColor: theme.primary, paddingVertical: 4, marginRight: 16 },
  salaryBtn: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  salaryBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  salaryBtnOutline: { backgroundColor: theme.background, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  salaryBtnOutlineText: { color: theme.text, fontWeight: '700', fontSize: 16 },
  salarySubtext: { fontSize: 13, color: theme.textSecondary, marginTop: 12 },

  // Transaction List Styles
  txnContainer: { marginTop: -10, marginBottom: 16, paddingHorizontal: 4, backgroundColor: theme.background, borderRadius: 8, padding: 8 },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
  txnDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  txnCategory: { fontSize: 15, fontWeight: '600', color: theme.textSecondary },
  txnDate: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: '700', color: theme.text },
  emptyText: { fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', marginVertical: 10, textAlign: 'center' },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 8 }
});

export default BudgetScreen;
