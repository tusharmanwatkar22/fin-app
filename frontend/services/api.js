import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBackendUrl = () => {
  // Attempt to get the IP address from Expo's Metro Bundler host
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri || Constants?.manifest2?.extra?.expoGo?.debuggerHost;
  
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8000`; // Assuming your backend runs on port 8000
  }
  
  // Fallback to the host machine's local IP address for physical devices and emulators
  return 'http://172.24.161.238:8000';
};

const API_BASE_URL = getBackendUrl();
console.log("🚀 ~ API_BASE_URL resolved as:", API_BASE_URL);

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

export const getProfile = async (userId) => {
  const response = await api.get(`/profile?user_id=${userId}`);
  return response.data;
};

export const updateProfile = async (userId, updateData) => {
  const response = await api.put(`/profile/update?user_id=${userId}`, updateData);
  return response.data;
};

export const getExpenses = async (userId) => {
  const response = await api.get(`/expense/list?user_id=${userId}`);
  return response.data;
};

export default api;
