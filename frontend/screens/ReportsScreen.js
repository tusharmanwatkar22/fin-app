import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportsScreen({ navigation, route }) {
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const [downloading, setDownloading] = useState('');
  const { month, year, periodName } = route.params || {};
  
  const handleExport = async (format) => {
    setDownloading(format);
    try {
      const url = month && year 
        ? `/export/${format}?user_id=${userId}&month=${month}&year=${year}`
        : `/export/${format}?user_id=${userId}`;
        
      const res = await api.get(url);
      if (res.data && res.data.success && res.data.data) {
        const { filename, mime_type, data_base64 } = res.data.data;
        
        if (Platform.OS === 'web') {
          // Logic for laptop/desktop browsers
          const byteCharacters = atob(data_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mime_type });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          Alert.alert("Success", `Report "${filename}" downloaded successfully.`);
        } else {
          // Logic for mobile devices
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

  return (
    <View style={[styles.container, { paddingTop: insets.top || 40 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.header}>Reports & Data</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 20 }}>
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="download" size={24} color="#10b981" />
            <Text style={styles.title}>Export Data</Text>
          </View>
          <Text style={styles.subtext}>
            Generating report for: <Text style={{fontWeight: '700', color: '#10b981'}}>{periodName || 'Full History'}</Text>
          </Text>
          <Text style={styles.subtext}>Generate backups of your transactional history in professional formats.</Text>
          
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  
  formCard: { 
    backgroundColor: '#ffffff', padding: 24, borderRadius: 24, marginBottom: 20,
    shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 
  },
  
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  subtext: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  exportBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  exportBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
