import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBackendUrl = () => {
  // 1. Web browser fallback
  if (Platform.OS === 'web') return 'http://localhost:8000';

  // 2. Discover local Wi-Fi IP automatically from Expo Go 
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8000`;
  }

  // 3. Android Emulator fallback
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';

  // 4. Default failsafe fallback
  return 'http://10.71.173.166:8000';
};

const API_BASE_URL = getBackendUrl();
console.log('====================================');
console.log('USING API_BASE_URL:', API_BASE_URL);
console.log('====================================');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSummary = async (userId) => {
  const response = await api.get(`/summary?user_id=${userId}`);
  return response.data;
};

export const addExpense = async (userId, expenseData) => {
  const response = await api.post(`/expense/add?user_id=${userId}`, expenseData);
  return response.data;
};

export const addIncome = async (userId, incomeData) => {
  const response = await api.post(`/income/add?user_id=${userId}`, incomeData);
  return response.data;
};

export const getBudgetRules = async () => {
  const response = await api.get('/budget-rules');
  return response.data;
};

export const getGoals = async (userId) => {
  const response = await api.get(`/goals?user_id=${userId}`);
  return response.data;
};

export const addTransaction = async (userId, transactionData) => {
  const response = await api.post(`/transactions/add?user_id=${userId}`, transactionData);
  return response.data;
};

export default api;
