import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoryContext';
import api from '../services/api';



export default function AddTransactionScreen({ route, navigation }) {
  const { userId } = useAuth();
  const { theme: appTheme } = useTheme();
  const { expenseCategories, incomeCategories } = useCategories();
  const styles = getStyles(appTheme);
  
  const initialType = route.params?.type || 'expense';
  const [type, setType] = useState(initialType); // 'income' or 'expense'
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('Cash');
  const [note, setNote] = useState('');


  const handleSaveTransaction = async () => {
    if (!amount || !category) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }


    try {
      if (type === 'expense') {
        await api.post(`/expense/add?user_id=${userId}`, {
          amount: parseFloat(amount) || 0,
          category: category,
          payment_mode: mode,
          note
        });
      } else {
        await api.post(`/income/add?user_id=${userId}`, {
          amount: parseFloat(amount) || 0,
          source: category, 
          payment_mode: mode
        });
      }
      if(navigation.goBack) navigation.goBack();
    } catch (e) {
      Alert.alert('Error', `Could not save ${type}`);
    }
  };


  const isIncome = type === 'income';
  const themeColor = isIncome ? appTheme.success : appTheme.danger;
  const themeBg = isIncome ? appTheme.success + '15' : appTheme.danger + '15';
  
  const currentCategories = isIncome ? incomeCategories : expenseCategories;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Toggle Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, type === 'income' && { backgroundColor: appTheme.success }]} 
              onPress={() => { setType('income'); setCategory(''); setMode('Cash'); }}
            >
              <Text style={[styles.toggleText, type === 'income' && { color: '#fff' }]}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, type === 'expense' && { backgroundColor: appTheme.danger }]} 
              onPress={() => { setType('expense'); setCategory(''); setMode('Cash'); }}
            >
              <Text style={[styles.toggleText, type === 'expense' && { color: '#fff' }]}>Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      
        <View style={[styles.formCard, { shadowColor: themeColor }]}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={amount} 
              onChangeText={setAmount} 
              placeholder="0.00" 
              placeholderTextColor={appTheme.textSecondary} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isIncome ? 'Income Source *' : 'Category *'}</Text>
            <View style={styles.categoryGrid}>
              {currentCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard, 
                    category === cat.name && { backgroundColor: themeBg, borderColor: themeColor }
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                     styles.categoryText, 
                     category === cat.name && { color: themeColor, fontWeight: '800' }
                  ]} adjustsFontSizeToFit numberOfLines={2}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Mode</Text>
            <View style={styles.row}>
              {[{name: 'Cash', icon: 'cash'}, {name: 'Card', icon: 'card'}, {name: 'UPI', icon: 'qr-code'}].map(m => (
                <TouchableOpacity 
                  key={m.name} 
                  style={[styles.modeBtn, mode === m.name && { backgroundColor: themeColor }]} 
                  onPress={() => setMode(m.name)}
                >
                  <Ionicons name={m.icon} size={18} color={mode === m.name ? '#ffffff' : '#6b7280'} style={{marginBottom: 4}} />
                  <Text style={[styles.modeText, mode === m.name && { color: '#ffffff', fontWeight: '700' }]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: themeColor }]} onPress={handleSaveTransaction}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.saveBtnText}>Save {isIncome ? 'Income' : 'Expense'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={() => {if(navigation.goBack) navigation.goBack()}}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: theme.text },
  
  typeToggle: { flexDirection: 'row', backgroundColor: theme.border, borderRadius: 20, padding: 4 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  toggleText: { fontSize: 13, fontWeight: '700', color: theme.textSecondary },
  
  formCard: { 
    backgroundColor: theme.surface, padding: 24, borderRadius: 24, 
    shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6,
    borderWidth: 1, borderColor: theme.border 
  },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: theme.text, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: theme.background, color: theme.text, paddingHorizontal: 16, height: 54, borderRadius: 14, fontSize: 16, fontWeight: '500', borderWidth: 1, borderColor: theme.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '31.5%', backgroundColor: theme.background, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryText: { fontSize: 11, color: theme.textSecondary, fontWeight: '600', textAlign: 'center' },
  
  modeBtn: { flex: 1, paddingVertical: 14, backgroundColor: theme.background, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  modeText: { color: theme.textSecondary, fontWeight: '600', fontSize: 15 },
  
  saveBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  
  cancelBtn: { backgroundColor: theme.background, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: theme.border },
  cancelBtnText: { color: theme.textSecondary, fontSize: 16, fontWeight: '700' },

});
