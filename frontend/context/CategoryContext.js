import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export const CategoryContext = createContext();

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'bills', name: 'Bills & Utilities', icon: '💡', isDefault: true },
  { id: 'education', name: 'Education', icon: '📚', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', isDefault: true },
  { id: 'food', name: 'Food & Drinks', icon: '🍽️', isDefault: true },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', isDefault: true },
  { id: 'groceries', name: 'Groceries', icon: '🛒', isDefault: true },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', isDefault: true },
  { id: 'housing', name: 'Housing', icon: '🏠', isDefault: true },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', isDefault: true },
  { id: 'other', name: 'Other Expenses', icon: '💸', isDefault: true },
  { id: 'personal', name: 'Personal Care', icon: '💅', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', isDefault: true },
  { id: 'subscriptions', name: 'Subscriptions', icon: '🔄', isDefault: true },
  { id: 'transportation', name: 'Transportation', icon: '🚗', isDefault: true },
  { id: 'travel', name: 'Travel', icon: '✈️', isDefault: true },
  { id: 'investment', name: 'Investment', icon: '📈', isDefault: true },
  { id: 'savings', name: 'Savings', icon: '🏦', isDefault: true },
  { id: 'emergency', name: 'Emergency Fund', icon: '🚑', isDefault: true }
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: '💰', isDefault: true },
  { id: 'freelance', name: 'Freelance', icon: '💻', isDefault: true },
  { id: 'investments', name: 'Investments', icon: '📈', isDefault: true },
  { id: 'business', name: 'Business', icon: '🏢', isDefault: true },
  { id: 'gifts', name: 'Gifts', icon: '🎁', isDefault: true },
  { id: 'other', name: 'Other', icon: '💵', isDefault: true }
];

export const CategoryProvider = ({ children }) => {
  const { userId } = useAuth();
  const [customExpenseCategories, setCustomExpenseCategories] = useState([]);
  const [customIncomeCategories, setCustomIncomeCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomCategories = useCallback(async () => {
    if (!userId) {
      setCustomExpenseCategories([]);
      setCustomIncomeCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      const storedExp = await AsyncStorage.getItem(`@custom_expense_categories_${userId}`);
      const storedInc = await AsyncStorage.getItem(`@custom_income_categories_${userId}`);
      if (storedExp) setCustomExpenseCategories(JSON.parse(storedExp));
      else setCustomExpenseCategories([]);
      
      if (storedInc) setCustomIncomeCategories(JSON.parse(storedInc));
      else setCustomIncomeCategories([]);
    } catch (e) {
      console.error("Failed to load categories", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCustomCategories();
  }, [loadCustomCategories]);

  const saveCustomCategories = async (type, newArr) => {
    if (!userId) return;
    try {
      if (type === 'expense') {
        await AsyncStorage.setItem(`@custom_expense_categories_${userId}`, JSON.stringify(newArr));
        setCustomExpenseCategories(newArr);
      } else {
        await AsyncStorage.setItem(`@custom_income_categories_${userId}`, JSON.stringify(newArr));
        setCustomIncomeCategories(newArr);
      }
    } catch(e) {
      console.error("Failed to save categories", e);
    }
  };

  const addCategory = (type, name, icon) => {
    const newCat = {
      id: Date.now().toString(),
      name,
      icon,
      isDefault: false
    };

    if (type === 'expense') {
      saveCustomCategories('expense', [...customExpenseCategories, newCat]);
    } else {
      saveCustomCategories('income', [...customIncomeCategories, newCat]);
    }
  };

  const removeCategory = (type, id) => {
    if (type === 'expense') {
      saveCustomCategories('expense', customExpenseCategories.filter(c => c.id !== id));
    } else {
      saveCustomCategories('income', customIncomeCategories.filter(c => c.id !== id));
    }
  };

  const expenseCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...customExpenseCategories];
  const incomeCategories = [...DEFAULT_INCOME_CATEGORIES, ...customIncomeCategories];

  return (
    <CategoryContext.Provider value={{
      expenseCategories,
      incomeCategories,
      addCategory,
      removeCategory
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
