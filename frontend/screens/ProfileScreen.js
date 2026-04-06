import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { userId, setUserProfile, userProfile } = useAuth();
  const [profile, setProfile] = useState(userProfile);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // States for toggles
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAutoUpdate, setIsAutoUpdate] = useState(true);

  // Sync local state when global userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchProfile = () => {
      api.get(`/profile?user_id=${userId}`).then(res => {
        if (res.data.success && res.data.data) {
          setProfile(res.data.data);
          setUserProfile(res.data.data);
        }
      }).catch(e => console.log('Error fetching user profile', e));
    };

    const unsubscribe = navigation.addListener('focus', fetchProfile);
    fetchProfile();
    return unsubscribe;
  }, [navigation, userId, setUserProfile]);

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/profile/update?user_id=${userId}`, profile);
      if (res.data.success) {
        setUserProfile(profile);
        Alert.alert("Success", "Profile Updated Successfully");
        setIsEditModalVisible(false);
      }
    } catch(e) {
      Alert.alert("Error", "Update failed.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity style={styles.card} onPress={() => setIsEditModalVisible(true)}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name || 'Set your name'}</Text>
              <Text style={styles.profileEmail}>{profile.email || 'Set your email'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </View>
        </TouchableOpacity>

        {/* Settings Group 1 */}
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={[styles.settingRow, styles.borderBottom]}>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Settings Group 2 */}
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto-update Balance</Text>
            <Switch
              value={isAutoUpdate}
              onValueChange={setIsAutoUpdate}
              trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Settings Group 3 */}
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={[styles.settingRow, styles.borderBottom]}>
            <View style={styles.iconLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: '#10b981' }]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <Text style={styles.settingLabel}>Manage Categories</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconLabelRow}>
              <View style={[styles.iconBox, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="sync" size={16} color="#fff" />
              </View>
              <Text style={styles.settingLabel}>Security & Sync</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Footer Links */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerBtn}>
            <Text style={styles.footerBtnText}>Help & Support </Text>
            <Ionicons name="chevron-forward" size={16} color="#555" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal to preserve "Save Profile" functionality */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#9ca3af" value={profile.name || ''} onChangeText={t => setProfile({...profile, name: t})} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" value={profile.email || ''} onChangeText={t => setProfile({...profile, email: t})} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput style={styles.input} placeholder="Mobile Number" placeholderTextColor="#9ca3af" value={profile.mobile_number || ''} onChangeText={t => setProfile({...profile, mobile_number: t})} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Ionicons name="save" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#6b7280' },
  
  settingsGroup: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2, paddingHorizontal: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingLabel: { fontSize: 16, color: '#374151', fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 16, color: '#6b7280', marginRight: 8 },
  
  iconLabelRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  footerBtn: { flex: 1, backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  footerBtnText: { fontSize: 14, color: '#4b5563', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: '#4b5563', fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#f3f4f6', color: '#1f2937', paddingHorizontal: 16, height: 54, borderRadius: 14, fontSize: 16, fontWeight: '500' },
  saveBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
