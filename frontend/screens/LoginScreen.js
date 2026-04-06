import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { login } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (email) {
      try {
        const res = await api.get(`/profile/lookup?email=${email}`);
        
        if (res.data && res.data.success) {
          const profile = res.data.data;
          login(profile.user_id, profile);
        } else {
          alert("User not found. Please sign up.");
        }
      } catch (e) {
        console.log("Error during login", e);
        alert("Failed to login. Please try again.");
      }
    } else {
      alert("Please enter your email");
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
          <Text style={styles.title}>Login</Text>
          <View style={{ width: 28 }} /> {/* Placeholder for balance */}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Ionicons name="mail" size={20} color="#999" style={styles.inputIcon} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#999" style={styles.inputIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#DB4437" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
            <Ionicons name="logo-facebook" size={24} color="#FFF" style={styles.socialIcon} />
            <Text style={[styles.socialButtonText, {color: '#FFF'}]}>Continue with Facebook</Text>
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background,
    borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: theme.border, marginBottom: 20, height: 55
  },
  input: { flex: 1, height: '100%', color: theme.text, fontSize: 16 },
  inputIcon: { marginLeft: 10 },
  loginButton: { backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginVertical: 10 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: theme.border },
  dividerText: { marginHorizontal: 10, color: theme.textSecondary, fontSize: 14 },
  socialButton: {
    width: '100%', backgroundColor: theme.background, borderRadius: 12, paddingVertical: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: theme.border
  },
  facebookButton: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  socialIcon: { position: 'absolute', left: 20 },
  socialButtonText: { color: theme.text, fontSize: 15, fontWeight: '600' }
});
