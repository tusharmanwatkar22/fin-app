import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoryContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';



export default function IncomeScreen({ navigation }) {
  const { userId } = useAuth();
  const { theme } = useTheme();
  const { incomeCategories } = useCategories();
  const styles = getStyles(theme);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [mode, setMode] = useState('Bank');

  const handleAddIncome = async () => {
    if (!amount || !source) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    try {
      const res = await api.post(`/income/add?user_id=${userId}`, {
        amount: parseFloat(amount),
        source: source,
        payment_mode: mode
      });
      if (res.data.success) {
        setAmount('');
        setSource('Salary');
        if(navigation.goBack) navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to add income");
      }
    } catch (e) {
      Alert.alert("Error", "API Error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Add Income</Text>
        
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0.00" 
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric" 
              value={amount} 
              onChangeText={setAmount} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {incomeCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    source === cat.name && styles.categoryCardActive
                  ]}
                  onPress={() => setSource(cat.name)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    source === cat.name && styles.categoryTextActive
                  ]} adjustsFontSizeToFit numberOfLines={2}>{cat.name}</Text>
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

          <TouchableOpacity style={styles.saveBtn} onPress={handleAddIncome}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.saveBtnText}>Save Income</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelBtn} onPress={() => {if(navigation.goBack) navigation.goBack()}}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: theme.background },
  header: { fontSize: 28, fontWeight: '800', color: theme.text, marginTop: 20, marginBottom: 24 },
  
  formCard: { 
    backgroundColor: theme.surface, padding: 24, borderRadius: 24, 
    shadowColor: theme.success, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6,
    borderWidth: 1, borderColor: theme.border
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: theme.text, fontWeight: '600', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '31.5%', backgroundColor: theme.background, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  categoryCardActive: { backgroundColor: theme.success + '15', borderColor: theme.success },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryText: { fontSize: 11, color: theme.textSecondary, fontWeight: '600', textAlign: 'center' },
  categoryTextActive: { color: theme.success, fontWeight: '800' },
  input: { 
    backgroundColor: theme.background, color: theme.text, paddingHorizontal: 16, height: 54, 
    borderRadius: 14, fontSize: 16, fontWeight: '500', borderWidth: 1, borderColor: theme.border
  },
  
  saveBtn: { 
    backgroundColor: theme.success, paddingVertical: 16, borderRadius: 14, 
    alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' 
  },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 14, backgroundColor: theme.background, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  modeBtnActive: { backgroundColor: theme.success, borderColor: theme.success },
  modeText: { color: theme.textSecondary, fontWeight: '600', fontSize: 13 },
  modeTextActive: { color: '#ffffff', fontWeight: '700' },
  
  cancelBtn: { 
    backgroundColor: theme.background, paddingVertical: 16, borderRadius: 14, 
    alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: theme.border
  },
  cancelBtnText: { color: theme.textSecondary, fontSize: 16, fontWeight: '700' }
});
