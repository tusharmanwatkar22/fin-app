import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoryContext';
import api from '../services/api';



const ExpenseScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const { theme } = useTheme();
  const { expenseCategories } = useCategories();
  const styles = getStyles(theme);
  
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
          <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={theme.textSecondary} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {expenseCategories.map((cat) => (
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

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', color: theme.text, marginTop: 20, marginBottom: 24 },
  
  formCard: { 
    backgroundColor: theme.surface, padding: 24, borderRadius: 24, 
    shadowColor: theme.danger, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6,
    borderWidth: 1, borderColor: theme.border
  },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: theme.text, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: theme.background, color: theme.text, paddingHorizontal: 16, height: 54, borderRadius: 14, fontSize: 16, fontWeight: '500', borderWidth: 1, borderColor: theme.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '31.5%', backgroundColor: theme.background, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  categoryCardActive: { backgroundColor: theme.danger + '15', borderColor: theme.danger },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryText: { fontSize: 11, color: theme.textSecondary, fontWeight: '600', textAlign: 'center' },
  categoryTextActive: { color: theme.danger, fontWeight: '800' },
  
  modeBtn: { flex: 1, paddingVertical: 14, backgroundColor: theme.background, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  modeBtnActive: { backgroundColor: theme.danger, borderColor: theme.danger },
  modeText: { color: theme.textSecondary, fontWeight: '600', fontSize: 15 },
  modeTextActive: { color: '#ffffff', fontWeight: '700' },
  
  
  saveBtn: { backgroundColor: theme.danger, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  
  cancelBtn: { backgroundColor: theme.background, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: theme.border },
  cancelBtnText: { color: theme.textSecondary, fontSize: 16, fontWeight: '700' },

});

export default ExpenseScreen;
