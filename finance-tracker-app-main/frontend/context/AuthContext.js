import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // In a real app, this state would map to a database `id` or JWT after login.
  // For the current single-user implementation, we default it to null safely
  // to show the Welcome screen initially.
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });

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

  const login = (id, profile) => {
    setUserId(id);
    setUserProfile(profile);
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
