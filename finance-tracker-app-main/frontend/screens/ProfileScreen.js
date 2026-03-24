import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { userId, setUserProfile } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', mobile_number: '' });

  useEffect(() => {
    const fetchProfile = () => {
      api.get(`/profile?user_id=${userId}`).then(res => {
        if (res.data.success && res.data.data) {
          setProfile(res.data.data);
          setUserProfile(res.data.data);
        }
      }).catch(e => console.log(e));
    };

    const unsubscribe = navigation.addListener('focus', fetchProfile);
    fetchProfile();
    return unsubscribe;
  }, [navigation, userId]);

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/profile/update?user_id=${userId}`, profile);
      if (res.data.success) {
        setUserProfile(profile);
        Alert.alert("Success", "Profile Updated Successfully");
      }
    } catch(e) {
      Alert.alert("Error", "Update failed.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.header}>User Profile</Text>
      
      <View style={styles.formCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#6366f1" />
          </View>
          <Text style={styles.emailText}>{profile.email || 'No email set'}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#9ca3af" value={profile.name || ''} onChangeText={t => setProfile({...profile, name: t})} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" value={profile.email || ''} onChangeText={t => setProfile({...profile, email: t})} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput style={styles.input} placeholder="Mobile Number" placeholderTextColor="#9ca3af" value={profile.mobile_number || ''} onChangeText={t => setProfile({...profile, mobile_number: t})} keyboardType="phone-pad" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
          <Ionicons name="save" size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f9fafb' },
  header: { fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 60, marginBottom: 24, textAlign: 'center' },
  
  formCard: { 
    backgroundColor: '#ffffff', padding: 24, borderRadius: 24, 
    shadowColor: '#6366f1', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6 
  },
  
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emailText: { fontSize: 16, color: '#6b7280', fontWeight: '500' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#4b5563', fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#f3f4f6', color: '#1f2937', paddingHorizontal: 16, height: 54, borderRadius: 14, fontSize: 16, fontWeight: '500' },
  
  saveBtn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
