import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function GoalsScreen() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get(`/goals?user_id=${userId}`);
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async () => {
    if (!name || !target) return;
    try {
      const res = await api.post(`/goals/add?user_id=${userId}`, {
        goal_name: name,
        target_amount: parseFloat(target),
        deadline: new Date().toISOString()
      });
      if (res.data.success) {
        setName('');
        setTarget('');
        fetchGoals();
      }
    } catch (e) {
      Alert.alert('Error', 'API Error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Financial Goals</Text>
      
      <View style={styles.formCard}>
        <TextInput 
          style={styles.input} 
          placeholder="New Goal Target (e.g. Car)" 
          placeholderTextColor="#9ca3af"
          value={name} 
          onChangeText={setName} 
        />
        <View style={styles.row}>
          <TextInput 
            style={[styles.input, { flex: 1, marginRight: 12, marginBottom: 0 }]} 
            placeholder="Target Amount (₹)" 
            placeholderTextColor="#9ca3af"
            value={target} 
            onChangeText={setTarget} 
            keyboardType="numeric" 
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={goals}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyExtractor={(item) => item.goal_id?.toString() || Math.random().toString()}
        renderItem={({ item }) => {
          const progress = Math.min((item.saved_amount / item.target_amount) * 100, 100);
          return (
            <View style={styles.goalCard}>
              <View style={styles.goalHeaderRow}>
                <Text style={styles.goalTitle}>{item.goal_name}</Text>
                <Text style={styles.goalPercentage}>{progress.toFixed(0)}%</Text>
              </View>
              <Text style={styles.goalSubtext}>₹{item.saved_amount.toLocaleString()} saved of ₹{item.target_amount.toLocaleString()}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f9fafb' },
  header: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 20, marginBottom: 20 },
  
  formCard: { 
    backgroundColor: '#ffffff', padding: 20, borderRadius: 20, marginBottom: 24,
    shadowColor: '#6366f1', shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 4 
  },
  input: { 
    backgroundColor: '#f3f4f6', color: '#1f2937', paddingHorizontal: 16, height: 50, 
    borderRadius: 12, marginBottom: 12, fontSize: 16, fontWeight: '500' 
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  addButton: { 
    backgroundColor: '#6366f1', height: 50, width: 50, borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center' 
  },

  goalCard: { 
    backgroundColor: '#ffffff', padding: 20, borderRadius: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2
  },
  goalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  goalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  goalPercentage: { fontSize: 16, fontWeight: '800', color: '#6366f1' },
  goalSubtext: { fontSize: 14, color: '#6b7280', marginBottom: 16, fontWeight: '500' },
  progressBar: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 5 }
});
