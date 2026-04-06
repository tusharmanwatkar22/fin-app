import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCategories } from '../context/CategoryContext';

export default function ManageCategoriesScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { expenseCategories, incomeCategories, addCategory, removeCategory } = useCategories();

  const [activeTab, setActiveTab] = useState('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  const currentCategories = activeTab === 'expense' ? expenseCategories : incomeCategories;

  const handleAddCategory = () => {
    if (!newCatName.trim() || !newCatIcon.trim()) {
      Alert.alert('Error', 'Please provide both a name and an emoji/icon.');
      return;
    }
    
    // Quick validation for emoji (Optional, trusting user for now)
    addCategory(activeTab, newCatName.trim(), newCatIcon.trim());
    setNewCatName('');
    setNewCatIcon('');
  };

  const handleDelete = (id) => {
    removeCategory(activeTab, id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'expense' && styles.tabBtnActiveExp]} 
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'income' && styles.tabBtnActiveInc]} 
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>Income</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add Custom Category</Text>
          <View style={styles.addFormRow}>
            <TextInput
              style={[styles.input, { flex: 0.3, marginRight: 8, textAlign: 'center' }]}
              placeholder="🍔"
              placeholderTextColor={theme.textSecondary}
              value={newCatIcon}
              onChangeText={setNewCatIcon}
              maxLength={2}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Category Name"
              placeholderTextColor={theme.textSecondary}
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Current Categories</Text>
        <View style={styles.gridContainer}>
          {currentCategories.map(cat => (
            <View key={cat.id} style={styles.categoryCard}>
              <View style={styles.catIconWrapper}>
                <Text style={styles.catIconText}>{cat.icon}</Text>
              </View>
              <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
              
              {!cat.isDefault ? (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(cat.id)}>
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                </TouchableOpacity>
              ) : (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
  
  tabsContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: theme.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: theme.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabBtnActiveExp: { backgroundColor: theme.danger },
  tabBtnActiveInc: { backgroundColor: theme.success },
  tabText: { fontSize: 16, fontWeight: '600', color: theme.textSecondary },
  tabTextActive: { color: '#ffffff' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  addSection: { backgroundColor: theme.surface, padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: theme.border, shadowColor: theme.cardShadow, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 },
  addFormRow: { flexDirection: 'row', alignItems: 'center' },
  input: { backgroundColor: theme.background, color: theme.text, height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: theme.border },
  addBtn: { backgroundColor: theme.primary, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border, shadowColor: theme.cardShadow, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  catIconWrapper: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  catIconText: { fontSize: 24 },
  catName: { fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 12, textAlign: 'center' },
  
  deleteBtn: { padding: 6, backgroundColor: theme.danger + '15', borderRadius: 8 },
  defaultBadge: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: theme.background, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  defaultBadgeText: { fontSize: 11, color: theme.textSecondary, fontWeight: '600' }
});
