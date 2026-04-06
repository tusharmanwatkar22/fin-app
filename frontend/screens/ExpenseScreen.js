import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EXPENSE_CATEGORIES = [
  { id: 'bills', name: 'Bills & Utilities', icon: '💡' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'food', name: 'Food & Drinks', icon: '🍽️' },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁' },
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'housing', name: 'Housing', icon: '🏠' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️' },
  { id: 'other', name: 'Other Expenses', icon: '💸' },
  { id: 'personal', name: 'Personal Care', icon: '💅' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '🔄' },
  { id: 'transportation', name: 'Transportation', icon: '🚗' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
];

const ExpenseScreen = ({ navigation }) => {
  const { userId } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('Cash');
  const [note, setNote] = useState('');


  const handleSaveExpense = async () => {

    try {
      await api.post(`/expense/add?user_id=${userId}`, {
        amount: parseFloat(amount) || 0,
        category: category || 'Other',
        payment_mode: mode,
        note
      });
      if(navigation.goBack) navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save expense');
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Add Expense</Text>
      
      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor="#9ca3af" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, category === cat.name && styles.categoryCardActive]}
                onPress={() => setCategory(cat.name)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryText, category === cat.name && styles.categoryTextActive]} adjustsFontSizeToFit numberOfLines={2}>
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
              <TouchableOpacity key={m.name} style={[styles.modeBtn, mode === m.name && styles.modeBtnActive]} onPress={() => setMode(m.name)}>
                <Ionicons name={m.icon} size={18} color={mode === m.name ? '#ffffff' : '#6b7280'} style={{marginBottom: 4}} />
                <Text style={[styles.modeText, mode === m.name && styles.modeTextActive]}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveExpense}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.saveBtnText}>Save Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => {if(navigation.goBack) navigation.goBack()}}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 20, marginBottom: 24 },
  
  formCard: { 
    backgroundColor: '#ffffff', padding: 24, borderRadius: 24, 
    shadowColor: '#f43f5e', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 
  },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#4b5563', fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#f3f4f6', color: '#1f2937', paddingHorizontal: 16, height: 54, borderRadius: 14, fontSize: 16, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '31.5%', backgroundColor: '#f3f4f6', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  categoryCardActive: { backgroundColor: '#fef2f2', borderColor: '#f43f5e' },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryText: { fontSize: 11, color: '#6b7280', fontWeight: '600', textAlign: 'center' },
  categoryTextActive: { color: '#f43f5e', fontWeight: '800' },
  
  modeBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#f43f5e' },
  modeText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },
  modeTextActive: { color: '#ffffff', fontWeight: '700' },
  
  
  saveBtn: { backgroundColor: '#f43f5e', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  
  cancelBtn: { backgroundColor: '#f3f4f6', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  cancelBtnText: { color: '#4b5563', fontSize: 16, fontWeight: '700' },

});

export default ExpenseScreen;
