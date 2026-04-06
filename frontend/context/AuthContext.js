import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedId = await AsyncStorage.getItem('user_id');
      if (storedId) {
        const lockState = await AsyncStorage.getItem('@app_lock_enabled');
        if (lockState === 'true') {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Finance Tracker',
            cancelLabel: 'Cancel',
            fallbackLabel: 'Use Passcode'
          });
          if (!result.success) {
            return; // Lock interface if failed
          }
        }
        setUserId(Number(storedId));
      }
    } catch(e) {
      console.log('Error loading user session', e);
    }
  };

  useEffect(() => {
    if (userId) {
      api.get(`/profile?user_id=${userId}`)
        .then(res => {
          if (res.data && res.data.success) {
            setUserProfile(res.data.data);
          }
        })
        .catch(e => console.log('Error fetching user profile', e));
    }
  }, [userId]);

  const login = async (id, profile) => {
    try {
      await AsyncStorage.setItem('user_id', String(id));
      setUserId(id);
      setUserProfile(profile);
    } catch(e) {
      console.log('Could not save login state', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_id');
      setUserId(null);
      setUserProfile({ name: '', email: '' });
    } catch(e) {
      console.log('Error during logout', e);
    }
  };

  return (
    <AuthContext.Provider value={{ userId, userProfile, login, logout, setUserId, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
