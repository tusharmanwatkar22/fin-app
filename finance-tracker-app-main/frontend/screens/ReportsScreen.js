import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export default function ReportsScreen() {
  const { userId } = useAuth();
  const [downloading, setDownloading] = useState('');
  const [importing, setImporting] = useState(false);
  
  const handleExport = async (format) => {
    setDownloading(format);
    try {
      const res = await api.get(`/export/${format}?user_id=${userId}`);
      if (res.data.success && res.data.data) {
        const { filename, mime_type, data_base64 } = res.data.data;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        
        await FileSystem.writeAsStringAsync(fileUri, data_base64, {
          encoding: 'base64',
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: mime_type,
            dialogTitle: `Export ${format.toUpperCase()}`
          });
        } else {
          Alert.alert(`Exported to ${format.toUpperCase()}`, `File saved to: ${fileUri}`);
        }
      } else {
        Alert.alert("Error", "Failed to generate export file.");
      }
    } catch (e) {
      console.error("Export Error:", e);
      Alert.alert("Error", "Failed to connect to export service.");
    } finally {
      setDownloading('');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      setImporting(true);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream'
      });
      
      let importRoute = '';
      if (file.name.endsWith('.pdf')) {
        importRoute = '/import/pdf';
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importRoute = '/import/excel';
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        importRoute = '/import/docx';
      } else {
        Alert.alert("Unsupported", "Only PDF, Excel, and Word files are supported currently.");
        setImporting(false);
        return;
      }

      const res = await api.post(`${importRoute}?user_id=${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        Alert.alert("Success", "Data imported successfully.");
      } else {
        Alert.alert("Error", "Failed to import data.");
      }
    } catch (e) {
      console.error("Import Error:", e);
      Alert.alert("Error", "Failed to import file.");
    } finally {
      setImporting(false);
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
          <TouchableOpacity activeOpacity={0.8} style={[styles.exportBtn, {backgroundColor: '#ef4444'}]} onPress={() => handleExport('pdf')} disabled={!!downloading}>
            {downloading === 'pdf' ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="document-text" size={18} color="#fff" />}
            <Text style={styles.exportBtnText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={[styles.exportBtn, {backgroundColor: '#10b981'}]} onPress={() => handleExport('excel')} disabled={!!downloading}>
            {downloading === 'excel' ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="grid" size={18} color="#fff" />}
            <Text style={styles.exportBtnText}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={[styles.exportBtn, {backgroundColor: '#3b82f6'}]} onPress={() => handleExport('csv')} disabled={!!downloading}>
            {downloading === 'csv' ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="options" size={18} color="#fff" />}
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
        <TouchableOpacity activeOpacity={0.8} style={styles.importBtn} onPress={handleImport} disabled={importing}>
          {importing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="folder-open" size={20} color="#fff" style={{marginRight: 8}} />
          )}
          <Text style={styles.importBtnText}>{importing ? 'Importing...' : 'Select File to Import'}</Text>
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
