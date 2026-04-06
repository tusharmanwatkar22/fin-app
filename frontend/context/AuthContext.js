import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // In a real app, this state would map to a database `id` or JWT after login.
  // For the current single-user implementation, we default it to null safely
  // to show the Welcome screen initially.
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: '', email: '', mobile_number: '' });

  useEffect(() => {
    if (userId) {
      console.log(`🔄 Syncing profile for user ${userId}...`);
      api.get(`/profile?user_id=${userId}`)
        .then(res => {
          if (res.data && res.data.success && res.data.data) {
            setUserProfile(res.data.data);
            console.log("✅ Profile synced successfully");
          }
        })
        .catch(e => {
          console.log('⚠️ Sync failed, keeping local state', e);
        });
    }
  }, [userId]);

  const login = (id, profile) => {
    setUserId(id);
    if (profile) {
      setUserProfile(profile);
    }
  };

  const logout = () => {
    setUserId(null);
    setUserProfile(null);
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
