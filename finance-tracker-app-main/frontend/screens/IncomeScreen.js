import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: '💰' },
  { id: 'freelance', name: 'Freelance', icon: '💻' },
  { id: 'investments', name: 'Investments', icon: '📈' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'gifts', name: 'Gifts', icon: '🎁' },
  { id: 'other', name: 'Other', icon: '💵' }
];

export default function IncomeScreen({ navigation }) {
  const { userId } = useAuth();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');

  const handleAddIncome = async () => {
    if (!amount || !source) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    try {
      const res = await api.post(`/income/add?user_id=${userId}`, {
        amount: parseFloat(amount),
        source: source
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
      <Text style={styles.header}>Add Income</Text>
      
      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Source</Text>
          <View style={styles.categoryGrid}>
            {INCOME_CATEGORIES.map(cat => (
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
          <TextInput 
            style={[styles.input, { marginTop: 12 }]} 
            placeholder="Or type custom source..." 
            placeholderTextColor="#9ca3af"
            value={source} 
            onChangeText={setSource} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0.00" 
            placeholderTextColor="#9ca3af"
            keyboardType="numeric" 
            value={amount} 
            onChangeText={setAmount} 
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleAddIncome}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.saveBtnText}>Save Income</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => {if(navigation.goBack) navigation.goBack()}}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f9fafb' },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 20, marginBottom: 24 },
  
  formCard: { 
    backgroundColor: '#ffffff', padding: 24, borderRadius: 24, 
    shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#4b5563', fontWeight: '600', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '31.5%', backgroundColor: '#f3f4f6', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  categoryCardActive: { backgroundColor: '#e0e7ff', borderColor: '#4f46e5' },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryText: { fontSize: 11, color: '#6b7280', fontWeight: '600', textAlign: 'center' },
  categoryTextActive: { color: '#4f46e5', fontWeight: '800' },
  input: { 
    backgroundColor: '#f3f4f6', color: '#1f2937', paddingHorizontal: 16, height: 54, 
    borderRadius: 14, fontSize: 16, fontWeight: '500' 
  },
  
  saveBtn: { 
    backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14, 
    alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center' 
  },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  
  cancelBtn: { 
    backgroundColor: '#f3f4f6', paddingVertical: 16, borderRadius: 14, 
    alignItems: 'center', marginTop: 12 
  },
  cancelBtnText: { color: '#4b5563', fontSize: 16, fontWeight: '700' }
});
