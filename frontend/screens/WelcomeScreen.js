import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    // For demonstration, simulating a Google Sign In success and logging the user in.
    // Real implementation requires Expo AuthSession and Google Cloud Console Client IDs.
    login(1, { name: 'Demo User', email: 'user@google.com', mobile_number: '' });
  };

  return (
    <LinearGradient
      colors={['#3B82F6', '#1E3A8A']} // Blue gradient matching the design
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        {/* New Logo */}
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
      </View>

      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeTitle}>Welcome to FinTrack</Text>
        <Text style={styles.welcomeSubtitle}>Manage your finances easily</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={24} color="#DB4437" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
          <Ionicons name="logo-facebook" size={24} color="#FFF" style={styles.socialIcon} />
          <Text style={[styles.socialButtonText, {color: '#FFF'}]}>Continue with Facebook</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoImage: {
    width: 320,
    height: 200,
    marginBottom: 10,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#60A5FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  socialIcon: {
    position: 'absolute',
    left: 20,
  },
  socialButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
});
