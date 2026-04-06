import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SecuritySyncScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { logout } = useAuth();

  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackgroundSyncEnabled, setIsBackgroundSyncEnabled] = useState(true);
  
  // Password Change Modal States
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    checkDeviceCapabilities();
    loadSettingsState();
  }, []);

  const checkDeviceCapabilities = async () => {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasHardware(hardware && enrolled);
  };

  const loadSettingsState = async () => {
    const lockState = await AsyncStorage.getItem('@app_lock_enabled');
    if (lockState === 'true') setIsAppLockEnabled(true);

    const syncState = await AsyncStorage.getItem('@background_sync_enabled');
    if (syncState !== null) {
      setIsBackgroundSyncEnabled(syncState === 'true');
    }
  };

  const toggleAppLock = async (value) => {
    if (value && !hasHardware) {
      Alert.alert("Unsupported", "Your device does not support or have biometric authentication set up.");
      return;
    }

    if (value) {
      // Prompt user to verify before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable App Lock',
        fallbackLabel: 'Use Passcode'
      });
      if (result.success) {
        setIsAppLockEnabled(true);
        await AsyncStorage.setItem('@app_lock_enabled', 'true');
      } else {
        setIsAppLockEnabled(false);
      }
    } else {
      setIsAppLockEnabled(false);
      await AsyncStorage.setItem('@app_lock_enabled', 'false');
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    // Simulate a network request
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert("Sync Successful", "All local changes have been backed up securely.");
    }, 2000);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout }
      ]
    );
  };

  const toggleBackgroundSync = async (value) => {
    setIsBackgroundSyncEnabled(value);
    await AsyncStorage.setItem('@background_sync_enabled', value ? 'true' : 'false');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    
    // Simulate API call for password change
    setTimeout(() => {
      setIsPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert("Success", "Your password has been changed successfully.");
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security & Sync</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.settingsGroup}>
          <View style={[styles.settingRow, styles.borderBottom]}>
            <View style={styles.iconLabelRow}>
              <Ionicons name="finger-print" size={24} color={theme.primary} style={styles.icon} />
              <View>
                <Text style={styles.settingLabel}>Biometric App Lock</Text>
                <Text style={styles.settingSubLabel}>Require FaceID/Fingerprint on app open</Text>
              </View>
            </View>
            <Switch
              value={isAppLockEnabled}
              onValueChange={toggleAppLock}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={styles.settingRow} onPress={() => setIsPasswordModalVisible(true)}>
            <View style={styles.iconLabelRow}>
              <Ionicons name="key" size={24} color={theme.primary} style={styles.icon} />
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sync Section */}
        <Text style={styles.sectionTitle}>Data & Synchronization</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={[styles.settingRow, styles.borderBottom]} onPress={handleManualSync} disabled={isSyncing}>
            <View style={styles.iconLabelRow}>
              <Ionicons name="cloud-upload" size={24} color={theme.success} style={styles.icon} />
              <View>
                <Text style={styles.settingLabel}>Manual Sync Server</Text>
                <Text style={styles.settingSubLabel}>Push latest local changes securely</Text>
              </View>
            </View>
            {isSyncing ? <ActivityIndicator color={theme.primary} /> : <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
          </TouchableOpacity>
          <View style={styles.settingRow}>
            <View style={styles.iconLabelRow}>
              <Ionicons name="refresh" size={24} color={theme.success} style={styles.icon} />
              <View>
                <Text style={styles.settingLabel}>Background Sync</Text>
                <Text style={styles.settingSubLabel}>Will sync continuously</Text>
              </View>
            </View>
            <Switch
              value={isBackgroundSyncEnabled}
              onValueChange={toggleBackgroundSync}
              trackColor={{ false: theme.border, true: theme.success }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: theme.danger, marginTop: 10 }]}>Danger Zone</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.danger} style={{marginRight: 8}} />
          <Text style={styles.logoutBtnText}>Log Out From Device</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Change Password Modal */}
      {isPasswordModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput style={styles.input} placeholderTextColor="#9ca3af" placeholder="Enter current password" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput style={styles.input} placeholderTextColor="#9ca3af" placeholder="Enter new password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput style={styles.input} placeholderTextColor="#9ca3af" placeholder="Confirm new password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
              <Ionicons name="lock-closed" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.saveBtnText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 },
  
  settingsGroup: { backgroundColor: theme.surface, borderRadius: 20, marginBottom: 28, shadowColor: theme.cardShadow, shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2, paddingHorizontal: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: theme.border },
  
  iconLabelRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { marginRight: 16 },
  settingLabel: { fontSize: 16, color: theme.text, fontWeight: '600' },
  settingSubLabel: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },

  logoutBtn: { backgroundColor: theme.danger + '15', paddingVertical: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.danger + '30' },
  logoutBtnText: { color: theme.danger, fontSize: 16, fontWeight: '700' },

  // Modal styles
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000 },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: theme.text },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: theme.text, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: theme.background, color: theme.text, paddingHorizontal: 16, height: 54, borderRadius: 14, fontSize: 16, fontWeight: '500', borderWidth: 1, borderColor: theme.border },
  saveBtn: { backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
