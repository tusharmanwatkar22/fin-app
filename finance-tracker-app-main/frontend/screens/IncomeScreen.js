import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'cash', color: '#10b981' },
  { name: 'Freelance', icon: 'laptop', color: '#3b82f6' },
  { name: 'Investments', icon: 'trending-up', color: '#8b5cf6' },
  { name: 'Gifts', icon: 'gift', color: '#ec4899' },
  { name: 'Other', icon: 'ellipsis-horizontal-circle', color: '#6b7280' }
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
          <View style={styles.categoriesContainer}>
            {INCOME_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryBox,
                  source === cat.name && { borderColor: cat.color, backgroundColor: `${cat.color}15` }
                ]}
                onPress={() => setSource(cat.name)}
              >
                <Ionicons name={cat.icon} size={28} color={source === cat.name ? cat.color : '#9ca3af'} />
                <Text style={[
                  styles.categoryText,
                  source === cat.name && { color: cat.color, fontWeight: '700' }
                ]}>{cat.name}</Text>
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  categoryBox: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 4
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center'
  },
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
