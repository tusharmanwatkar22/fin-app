import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function GoalsScreen() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  // Add Money Modal states
  const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');

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

  const openAddMoneyModal = (goal) => {
    setSelectedGoal(goal);
    setAddAmount('');
    setIsAddMoneyModalVisible(true);
  };

  const handleAddMoneySubmit = async () => {
    if (!addAmount || !selectedGoal) return;
    try {
      const res = await api.put(`/goals/${selectedGoal.goal_id}/add-money?amount=${parseFloat(addAmount)}&user_id=${userId}`);
      if (res.data.success) {
        setIsAddMoneyModalVisible(false);
        fetchGoals();
        Alert.alert('Success', `Added ₹${addAmount} to ${selectedGoal.goal_name}`);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not add money to your goal.');
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
                <View style={styles.headerRight}>
                  <Text style={styles.goalPercentage}>{progress.toFixed(0)}%</Text>
                  {progress >= 100 ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" style={{ padding: 4 }} />
                  ) : (
                    <TouchableOpacity style={styles.addMoneyBtnIcon} onPress={() => openAddMoneyModal(item)}>
                      <Ionicons name="add-circle" size={24} color="#6366f1" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={styles.goalSubtext}>₹{item.saved_amount.toLocaleString()} saved of ₹{item.target_amount.toLocaleString()}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          );
        }}
      />

      {/* Add Money Modal */}
      <Modal visible={isAddMoneyModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money</Text>
              <TouchableOpacity onPress={() => setIsAddMoneyModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Goal: {selectedGoal?.goal_name}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount to Add (₹)</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="0" 
                placeholderTextColor="#9ca3af"
                value={addAmount} 
                onChangeText={setAddAmount} 
                keyboardType="numeric" 
                autoFocus={true}
              />
            </View>

            <TouchableOpacity style={styles.submitModalBtn} onPress={handleAddMoneySubmit}>
              <Text style={styles.submitModalBtnText}>Update Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  goalPercentage: { fontSize: 16, fontWeight: '800', color: '#6366f1', marginRight: 8 },
  addMoneyBtnIcon: { padding: 4 },
  goalSubtext: { fontSize: 14, color: '#6b7280', marginBottom: 16, fontWeight: '500' },
  progressBar: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  modalSubtitle: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, color: '#4b5563', fontWeight: '600', marginBottom: 8 },
  modalInput: { backgroundColor: '#f3f4f6', color: '#1f2937', paddingHorizontal: 16, height: 54, borderRadius: 14, fontSize: 16, fontWeight: '500' },
  submitModalBtn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitModalBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
