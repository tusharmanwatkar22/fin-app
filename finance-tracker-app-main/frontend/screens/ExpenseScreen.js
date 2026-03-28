import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { initiateUPIPayment } from '../services/upiService';
import { extractUpiFromQR } from '../services/scannerService';
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
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [note, setNote] = useState('');

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScanning(false);
    const result = extractUpiFromQR(data);
    if (result && result.upiId) {
      setUpiId(result.upiId);
      if (result.amount) setAmount(result.amount);
      Alert.alert('QR Scanned', `UPI ID found: ${result.upiId}`);
    } else {
      Alert.alert('Invalid QR', 'Not a valid UPI QR code');
    }
  };

  const handleSaveExpense = async () => {
    if (mode === 'UPI' && upiId && amount) {
      const pRes = await initiateUPIPayment(upiId, 'Merchant', amount, note);
      if (!pRes.success) {
        Alert.alert('UPI Error', pRes.message);
      }
    }

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

  if (scanning) {
    if (!permission) return <View style={styles.centered}><Text>Requesting for camera permission...</Text></View>;
    if (!permission.granted) return (
      <View style={styles.centered}>
        <Text>No access to camera</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={requestPermission}>
          <Text style={styles.saveBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View style={{ flex: 1 }}>
        <CameraView onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} style={StyleSheet.absoluteFillObject} />
        <TouchableOpacity style={styles.cameraCancelBtn} onPress={() => setScanning(false)}>
          <Text style={styles.cameraCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
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

        {mode === 'UPI' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>UPI ID (optional)</Text>
            <View style={{flexDirection: 'row'}}>
              <TextInput style={[styles.input, {flex: 1}]} value={upiId} onChangeText={setUpiId} placeholder="user@upi" placeholderTextColor="#9ca3af" />
              <TouchableOpacity style={styles.scanBtn} onPress={() => {setScanning(true); setScanned(false);}}>
                <Ionicons name="qr-code" size={20} color="#fff" style={{marginRight: 6}} />
                <Text style={styles.scanBtnText}>Scan QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveExpense}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.saveBtnText}>Save Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => {if(navigation.goBack) navigation.goBack()}}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 60, marginBottom: 24 },
  
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
  categoryCardActive: { backgroundColor: '#e0e7ff', borderColor: '#4f46e5' },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryText: { fontSize: 11, color: '#6b7280', fontWeight: '600', textAlign: 'center' },
  categoryTextActive: { color: '#4f46e5', fontWeight: '800' },
  
  modeBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#4f46e5' },
  modeText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },
  modeTextActive: { color: '#ffffff', fontWeight: '700' },
  
  scanBtn: { backgroundColor: '#4f46e5', flexDirection: 'row', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 14, marginLeft: 10 },
  scanBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  
  saveBtn: { backgroundColor: '#f43f5e', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  
  cancelBtn: { backgroundColor: '#f3f4f6', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  cancelBtnText: { color: '#4b5563', fontSize: 16, fontWeight: '700' },

  cameraCancelBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#ffffff', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  cameraCancelText: { color: '#f43f5e', fontWeight: '800', fontSize: 16 }
});

export default ExpenseScreen;
