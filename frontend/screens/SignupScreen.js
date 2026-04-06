import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isCrescon, setIsCrescon] = useState(true);
  const navigation = useNavigation();
  const { login, setUserProfile } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleSignup = async () => {
    if (name && email && mobileNumber) {
      try {
        const res = await api.post('/profile/create', {
          name: name,
          email: email,
          mobile_number: mobileNumber
        });
        
        if (res.data && res.data.success) {
          const newUserId = res.data.data.user_id;
          const newProfile = { name, email, mobile_number: mobileNumber };
          setUserProfile(newProfile);
          login(newUserId, newProfile);
        } else {
          alert("Error creating account: " + (res.data?.data?.error || "Unknown error"));
        }
      } catch (e) {
        console.log("Error during signup", e);
        alert("Failed to sign up. Please try again.");
      }
    } else {
      alert("Please fill in Name, Email, and Mobile Number");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Sign Up</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Ionicons name="person" size={20} color="#999" style={styles.inputIcon} />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Ionicons name="mail" size={20} color="#999" style={styles.inputIcon} />
          </View>

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor={theme.textSecondary}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
            <Ionicons name="call" size={20} color="#999" style={styles.inputIcon} />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputContainer, styles.passwordContainer]}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setIsCrescon(!isCrescon)}
            >
              <View style={[styles.checkbox, isCrescon && styles.checkboxChecked]}>
                {isCrescon && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Crescon</Text>
            </TouchableOpacity>
            
            <Ionicons name="settings-outline" size={20} color="#999" />
          </View>
          
          <Text style={styles.label}>Date</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dateText}>{today}</Text>
            <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContainer: { flexGrow: 1, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 30 },
  backButton: { padding: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.text },
  formContainer: {
    backgroundColor: theme.surface, borderRadius: 20, marginHorizontal: 20, padding: 20,
    shadowColor: theme.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: theme.border
  },
  label: { fontSize: 14, color: theme.text, marginBottom: 8, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background,
    borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: theme.border, marginBottom: 20, height: 55
  },
  passwordContainer: { justifyContent: 'space-between' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: theme.primary, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: theme.primary },
  checkboxLabel: { fontSize: 16, color: theme.text },
  input: { flex: 1, height: '100%', color: theme.text, fontSize: 16 },
  inputIcon: { marginLeft: 10 },
  dateText: { flex: 1, fontSize: 16, color: theme.text },
  signupButton: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  signupButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
