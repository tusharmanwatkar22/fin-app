import axios from 'axios';

const API_BASE_URL = 'http://10.25.154.23:8000'; // Updated to your PC's local IP

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
