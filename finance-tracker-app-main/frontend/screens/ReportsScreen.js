import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ReportsScreen() {
  const { userId } = useAuth();
  
  const handleExport = async (format) => {
    try {
      const res = await api.get(`/export/${format}?user_id=${userId}`);
      if (res.data.success) {
        Alert.alert(`Exported to ${format.toUpperCase()}`, "Check console log or mock file system.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to export");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.header}>Reports & Data</Text>
      
      <View style={styles.formCard}>
        <View style={styles.headerRow}>
          <Ionicons name="download" size={24} color="#10b981" />
          <Text style={styles.title}>Export Data</Text>
        </View>
        <Text style={styles.subtext}>Generate backups of your entire transactional history in standard formats.</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.exportBtn, {backgroundColor: '#ef4444'}]} onPress={() => handleExport('pdf')}>
            <Ionicons name="document-text" size={18} color="#fff" />
            <Text style={styles.exportBtnText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, {backgroundColor: '#10b981'}]} onPress={() => handleExport('excel')}>
            <Ionicons name="grid" size={18} color="#fff" />
            <Text style={styles.exportBtnText}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, {backgroundColor: '#3b82f6'}]} onPress={() => handleExport('csv')}>
            <Ionicons name="options" size={18} color="#fff" />
            <Text style={styles.exportBtnText}>CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.headerRow}>
          <Ionicons name="cloud-upload" size={24} color="#6366f1" />
          <Text style={styles.title}>Import Data</Text>
        </View>
        <Text style={styles.subtext}>Restore your history by importing standard CSV or PDF reports exported previously.</Text>
        <TouchableOpacity style={styles.importBtn} onPress={() => Alert.alert("Doc Picker", "Opening Document Picker...")}>
          <Ionicons name="folder-open" size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.importBtnText}>Select File to Import</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f9fafb' },
  header: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 60, marginBottom: 24, textAlign: 'center' },
  
  formCard: { 
    backgroundColor: '#ffffff', padding: 24, borderRadius: 24, marginBottom: 20,
    shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 
  },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtext: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  exportBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  exportBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  
  importBtn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  importBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' }
});
